import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ReportesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'reporter']}>{children}</AuthGuard>
  );
}
