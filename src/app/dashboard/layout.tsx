import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Uploads Dashboard',
  description:
    'Manage your uploaded images and videos, monitor auto-expiration countdowns, and securely delete files with owner tokens.',
  alternates: {
    canonical: '/dashboard',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
