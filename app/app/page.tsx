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
    DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Pencil, Trash2 } from 'lucide-react'
import { DialogPortal, DialogOverlay } from '@/components/ui/dialog'

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
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

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

        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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

    const handleEditTodo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingTodo) return

        const response = await fetch('/api/todos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: editingTodo._id,
                name: editingTodo.name,
                project: editingTodo.project,
                deadlineDate: editingTodo.deadlineDate,
            }),
        })

        if (response.ok) {
            const updatedTodo = await response.json()
            setTodos(todos.map(t =>
                t._id?.toString() === editingTodo._id?.toString() ? updatedTodo : t
            ))
            setIsEditDialogOpen(false)
            setEditingTodo(null)
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
        <div className="pb-20"> {/* Add padding-bottom to account for navbar */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Todo</Button>
                    </DialogTrigger>
                    <DialogPortal>
                        <DialogOverlay />
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
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Save</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </DialogPortal>
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
                                            onClick={() => {
                                                setEditingTodo(todo)
                                                setIsEditDialogOpen(true)
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteTodo(todo._id?.toString() || '')}
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

            <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                setIsEditDialogOpen(open)
                if (!open) setEditingTodo(null)
            }}>
                <DialogPortal>
                    <DialogOverlay />
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Todo</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditTodo} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editingTodo?.name || ''}
                                    onChange={e =>
                                        setEditingTodo(prev => 
                                            prev ? { ...prev, name: e.target.value } : null
                                        )
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-project">Project</Label>
                                <Input
                                    id="edit-project"
                                    value={editingTodo?.project || ''}
                                    onChange={e =>
                                        setEditingTodo(prev => 
                                            prev ? { ...prev, project: e.target.value } : null
                                        )
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-deadline">Deadline</Label>
                                <Input
                                    id="edit-deadline"
                                    type="date"
                                    value={editingTodo?.deadlineDate || ''}
                                    onChange={e =>
                                        setEditingTodo(prev => 
                                            prev ? { ...prev, deadlineDate: e.target.value } : null
                                        )
                                    }
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </DialogPortal>
            </Dialog>
        </div>
    )
}
