// src/components/Navbar.tsx

import React, { FC, useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  BarChart2,
  PlusCircle,
  Shield,     // lucide-react Shield icon
  Sun,
  Moon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { fixProfileImagePath } from "@/lib/urlFix";

const baseLinks = [
  { to: "/",        label: "Home",     icon: Home },
  { to: "/calendar",label: "Calendar", icon: Calendar },
  { to: "/new-event",label: "New Event", icon: PlusCircle },
  { to: "/events",  label: "Events",   icon: BarChart2 },
] as const;

const Navbar: FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Build links array, appending Admin if user.role === 'admin'
  const links = [
    ...baseLinks,
    ...(user?.role === "admin"
      ? [{ to: "/admin", label: "Admin", icon: Shield }]
      : []),
  ];

  // Theme toggle & click‐outside handler
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
      {/* Desktop Top Nav */}
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

        {/* Dark toggle + Profile */}
        <div className="flex items-center space-x-4 relative" ref={menuRef}>
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle dark mode"
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-800" />
            )}
          </button>

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
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 mt-2 w-56 bg-white dark:bg-gray-700 shadow-lg rounded-md py-2 z-30"
              >
                {user && (
                  <div className="px-4 py-3 border-b dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleProfileClick}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
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
