import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { ToastProvider } from '@/components/ui/toast';
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
  title: 'Cortexo — The Brain for Your Code',
  description:
    'Deploy. Detect. Debug. The only DevOps tool that deploys your code, catches bugs automatically, and tells you WHY they happened — powered by AI.',
  keywords: [
    'DevOps',
    'CI/CD',
    'error monitoring',
    'AI code review',
    'deployment automation',
    'bug detection',
  ],
  authors: [{ name: 'Cortexo' }],
  openGraph: {
    title: 'Cortexo — The Brain for Your Code',
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
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
