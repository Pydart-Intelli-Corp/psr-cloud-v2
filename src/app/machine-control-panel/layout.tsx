'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { PageLoader } from '@/components';
import { UserRole } from '@/types/user';

/**
 * Control Panel Layout Content - Full screen without sidebar/header
 * Provides authentication but no DashboardLayout for immersive experience
 */
function ControlPanelLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return null;
  }

  // Return children directly - no sidebar or header
  return <>{children}</>;
}

export default function ControlPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ControlPanelLayoutContent>{children}</ControlPanelLayoutContent>
    </UserProvider>
  );
}
