import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session)
        return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
        )

    try {
        const client = await clientPromise
        const todos = await client
            .db()
            .collection('todos')
            .find({ userId: session.user.id })
            .toArray()

        return NextResponse.json(
            todos.map(todo => ({
                ...todo,
                _id: todo._id.toString(),
                creationDate:
                    todo.creationDate instanceof Date
                        ? todo.creationDate.toISOString()
                        : todo.creationDate,
                deadlineDate:
                    todo.deadlineDate instanceof Date
                        ? todo.deadlineDate.toISOString()
                        : todo.deadlineDate,
            }))
        )
    } catch (error) {
        console.error('Error fetching todos:', error)
        return NextResponse.json(
            { error: 'Failed to fetch todos' },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
        )
    }

    try {
        const data = await req.json()
        console.log('Received data:', data) // Add this line

        const { name, project, deadlineDate } = data

        // Check if the required fields are present
        if (!name || !project || !deadlineDate) {
            console.error('Missing required fields:', {
                name,
                project,
                deadlineDate,
            })
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const newTodo = {
            name,
            project,
            creationDate: new Date(),
            deadlineDate: new Date(deadlineDate),
            userId: session.user.id,
        }


        const result = await client
            .db()
            .collection('todos')
            .insertOne(newTodo)

        return NextResponse.json({
            ...newTodo,
            _id: result.insertedId.toString(),
        })
    } catch (error) {
        console.error('Error creating todo:', error)
        return NextResponse.json(
            { error: 'Failed to create todo' },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session)
        return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
        )

    try {
        const id = new URL(req.url).searchParams.get('id')
        if (!id)
            return NextResponse.json(
                { error: 'Todo ID is required' },
                { status: 400 }
            )

        const client = await clientPromise
        const result = await client
            .db()
            .collection('todos')
            .deleteOne({
                _id: new ObjectId(id),
                userId: session.user.id,
            })

        if (result.deletedCount === 0) {
            return NextResponse.json(
                {
                    error: 'Todo not found or not authorized to delete',
                },
                { status: 404 }
            )
        }

        return NextResponse.json({
            message: 'Todo deleted successfully',
        })
    } catch (error) {
        console.error('Error deleting todo:', error)
        return NextResponse.json(
            { error: 'Failed to delete todo' },
            { status: 500 }
        )
    }
}
