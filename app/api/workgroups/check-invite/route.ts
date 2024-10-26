import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing invitation ID' }, { status: 400 });
  }

  const db = await connectToDatabase();

  try {
    const invitation = await db.collection('invitations').findOne({
      _id: new ObjectId(id),
      status: 'pending'
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    const workgroup = await db.collection('workgroups').findOne({
      _id: invitation.workgroupId
    });

    if (!workgroup) {
      return NextResponse.json({ error: 'Workgroup not found' }, { status: 404 });
    }

    // Check if the invited email already has an account
    const existingUser = await db.collection('users').findOne({
      email: invitation.invitedEmail
    });

    return NextResponse.json({ 
      workgroupName: workgroup.name,
      hasAccount: !!existingUser,  // This converts null/undefined to false
      invitedEmail: invitation.invitedEmail
    });
  } catch (error) {
    console.error('Error checking invitation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
