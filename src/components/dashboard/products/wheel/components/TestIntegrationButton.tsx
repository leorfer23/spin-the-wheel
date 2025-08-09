import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface TestIntegrationButtonProps {
  storeId: string;
  onIntegrationCreated: () => void;
}

export function TestIntegrationButton({ storeId, onIntegrationCreated }: TestIntegrationButtonProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTestIntegration = async () => {
    setIsCreating(true);
    
    try {
      // Create a test integration for development
      const { error } = await (supabase as any)
        .schema('spinawheel')
        .from('store_integrations')
        .insert({
          store_id: storeId,
          platform: 'tiendanube',
          access_token: 'test_token_' + Date.now(),
          platform_store_id: '12345',
          platform_store_name: 'Test Store',
          platform_store_domain: 'test.tiendanube.com',
          status: 'active',
          platform_metadata: {
            test: true,
            created_for: 'development'
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Test integration created successfully');
      onIntegrationCreated();
    } catch (error) {
      console.error('Failed to create test integration:', error);
      toast.error('Failed to create test integration');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreateTestIntegration}
      disabled={isCreating}
      variant="outline"
      className="w-full"
    >
      {isCreating ? 'Creating Test Integration...' : 'Create Test Integration (Dev Only)'}
    </Button>
  );
}