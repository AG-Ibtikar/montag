'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { Suspense } from 'react';

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-400">Initializing...</p>
      </div>
    </div>
  );
}

export default function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Suspense>
  );
} 