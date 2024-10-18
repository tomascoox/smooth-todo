'use client';

import { useUser } from '@/contexts/UserContext';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function TopNavbar() {
  const { user } = useUser();
  const [avatarUrl, setAvatarUrl] = useState('/images/default-avatar.png');
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    if (user) {
      setAvatarUrl(user.image || '/images/default-avatar.png');
      setUserName(user.name || user.email || 'User');
    }
  }, [user]);

  return (
    <nav className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={avatarUrl}
              alt="User Avatar"
              width={32}
              height={32}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <span className="font-semibold text-lg ml-2">Hello {userName}</span>
        </div>
        <button className="p-2">
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </nav>
  );
}
