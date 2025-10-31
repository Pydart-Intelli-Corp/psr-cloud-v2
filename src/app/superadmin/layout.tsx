import { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Poornasree Admin Panel',
  description: 'Administrative dashboard for Poornasree Equipments Cloud',
  robots: 'noindex, nofollow', // Prevent search engine indexing
};

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className}>
      {children}
    </div>
  );
}