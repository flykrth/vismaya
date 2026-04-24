import { Plus_Jakarta_Sans, Manrope, Caveat } from 'next/font/google';
import { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/views/layout/Navigation';
import { Footer } from '@/views/layout/Footer';
import { createClient } from '@/models/supabaseServer';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/next';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-headline',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-accent',
});

export const metadata: Metadata = {
  title: 'Vismaya Camp 2026',
  description: 'A transformative summer camp experience blending adventure and spirituality.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${manrope.variable} ${caveat.variable} scroll-smooth`}>
      <body className="font-body bg-surface-container-lowest text-on-surface antialiased selection:bg-primary/30 selection:text-primary">
        <Navigation initialSession={session} />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
