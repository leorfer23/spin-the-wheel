import React from 'react';
import { useParams } from 'react-router-dom';

export const WheelBuilder: React.FC = () => {
  const { storeId, wheelId } = useParams();
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {wheelId ? 'Edit Wheel' : 'Create New Wheel'}
      </h2>
      <p className="text-gray-600">Store ID: {storeId}</p>
      {wheelId && <p className="text-gray-600">Wheel ID: {wheelId}</p>}
      <p className="text-gray-600 mt-4">Wheel builder coming soon...</p>
    </div>
  );
};