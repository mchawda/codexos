// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import LayoutProvider from '@/components/providers/layout-provider';
import { UserProvider } from '@/contexts/user-context';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://codexos.dev'),
  title: 'CodexOS - Autonomous Engineering OS',
  description: 'A next-level autonomous engineering OS. Modular, agentic, real-time, and scalable.',
  keywords: ['AI', 'Engineering', 'Development', 'Automation', 'LLM', 'Agent'],
  authors: [{ name: 'CodexOS Team' }],
  openGraph: {
    title: 'CodexOS - Autonomous Engineering OS',
    description: 'Build, orchestrate, and deploy AI-powered development workflows',
    type: 'website',
    locale: 'en_US',
    url: 'https://codexos.dev',
    siteName: 'CodexOS',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} custom-scrollbar cosmic-bg`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          themes={['light', 'dark']}
        >
          <UserProvider>
            <LayoutProvider>
              {children}
            </LayoutProvider>
            <Toaster />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}