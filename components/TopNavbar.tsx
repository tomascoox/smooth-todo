'use client';

import { useSession } from 'next-auth/react';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function TopNavbar() {
  const { data: session } = useSession();
  const [avatarUrl, setAvatarUrl] = useState('/images/default-avatar.png');

  useEffect(() => {
    if (session?.user?.image) {
      setAvatarUrl(session.user.image);
    }
  }, [session]);

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
          <span className="font-semibold text-lg ml-2">Hello {session?.user?.name || 'User'}</span>
        </div>
        <button className="p-2">
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </nav>
  );
}
