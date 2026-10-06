import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Storage Reset Console',
  description: 'Private administrative storage maintenance and cleanup console.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function ResetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
