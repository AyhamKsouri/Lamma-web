import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";
import { fetchFollowers, fetchFollowing, SimpleUser } from "@/services/userAccountClient";
import { format } from "date-fns";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * A simple centered modal backdrop.
 */
const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[70vh] overflow-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-4 py-2 border-b dark:border-gray-700 flex justify-between">
          <h2 className="font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </header>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserData | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [createdEvents, setCreatedEvents] = useState<EventData[]>([]);
  const [likedEvents, setLikedEvents] = useState<EventData[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<EventData[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [error, setError] = useState("");

  // For the modals:
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState<SimpleUser[]>([]);
  const [followingList, setFollowingList] = useState<SimpleUser[]>([]);
  const [loadingFollowersList, setLoadingFollowersList] = useState(false);
  const [loadingFollowingList, setLoadingFollowingList] = useState(false);
  const [followersListError, setFollowersListError] = useState<string | null>(null);
  const [followingListError, setFollowingListError] = useState<string | null>(null);

  // Fetch profile, stats & events
  const fetchProfileAndEvents = async () => {
    if (!id) return;
    setLoadingProfile(true);
    try {
      const [
        userRes,
        statsRes,
        createdRes,
        likedRes,
        attendingRes,
      ] = await Promise.all([
        api.get(`/api/user-account/${id}`),
        api.get(`/api/user-account/${id}/follow-stats`),
        api.get(`/api/event/user/${id}/public-events`),
        api.get(`/api/event/user/${id}/liked`, {
          headers: { "Cache-Control": "no-cache" },
          params: { t: Date.now() },
        }),
        api.get(`/api/event/user/${id}/attending`),
      ]);

      setUser(userRes.data);
      setFollowersCount(statsRes.data.followersCount || 0);
      setFollowingCount(statsRes.data.followingCount || 0);

      setCreatedEvents(createdRes.data);
      setLikedEvents(
        Array.isArray(likedRes.data)
          ? likedRes.data.filter(
              (e) => String(e.visibility).toLowerCase() === "public"
            )
          : []
      );
      setAttendingEvents(
        attendingRes.data.filter((e) => e.visibility === "public")
      );

      // Determine if current user follows this profile
      const currentUserId = localStorage.getItem("userId");
      if (currentUserId) {
        const meRes = await api.get(`/api/user-account/${currentUserId}`);
        const myFollowing = await api.get(
          `/api/user-account/${currentUserId}/following`
        );
        const iFollow = Array.isArray(myFollowing.data) &&
          myFollowing.data.some((u: SimpleUser) => u._id === id);
        setIsFollowing(iFollow);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfileAndEvents();
  }, [id]);

  // Toggle follow/unfollow
  const handleFollowToggle = async () => {
    if (!id) return;
    setToggleLoading(true);
    try {
      const { data } = await api.post(`/api/user-account/follow/${id}`);
      setIsFollowing(data.isFollowing);

      // refresh counts from server
      const stats = await api.get(`/api/user-account/${id}/follow-stats`);
      setFollowersCount(stats.data.followersCount || 0);
      setFollowingCount(stats.data.followingCount || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to toggle follow.");
    } finally {
      setToggleLoading(false);
    }
  };

  // Load followers list for modal
  const openFollowers = async () => {
    if (!id) return;
    setFollowersListError(null);
    setLoadingFollowersList(true);
    try {
      const list = await fetchFollowers(id);
      setFollowersList(list);
    } catch (err) {
      console.error(err);
      setFollowersListError("Failed to load followers.");
    } finally {
      setLoadingFollowersList(false);
      setShowFollowersModal(true);
    }
  };

  // Load following list for modal
  const openFollowing = async () => {
    if (!id) return;
    setFollowingListError(null);
    setLoadingFollowingList(true);
    try {
      const list = await fetchFollowing(id);
      setFollowingList(list);
    } catch (err) {
      console.error(err);
      setFollowingListError("Failed to load following.");
    } finally {
      setLoadingFollowingList(false);
      setShowFollowingModal(true);
    }
  };

  if (loadingProfile) {
    return <div className="p-6">Loading profile…</div>;
  }
  if (error || !user) {
    return (
      <div className="p-6 text-red-500 font-medium">
        {error || "User not found."}
      </div>
    );
  }

  const renderEvents = (events: EventData[]) =>
    events.length === 0 ? (
      <p className="text-gray-400">No events available.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {events.map((ev) => (
          <div
            key={ev._id}
            className="border rounded-lg p-4 hover:shadow transition"
          >
            <img
              src={ev.bannerUrl || "/default-event-banner.jpg"}
              alt={ev.title}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <h3 className="font-semibold text-white">{ev.title}</h3>
            <p className="text-sm text-gray-400">
              {format(new Date(ev.startDate), "MMMM do, yyyy")}
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
            <h1 className="text-2xl font-bold">
              {user.userInfo?.name || "Unnamed"}
            </h1>
            <p className="text-gray-400">{user.email}</p>
            <p className="text-sm text-gray-400">
              <button
                onClick={openFollowers}
                className="hover:underline mr-2"
              >
                {followersCount} Followers
              </button>
              •
              <button
                onClick={openFollowing}
                className="hover:underline ml-2"
              >
                {followingCount} Following
              </button>
            </p>
          </div>
        </div>
        <Button
          onClick={handleFollowToggle}
          disabled={toggleLoading}
          className={`bg-purple-600 text-white hover:bg-purple-700 ${
            toggleLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {toggleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isFollowing ? (
            "Unfollow"
          ) : (
            "Follow"
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="created" className="space-y-4">
        <TabsList className="flex space-x-4">
          <TabsTrigger value="created">Created</TabsTrigger>
          <TabsTrigger value="liked">Liked</TabsTrigger>
          <TabsTrigger value="attending">Attending</TabsTrigger>
        </TabsList>

        <TabsContent value="created">
          {renderEvents(createdEvents)}
        </TabsContent>
        <TabsContent value="liked">{renderEvents(likedEvents)}</TabsContent>
        <TabsContent value="attending">
          {renderEvents(attendingEvents)}
        </TabsContent>
      </Tabs>

      {/* Followers Modal */}
      <Modal
        title={`Followers (${followersCount})`}
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
      >
        {loadingFollowersList ? (
          <p>Loading…</p>
        ) : followersListError ? (
          <p className="text-red-500">{followersListError}</p>
        ) : followersList.length === 0 ? (
          <p>No followers found.</p>
        ) : (
          <ul className="space-y-2">
            {followersList.map((u) => (
              <li
                key={u._id}
                className="flex items-center gap-3 py-1"
              >
                <img
                  src={
                    u.userInfo.profileImage
                      ? `${import.meta.env.VITE_API_URL}/uploads/profileImages/${u.userInfo.profileImage}`
                      : "/images/profile-pic.png"
                  }
                  className="w-8 h-8 rounded-full object-cover"
                  alt={u.userInfo.name}
                />
                <span className="font-medium">
                  {u.userInfo.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {/* Following Modal */}
      <Modal
        title={`Following (${followingCount})`}
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
      >
        {loadingFollowingList ? (
          <p>Loading…</p>
        ) : followingListError ? (
          <p className="text-red-500">{followingListError}</p>
        ) : followingList.length === 0 ? (
          <p>No one followed.</p>
        ) : (
          <ul className="space-y-2">
            {followingList.map((u) => (
              <li
                key={u._id}
                className="flex items-center gap-3 py-1"
              >
                <img
                  src={
                    u.userInfo.profileImage
                      ? `${import.meta.env.VITE_API_URL}/uploads/profileImages/${u.userInfo.profileImage}`
                      : "/images/profile-pic.png"
                  }
                  className="w-8 h-8 rounded-full object-cover"
                  alt={u.userInfo.name}
                />
                <span className="font-medium">
                  {u.userInfo.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}
