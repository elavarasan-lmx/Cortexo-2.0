import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { ModalProvider } from '@/components/modal-provider';
import { QueryProvider } from '@/components/query-provider';
import { PLATFORM_DEFAULTS } from '@/lib/platform-config';
import './globals.css';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: PLATFORM_DEFAULTS.seoTitle,
  description: PLATFORM_DEFAULTS.seoDescription,
  keywords: [
    'DevOps',
    'CI/CD',
    'error monitoring',
    'AI code review',
    'deployment automation',
    'bug detection',
    'bullion',
    'Logimax',
  ],
  authors: [{ name: PLATFORM_DEFAULTS.author }],
  openGraph: {
    title: PLATFORM_DEFAULTS.seoTitle,
    description:
      'Deploy. Detect. Debug. AI-powered DevOps for small teams.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen font-sans antialiased">
        <AuthProvider>
          <ThemeProvider>
            <QueryProvider>
              <ModalProvider>{children}</ModalProvider>
            </QueryProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
