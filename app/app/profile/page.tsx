'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { user, updateUser } = useUser();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('/images/default-avatar.png');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (user) {
      setName(user.name || '');
      setAvatar(user.image || '/images/default-avatar.png');
    }
  }, [status, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        updateUser({ name });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          setAvatar(data.url);
          updateUser({ image: data.url });
        }
      } catch (error) {
        console.error('Failed to upload avatar:', error);
      }
    }
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 relative group">
                  <Image
                    src={avatar}
                    alt="User Avatar"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full">
                Update Profile
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
