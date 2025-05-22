import React, { useEffect, useState } from 'react';
import { useNavigate }          from 'react-router-dom';
import { getAllUsers, softDeleteUser, UserRecord } from '@/services/adminService';
import { Card, CardContent, CardFooter }           from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage }     from '@/components/ui/avatar';
import { Button }                                   from '@/components/ui/button';
import { Badge }                                    from '@/components/ui/badge';
import { useToast }                                 from '@/components/ui/use-toast';

export default function UsersAdminPage() {
  const [users, setUsers]   = useState<UserRecord[]>([]);
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

  if (loading) return <p className="p-6">Loading…</p>;
  if (users.length === 0) return <p className="p-6">No users found.</p>;

  return (
    <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {users.map(u => (
        <Card key={u._id} className="dark:bg-gray-800">
          <CardContent className="flex items-center space-x-4">
            <Avatar className="w-12 h-12">
              {u.profileImage
                ? <AvatarImage src={u.profileImage} alt={u.name}/>
                : <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>}
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{u.name}</h3>
              <p className="text-sm text-gray-500">{u.email}</p>
            </div>
            <Badge variant={u.role==='admin' ? 'secondary' : 'outline'}>
              {u.role}
            </Badge>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button size="sm" variant="outline" onClick={()=>nav(`/admin/users/${u._id}`)}>
              View
            </Button>
            <Button size="sm"
                    variant={u.deleted ? 'outline' : 'destructive'}
                    onClick={()=>toggleDelete(u)}>
              {u.deleted ? 'Restore' : 'Delete'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
