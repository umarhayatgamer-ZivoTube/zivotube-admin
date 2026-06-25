'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in
        router.push('/login');
      } else if (!isAdmin) {
        // Logged in but not admin
        router.push('/unauthorized');
      }
    }
  }, [user, isAdmin, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Authenticating...</p>
        </div>
      </div>
    );
  }

  // If user is logged in and is admin, render the children
  if (user && isAdmin) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}
