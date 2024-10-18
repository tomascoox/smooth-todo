import { TopNavbar } from '@/components/TopNavbar';
import { Navbar } from '@/components/Navbar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNavbar />
      <main className="flex-grow p-4 mt-16 mb-16">
        {children}
      </main>
      <Navbar />
    </div>
  );
}
