import './globals.css'

export const metadata = {
  metadataBase: new URL('https://bangkokaudits.vercel.app'),
  title: {
    default: 'Bangkok Audits | Web3 Security',
    template: '%s | Bangkok Audits'
  },
  description: 'Elite Web3 security auditing from Bangkok. Protecting smart contracts from vulnerabilities. Trusted by leading DeFi protocols.',
  keywords: ['web3 security', 'smart contract audit', 'blockchain security', 'defi audit', 'solidity audit', 'bangkok', 'thailand'],
  authors: [{ name: 'Bangkok Audits' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Bangkok Audits | Web3 Security',
    description: 'Elite Web3 security auditing from Bangkok. Protecting smart contracts from vulnerabilities.',
    url: 'https://bangkokaudits.vercel.app',
    siteName: 'Bangkok Audits',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bangkok Audits | Web3 Security',
    description: 'Elite Web3 security auditing from Bangkok. Protecting smart contracts from vulnerabilities.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
