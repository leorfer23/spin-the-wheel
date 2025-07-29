import React from 'react';
import { TopBar } from './TopBar';

interface DashboardLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  leftContent, 
  rightContent 
}) => {
  return (
    <div className="fixed inset-0 bg-gray-50 overflow-hidden flex flex-col">
      <TopBar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Full width container with left content */}
        <div className="flex-1 flex overflow-hidden">
          {leftContent}
        </div>
        
        {/* Right Side - Configuration Panel */}
        {rightContent && (
          <div className="flex-1 overflow-hidden">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};