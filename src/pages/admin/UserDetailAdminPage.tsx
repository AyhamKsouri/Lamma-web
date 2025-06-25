import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getUserById,
  getEventsByUser,
  updateUserRole,
  softDeleteUser,
  updateUserStatus,
  UserRecord,
  EventRecord,
} from "@/services/adminService";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function UserDetailAdminPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<UserRecord | null>(null);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventRecord[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    if (!id) return;
    setLoadingUser(true);
    getUserById(id)
      .then(setUser)
      .catch(() => {
        toast({ variant: "destructive", title: "Error", description: "Could not load user." });
        navigate("/admin/users", { replace: true });
      })
      .finally(() => setLoadingUser(false));
  }, [id, navigate, toast]);

  useEffect(() => {
    if (!id) return;
    setLoadingEvents(true);
    getEventsByUser(id)
      .then(events => {
        const sorted = [...events].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        setEvents(sorted);
        setFilteredEvents(sorted);
      })
      .catch(() => {
        toast({ variant: "destructive", title: "Error", description: "Could not load user’s events." });
      })
      .finally(() => setLoadingEvents(false));
  }, [id, toast]);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFilteredEvents(
      events.filter(ev =>
        ev.title?.toLowerCase().includes(lowerSearch) &&
        (typeFilter === "all" || ev.type === typeFilter)
      )
    );
  }, [search, typeFilter, events]);

  if (loadingUser) return <p className="p-6 text-center text-gray-300 animate-pulse">Loading user…</p>;
  if (!user) return <p className="p-6 text-center text-red-400">User not found.</p>;

  const roleLabel = (user.role ?? "user").toUpperCase();
  const isAdminUser = user.role === "admin";
  const isBanned = user.banned ?? false;

  const toggleBan = async () => {
    if (!user) return;
    setBusy(true);
    try {
      console.log("Toggling ban for user:", user._id, "Current banned:", isBanned);
      const raw = await updateUserStatus(user._id, !isBanned);
      // inject the new flag:
      const updatedUser: UserRecord = { ...raw, banned: !isBanned };
      console.log("API Response:", updatedUser);
      setUser(updatedUser); // Update state with the new user object
      toast({ title: isBanned ? "User unbanned" : "User banned" });
    } catch (error) {
      console.error("Ban toggle error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not change ban status.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">User Details</h1>
      <Card className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
        <CardContent className="p-6 flex items-center space-x-6">
          <Avatar className="w-24 h-24 border-4 border-indigo-100 shadow-md">
            {user.profileImage ? (
              <AvatarImage src={user.profileImage} alt={user.name} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-indigo-200 text-indigo-800 font-semibold text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 space-y-3">
            <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-lg text-gray-600">{user.email}</p>
            <Badge className={`px-3 py-1 rounded-full text-sm ${isAdminUser ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}>{roleLabel}</Badge>
            {isBanned && <Badge className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">Banned</Badge>}
            <p className="text-md text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
        <CardFooter className="p-6 bg-gray-50 flex justify-end space-x-4">
          <Button variant={isAdminUser ? "outline" : "default"} className={`px-6 py-2 rounded-lg ${isAdminUser ? 'border-gray-300 text-gray-700 hover:bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`} disabled={busy} onClick={async () => {
            setBusy(true);
            try {
              const newRole = isAdminUser ? "user" : "admin";
              const updated = await updateUserRole(user._id, newRole);
              setUser(updated);
              toast({ title: newRole === "admin" ? "Promoted to Admin" : "Demoted to User" });
            } catch {
              toast({ variant: "destructive", title: "Error", description: "Could not update role." });
            } finally {
              setBusy(false);
            }
          }}>{isAdminUser ? "Revoke Admin" : "Make Admin"}</Button>
          <Button variant="destructive" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" disabled={busy} onClick={async () => {
            setBusy(true);
            try {
              await softDeleteUser(user._id);
              toast({ title: "User soft-deleted" });
              navigate("/admin/users");
            } catch {
              toast({ variant: "destructive", title: "Error", description: "Could not delete user." });
            } finally {
              setBusy(false);
            }
          }}>Soft-Delete</Button>
          <Button variant={isBanned ? "outline" : "default"} className={`px-6 py-2 rounded-lg ${isBanned ? 'border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-200' : 'bg-yellow-600 text-white hover:bg-yellow-700'}`} disabled={busy} onClick={toggleBan}>
            {isBanned ? "Unban" : "Ban"}
          </Button>
        </CardFooter>
      </Card>

      <section className="space-y-6 mt-10">
        <h2 className="text-3xl font-bold text-gray-900">Events Created</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Input placeholder="Search by title..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-80 p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          <Select onValueChange={setTypeFilter} value={typeFilter}>
            <SelectTrigger className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
              <SelectValue>{typeFilter === "all" ? "All" : typeFilter}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 rounded-lg text-gray-900">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="sport">Sport</SelectItem>
              <SelectItem value="birthday">Birthday</SelectItem>
              <SelectItem value="rave">Rave</SelectItem>
              <SelectItem value="clubbing">Clubbing</SelectItem>
              <SelectItem value="wedding">Wedding</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loadingEvents ? (
          <p className="text-center text-gray-500 animate-pulse">Loading events…</p>
        ) : filteredEvents.length === 0 ? (
          <p className="text-center text-gray-500">No events found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {filteredEvents.map(ev => (
              <Card key={ev._id} className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                {ev.bannerUrl && (
                  <img src={ev.bannerUrl} alt={ev.title} className="h-48 w-full object-cover" />
                )}
                <CardContent className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800">{ev.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(ev.startDate).toLocaleDateString()} – {new Date(ev.endDate).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="p-5 bg-gray-50 flex justify-end">
                  <Link to={`/events/${ev._id}`}>
                    <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg transition-all">View</Button>
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