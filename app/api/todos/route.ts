import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const client = await clientPromise
        const db = client.db()
        const todos = await db.collection('todos').find({
            userId: session.user.id
        }).toArray()

        return NextResponse.json(todos)
    } catch (error) {
        console.error('Error in GET /api/todos:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const data = await request.json()
        const client = await clientPromise
        const db = client.db()

        const todo = {
            ...data,
            userId: session.user.id,
            creationDate: new Date().toISOString()
        }

        const result = await db.collection('todos').insertOne(todo)
        const createdTodo = await db.collection('todos').findOne({ _id: result.insertedId })

        return NextResponse.json(createdTodo)
    } catch (error) {
        console.error('Error in POST /api/todos:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return new NextResponse('Missing id parameter', { status: 400 })
        }

        const client = await clientPromise
        const db = client.db()

        const result = await db.collection('todos').deleteOne({
            _id: new ObjectId(id),
            userId: session.user.id  // Ensure user can only delete their own todos
        })

        if (result.deletedCount === 0) {
            return new NextResponse('Todo not found', { status: 404 })
        }

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error in DELETE /api/todos:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
