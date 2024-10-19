'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface Workgroup {
    _id: string
    name: string
    members: string[]
    invitedMembers: string[]
}

export default function WorkgroupsPage() {
    const [workgroups, setWorkgroups] = useState<Workgroup[]>([])
    const [newWorkgroupName, setNewWorkgroupName] = useState('')
    const { data: session } = useSession()

    useEffect(() => {
        const fetchWorkgroups = async () => {
            const response = await fetch('/api/workgroups')
            if (response.ok) {
                const data = await response.json()
                setWorkgroups(data)
            }
        }

        if (session) {
            fetchWorkgroups()
        }
    }, [session])

    const handleCreateWorkgroup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newWorkgroupName.trim()) return

        const response = await fetch('/api/workgroups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newWorkgroupName }),
        })

        if (response.ok) {
            const newWorkgroup = await response.json()
            setWorkgroups([...workgroups, newWorkgroup])
            setNewWorkgroupName('')
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Workgroups</h1>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Create New Workgroup</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleCreateWorkgroup}
                        className="flex gap-2"
                    >
                        <Input
                            type="text"
                            value={newWorkgroupName}
                            onChange={e =>
                                setNewWorkgroupName(e.target.value)
                            }
                            placeholder="Workgroup name"
                            className="flex-grow"
                        />
                        <Button type="submit">
                            Create Workgroup
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {workgroups.map(workgroup => (
                    <Card key={workgroup._id}>
                        <CardHeader>
                            <CardTitle>{workgroup.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Members: {workgroup.members.length}</p>
                            <p>
                                Invited:{' '}
                                {workgroup.invitedMembers.length}
                            </p>
                            <Link
                                href={`/app/workgroups/${workgroup._id}`}
                                passHref
                            >
                                <Button className="mt-2">
                                    View Workgroup
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
