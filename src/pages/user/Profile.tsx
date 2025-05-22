import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Archive, Settings, Calendar as CalIcon, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMyEvents, EventData } from "@/services/eventService";
import { AuthError } from "@/services/api";
import { format, parseISO, isValid } from "date-fns";

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"My Events" | "Interested" | "Liked" | "Attending" | "Photos">("My Events");
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedEvents = await getMyEvents();
        console.log("Fetched events:", fetchedEvents);
        setEvents(fetchedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        if (err instanceof AuthError) {
          setError('Please sign in again to view your events.');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load events. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user]);

  const handleRetry = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedEvents = await getMyEvents();
      setEvents(fetchedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (date: string | undefined, time: string | undefined) => {
    try {
      if (!date || !time) {
        throw new Error(`Invalid input: date=${date}, time=${time}`);
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new Error(`Invalid date format: ${date}`);
      }
      let fullTime = time;
      if (time.length === 5) {
        fullTime = `${time}:00`;
      } else if (!/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
        throw new Error(`Invalid time format: ${time}`);
      }
      const dateTime = parseISO(`${date}T${fullTime}`);
      if (!isValid(dateTime)) {
        throw new Error(`Invalid date-time: ${date}T${fullTime}`);
      }
      return format(dateTime, "MMM d, yyyy 'at' h:mm a");
    } catch (err) {
      console.error('Date formatting error:', err, { date, time });
      return `${date || 'Unknown date'} ${time || 'Unknown time'}`;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row py-8 px-4 gap-8">
        <aside className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24 border-2 border-gray-200 dark:border-gray-700">
              <AvatarImage src={user.profileImage} alt={user.name} />
              <AvatarFallback className="bg-blue-50 text-blue-500">
                {user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {user.name || 'User'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/edit-profile">
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                <Edit className="w-5 h-5 mr-2" />
                Edit Profile
              </Button>
            </Link>
            <Button
              asChild
              variant="outline"
              className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Link to="/archive">
                <Archive className="w-5 h-5 mr-2" />
                View Archive
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="self-end border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>My Events</span>
              <span>{events.length}</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Followers</span>
              <span>0</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Following</span>
              <span>0</span>
            </div>
          </div>
        </aside>
        <main className="flex-1 flex flex-col space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="px-4 bg-white dark:bg-gray-800">
                {["My Events", "Interested", "Liked", "Attending", "Photos"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="px-6 py-4 text-gray-700 dark:text-gray-300 
                      data-[state=active]:text-cyan-500 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="p-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p className="text-gray-500">Loading events...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <p className="text-red-500">{error}</p>
                  <Button variant="outline" onClick={handleRetry} className="mt-2">
                    Try Again
                  </Button>
                </div>
              ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-4">
                  <p className="text-gray-500">No events found</p>
                  <Link to="/new-event">
                    <Button variant="default" className="bg-cyan-500 hover:bg-cyan-600">
                      Create Your First Event
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="h-32 bg-gray-100 dark:bg-gray-700 relative">
                        {event.bannerUrl ? (
                          <img
                            src={event.bannerUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error("Image failed to load:", event.bannerUrl);
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                              const icon = document.createElement('div');
                              icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-gray-300 dark:text-gray-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
                              e.currentTarget.parentElement?.appendChild(icon);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CalIcon className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 px-2 py-1 bg-cyan-500 text-white text-xs rounded-full">
                          {event.visibility}
                        </div>
                      </div>
                      <div className="p-4 flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {event.title}
                        </h3>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex flex-col gap-1.5">
                          <div className="flex items-center">
                            <CalIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">
                              {formatDateTime(event.startDate, event.startTime)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span className=" truncate">{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-cyan-500 flex justify-between items-center text-white text-sm">
                        <span className="capitalize truncate">{event.category}</span>
                        <Link 
                          to={`/events/${event.id}`}
                          className="text-white hover:text-cyan-100 text-xs font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}