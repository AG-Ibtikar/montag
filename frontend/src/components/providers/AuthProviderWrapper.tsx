'use client';

import { useAuth } from '@/components/AuthProvider';
import { Loader2 } from 'lucide-react';

export default function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
} 