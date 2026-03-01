'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Shield, User as UserIcon } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface User {
  id: string
  name: string
  email: string
  role: string
  language: string
  createdAt: string
  _count: {
    habits: number
  }
}

export default function AdminUsersPage() {
  const { t } = useI18n()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userId))
        setDeleteDialog({ open: false, userId: null })
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.manageUsers')}</h2>
        <p className="text-muted-foreground">Manage all system users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.users')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {user.role === 'ADMIN' ? (
                      <Shield className="h-5 w-5 text-primary" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {user.role === 'ADMIN' ? t('admin.admin') : t('admin.user')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user._count.habits} habits
                    </p>
                  </div>
                  {user.role !== 'ADMIN' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialog({ open: true, userId: user.id })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, userId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.deleteUser')}</DialogTitle>
            <DialogDescription>
              {t('admin.confirmDeleteUser')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, userId: null })}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog.userId && handleDeleteUser(deleteDialog.userId)}
            >
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
