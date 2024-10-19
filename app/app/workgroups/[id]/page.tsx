'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
}

export default function WorkgroupPage() {
  const [workgroup, setWorkgroup] = useState<Workgroup | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchWorkgroup = async () => {
      const response = await fetch(`/api/workgroups/${id}`);
      if (response.ok) {
        const data = await response.json();
        setWorkgroup(data);
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
      } else {
        setMessage(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      setMessage('An error occurred while sending the invitation');
    }
  };

  if (!workgroup) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{workgroup.name}</h1>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Invite Member</Button>
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
      
      {message && <p className="mt-4 text-sm text-gray-500">{message}</p>}
    </div>
  );
}
