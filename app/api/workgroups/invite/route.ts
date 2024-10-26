import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.email) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    const { workgroupId, email } = await req.json()

    if (!workgroupId || !email) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        )
    }

    const db = await connectToDatabase()

    // Check if the user is a member of the workgroup
    const workgroup = await db.collection('workgroups').findOne({
        _id: new ObjectId(workgroupId),
        $or: [
            { members: session.user.email },
            { ownerId: session.user.id },
        ],
    })

    if (!workgroup) {
        return NextResponse.json(
            { error: 'Workgroup not found or user is not a member' },
            { status: 404 }
        )
    }

    // Check for existing invitation
    const existingInvitation = await db
        .collection('invitations')
        .findOne({
            workgroupId: new ObjectId(workgroupId),
            invitedEmail: email,
            status: 'pending',
        })

    if (existingInvitation) {
        return NextResponse.json(
            { error: 'Invitation already sent' },
            { status: 400 }
        )
    }

    // Create invitation
    const invitation = {
        _id: new ObjectId(),
        workgroupId: new ObjectId(workgroupId),
        invitedBy: session.user.email,
        invitedEmail: email,
        status: 'pending',
        createdAt: new Date(),
    }

    await db.collection('invitations').insertOne(invitation)

    // Add invited email to invitedMembers array in workgroup
    await db
        .collection('workgroups')
        .updateOne(
            { _id: new ObjectId(workgroupId) },
            { $addToSet: { invitedMembers: email } }
        )

    // Update the invite URL to not include /app/
    const inviteUrl = `${process.env.NEXTAUTH_URL}/workgroups/accept-invite?id=${invitation._id}`

    try {
        await sendEmail({
            to: email,
            subject: `Invitation to join ${workgroup.name}`,
            text: `You've been invited to join the workgroup "${workgroup.name}". Click here to accept: ${inviteUrl}`,
            html: `<p>You've been invited to join the workgroup "${workgroup.name}".</p><p><a href="${inviteUrl}">Click here to accept</a></p>`,
        })
    } catch (error) {
        console.error('Failed to send invitation email. Details:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            workgroupId,
            inviteEmail: email,
        })

        return NextResponse.json(
            {
                error: 'Failed to send invitation email',
                details:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error',
            },
            { status: 500 }
        )
    }

    return NextResponse.json({
        message: 'Invitation sent successfully',
    })
}
