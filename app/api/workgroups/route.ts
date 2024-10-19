import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { Workgroup } from '@/lib/models/Workgroup';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id || !session.user.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const workgroupsCollection = client.db().collection<Workgroup>('workgroups');
    const workgroups = await workgroupsCollection.find({
      $or: [
        { ownerId: session.user.id },
        { members: session.user.id },
        { invitedMembers: session.user.email },
      ],
    }).toArray();
    return NextResponse.json(workgroups);
  } catch (error) {
    console.error('Error fetching workgroups:', error);
    return NextResponse.json({ error: 'Failed to fetch workgroups' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { name } = await req.json();
    const client = await clientPromise;
    const workgroupsCollection = client.db().collection<Workgroup>('workgroups');

    const newWorkgroup: Workgroup = {
      name,
      ownerId: session.user.id,
      members: [session.user.id],
      invitedMembers: [],
    };

    const result = await workgroupsCollection.insertOne(newWorkgroup);
    return NextResponse.json({ ...newWorkgroup, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating workgroup:', error);
    return NextResponse.json({ error: 'Failed to create workgroup' }, { status: 500 });
  }
}
