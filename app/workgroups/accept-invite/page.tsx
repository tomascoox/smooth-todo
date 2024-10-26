'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [workgroupName, setWorkgroupName] = useState<string>('');
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [invitedEmail, setInvitedEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const invitationId = searchParams.get('id');

  useEffect(() => {
    const checkInvitation = async () => {
      // Don't proceed until we know the session status
      if (status === 'loading') return;

      if (!invitationId) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/workgroups/check-invite?id=${invitationId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify invitation');
        }

        setWorkgroupName(data.workgroupName);
        setHasAccount(data.hasAccount);
        setInvitedEmail(data.invitedEmail);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkInvitation();
  }, [invitationId, status]); // Add status to dependencies

  const handleAcceptInvitation = async () => {
    if (!invitationId) return;

    try {
      setLoading(true);
      const response = await fetch('/api/workgroups/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      router.push('/app/workgroups');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Instead of calling signIn directly, redirect to login page with proper parameters
    const callbackUrl = encodeURIComponent(`/workgroups/accept-invite?id=${invitationId}`);
    router.push(`/login?redirect=${callbackUrl}&email=${invitedEmail}`);
  };

  // Show loading state while session is being established
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[90%] max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-[90%] max-w-md">
        <CardHeader>
          <CardTitle>Workgroup Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join {workgroupName}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {status === 'authenticated' ? (
            session?.user?.email === invitedEmail ? (
              <Button onClick={handleAcceptInvitation} disabled={loading}>
                {loading ? 'Accepting...' : 'Accept Invitation'}
              </Button>
            ) : (
              <div className="text-red-500">
                This invitation was sent to {invitedEmail}. Please log in with that email address.
              </div>
            )
          ) : hasAccount ? (
            <Button onClick={handleLogin}>
              Login to Accept
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => router.push(`/register?invitationId=${invitationId}&email=${invitedEmail}`)}
            >
              Create Account
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
