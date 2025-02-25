import React from 'react';
import { HashLoader } from 'react-spinners';

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="space-y-6 w-full max-w-md p-6">
      <HashLoader size={50} color={"#36D7B7"} />
    </div>
  </div>
);