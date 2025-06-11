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
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import jsPDF from "jspdf";

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

  const exportToCSV = () => {
    const headers = ["Title", "Start Date", "End Date", "Location"];
    const rows = filteredEvents.map(ev => [ev.title, ev.startDate, ev.endDate, ev.location]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "user-events.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    filteredEvents.forEach((ev, index) => {
      doc.text(`- ${ev.title} | ${ev.startDate} to ${ev.endDate} | ${ev.location}`, 10, 10 + index * 10);
    });
    doc.save("user-events.pdf");
  };

  if (loadingUser) return <p className="p-6 text-center">Loading user…</p>;
  if (!user) return <p className="p-6 text-center text-red-500">User not found.</p>;

  const roleLabel = (user.role ?? "user").toUpperCase();
  const isAdminUser = user.role === "admin";

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">User Details</h1>
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="flex items-center space-x-6 p-6">
          <Avatar className="w-16 h-16">
            {user.profileImage ? (
              <Avatar>
                {user.profileImage ? (
                  <AvatarImage src={user.profileImage} alt={user.name} />
                ) : (
                  <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
            ) : (
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <Badge variant={isAdminUser ? "secondary" : "outline"}>{roleLabel}</Badge>
            <p className="text-sm text-gray-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 px-6 py-4">
          <Button variant={isAdminUser ? "outline" : "secondary"} disabled={busy} onClick={async () => {
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
          <Button variant="destructive" disabled={busy} onClick={async () => {
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
        </CardFooter>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Events Created</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Input placeholder="Search by title..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64" />
          <Select onValueChange={setTypeFilter} value={typeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue>{typeFilter === "all" ? "All" : typeFilter}</SelectValue>
            </SelectTrigger>
            <SelectContent>
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
          <p>Loading events…</p>
        ) : filteredEvents.length === 0 ? (
          <p className="text-gray-500">No events found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEvents.map(ev => (
              <Card key={ev._id} className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
                {ev.bannerUrl && (
                  <img src={ev.bannerUrl} alt={ev.title} className="h-32 w-full object-cover rounded-t" />
                )}
                <CardContent className="p-4">
                  <h3 className="font-medium">{ev.title}</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(ev.startDate).toLocaleDateString()} – {new Date(ev.endDate).toLocaleDateString()}
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
