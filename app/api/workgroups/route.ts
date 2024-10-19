import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectToDatabase();

  try {
    console.log('Fetching workgroups for user:', session.user.email);
    const workgroups = await db.collection('workgroups').find({
      $or: [
        { members: session.user.email },
        { invitedMembers: session.user.email },
        { ownerId: session.user.id }
      ]
    }).toArray();

    console.log('Workgroups found:', workgroups);
    return NextResponse.json(workgroups);
  } catch (error) {
    console.error('Error fetching workgroups:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { name } = await req.json();
    const db = await connectToDatabase();

    const newWorkgroup = {
      name,
      ownerId: session.user.id,
      members: [session.user.email],
      invitedMembers: [],
    };

    const result = await db.collection('workgroups').insertOne(newWorkgroup);
    console.log('New workgroup created:', { ...newWorkgroup, _id: result.insertedId });
    return NextResponse.json({ ...newWorkgroup, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating workgroup:', error);
    return NextResponse.json({ error: 'Failed to create workgroup' }, { status: 500 });
  }
}
