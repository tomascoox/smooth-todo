'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Users, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/app' },
  { icon: Users, label: 'Workgroups', href: '/app/workgroups' },
  { icon: User, label: 'Profile', href: '/app/profile' },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  if (pathname === '/' || pathname === '/login' || pathname === '/register') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              pathname === href ? "text-blue-500" : "text-gray-500 hover:text-blue-500"
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-500"
        >
          <LogOut className="h-6 w-6" />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </div>
    </nav>
  );
}
