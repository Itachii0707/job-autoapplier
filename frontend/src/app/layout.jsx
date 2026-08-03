import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'AI Job Auto-Applier Platform | Next.js 15',
  description: 'Autonomous multi-platform job applier powered by FastAPI, Playwright, Gemini AI & Next.js 15.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 pb-16">
          {children}
        </main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-medium">
          <p>© 2026 AI Job Auto-Applier Platform • Next.js 15 + FastAPI Architecture</p>
        </footer>
      </body>
    </html>
  );
}
