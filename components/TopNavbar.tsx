'use client';

import { useUser } from '@/contexts/UserContext';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function TopNavbar() {
  const { user } = useUser();
  const [avatarUrl, setAvatarUrl] = useState('/images/default-avatar.png');
  const [userName, setUserName] = useState('Guest');
  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      setAvatarUrl(user.image || '/images/default-avatar.png');
      setUserName(user.name || user.email || 'User');
    } else {
      setAvatarUrl('/images/default-avatar.png');
      setUserName('Guest');
    }
  }, [user]);

  if (pathname === '/' || pathname === '/login' || pathname === '/register') return null;

  return (
    <nav className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
            <Image
              src={avatarUrl}
              alt="User Avatar"
              width={32}
              height={32}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <span className="font-semibold">Hello {userName}</span>
        </div>
        <button className="p-2">
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </nav>
  );
}
