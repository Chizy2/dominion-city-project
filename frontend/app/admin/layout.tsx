'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authHelpers } from '@/lib/supabase';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Allow login page without auth check
      if (pathname === '/admin/login') {
        setLoading(false);
        return;
      }

      // Check for session
      const session = await authHelpers.getSession();
      
      if (!session) {
        router.push('/admin/login');
        return;
      }

      // Verify user is admin
      const user = await authHelpers.getUser();
      if (!user?.user_metadata?.is_admin) {
        await authHelpers.signOut();
        router.push('/admin/login');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading state while checking auth
  if (loading && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dominion-blue"></div>
      </div>
    );
  }

  return <>{children}</>;
}
