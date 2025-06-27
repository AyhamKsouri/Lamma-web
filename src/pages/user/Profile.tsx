import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link , useNavigate} from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Archive, Settings, Calendar as CalIcon, Users, Loader2, MapPin, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/services/api";
import { fetchFollowers, fetchFollowing, SimpleUser } from "@/services/userAccountClient";
import { getMyEvents, getGoingEvents, getInterestedEvents, getLikedEvents, EventData } from "@/services/eventService";
import { AuthError } from "@/services/api";
import { format, parseISO, isValid } from "date-fns";
import { fixProfileImagePath } from "@/lib/urlFix";


interface User {
  _id: string;
  name?: string;
  email: string;
  profileImage?: string;
  bio?: string;
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
  const { user, reloadUser } = useAuth();
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
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const navigate = useNavigate();


  useEffect(() => {
    console.log("User object:", user);
  }, [user]);

  const getInitials = () => {
    if (!user?.name) return "JD";
    const [first, second] = user.name.trim().split(" ");
    return (first[0] + (second?.[0] || "")).toUpperCase();
  };

  const openFollowers = async () => {
    console.log("⏳ openFollowers() for", user!._id);
    try {
      setIsFollowersLoading(true);
      setFollowersError(null);
      const list = await fetchFollowers(user!._id);
      console.log("Followers Data:", list, "Length:", list.length);
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
      const list2 = await fetchFollowing(user!._id) || [];
      console.log("Following Data:", list2, "Length:", list2.length);
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
        const res = await api.get(`/api/user-account/${user?._id}?t=${Date.now()}`);
        console.log("Full User Response:", res.data);
        setFollowers(res.data.followersCount || 0);
        setFollowing(res.data.followingCount || 0);
        setBio(res.data.bio || '');
      } catch (err) {
        console.error("Failed to fetch user data:", err.response?.data || err.message);
        setStatsError("Failed to load user data.");
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

  const handleEditBio = () => setIsEditingBio(true);
  const handleSaveBio = async () => {
    try {
      await api.put(`/api/user-account/${user._id}/bio`, { bio });
      setIsEditingBio(false);
      if (reloadUser) reloadUser();
    } catch (err) {
      console.error("Error saving bio:", err);
      setStatsError("Failed to update bio.");
    }
  };
  const handleCancelBio = () => {
    setBio(user?.bio || '');
    setIsEditingBio(false);
  };
  const handleBioChange = (e) => setBio(e.target.value);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <p className="text-gray-500 text-lg">Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row py-4 px-2 md:px-4 gap-6">
        <aside className="w-full md:w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 flex flex-col justify-between max-h-[95vh] overflow-auto bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-gray-800 dark:to-gray-900">
          <div className="flex flex-col items-center space-y-4 relative">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-cyan-400 shadow-lg transform hover:scale-110 transition-transform duration-300">
                <AvatarImage
                  src={fixProfileImagePath(user?.profileImage || "")}
                  alt={user?.name || "User"}
                  className="rounded-full object-cover"
                />
                <AvatarFallback className="bg-cyan-200 text-cyan-800 font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <Sparkles className="absolute -top-4 -right-4 h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name || "User"}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center">{user.email}</p>
            {statsError && <p className="text-red-500 text-sm">{statsError}</p>}
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link to="/edit-profile">
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full hover:from-cyan-600 hover:to-purple-700 transition-all duration-200">
                <Edit className="w-5 h-5 mr-2" />
                Edit Profile
              </Button>
            </Link>

            <Button
              asChild
              variant="outline"
              className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
            >
              <Link to="/archive">
                <Archive className="w-5 h-5 mr-2" />
                View Archive
              </Link>
            </Button>

            {/* --- Modern & Fun BIO CARD --- */}
            <div className="mt-4 bg-gradient-to-br from-cyan-100 to-purple-200 dark:from-gray-800 dark:to-gray-900 p-4 rounded-2xl shadow-lg transform hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-extrabold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" /> About Me
              </h3>
              {isEditingBio ? (
                <div className="space-y-2">
                  <textarea
                    value={bio}
                    onChange={handleBioChange}
                    placeholder="Share your awesome story! 🎉"
                    className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 resize-y min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveBio}
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700 rounded-full px-3 py-1 transition-all duration-200"
                    >
                      Save & Shine ✨
                    </Button>
                    <Button
                      onClick={handleCancelBio}
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full px-3 py-1 transition-all duration-200"
                    >
                      Oops, Cancel!
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-800 p-2 rounded-lg shadow-inner">
                    {bio || "No epic tale yet! Click 'Edit Profile' to unleash your vibe! 🚀"}
                  </p>
                  <Button
                    onClick={handleEditBio}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 animate-pulse-slow"
                  >
                    <Edit className="w-5 h-5 mr-2" /> Edit My Story
                  </Button>
                </div>
              )}
            </div>
              
            <Button
              variant="outline"
              size="icon"
              className="self-end border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
                    onClick={() => navigate('/settings')}

            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>My Events</span>
              <span>{events.length}</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <button onClick={openFollowers} className="font-semibold hover:underline text-cyan-600 dark:text-cyan-400">
                Followers {followers}
              </button>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <button onClick={openFollowing} className="font-semibold hover:underline text-cyan-600 dark:text-cyan-400">
                Following {following}
              </button>
            </div>
          </div>
        </aside>
        <main className="flex-1 max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
              <TabsList className="px-6 bg-white dark:bg-gray-800">
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
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-b-2xl">
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                  <p className="text-red-500 text-lg">{error}</p>
                  <Button variant="outline" onClick={handleRetry} className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600 rounded-full px-6 py-2">
                    Try Again
                  </Button>
                </div>
              ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-6">
                  <p className="text-gray-500 text-xl">No events found</p>
                  <Link to="/new-event">
                    <Button variant="default" className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white hover:from-cyan-500 hover:to-purple-600 rounded-full px-6 py-3">
                      Create Your First Event
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-2"
                    >
                      <div className="h-40 bg-gray-100 dark:bg-gray-700 relative">
                        {event.bannerUrl && !imageError[event.id] ? (
                          <img
                            src={event.bannerUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={() => setImageError((prev) => ({ ...prev, [event.id]: true }))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CalIcon className="w-12 h-12 text-gray-300 dark:text-gray-500" aria-hidden="true" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 px-2 py-1 bg-cyan-500 text-white text-sm rounded-full">
                          {event.visibility}
                        </div>
                      </div>
                      <div className="p-4 flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate text-lg">{event.title}</h3>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex flex-col gap-2">
                          <div className="flex items-center">
                            <CalIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span className="truncate">{formatDateTime(event.startDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 flex justify-between items-center text-white text-sm">
                        <span className="capitalize truncate">{event.category}</span>
                        <Link to={`/events/${event.id}`} className="text-white hover:text-cyan-100 text-sm font-medium">
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