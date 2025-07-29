import React from 'react';
import { useParams } from 'react-router-dom';

export const StoreDetail: React.FC = () => {
  const { storeId } = useParams();
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Details</h2>
      <p className="text-gray-600">Store ID: {storeId}</p>
      <p className="text-gray-600 mt-4">Store management features coming soon...</p>
    </div>
  );
};