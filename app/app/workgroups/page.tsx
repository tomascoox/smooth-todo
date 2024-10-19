'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Workgroup } from '@/lib/models/Workgroup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function WorkgroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workgroups, setWorkgroups] = useState<Workgroup[]>([]);
  const [newWorkgroupName, setNewWorkgroupName] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchWorkgroups();
    }
  }, [status, router]);

  const fetchWorkgroups = async () => {
    const response = await fetch('/api/workgroups');
    if (response.ok) {
      const data = await response.json();
      setWorkgroups(data);
    }
  };

  const handleCreateWorkgroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/workgroups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newWorkgroupName }),
    });

    if (response.ok) {
      setNewWorkgroupName('');
      fetchWorkgroups();
    }
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Workgroups</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Create New Workgroup</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWorkgroup} className="space-y-4">
              <Input
                type="text"
                placeholder="Workgroup name"
                value={newWorkgroupName}
                onChange={(e) => setNewWorkgroupName(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">Create Workgroup</Button>
            </form>
          </CardContent>
        </Card>

        {workgroups.map((workgroup) => (
          <Card key={workgroup._id?.toString()}>
            <CardHeader>
              <CardTitle>{workgroup.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Members: {workgroup.members.length}</p>
              <p>Invited: {workgroup.invitedMembers.length}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
