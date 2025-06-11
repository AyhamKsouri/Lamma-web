import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";
import { format } from "date-fns";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface UserData {
  _id: string;
  email: string;
  userInfo?: {
    name?: string;
    profileImage?: string;
  };
}

interface EventData {
  _id: string;
  title: string;
  startDate: string;
  bannerUrl?: string;
  visibility?: string;
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserData | null>(null);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [createdEvents, setCreatedEvents] = useState<EventData[]>([]);
  const [likedEvents, setLikedEvents] = useState<EventData[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<EventData[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    if (!id) return;
    try {
      const [userRes, statsRes, createdRes, likedRes, attendingRes] = await Promise.all([
        api.get(`/api/user-account/${id}`),
        api.get(`/api/user-account/${id}/follow-stats`),
        api.get(`/api/event/user/${id}/public-events`),
        api.get(`/api/event/user/${id}/liked`, {
          headers: { "Cache-Control": "no-cache" },
          params: { t: Date.now() } // 👈 unique query each time to bust cache
        }),

        api.get(`/api/event/user/${id}/attending`),
      ]);
      console.log("✅ likedRes.data:", likedRes.data);


      setUser(userRes.data);
      setFollowers(statsRes.data.followersCount || 0);
      setFollowing(statsRes.data.followingCount || 0);
      setCreatedEvents(createdRes.data);
      setLikedEvents(
        Array.isArray(likedRes.data)
          ? likedRes.data.filter(e => String(e.visibility).toLowerCase() === "public")
          : []
      );
      setAttendingEvents(attendingRes.data.filter((e) => e.visibility === "public"));

      const currentUserId = localStorage.getItem("userId");
      if (currentUserId) {
        const currentUser = await api.get(`/api/user-account/${currentUserId}`);
        const userInfoId = currentUser.data.userInfo._id;
        const targetUserInfoId = userRes.data.userInfo._id;
        const isFollowing = currentUser.data.userInfo.following.includes(targetUserInfoId);
        setIsFollowing(isFollowing);
      }
    } catch (err) {
      console.error("Failed to load user or events:", err);
      setError("User not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!id) return;
    try {
      const response = await api.post(`/api/user-account/follow/${id}`);
      setIsFollowing(response.data.isFollowing);
      setFollowers(response.data.followers);
    } catch (err) {
      console.error("Failed to toggle follow:", err);
      setError("Failed to toggle follow.");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error || !user)
    return <div className="p-6 text-red-500 font-medium">{error || "User not found."}</div>;

  const renderEvents = (events: EventData[]) =>
    events.length === 0 ? (
      <p className="text-gray-400">No events available.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event._id} className="border rounded-lg p-4 hover:shadow transition">
            <img
              src={event.bannerUrl || "/default-event-banner.jpg"}
              alt={event.title}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <h3 className="font-semibold text-white">{event.title}</h3>
            <p className="text-sm text-gray-400">
              {format(new Date(event.startDate), "MMMM do, yyyy")}
            </p>
          </div>
        ))}
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src={
              user.userInfo?.profileImage
                ? `${import.meta.env.VITE_API_URL}/uploads/profileImages/${user.userInfo.profileImage}`
                : "/images/profile-pic.png"
            }
            className="w-20 h-20 rounded-full object-cover border"
            alt="Profile"
          />
          <div>
            <h1 className="text-2xl font-bold">{user.userInfo?.name || "Unnamed"}</h1>
            <p className="text-gray-400">{user.email}</p>
            <p className="text-sm text-gray-400">
              Followers: {followers} • Following: {following}
            </p>
          </div>
        </div>

        <Button
          className="bg-purple-600 text-white hover:bg-purple-700"
          onClick={handleFollowToggle as (e: React.MouseEvent<HTMLButtonElement>) => void}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="created" className="space-y-4">
        <TabsList className="flex space-x-4">
          <TabsTrigger value="created">Created</TabsTrigger>
          <TabsTrigger value="liked">Liked</TabsTrigger>
          <TabsTrigger value="attending">Attending</TabsTrigger>
        </TabsList>

        <TabsContent value="created">{renderEvents(createdEvents)}</TabsContent>
        <TabsContent value="liked">{renderEvents(likedEvents)}</TabsContent>
        <TabsContent value="attending">{renderEvents(attendingEvents)}</TabsContent>
      </Tabs>
    </div>
  );
}