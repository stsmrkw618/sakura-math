import './globals.css';

export const metadata = {
  title: 'SAKURA Math 🌸 さくら算数',
  description: '算数つまずき克服ドリル',
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F472B6',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen">
        <div className="max-w-[480px] mx-auto px-4 pb-8">
          {children}
        </div>
      </body>
    </html>
  );
}
