'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Todo } from '@/lib/models/Todo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Trash2, Check, X } from 'lucide-react'

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [todos, setTodos] = useState<Todo[]>([])
    const [filter, setFilter] = useState('all')
    const [sortBy, setSortBy] = useState('deadlineDate')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [newTodo, setNewTodo] = useState({
        name: '',
        project: '',
        deadlineDate: '',
    })
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            fetchTodos()
        }
    }, [status, router])

    const fetchTodos = async () => {
        const response = await fetch('/api/todos')
        if (response.ok) {
            const data = await response.json()
            setTodos(data)
        }
    }

    const handleCreateTodo = async (e: React.FormEvent) => {
        e.preventDefault()

        console.log('Type of name:', typeof newTodo.name)
        console.log('Content of name:', newTodo.name)
        console.log('Type of project:', typeof newTodo.project)
        console.log('Content of project:', newTodo.project)

        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(newTodo),
        })

        if (response.ok) {
            const createdTodo = await response.json()
            setTodos([...todos, createdTodo])
            setNewTodo({ name: '', project: '', deadlineDate: '' })
            setIsDialogOpen(false)
        }
    }

    const handleToggleTodo = async (id: string) => {
        const todo = todos.find(t => t._id?.toString() === id)
        if (!todo) return

        const response = await fetch('/api/todos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, completed: !todo.completed }),
        })

        if (response.ok) {
            const updatedTodo = await response.json()
            setTodos(
                todos.map(t =>
                    t._id?.toString() === id ? updatedTodo : t
                )
            )
        }
    }

    const handleDeleteTodo = async (id: string) => {
        const response = await fetch(`/api/todos?id=${id}`, {
            method: 'DELETE',
        })

        if (response.ok) {
            setTodos(todos.filter(t => t._id?.toString() !== id))
        } else {
            console.error('Failed to delete todo')
        }
    }

    const filteredTodos = todos.filter(todo => {
        if (filter === 'all') return true
        if (filter === 'my') return todo.userId === session?.user.id
        return true
    })

    const sortedTodos = [...filteredTodos].sort((a, b) => {
        if (sortBy === 'deadlineDate') {
            return sortOrder === 'asc'
                ? new Date(a.deadlineDate).getTime() -
                      new Date(b.deadlineDate).getTime()
                : new Date(b.deadlineDate).getTime() -
                      new Date(a.deadlineDate).getTime()
        }
        if (sortBy === 'name') {
            return sortOrder === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name)
        }
        return 0
    })

    const toggleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(column)
            setSortOrder('asc')
        }
    }

    if (status === 'loading') return <div>Loading...</div>
    if (!session) return null

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Dialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button>Add Todo</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Todo</DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={handleCreateTodo}
                            className="space-y-4"
                        >
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newTodo.name}
                                    onChange={e =>
                                        setNewTodo({
                                            ...newTodo,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="project">
                                    Project
                                </Label>
                                <Input
                                    id="project"
                                    value={newTodo.project}
                                    onChange={e =>
                                        setNewTodo({
                                            ...newTodo,
                                            project: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="deadlineDate">
                                    Deadline
                                </Label>
                                <Input
                                    id="deadlineDate"
                                    type="date"
                                    value={newTodo.deadlineDate}
                                    onChange={e =>
                                        setNewTodo({
                                            ...newTodo,
                                            deadlineDate:
                                                e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <Button type="submit">Save</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="mb-4 flex space-x-2">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                >
                    All Todos
                </Button>
                <Button
                    variant={filter === 'my' ? 'default' : 'outline'}
                    onClick={() => setFilter('my')}
                >
                    My Todos
                </Button>
            </div>

            <Card className="w-full">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    onClick={() => toggleSort('name')}
                                    className="cursor-pointer"
                                >
                                    Name{' '}
                                    {sortBy === 'name' &&
                                        (sortOrder === 'asc'
                                            ? '↑'
                                            : '↓')}
                                </TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead
                                    onClick={() =>
                                        toggleSort('deadlineDate')
                                    }
                                    className="cursor-pointer"
                                >
                                    Deadline{' '}
                                    {sortBy === 'deadlineDate' &&
                                        (sortOrder === 'asc'
                                            ? '↑'
                                            : '↓')}
                                </TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedTodos.map(todo => (
                                <TableRow key={todo._id?.toString()}>
                                    <TableCell className="py-2">
                                        {todo.name}
                                    </TableCell>
                                    <TableCell className="py-2">
                                        {todo.project}
                                    </TableCell>
                                    <TableCell className="py-2">
                                        {new Date(
                                            todo.deadlineDate
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleToggleTodo(
                                                    todo._id?.toString() ||
                                                        ''
                                                )
                                            }
                                        >
                                            {todo.completed ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <X className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDeleteTodo(
                                                    todo._id?.toString() ||
                                                        ''
                                                )
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
