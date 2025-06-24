import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Archive, Settings, Calendar as CalIcon, Users, Loader2, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/services/api";
import { fetchFollowers, fetchFollowing, SimpleUser } from "@/services/userAccountClient";
import { getMyEvents, getGoingEvents, getInterestedEvents, getLikedEvents, EventData } from "@/services/eventService";
import { AuthError } from "@/services/api";
import { format, parseISO, isValid } from "date-fns";

interface User {
  _id: string;
  name?: string;
  email: string;
  profileImage?: string;
}

type Tab = "My Events" | "Interested" | "Liked" | "Attending" | "Photos";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ title, isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[70vh] overflow-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-4 py-2 border-b dark:border-gray-700 flex justify-between">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} aria-label={`Close ${title} modal`} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </header>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("My Events");
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [followersList, setFollowersList] = useState<SimpleUser[]>([]);
  const [followingList, setFollowingList] = useState<SimpleUser[]>([]);
  const [followersError, setFollowersError] = useState<string | null>(null);
  const [followingError, setFollowingError] = useState<string | null>(null);
  const [isFollowersLoading, setIsFollowersLoading] = useState(true);
  const [isFollowingLoading, setIsFollowingLoading] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});

  const openFollowers = async () => {
    console.log("⏳ openFollowers() for", user!._id);
    try {
      setIsFollowersLoading(true);
      setFollowersError(null);

      const list = await fetchFollowers(user!._id);
      console.log("✅ fetchFollowers returned:", list);
      setFollowersList(list);

    } catch (err) {
      console.error("❌ Failed to fetch followers:", err);
      setFollowersError("Failed to load followers.");
    } finally {
      setIsFollowersLoading(false);
      setShowFollowers(true);
    }
  };


  const openFollowing = async () => {
    try {
      setIsFollowingLoading(true);
      setFollowingError(null);
      const list2 = await fetchFollowing((user!._id)) || [];
      setFollowingList(list2);
    } catch (err) {
      console.error("Failed to fetch following:", err);
      setFollowingError("Failed to load following.");
    } finally {
      setIsFollowingLoading(false);
      setShowFollowing(true);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsError(null);
        const res = await api.get(`/api/user-account/${user?._id}/follow-stats`);
        setFollowers(res.data.followersCount || 0);
        setFollowing(res.data.followingCount || 0);
      } catch (err) {
        console.error("Failed to fetch follow stats:", err);
        setStatsError("Failed to load follower stats.");
      }
    };

    if (user?._id) fetchStats();
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let fetchedEvents: EventData[] = [];
        switch (activeTab) {
          case "My Events":
            fetchedEvents = await getMyEvents();
            break;
          case "Interested":
            fetchedEvents = await getInterestedEvents();
            break;
          case "Liked":
            fetchedEvents = await getLikedEvents();
            break;
          case "Attending":
            fetchedEvents = await getGoingEvents();
            break;
          case "Photos":
            fetchedEvents = [];
            break;
        }

        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err instanceof AuthError ? "Please sign in again to view your events." : "Failed to load events.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchEvents();
  }, [user, activeTab]);

  const handleRetry = () => {
    if (user) {
      setError(null);
      setIsLoading(true);
    }
  };

  const formatDateTime = (date: string | undefined) => {
    if (!date) return "Date TBD";
    const dateTime = parseISO(date);
    return isValid(dateTime) ? format(dateTime, "MMM d, yyyy 'at' h:mm a") : "Date TBD";
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
        <aside className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col justify-between max-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24 border-2 border-gray-200 dark:border-gray-700">
              <AvatarImage src={user.profileImage} alt={user.name || "User"} />
              <AvatarFallback className="bg-blue-50 text-blue-500">{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user.name || "User"}</h2>
            <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
            {statsError && <p className="text-red-500 text-sm">{statsError}</p>}
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
              <button onClick={openFollowers} className="font-semibold hover:underline">
                Followers {followers}
              </button>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <button onClick={openFollowing} className="font-semibold hover:underline">
                Following {following}
              </button>
            </div>
          </div>
        </aside>
        <main className="flex-1 flex flex-col space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
              <TabsList className="px-4 bg-white dark:bg-gray-800">
                {["My Events", "Interested", "Liked", "Attending", "Photos"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="px-6 py-4 text-gray-700 dark:text-gray-300 data-[state=active]:text-cyan-500 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="p-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
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
                        {event.bannerUrl && !imageError[event.id] ? (
                          <img
                            src={event.bannerUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={() => setImageError((prev) => ({ ...prev, [event.id]: true }))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CalIcon className="w-8 h-8 text-gray-300 dark:text-gray-500" aria-hidden="true" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 px-2 py-1 bg-cyan-500 text-white text-xs rounded-full">
                          {event.visibility}
                        </div>
                      </div>
                      <div className="p-4 flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{event.title}</h3>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex flex-col gap-1.5">
                          <div className="flex items-center">
                            <CalIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{formatDateTime(event.startDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-cyan-500 flex justify-between items-center text-white text-sm">
                        <span className="capitalize truncate">{event.category}</span>
                        <Link to={`/events/${event.id}`} className="text-white hover:text-cyan-100 text-xs font-medium">
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
      <Modal title="Followers" isOpen={showFollowers} onClose={() => setShowFollowers(false)}>
        <ul className="space-y-3">
          {isFollowersLoading ? (
            <li className="text-gray-500">Loading followers...</li>
          ) : followersError ? (
            <li className="text-red-500">{followersError}</li>
          ) : followersList.length === 0 ? (
            <li className="text-gray-500">No followers found</li>
          ) : (
            followersList.map((u) => (
              <li key={u._id} className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={u.userInfo.profileImage} alt={u.userInfo.name} />
                  <AvatarFallback>{u.userInfo.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-gray-900 dark:text-gray-100">{u.userInfo.name}</span>
              </li>
            ))
          )}
        </ul>
      </Modal>
      <Modal title="Following" isOpen={showFollowing} onClose={() => setShowFollowing(false)}>
        <ul className="space-y-3">
          {isFollowingLoading ? (
            <li className="text-gray-500">Loading following...</li>
          ) : followingError ? (
            <li className="text-red-500">{followingError}</li>
          ) : followingList.length === 0 ? (
            <li className="text-gray-500">No following found</li>
          ) : (
            followingList.map((u) => (
              <li key={u._id} className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={u.userInfo.profileImage} alt={u.userInfo.name} />
                  <AvatarFallback>{u.userInfo.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-gray-900 dark:text-gray-100">{u.userInfo.name}</span>
              </li>
            ))
          )}
        </ul>
      </Modal>
    </div>
  );
}