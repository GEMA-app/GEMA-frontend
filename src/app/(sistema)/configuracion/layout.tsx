import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ConfiguracionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard roleRequired={['admin']}>{children}</AuthGuard>;
}
