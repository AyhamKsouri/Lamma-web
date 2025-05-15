// src/components/AppSidebar.tsx
import React, { FC } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Calendar, BarChart2, User, PlusCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// your nav items
const links = [
  { to: "/",          label: "Home",      icon: Home       },
  { to: "/calendar",  label: "Calendar",  icon: Calendar   },
  { to: "/events",    label: "Events",    icon: BarChart2  },
  { to: "/profile",   label: "Profile",   icon: User       },
  { to: "/new-event", label: "New Event", icon: PlusCircle},
];

const AppSidebar: FC = () => {
  const location = useLocation();
  const { open, setOpenMobile } = useSidebar();

  const close = () => setOpenMobile(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setOpenMobile(true)}>
          <Menu className="w-5 h-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>

      {/* Backdrop + Drawer for mobile */}
      {open && (
        <>
          {/* Dark backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={close}
          />

          {/* Drawer panel */}
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col shadow-lg">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-xl font-bold">Lamma</span>
              <Button variant="ghost" size="icon" onClick={close}>
                <X className="w-5 h-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto p-2">
              <ul className="space-y-1">
                {links.map(({ to, label, icon: Icon }) => (
                  <li key={label}>
                    <NavLink
                      to={to}
                      onClick={close}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700 hover:bg-gray-100"
                        )
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:h-screen md:fixed md:left-0 md:top-0 border-r bg-white">
        <div className="p-4 border-b">
          <span className="text-xl font-bold">Lamma</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <li key={label}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Spacer so page content shifts right on desktop */}
      <div className="hidden md:block md:w-64" />
    </>
  );
};

export default AppSidebar;
