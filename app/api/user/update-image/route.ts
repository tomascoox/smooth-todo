import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { imageUrl } = await req.json();

  try {
    const client = await clientPromise;
    const usersCollection = client.db().collection('users');
    await usersCollection.updateOne(
      { email: session.user.email },
      { $set: { image: imageUrl } }
    );

    return NextResponse.json({ message: 'User image updated successfully' });
  } catch (error) {
    console.error('Error updating user image:', error);
    return NextResponse.json({ error: 'Failed to update user image' }, { status: 500 });
  }
}
