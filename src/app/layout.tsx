import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata = {
  title: 'Uncle Scrooge — Enterprise Financial AI Operating System',
  description: 'Autonomous financial intelligence OS for enterprise economic value optimization',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
