import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('Fetching workgroup with id:', params.id);
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    console.log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectToDatabase();

  try {
    console.log('Searching for workgroup with id:', params.id, 'and member:', session.user.email);
    const workgroup = await db.collection('workgroups').findOne({
      _id: new ObjectId(params.id),
      $or: [
        { members: session.user.email },
        { ownerId: session.user.id }
      ]
    });

    if (!workgroup) {
      console.log('Workgroup not found');
      return NextResponse.json({ error: 'Workgroup not found' }, { status: 404 });
    }

    console.log('Workgroup found:', workgroup);
    return NextResponse.json(workgroup);
  } catch (error) {
    console.error('Error fetching workgroup:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectToDatabase();

    try {
        // First check if the user is the owner of the workgroup
        const workgroup = await db.collection('workgroups').findOne({
            _id: new ObjectId(params.id),
            ownerId: session.user.id
        });

        if (!workgroup) {
            return NextResponse.json({ error: 'Workgroup not found or unauthorized' }, { status: 404 });
        }

        // Delete the workgroup
        const result = await db.collection('workgroups').deleteOne({
            _id: new ObjectId(params.id)
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Failed to delete workgroup' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Workgroup deleted successfully' });
    } catch (error) {
        console.error('Error deleting workgroup:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
