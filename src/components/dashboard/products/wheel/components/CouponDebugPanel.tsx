import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface CouponDebugPanelProps {
  storeId: string;
}

export function CouponDebugPanel({ storeId }: CouponDebugPanelProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testEndpoint = async () => {
    setIsLoading(true);
    try {
      // Test the debug endpoint
      const response = await fetch('/api/tiendanube/test');
      const data = await response.json();
      setDebugInfo(data);
      
      if (data.success) {
        toast.success('Test endpoint working!');
      } else {
        toast.error('Test endpoint failed');
      }
    } catch (error) {
      console.error('Debug test failed:', error);
      toast.error('Failed to connect to test endpoint');
      setDebugInfo({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const testCouponsProxy = async () => {
    setIsLoading(true);
    try {
      // First, get the integration details from Supabase
      const { supabase } = await import('@/lib/supabase');
      
      const { data: integration, error: intError } = await (supabase as any)
        .schema('spinawheel')
        .from('store_integrations')
        .select('*')
        .eq('store_id', storeId)
        .eq('platform', 'tienda_nube')
        .eq('status', 'active')
        .single();

      if (intError || !integration) {
        throw new Error('No active TiendaNube integration found');
      }

      console.log('🔍 Testing proxy with integration:', {
        platform_store_id: integration.platform_store_id,
        has_token: !!integration.access_token
      });

      // Test the actual proxy endpoint
      const proxyUrl = `/api/tiendanube/proxy/${integration.platform_store_id}/coupons?per_page=5`;
      console.log('🌐 Calling proxy URL:', proxyUrl);

      const response = await fetch(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${integration.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📨 Proxy response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();
      
      setDebugInfo({
        proxyTest: {
          success: response.ok,
          status: response.status,
          couponsCount: Array.isArray(data) ? data.length : 0,
          data: data
        }
      });

      if (response.ok) {
        toast.success(`Found ${Array.isArray(data) ? data.length : 0} coupons via proxy!`);
      } else {
        toast.error(`Proxy failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Proxy test failed:', error);
      toast.error(`Proxy test failed: ${error instanceof Error ? error.message : String(error)}`);
      setDebugInfo({ proxyError: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectApi = async () => {
    setIsLoading(true);
    try {
      // Try calling TiendaNube API directly (this should fail with CORS)
      await fetch('https://api.tiendanube.com/v1/12345/coupons', {
        headers: {
          'Authentication': 'bearer fake_token',
          'Content-Type': 'application/json'
        }
      });
      
      // If we get here, something is wrong (CORS should block it)
      setDebugInfo({ 
        directApi: 'WARNING: Direct API call succeeded (should have been blocked by CORS)' 
      });
    } catch (error) {
      // This is expected - CORS should block direct calls
      setDebugInfo({ 
        directApi: 'Good! Direct API call blocked by CORS (as expected)',
        error: error instanceof Error ? error.message : String(error) 
      });
      toast.success('CORS is working correctly (blocking direct calls)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-4 border-2 border-orange-500">
      <div className="text-lg font-bold text-orange-600">
        🔍 Debug de Integración de Cupones
      </div>
      
      <div className="space-y-2">
        <Button 
          onClick={testEndpoint}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          1. Test Basic Endpoint (/api/tiendanube/test)
        </Button>
        
        <Button 
          onClick={testCouponsProxy}
          disabled={isLoading}
          variant="outline" 
          className="w-full"
        >
          2. Test Coupons Proxy (/api/tiendanube/proxy/...)
        </Button>
        
        <Button 
          onClick={testDirectApi}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          3. Test Direct API (Should Fail - CORS)
        </Button>
      </div>

      {debugInfo && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <div className="text-sm font-mono">
            <pre className="whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>Store ID: {storeId}</p>
        <p>Environment: {import.meta.env.MODE}</p>
        <p>API Base: {window.location.origin}/api</p>
      </div>
    </Card>
  );
}