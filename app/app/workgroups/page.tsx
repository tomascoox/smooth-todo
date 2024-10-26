'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { DialogPortal, DialogOverlay } from '@/components/ui/dialog'
import { Pencil, Trash2 } from 'lucide-react'

interface Workgroup {
    _id: string
    name: string
    members: string[]
    invitedMembers: string[]
}

export default function WorkgroupsPage() {
    const [workgroups, setWorkgroups] = useState<Workgroup[]>([])
    const [newWorkgroupName, setNewWorkgroupName] = useState('')
    const [selectedWorkgroup, setSelectedWorkgroup] =
        useState<Workgroup | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] =
        useState(false)
    const [editName, setEditName] = useState('')
    const [inviteEmail, setInviteEmail] = useState('')
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
            setIsCreateDialogOpen(false)
        }
    }

    const handleInviteMember = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inviteEmail.trim() || !selectedWorkgroup) return

        const response = await fetch('/api/workgroups/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                workgroupId: selectedWorkgroup._id,
                email: inviteEmail,
            }),
        })

        if (response.ok) {
            // Refresh workgroup data
            const updatedResponse = await fetch(
                `/api/workgroups/${selectedWorkgroup._id}`
            )
            if (updatedResponse.ok) {
                const updatedWorkgroup = await updatedResponse.json()
                setWorkgroups(
                    workgroups.map(w =>
                        w._id === updatedWorkgroup._id
                            ? updatedWorkgroup
                            : w
                    )
                )
                setSelectedWorkgroup(updatedWorkgroup)
            }
            setInviteEmail('')
        }
    }

    const handleDeleteWorkgroup = async (id: string) => {
        const response = await fetch(`/api/workgroups/${id}`, {
            method: 'DELETE',
        })

        if (response.ok) {
            setWorkgroups(workgroups.filter(w => w._id !== id))
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Workgroups</h1>
                <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button>Create Workgroup</Button>
                    </DialogTrigger>
                    <DialogPortal>
                        <DialogOverlay />
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Create New Workgroup
                                </DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={handleCreateWorkgroup}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newWorkgroupName}
                                        onChange={e =>
                                            setNewWorkgroupName(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <Button type="submit">Create</Button>
                            </form>
                        </DialogContent>
                    </DialogPortal>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableBody>
                            {workgroups.map(workgroup => (
                                <TableRow
                                    key={workgroup._id}
                                    className="cursor-pointer hover:bg-gray-100 h-8"
                                    onClick={() => {
                                        setSelectedWorkgroup(workgroup)
                                        setEditName(workgroup.name)
                                        setIsDialogOpen(true)
                                    }}
                                >
                                    <TableCell className="py-0 w-full">
                                        {workgroup.name}
                                    </TableCell>
                                    <TableCell className="py-0 w-[100px]">
                                        <div 
                                            className="flex justify-end gap-2 relative z-10"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                            }}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => {
                                                    setSelectedWorkgroup(workgroup)
                                                    setEditName(workgroup.name)
                                                    setIsDialogOpen(true)
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleDeleteWorkgroup(workgroup._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Workgroup Details Dialog */}
            <Dialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            >
                <DialogPortal>
                    <DialogOverlay />
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Workgroup Details</DialogTitle>
                        </DialogHeader>
                        {selectedWorkgroup && (
                            <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                            >
                                <AccordionItem value="name">
                                    <AccordionTrigger className="hover:no-underline">
                                        Name
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <Input
                                            value={editName}
                                            onChange={e =>
                                                setEditName(
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1"
                                        />
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="members">
                                    <AccordionTrigger className="hover:no-underline">
                                        Members ({selectedWorkgroup.members.length})
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-1">
                                            {selectedWorkgroup.members.map(
                                                member => (
                                                    <div
                                                        key={member}
                                                        className="text-sm flex items-center justify-between"
                                                    >
                                                        <span>
                                                            {member}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="pending">
                                    <AccordionTrigger className="hover:no-underline">
                                        Pending Invites ({selectedWorkgroup.invitedMembers.length})
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-1">
                                            {selectedWorkgroup.invitedMembers.map(
                                                member => (
                                                    <div
                                                        key={member}
                                                        className="text-sm flex items-center justify-between"
                                                    >
                                                        <span>
                                                            {member}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="invite">
                                    <AccordionTrigger className="hover:no-underline">
                                        Invite New Member
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <form
                                            onSubmit={handleInviteMember}
                                            className="space-y-2"
                                        >
                                            <div className="flex gap-2">
                                                <Input
                                                    type="email"
                                                    value={inviteEmail}
                                                    onChange={e =>
                                                        setInviteEmail(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Email address"
                                                />
                                                <Button type="submit">
                                                    Invite
                                                </Button>
                                            </div>
                                        </form>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        )}
                    </DialogContent>
                </DialogPortal>
            </Dialog>
        </div>
    )
}
