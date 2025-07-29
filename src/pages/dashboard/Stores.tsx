import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StoreService } from '../../services';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Plus, Store, ExternalLink, Trash2, Settings } from 'lucide-react';
import type { CreateStoreInput } from '../../types/validation';

export const Stores: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteStoreId, setDeleteStoreId] = useState<string | null>(null);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const result = await StoreService.getStores();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateStoreInput) => StoreService.createStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setCreateDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (storeId: string) => StoreService.deleteStore(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setDeleteStoreId(null);
    },
  });

  const handleCreateStore = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: CreateStoreInput = {
      store_name: formData.get('store_name') as string,
      platform: formData.get('platform') as 'shopify' | 'tienda_nube' | 'custom',
      store_url: formData.get('store_url') as string,
    };
    createMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stores</h2>
          <p className="text-gray-600 mt-1">Manage your connected stores</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Store
        </Button>
      </div>

      {stores.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores yet</h3>
            <p className="text-gray-500 text-center mb-4">
              Get started by connecting your first store
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Card key={store.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{store.store_name}</CardTitle>
                    <CardDescription className="capitalize">{store.platform}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/dashboard/stores/${store.id}`)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteStoreId(store.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <a
                    href={store.store_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:underline flex items-center gap-1"
                  >
                    Visit Store
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    store.plan_tier === 'free' ? 'bg-gray-100 text-gray-700' :
                    store.plan_tier === 'starter' ? 'bg-blue-100 text-blue-700' :
                    store.plan_tier === 'growth' ? 'bg-purple-100 text-purple-700' :
                    'bg-gold-100 text-gold-700'
                  }`}>
                    {store.plan_tier}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Store Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Store</DialogTitle>
            <DialogDescription>
              Connect your e-commerce store to start creating spin wheels
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStore}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="store_name">Store Name</Label>
                <Input
                  id="store_name"
                  name="store_name"
                  placeholder="My Awesome Store"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select name="platform" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopify">Shopify</SelectItem>
                    <SelectItem value="tienda_nube">Tienda Nube</SelectItem>
                    <SelectItem value="custom">Custom Website</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_url">Store URL</Label>
                <Input
                  id="store_url"
                  name="store_url"
                  type="url"
                  placeholder="https://mystore.com"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Store'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteStoreId} onOpenChange={() => setDeleteStoreId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Store</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this store? This will also delete all associated wheels, campaigns, and data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteStoreId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteStoreId && deleteMutation.mutate(deleteStoreId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Store'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};