import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function TiendaNubeDebug() {
  const { selectedStoreId, stores } = useStore();
  const { user } = useAuth();
  const [integration, setIntegration] = useState<any>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [needsReauth, setNeedsReauth] = useState(false);

  const addLog = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage, data);
    setLogs(prev => [...prev, data ? `${logMessage}: ${JSON.stringify(data, null, 2)}` : logMessage]);
  };

  // Check for OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const integrationSuccess = urlParams.get('integration_success');
    const integrationError = urlParams.get('integration_error');
    
    if (integrationSuccess === 'true') {
      toast.success('¡Tienda reconectada exitosamente!');
      setNeedsReauth(false);
      // Clear the URL parameters
      window.history.replaceState({}, '', window.location.pathname);
      // Fetch the updated integration when component loads after redirect
      if (selectedStoreId) {
        addLog('Integration reconnected successfully, refreshing data...');
      }
    } else if (integrationError) {
      toast.error(`Error al conectar: ${decodeURIComponent(integrationError)}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [selectedStoreId]);

  // Step 1: Get active store from zustand
  useEffect(() => {
    addLog('Step 1: Active store from zustand', { selectedStoreId, stores });
  }, [selectedStoreId, stores]);

  // Debug function to check what's in the database
  const debugDatabase = async () => {
    addLog('=== DATABASE DEBUG START ===');
    
    // Test 1: Raw query without any filters
    try {
      const { data: raw, error: rawError } = await (supabase as any)
        .schema('spinawheel')
        .from('store_integrations')
        .select('*');
      
      addLog('Raw query result:', { 
        success: !rawError, 
        recordCount: raw?.length || 0,
        error: rawError,
        records: raw 
      });
      
      if (raw && raw.length > 0) {
        raw.forEach((record: any, idx: number) => {
          addLog(`Record ${idx + 1}:`, {
            store_id: record.store_id,
            store_id_matches: record.store_id === selectedStoreId,
            platform: record.platform,
            status: record.status,
            has_token: !!record.access_token
          });
        });
      }
    } catch (err) {
      addLog('Raw query error:', err);
    }
    
    addLog('=== DATABASE DEBUG END ===');
  };

  // Step 2: Get integration from store_integrations table
  const fetchIntegration = async () => {
    if (!selectedStoreId) {
      addLog('No store selected');
      return;
    }

    setLoading(true);
    setError(null);
    addLog('Step 2: Fetching integration from store_integrations...');

    try {
      // Debug: Log the exact query parameters
      addLog('Query parameters:', {
        schema: 'spinawheel',
        table: 'store_integrations',
        store_id: selectedStoreId,
        store_id_type: typeof selectedStoreId,
        platform: 'tiendanube',
        status: 'active'
      });

      // First, let's try without .single() to see all results
      const { data: allData } = await (supabase as any)
        .schema('spinawheel')
        .from('store_integrations')
        .select('*');
      
      addLog('ALL records in store_integrations:', allData);
      addLog('Total records found:', allData?.length || 0);
      
      // Now let's add filters one by one
      const { data: byStore } = await (supabase as any)
        .schema('spinawheel')
        .from('store_integrations')
        .select('*')
        .eq('store_id', selectedStoreId);
      
      addLog('Records matching store_id:', byStore);
      addLog('Records with our store_id:', byStore?.length || 0);
      
      // Now the full query - use correct platform enum value
      const { data, error } = await (supabase as any)
        .schema('spinawheel')
        .from('store_integrations')
        .select('*')
        .eq('store_id', selectedStoreId)
        .eq('platform', 'tienda_nube')  // Correct enum value from database
        .eq('status', 'active')
        .single();

      if (error) {
        addLog('Error fetching integration', error);
        setError(error.message);
        return;
      }

      addLog('Integration fetched successfully', data);
      setIntegration(data);
    } catch (err) {
      addLog('Exception fetching integration', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Fetch coupons from TiendaNube API
  const fetchCoupons = async () => {
    if (!integration) {
      addLog('No integration available');
      return;
    }

    setLoading(true);
    addLog('Step 3: Fetching coupons from TiendaNube API...');

    try {
      // Use proxy endpoint to avoid CORS issues
      const proxyUrl = `/api/tiendanube/proxy/${integration.platform_store_id}/coupons`;
      const originalUrl = `https://api.tiendanube.com/v1/${integration.platform_store_id}/coupons`;
      
      addLog('Original API URL', originalUrl);
      addLog('Proxy URL', proxyUrl);
      addLog('Using access token', integration.access_token?.substring(0, 20) + '...');
      
      // Log the full headers being sent
      const headers = {
        'Authorization': `Bearer ${integration.access_token}`,
        'Content-Type': 'application/json'
      };
      addLog('Request headers', headers);

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: headers
      });

      addLog('Response received', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok,
        type: response.type,
        url: response.url
      });

      if (!response.ok) {
        const errorText = await response.text();
        addLog('API Error', errorText);
        
        // Check if it's a 401 Unauthorized error
        if (response.status === 401) {
          setNeedsReauth(true);
          setError('Token inválido o expirado. Por favor, reconecta tu tienda.');
          addLog('Token invalid - needs re-authorization');
          
          // Try to parse the error response
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.message === 'Unauthorized' || errorData.code === 401) {
              addLog('TiendaNube API returned 401 - token needs refresh');
            }
          } catch (e) {
            // Ignore parsing errors
          }
        } else {
          setError(`API Error: ${response.status} - ${errorText}`);
        }
        return;
      }

      const data = await response.json();
      addLog('Coupons fetched', data);
      setCoupons(data);
    } catch (err) {
      // Better error logging for debugging
      if (err instanceof Error) {
        addLog('Exception fetching coupons', {
          message: err.message,
          name: err.name,
          stack: err.stack?.split('\n').slice(0, 3).join('\n')
        });
        setError(err.message);
      } else {
        addLog('Exception fetching coupons', {
          error: String(err),
          type: typeof err,
          details: err
        });
        setError('Unknown error: ' + String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Create a test coupon
  const createTestCoupon = async () => {
    if (!integration) {
      addLog('No integration available');
      return;
    }

    setLoading(true);
    addLog('Step 4: Creating test coupon...');

    try {
      const couponData = {
        code: `TEST_${Date.now()}`,
        type: 'percentage',
        value: '10',
        valid: true
      };

      addLog('Coupon payload', couponData);

      // Use proxy endpoint to avoid CORS issues
      const proxyUrl = `/api/tiendanube/proxy/${integration.platform_store_id}/coupons`;
      const originalUrl = `https://api.tiendanube.com/v1/${integration.platform_store_id}/coupons`;
      
      addLog('Original API URL', originalUrl);
      addLog('Proxy URL', proxyUrl);
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(couponData)
      });

      addLog('Response status', { status: response.status, ok: response.ok });

      const responseText = await response.text();
      addLog('Raw response', responseText);

      if (!response.ok) {
        // Check if it's a 401 Unauthorized error
        if (response.status === 401) {
          setNeedsReauth(true);
          setError('Token inválido o expirado. Por favor, reconecta tu tienda.');
          addLog('Token invalid - needs re-authorization');
        } else {
          setError(`API Error: ${response.status} - ${responseText}`);
        }
        return;
      }

      const newCoupon = JSON.parse(responseText);
      addLog('Coupon created successfully', newCoupon);
      toast.success(`Coupon ${newCoupon.code} created!`);
      
      // Refresh coupons list
      await fetchCoupons();
    } catch (err) {
      addLog('Exception creating coupon', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Re-authorize with TiendaNube
  const handleReauthorize = async () => {
    if (!selectedStoreId || !user) {
      toast.error('No se pudo identificar la tienda o el usuario');
      return;
    }

    addLog('Initiating re-authorization...');
    setLoading(true);

    try {
      // Get the selected store details
      const selectedStore = stores.find(s => s.id === selectedStoreId);
      
      // Initiate OAuth flow for re-authorization
      const response = await fetch('/api/integrations/oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: 'tiendanube',
          storeId: selectedStoreId,
          storeName: selectedStore?.store_name || 'Mi Tienda',
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate OAuth');
      }

      const { authUrl } = await response.json();
      addLog('OAuth URL generated', authUrl);
      
      // Redirect to Tienda Nube OAuth page
      toast.info('Redirigiendo a TiendaNube para autorización...');
      window.location.href = authUrl;
    } catch (err) {
      addLog('Error initiating re-authorization', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar re-autorización');
      toast.error('Error al iniciar re-autorización');
    } finally {
      setLoading(false);
    }
  };

  // Create test integration for development
  const createTestIntegration = async () => {
    if (!selectedStoreId) {
      toast.error('No store selected');
      return;
    }

    setLoading(true);
    addLog('Creating test integration...');

    try {
      // We need service role access for this
      // For now, we'll create it manually in Supabase dashboard
      toast.info('Please create the integration manually in Supabase dashboard');
      addLog('Manual integration needed in spinawheel.store_integrations table', {
        store_id: selectedStoreId,
        platform: 'tienda_nube', // Use correct enum value
        access_token: 'your_actual_token_here',
        platform_store_id: 'your_tiendanube_store_id',
        status: 'active'
      });
    } catch (err) {
      addLog('Error creating test integration', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">TiendaNube Coupons Debug</h1>
      
      {/* Step 1: Store Info */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Active Store</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Selected Store ID:</strong> {selectedStoreId || 'None'}</p>
            <p><strong>Total Stores:</strong> {stores.length}</p>
            {stores.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Available Stores:</p>
                <ul className="list-disc pl-5">
                  {stores.map(store => (
                    <li key={store.id}>
                      {store.store_name} ({store.id})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Store Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={fetchIntegration} disabled={loading || !selectedStoreId}>
                Fetch Integration
              </Button>
              <Button onClick={debugDatabase} variant="outline" disabled={loading || !selectedStoreId}>
                Debug Database
              </Button>
            </div>
            
            {integration && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p><strong>Platform Store ID:</strong> {integration.platform_store_id}</p>
                <p><strong>Access Token:</strong> {integration.access_token?.substring(0, 20)}...{integration.access_token?.substring(integration.access_token.length - 5)}</p>
                <p><strong>Token Length:</strong> {integration.access_token?.length} characters</p>
                <p><strong>Status:</strong> {integration.status}</p>
                <p><strong>Connected At:</strong> {integration.connected_at}</p>
                <p><strong>Metadata:</strong> {JSON.stringify(integration.platform_metadata?.scope || 'N/A')}</p>
                
                {needsReauth && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800">
                          Autorización requerida
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          El token de acceso es inválido o ha sido revocado. Necesitas reconectar tu tienda.
                        </p>
                        <Button
                          onClick={handleReauthorize}
                          disabled={loading}
                          className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                          size="sm"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reconectar con TiendaNube
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!integration && selectedStoreId && (
              <div className="mt-4">
                <p className="text-yellow-600 mb-2">No integration found. Create one for testing:</p>
                <Button onClick={createTestIntegration} variant="outline">
                  Create Test Integration (See Console)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>Step 3: TiendaNube Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={fetchCoupons} disabled={loading || !integration}>
              Fetch Coupons
            </Button>
            
            {coupons.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Coupons ({coupons.length}):</p>
                <div className="space-y-2">
                  {coupons.map((coupon, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded">
                      <p><strong>Code:</strong> {coupon.code}</p>
                      <p><strong>Type:</strong> {coupon.type}</p>
                      <p><strong>Value:</strong> {coupon.value}</p>
                      <p><strong>Valid:</strong> {coupon.valid ? 'Yes' : 'No'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Create Coupon */}
      <Card>
        <CardHeader>
          <CardTitle>Step 4: Create Test Coupon</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={createTestCoupon} disabled={loading || !integration}>
            Create Test Coupon (10% OFF)
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            {needsReauth && (
              <Button
                onClick={handleReauthorize}
                disabled={loading}
                className="mt-4 bg-red-600 hover:bg-red-700"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconectar con TiendaNube
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-xs h-96 overflow-y-auto">
            {logs.map((log, idx) => (
              <div key={idx} className="mb-1">{log}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}