import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'TCR ROI Calculator | Quality Data Systems',
  description:
    'Calculate the return on investment for implementing Teller Cash Recyclers at your financial institution. See how much you could save with TCR technology.',
  keywords: [
    'TCR',
    'Teller Cash Recycler',
    'ROI Calculator',
    'Banking Technology',
    'Cash Automation',
    'Branch Efficiency',
    'Quality Data Systems',
    'QDS',
  ],
  authors: [{ name: 'Quality Data Systems' }],
  openGraph: {
    title: 'TCR ROI Calculator | Quality Data Systems',
    description:
      'Calculate your potential savings with Teller Cash Recycler technology.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts - loaded via CSS link for better compatibility */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {children}

        {/* HubSpot Tracking Code */}
        <Script
          id="hs-script-loader"
          src="//js.hs-scripts.com/360991.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
