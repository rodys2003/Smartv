import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal de Afiliados | Smart TV Like a Pro',
  description: 'Gestiona tus enlaces de referido, comisiones acumuladas y liquidaciones en USDT por Binance.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AfiliadosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
