import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Archive, Settings, Calendar as CalIcon, Users, Heart } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fixProfileImagePath } from "@/lib/urlFix";

interface Event {
  id: number;
  title: string;
  date: string;
  attendees: number;
  likes: number;
}

export default function ProfilePage() {
  const { user } = useAuth(); // Real authenticated user with fresh data
  const [activeTab, setActiveTab] = useState<
    "My Events" | "Interested" | "Liked" | "Attending" | "Photos"
  >("My Events");

  // Mock events (replace with real data later)
  const events: Event[] = [
    { id: 1, title: "Summer Music Festival", date: "May 15, 2025", attendees: 120, likes: 24 },
    { id: 2, title: "Tech Conference 2025", date: "May 15, 2025", attendees: 98, likes: 31 },
    { id: 3, title: "Yoga in the Park", date: "May 15, 2025", attendees: 75, likes: 18 },
    { id: 4, title: "Photo Workshop", date: "May 15, 2025", attendees: 64, likes: 12 },
    { id: 5, title: "Wine Tasting Tour", date: "May 15, 2025", attendees: 45, likes: 22 },
    { id: 6, title: "Charity Gala Dinner", date: "May 15, 2025", attendees: 150, likes: 40 },
  ];

  const tabs = ["My Events", "Interested", "Liked", "Attending", "Photos"] as const;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row py-8 px-4 gap-8">

        {/* LEFT SIDEBAR */}
        <aside className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24 border-2 border-gray-200 dark:border-gray-700">
              {/* Use fixProfileImagePath here to transform backend path to URL */}
              <AvatarImage src={fixProfileImagePath(user.profileImage || "")} alt={user.name} />
              <AvatarFallback className="bg-blue-50 text-blue-500">
                {user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {user.name}
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
              <span>6</span>
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

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col space-y-6">
          {/* TABS */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
            >
              <TabsList className="px-4 bg-white dark:bg-gray-800">
                {tabs.map((tab) => (
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

            {/* EVENT CARDS */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col overflow-hidden"
                >
                  <div className="h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <CalIcon className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                  </div>

                  <div className="p-4 flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {evt.title}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <CalIcon className="w-4 h-4 mr-1" />
                      {evt.date}
                    </div>
                  </div>

                  <div className="px-4 py-2 bg-yellow-400 flex justify-between text-white text-sm">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {evt.attendees}
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {evt.likes}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
