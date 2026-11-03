import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Onest } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import './catalog.css';

const bricolage = Bricolage_Grotesque({ variable: '--font-bricolage', subsets: ['latin'], axes: ['opsz', 'wdth'] });
const onest = Onest({ variable: '--font-onest', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'MJ 3D | Catálogo de Navidad 2026',
  description: 'Adornos y regalos de Navidad impresos en 3D en Marcos Juárez. Elegí el producto y el color y consultanos por WhatsApp.',
  openGraph: { title: 'MJ 3D | Catálogo de Navidad 2026', description: 'Adornos y regalos de Navidad impresos en 3D en Marcos Juárez.', locale: 'es_AR', type: 'website' },
};

export const viewport: Viewport = { themeColor: '#01141B', viewportFit: 'cover' };

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${bricolage.variable} ${onest.variable}`}>
      <body>{children}</body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
