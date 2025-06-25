import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, softDeleteUser, UserRecord } from '@/services/adminService';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const nav = useNavigate();

  useEffect(() => {
    setLoading(true);
    getAllUsers()
      .then(u => setUsers(u))
      .catch(err => {
        console.error(err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load users.',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleDelete = async (u: UserRecord) => {
    try {
      await softDeleteUser(u._id);
      setUsers(us =>
        us.map(x =>
          x._id === u._id ? { ...x, deleted: !u.deleted } : x
        )
      );
      toast({
        title: u.deleted ? 'User restored' : 'User soft-deleted'
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not change user status.'
      });
    }
  };

  if (loading) return <p className="p-6 text-center text-gray-300 dark:text-gray-400 animate-pulse">Loading…</p>;
  if (users.length === 0) return <p className="p-6 text-center text-gray-500 dark:text-gray-400">No users found.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 tracking-tight">User Management</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map(u => (
          <Card key={u._id} className="bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6 flex items-center space-x-6">
              <Avatar className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 shadow-md">
                {u.profileImage ? (
                  <AvatarImage src={u.profileImage} alt={u.name} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-semibold text-xl">{u.name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{u.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{u.email}</p>
                <Badge className={u.role === 'admin' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}>{u.role}</Badge>
              </div>
            </CardContent>
            <CardFooter className="p-6 bg-gray-50 dark:bg-gray-800 flex justify-between">
              <Button size="sm" variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" onClick={() => nav(`/admin/users/${u._id}`)}>
                View
              </Button>
              <Button size="sm" variant={u.deleted ? 'outline' : 'destructive'} className={`${u.deleted ? 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' : 'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800'} rounded-lg`} onClick={() => toggleDelete(u)}>
                {u.deleted ? 'Restore' : 'Delete'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}