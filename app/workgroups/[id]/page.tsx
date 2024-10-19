'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Workgroup {
  _id: string;
  name: string;
  members: string[];
  invitedMembers: string[];
  ownerId: string;
}

export default function WorkgroupPage() {
  const [workgroup, setWorkgroup] = useState<Workgroup | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchWorkgroup = async () => {
      try {
        console.log('Fetching workgroup with id:', id);
        const response = await fetch(`/api/workgroups/${id}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Workgroup data received:', data);
          setWorkgroup(data);
        } else {
          const errorData = await response.json();
          console.error('Error fetching workgroup:', errorData);
          setError(errorData.error || 'Failed to fetch workgroup');
        }
      } catch (error) {
        console.error('Error in fetchWorkgroup:', error);
        setError('An error occurred while fetching the workgroup');
      }
    };

    if (id) {
      fetchWorkgroup();
    }
  }, [id]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/workgroups/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workgroupId: id, email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Invitation sent successfully');
        setEmail('');
        setIsOpen(false);
        // Refresh workgroup data to update invitedMembers
        const updatedWorkgroup = await (await fetch(`/api/workgroups/${id}`)).json();
        setWorkgroup(updatedWorkgroup);
      } else {
        if (response.status === 400 && data.error === 'Invitation already sent') {
          setMessage('This user has already been invited to the workgroup');
        } else {
          setMessage(data.error || 'Failed to send invitation');
        }
      }
    } catch (error) {
      setMessage('An error occurred while sending the invitation');
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!workgroup) {
    return <div>Loading...</div>;
  }

  const isOwner = workgroup?.ownerId === session?.user?.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{workgroup?.name}</h1>
      <p>Members: {workgroup?.members.join(', ')}</p>
      <p>Invited: {workgroup?.invitedMembers.join(', ')}</p>
      
      {isOwner && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-4">Invite Member</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite to Workgroup</DialogTitle>
              <DialogDescription>
                Enter the email address of the person you want to invite to this workgroup.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite}>
              <div className="grid gap-4 py-4">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email to invite"
                  className="col-span-3"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">Send Invitation</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
      
      {message && <p className="mt-4 text-sm text-gray-500">{message}</p>}
    </div>
  );
}
