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
      status: 'pending',
      invitedEmail: session.user.email  // Make sure the logged-in user matches the invited email
    });

    if (!invitation) {
      console.log('Invitation not found or already processed');
      return NextResponse.json({ error: 'Invitation not found or already processed' }, { status: 404 });
    }

    // Delete the invitation first
    await db.collection('invitations').deleteOne({
      _id: new ObjectId(invitationId)
    });

    console.log('Updating workgroup');
    
    // Update the workgroup membership
    const updateResult = await db.collection('workgroups').updateOne(
      { _id: invitation.workgroupId },
      { 
        $addToSet: { members: session.user.email },
        $pull: { invitedMembers: invitation.invitedEmail }  // Use the value directly, not an object
      }
    );

    console.log('Workgroup update result:', updateResult);

    if (updateResult.matchedCount === 0) {
      console.log('Workgroup not found');
      return NextResponse.json({ error: 'Workgroup not found' }, { status: 404 });
    }

    if (updateResult.modifiedCount === 0) {
      console.log('No changes made to workgroup');
      return NextResponse.json({ error: 'No changes made to workgroup' }, { status: 400 });
    }

    console.log('Workgroup updated successfully');
    return NextResponse.json({ message: 'Invitation accepted successfully' });
  } catch (error: any) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'Failed to accept invitation', details: error.message }, { status: 500 });
  }
}
