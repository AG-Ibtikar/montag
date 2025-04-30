'use client';

import { AuthProviderWrapper } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProviderWrapper>
      {children}
      <Toaster position="top-right" />
    </AuthProviderWrapper>
  );
} 