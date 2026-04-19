import { Plus_Jakarta_Sans, Manrope, Caveat } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/views/layout/Navigation';
import { Footer } from '@/views/layout/Footer';

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
  variable: '--font-handdrawn',
});

export const metadata = {
  title: 'Vismaya Camp 2026',
  description: 'Embody the Radiant Horizon at Vismaya Camp.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${manrope.variable} ${caveat.variable}`}>
      <body className="antialiased min-h-screen flex flex-col relative overflow-x-hidden">
        <Navigation />
        <main className="flex-grow relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
