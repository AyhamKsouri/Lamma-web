import React, { useEffect, useState } from "react";
import {
  getAllEvents,
  banEvent,
  deleteEvent,
  AdminEventRecord
} from "@/services/adminService";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function EventsAdminPage() {
  const [events, setEvents]   = useState<AdminEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast }             = useToast();

  useEffect(() => {
    getAllEvents()
      .then(setEvents)
      .catch(() => toast({ variant: "destructive", title: "Failed to load events" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleAction = async (id: string, action: "ban" | "delete") => {
    try {
      if (action === "ban") await banEvent(id);
      else                   await deleteEvent(id);

      setEvents(evts => evts.filter(e => e._id !== id));
      toast({ title: `Event ${action === "ban" ? "banned" : "deleted"}` });
    } catch {
      toast({ variant: "destructive", title: `Failed to ${action} event` });
    }
  };

  if (loading) return <p className="p-6">Loading events…</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Events</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map(ev => (
            <TableRow key={ev._id}>
              <TableCell>{ev.title}</TableCell>
              <TableCell>
                {new Date(ev.startDate).toLocaleDateString()} –{" "}
                {new Date(ev.endDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{ev.createdBy.userInfo.name}</TableCell>
              <TableCell>
                {ev.banned   && <Badge variant="destructive">Banned</Badge>}
                {ev.deleted  && <Badge variant="destructive">Deleted</Badge>}
                {!ev.banned && !ev.deleted && <Badge>Active</Badge>}
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleAction(ev._id, "delete")}
                >
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(ev._id, "ban")}
                >
                  Ban
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
