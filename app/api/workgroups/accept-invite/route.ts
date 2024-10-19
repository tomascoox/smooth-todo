import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  console.log('Accept invite route called');
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invitationId } = await req.json();
    console.log('Invitation ID:', invitationId);

    if (!invitationId) {
      console.log('Missing invitation ID');
      return NextResponse.json({ error: 'Missing invitation ID' }, { status: 400 });
    }

    const db = await connectToDatabase();

    // Find the invitation
    const invitation = await db.collection('invitations').findOne({
      _id: new ObjectId(invitationId),
      status: 'pending'
    });

    if (!invitation) {
      console.log('Invitation not found or already processed');
      return NextResponse.json({ error: 'Invitation not found or already processed' }, { status: 404 });
    }

    // Update the invitation status
    await db.collection('invitations').updateOne(
      { _id: new ObjectId(invitationId) },
      { $set: { status: 'accepted' } }
    );

    console.log('Updating workgroup');
    const workgroup = await db.collection('workgroups').findOne({ _id: invitation.workgroupId });

    if (!workgroup) {
      console.log('Workgroup not found');
      return NextResponse.json({ error: 'Workgroup not found' }, { status: 404 });
    }

    const updatedMembers = Array.from(new Set([...workgroup.members, session.user.email]));
    const updatedInvitedMembers = workgroup.invitedMembers.filter((email: string) => email !== session.user.email);

    const updateResult = await db.collection('workgroups').updateOne(
      { _id: invitation.workgroupId },
      { 
        $set: { 
          members: updatedMembers,
          invitedMembers: updatedInvitedMembers
        }
      }
    );

    console.log('Workgroup update result:', updateResult);

    if (updateResult.matchedCount === 0) {
      console.log('Workgroup not found');
      return NextResponse.json({ error: 'Workgroup not found' }, { status: 404 });
    }

    console.log('Workgroup updated successfully');
    return NextResponse.json({ message: 'Invitation accepted successfully' });
  } catch (error: any) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'Failed to accept invitation', details: error.message }, { status: 500 });
  }
}
