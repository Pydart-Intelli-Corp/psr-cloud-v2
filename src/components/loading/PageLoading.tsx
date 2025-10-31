'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoadingProps {
  text?: string;
  showLogo?: boolean;
}

/**
 * PageLoading - Full page loading screen with branding
 */
const PageLoading: React.FC<PageLoadingProps> = ({
  text = 'Loading Poornasree Equipments...',
  showLogo = true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Company Branding */}
        {showLogo && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Poornasree Equipments
            </h1>
            <p className="text-gray-600">Cloud Management System</p>
          </div>
        )}
        
        {/* Loading Spinner */}
        <LoadingSpinner 
          size="xl" 
          text={text}
          showText={true}
          className="scale-110"
        />
        
        {/* Loading Progress Indicator */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoading;