import React from 'react';
import { useParams } from 'react-router-dom';

export const Integrations: React.FC = () => {
  const { storeId } = useParams();
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Integrations</h2>
      <p className="text-gray-600">Store ID: {storeId}</p>
      <p className="text-gray-600 mt-4">Email provider integrations coming soon...</p>
    </div>
  );
};