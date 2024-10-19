'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function AcceptInvitePage() {
  const [message, setMessage] = useState('Processing invitation...');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationId = searchParams.get('id');
  const { data: session, status } = useSession();

  useEffect(() => {
    const checkInvitation = async () => {
      if (!invitationId) {
        setError('Invalid invitation link');
        return;
      }

      try {
        const response = await fetch(`/api/workgroups/check-invite?id=${invitationId}`);
        const data = await response.json();

        if (response.ok) {
          setMessage(`You've been invited to join the workgroup "${data.workgroupName}"`);
          if (status === 'authenticated') {
            handleAcceptInvitation();
          }
        } else {
          setError(data.error || 'Invalid invitation');
        }
      } catch (error) {
        console.error('Error checking invitation:', error);
        setError('An error occurred while checking the invitation');
      }
    };

    checkInvitation();
  }, [invitationId, status]);

  const handleAcceptInvitation = async () => {
    if (!session) {
      // Redirect to login page with a return URL
      router.push(`/login?returnUrl=/workgroups/accept-invite?id=${invitationId}`);
      return;
    }

    try {
      const response = await fetch('/api/workgroups/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Invitation accepted successfully! Redirecting to workgroups...');
        setTimeout(() => router.push('/app/workgroups'), 3000);
      } else {
        setError(data.error || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error in acceptInvitation:', error);
      setError('An error occurred while accepting the invitation');
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Accept Invitation</h1>
        <p className="text-red-500">{error}</p>
        <Button onClick={() => router.push('/app/workgroups')} className="mt-4">
          Go to Workgroups
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Accept Invitation</h1>
      <p>{message}</p>
      {status === 'unauthenticated' && (
        <div className="mt-4">
          <p>You need to log in or create an account to accept this invitation.</p>
          <Link href={`/login?returnUrl=/workgroups/accept-invite?id=${invitationId}`}>
            <Button className="mr-2">Log In</Button>
          </Link>
          <Link href={`/register?returnUrl=/workgroups/accept-invite?id=${invitationId}`}>
            <Button>Create Account</Button>
          </Link>
        </div>
      )}
      {status === 'authenticated' && (
        <Button onClick={handleAcceptInvitation} className="mt-4">
          Accept Invitation
        </Button>
      )}
    </div>
  );
}
