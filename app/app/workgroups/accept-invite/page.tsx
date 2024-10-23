'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [workgroupName, setWorkgroupName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const invitationId = searchParams.get('id');

  useEffect(() => {
    const checkInvitation = async () => {
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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkInvitation();
  }, [invitationId]);

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

  if (loading) {
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
            <Button onClick={handleAcceptInvitation} disabled={loading}>
              {loading ? 'Accepting...' : 'Accept Invitation'}
            </Button>
          ) : (
            <>
              <Button onClick={() => signIn(undefined, { callbackUrl: `/app/workgroups/accept-invite?id=${invitationId}` })}>
                Login to Accept
              </Button>
              <Button variant="outline" onClick={() => router.push(`/register?redirect=/app/workgroups/accept-invite?id=${invitationId}`)}>
                Create Account
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
