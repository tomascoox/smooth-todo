import { TopNavbar } from '@/components/TopNavbar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <TopNavbar />
      <main className="flex-grow pt-4 px-4">
        {children}
      </main>
    </>
  );
}
