import React from 'react';

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="space-y-6 w-full max-w-md p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
          <div className="h-4 bg-gray-200 rounded w-3/6" />
        </div>
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </div>
  </div>
);