import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import PWAInstaller from '@/components/PWAInstaller';
import OfflineIndicator from '@/components/OfflineIndicator';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Dom TEA - Sistema de Acompanhamento Terapêutico',
  description: 'Sistema completo e profissional para acompanhamento de terapia ABA para crianças com autismo. Inclui insights de IA, gráficos detalhados e relatórios para terapeutas.',
  keywords: 'ABA, terapia, autismo, TEA, acompanhamento, insights, análise comportamental, aplicativo, app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Dom TEA',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Dom TEA',
    title: 'Dom TEA - Acompanhamento de Terapia ABA',
    description: 'Sistema completo para acompanhamento de terapia ABA para crianças com autismo.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dom TEA',
    description: 'Sistema completo para acompanhamento de terapia ABA.',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#199BF5' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />

        {/* iOS Specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dom TEA" />

        {/* Android Specific */}
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#199BF5" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />

        {/* Splash Screens for iOS */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-1125x2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-1242x2688.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
        />

        {/* Prevent zoom on input focus */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
        <PWAInstaller />
        <OfflineIndicator />
      </body>
    </html>
  );
}
