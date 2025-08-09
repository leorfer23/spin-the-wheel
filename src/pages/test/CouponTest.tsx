import { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { useTiendaNubeIntegration } from '@/hooks/useTiendaNubeCoupons';
import { SimpleCouponSelector } from '@/components/dashboard/products/wheel/components/SimpleCouponSelector';
import { TiendaNubeCouponsProvider } from '@/contexts/TiendaNubeCouponsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { tiendaNubeApi } from '@/services/integrations/tiendanube/tiendaNubeApiService';

export default function CouponTest() {
  const { selectedStoreId, stores, setSelectedStoreId } = useStore();
  const [selectedValue, setSelectedValue] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTestingApi, setIsTestingApi] = useState(false);

  // Use the integration hook
  const integrationStatus = useTiendaNubeIntegration(selectedStoreId || undefined);
  
  const addTestResult = (test: string, result: any, success: boolean) => {
    setTestResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      test,
      result,
      success
    }]);
  };

  // Test API directly
  const testApiDirectly = async () => {
    if (!selectedStoreId) {
      addTestResult('Direct API Test', 'No store selected', false);
      return;
    }

    setIsTestingApi(true);
    addTestResult('Direct API Test', 'Starting...', true);

    try {
      // Test the API service directly
      const result = await tiendaNubeApi.getCoupons(selectedStoreId, { per_page: 5 });
      addTestResult('API getCoupons', result, result.success);
      
      if (result.success && result.data) {
        addTestResult('Coupons Found', `${result.data.length} coupons`, true);
      }
    } catch (error) {
      addTestResult('API Error', error, false);
    } finally {
      setIsTestingApi(false);
    }
  };

  // Log current state
  useEffect(() => {
    console.log('🎯 CouponTest State:', {
      selectedStoreId,
      stores: stores.map(s => ({ id: s.id, name: s.store_name })),
      integrationStatus,
      selectedValue
    });
  }, [selectedStoreId, stores, integrationStatus, selectedValue]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Coupon Integration Test</h1>
      
      {/* Store Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">1. Store Selection</span>
            {selectedStoreId ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Selected Store ID:</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {selectedStoreId || 'None'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Available Stores:</p>
                <select 
                  className="w-full p-2 border rounded"
                  value={selectedStoreId || ''}
                  onChange={(e) => setSelectedStoreId(e.target.value || null)}
                >
                  <option value="">Select a store</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>
                      {store.store_name} ({store.id.substring(0, 8)}...)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">2. TiendaNube Integration Status</span>
            {integrationStatus?.isConnected ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Connection Status:</p>
              <div className={`p-2 rounded flex items-center gap-2 ${
                integrationStatus?.isConnected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {integrationStatus?.isConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Not Connected
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Needs Re-auth:</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {String(integrationStatus?.needsReauth || false)}
              </p>
            </div>
          </div>
          
          {integrationStatus?.isChecking && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Checking integration status...
            </div>
          )}

          <div className="mt-4">
            <Button onClick={testApiDirectly} disabled={isTestingApi}>
              {isTestingApi ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test API Directly'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Selector Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">3. Coupon Selector Component</span>
            {selectedValue ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Component Behavior:</p>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">
                  {!selectedStoreId 
                    ? '⚠️ No store selected - Will show text input'
                    : !integrationStatus?.isConnected 
                    ? '⚠️ No TiendaNube integration - Will show text input'
                    : '✅ Should show dropdown with coupons'
                  }
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Test the Selector:</p>
              <TiendaNubeCouponsProvider storeId={selectedStoreId} isConnected={true}>
                <SimpleCouponSelector
                  value={selectedValue}
                  onValueChange={(value, coupon) => {
                    setSelectedValue(value);
                    console.log('Coupon selected:', { value, coupon });
                    addTestResult('Coupon Selected', { value, coupon }, true);
                  }}
                  placeholder="Select or enter a coupon code"
                />
              </TiendaNubeCouponsProvider>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Selected Value:</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {selectedValue || 'None'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-xs h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet...</p>
            ) : (
              testResults.map((result, idx) => (
                <div key={idx} className={`mb-2 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  [{result.timestamp}] {result.test}: {JSON.stringify(result.result, null, 2)}
                </div>
              ))
            )}
          </div>
          {testResults.length > 0 && (
            <Button 
              onClick={() => setTestResults([])} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Clear Logs
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded font-mono text-xs">
            <p>Check the browser console for detailed logs.</p>
            <p className="mt-2">Key things to verify:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Store ID format (should be UUID)</li>
              <li>Integration status (should query store_integrations table)</li>
              <li>API proxy endpoint (/api/tiendanube/proxy/...)</li>
              <li>Authorization header format (Bearer token)</li>
              <li>CORS headers in proxy response</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}