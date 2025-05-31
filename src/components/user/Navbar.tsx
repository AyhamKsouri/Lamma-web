import React, { FC, useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  BarChart2,
  PlusCircle,
  Shield,
  Sun,
  Moon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { fixProfileImagePath } from "@/lib/urlFix";
import NotificationBell from "@/components/user/NotificationBell";

const baseLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/new-event", label: "New Event", icon: PlusCircle },
  { to: "/events", label: "Events", icon: BarChart2 },
] as const;

const Navbar: FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const links = [
    ...baseLinks,
    ...(user?.role === "admin"
      ? [{ to: "/admin", label: "Admin", icon: Shield }]
      : []),
  ];

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleProfileClick = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  const handleSignOut = () => {
    setMenuOpen(false);
    signOut();
    navigate("/login");
  };

  const getInitials = () => {
    if (!user?.name) return "JD";
    const [first, second] = user.name.trim().split(" ");
    return (first[0] + (second?.[0] || "")).toUpperCase();
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex items-center justify-between bg-white dark:bg-gray-800 shadow sticky top-0 z-20 h-14 px-6">
        <div className="flex items-center space-x-8">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "text-cyan-500 font-semibold border-b-2 border-cyan-500"
                    : "text-gray-700 dark:text-gray-300 hover:text-cyan-500"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="relative flex items-center space-x-4" ref={menuRef}>
          <NotificationBell />

          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Open profile menu"
            className="flex items-center space-x-2 focus:outline-none"
          >
            <Avatar className="w-8 h-8 border-2 border-gray-200 dark:border-gray-600">
              <AvatarImage
                src={fixProfileImagePath(user?.profileImage || "")}
                alt={user?.name || "User"}
              />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline-block text-gray-800 dark:text-gray-100 font-medium">
              {user?.name || "User"}
            </span>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{
                  duration: 0.25,
                  ease: [0.17, 0.67, 0.83, 0.67],
                }}
                className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl z-50 overflow-hidden"
              >
                {user && (
                  <div className="px-4 py-4 border-b dark:border-gray-700 bg-white/60 dark:bg-gray-800/70">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                )}

                <div className="flex flex-col">
                  <button
                    onClick={handleProfileClick}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-800 dark:text-gray-200 transition"
                  >
                    👤 Profile
                  </button>

                  <button
                    onClick={() => setIsDark((prev) => !prev)}
                    className="w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-800 dark:text-gray-200 transition"
                  >
                    🌓 Theme
                    {isDark ? (
                      <Sun className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-gray-800 shadow-inner border-t z-20">
        <ul className="flex justify-around">
          {links.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `w-full flex flex-col items-center py-2 text-xs transition-colors ${
                    isActive
                      ? "text-cyan-500"
                      : "text-gray-500 dark:text-gray-400 hover:text-cyan-500"
                  }`
                }
              >
                <Icon className="w-6 h-6 mb-1" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
