import React, { useEffect, useState } from "react";
import {
  getAllEvents,
  banEvent,
  deleteEvent,
  AdminEventRecord,
  logEvent,
} from "@/services/adminService";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw } from "lucide-react";
import "@/styles/eventsAdminPage.css";

export default function EventsAdminPage() {
  const [events, setEvents] = useState<AdminEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await getAllEvents();
      setEvents(response);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to load events" });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "ban" | "softDelete") => {
    try {
      if (action === "ban") {
        await banEvent(id);
        setEvents(evts => evts.map(e => e._id === id ? { ...e, banned: true } : e));
        logEvent({
          userId: id, // Replace with actual user ID from context if available
          action: "BAN_EVENT",
          resource: `Event-${id}`,
          metadata: { title: events.find(e => e._id === id)?.title },
        });
      } else if (action === "softDelete") {
        // Assuming deleteEvent updates the 'deleted' field on the backend
        await deleteEvent(id); // Adjust backend to mark as soft delete
        setEvents(evts => evts.map(e => e._id === id ? { ...e, deleted: true } : e));
        logEvent({
          userId: id, // Replace with actual user ID from context if available
          action: "SOFT_DELETE_EVENT",
          resource: `Event-${id}`,
          metadata: { title: events.find(e => e._id === id)?.title },
        });
      }
      toast({ title: `Event ${action === "ban" ? "banned" : "soft deleted"}` });
    } catch (error) {
      toast({ variant: "destructive", title: `Failed to ${action} event` });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="events-admin-page p-6 min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Events</h1>
        <button
          onClick={fetchEvents}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Refresh
        </button>
      </div>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="py-3 px-4 font-semibold text-gray-700">Title</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-gray-700">Dates</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-gray-700">Owner</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-gray-700">Status</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  No events available.
                </TableCell>
              </TableRow>
            ) : (
              events.map((ev) => (
                <TableRow key={ev._id} className="hover:bg-gray-50 transition duration-150">
                  <TableCell className="py-3 px-4">{ev.title}</TableCell>
                  <TableCell className="py-3 px-4">
                    {new Date(ev.startDate).toLocaleDateString()} –{" "}
                    {new Date(ev.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-3 px-4">{ev.createdBy.userInfo.name}</TableCell>
                  <TableCell className="py-3 px-4">
                    {ev.banned && <Badge variant="destructive">Banned</Badge>}
                    {ev.deleted && <Badge variant="destructive">Deleted</Badge>}
                    {!ev.banned && !ev.deleted && <Badge variant="success">Active</Badge>}
                  </TableCell>
                  <TableCell className="py-3 px-4 space-x-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(ev._id, "softDelete")}
                      disabled={ev.banned || ev.deleted}
                    >
                      Soft Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(ev._id, "ban")}
                      disabled={ev.banned || ev.deleted}
                    >
                      Ban
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}