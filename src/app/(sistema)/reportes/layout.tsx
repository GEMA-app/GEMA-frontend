import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ReportesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard roleRequired={['administrador', 'supervisor de activos', 'supervisor de operaciones']}>{children}</AuthGuard>
  );
}
