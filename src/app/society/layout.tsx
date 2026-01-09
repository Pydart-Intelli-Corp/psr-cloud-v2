'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageLoader } from '@/components';
import { UserRole } from '@/types/user';

interface SocietyUser {
  id: number;
  societyId: string;
  name: string;
  email: string;
  location?: string;
  presidentName?: string;
  contactPhone?: string;
  bmcId?: number;
  bmcName?: string;
  dairyId?: number;
  dairyName?: string;
  type?: string;
  role?: string;
  schema: string;
  dbKey?: string;
  adminName?: string;
  adminEmail?: string;
}

function SocietyLayoutContent({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SocietyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get society data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('🏢 Society layout - User data:', parsedUser);
        
        if (parsedUser.type === 'society' || parsedUser.role === 'society') {
          setUser(parsedUser);
        } else {
          // Not a society user, redirect to login
          console.log('⚠️ User is not a society, redirecting...');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
      }
    } else {
      console.log('⚠️ No user data found, redirecting to login...');
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return null;
  }

  // Transform society user data to match DashboardLayout expected format
  const dashboardUser = {
    id: user.id,
    uid: user.societyId,
    firstName: user.presidentName?.split(' ')[0] || user.name?.split(' ')[0] || 'Society',
    lastName: user.presidentName?.split(' ').slice(1).join(' ') || user.name?.split(' ').slice(1).join(' ') || 'User',
    email: user.email,
    role: UserRole.SOCIETY,
    dbKey: user.dbKey || user.schema
  };

  return (
    <DashboardLayout user={dashboardUser}>
      {children}
    </DashboardLayout>
  );
}

export default function SocietyLayout({ children }: { children: React.ReactNode }) {
  return <SocietyLayoutContent>{children}</SocietyLayoutContent>;
}
