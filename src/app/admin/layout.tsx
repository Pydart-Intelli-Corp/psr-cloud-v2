'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProvider, useUser } from '@/contexts/UserContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FlowerSpinner } from '@/components';
import { UserRole } from '@/types/user';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      // Redirect non-admin users
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <FlowerSpinner size={64} />
          <p className="mt-4 text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout 
      user={{
        id: user.id,
        uid: user.uid,
        firstName: user.fullName.split(' ')[0] || user.fullName,
        lastName: user.fullName.split(' ').slice(1).join(' ') || '',
        email: user.email,
        role: user.role
      }}
    >
      {children}
    </DashboardLayout>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </UserProvider>
  );
}
