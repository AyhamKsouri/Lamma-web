// src/pages/admin/UserDetailAdminPage.tsx

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getUserById,
  getEventsByUser,
  updateUserRole,
  softDeleteUser,
  UserRecord,
  EventRecord,
} from "@/services/adminService";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function UserDetailAdminPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<UserRecord | null>(null);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [busy, setBusy] = useState(false);

  // Fetch user details
  useEffect(() => {
    if (!id) return;
    setLoadingUser(true);
    getUserById(id)
      .then(setUser)
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load user.",
        });
        navigate("/admin/users", { replace: true });
      })
      .finally(() => setLoadingUser(false));
  }, [id, navigate, toast]);

  // Fetch events created by this user
  useEffect(() => {
    if (!id) return;
    setLoadingEvents(true);
    getEventsByUser(id)
      .then(setEvents)
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load user’s events.",
        });
      })
      .finally(() => setLoadingEvents(false));
  }, [id, toast]);

  // Loading / not-found states
  if (loadingUser) {
    return <p className="p-6 text-center">Loading user…</p>;
  }
  if (!user) {
    return (
      <p className="p-6 text-center text-red-500">User not found.</p>
    );
  }

  // Safe uppercase of role
  const roleLabel = (user.role ?? "user").toUpperCase();
  const isAdminUser = user.role === "admin";

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">User Details</h1>

      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="flex items-center space-x-6 p-6">
          <Avatar className="w-16 h-16">
            {user.profileImage ? (
              <AvatarImage src={user.profileImage} alt={user.name} />
            ) : (
              <AvatarFallback>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <Badge variant={isAdminUser ? "secondary" : "outline"}>
              {roleLabel}
            </Badge>
            <p className="text-sm text-gray-400">
              Joined: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 px-6 py-4">
          <Button
            variant={isAdminUser ? "outline" : "secondary"}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const newRole = isAdminUser ? "user" : "admin";
                const updated = await updateUserRole(user._id, newRole);
                setUser(updated);
                toast({
                  title: newRole === "admin" ? "Promoted to Admin" : "Demoted to User",
                });
              } catch {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Could not update role.",
                });
              } finally {
                setBusy(false);
              }
            }}
          >
            {isAdminUser ? "Revoke Admin" : "Make Admin"}
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await softDeleteUser(user._id);
                toast({ title: "User soft-deleted" });
                navigate("/admin/users");
              } catch {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Could not delete user.",
                });
              } finally {
                setBusy(false);
              }
            }}
          >
            Soft-Delete
          </Button>
        </CardFooter>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Events Created</h2>
        {loadingEvents ? (
          <p>Loading events…</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500">No events created.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((ev) => (
              <Card key={ev._id} className="bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <h3 className="font-medium">{ev.title}</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(ev.startDate).toLocaleDateString()} –{" "}
                    {new Date(ev.endDate).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end px-4 py-2">
                  <Link to={`/events/${ev._id}`}>
                    <Button size="sm">View</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
