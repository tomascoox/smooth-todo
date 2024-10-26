import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const data = await request.json()
        const client = await clientPromise
        const db = client.db()

        // First check if the todo exists and belongs to the user
        const existingTodo = await db.collection('todos').findOne({
            _id: new ObjectId(params.id),
            userId: session.user.id
        })

        if (!existingTodo) {
            return new NextResponse('Todo not found', { status: 404 })
        }

        // Update the todo with new data while preserving other fields
        const updatedTodo = {
            ...existingTodo,
            name: data.name,
            project: data.project,
            deadlineDate: data.deadlineDate,
            workgroupId: data.workgroupId
        }

        // Perform the update
        await db.collection('todos').updateOne(
            { _id: new ObjectId(params.id) },
            { $set: updatedTodo }
        )

        // Return the updated todo
        return NextResponse.json(updatedTodo)
    } catch (error) {
        console.error('Error in PUT /api/todos/[id]:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
