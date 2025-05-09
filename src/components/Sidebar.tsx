import { FC } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Home, Calendar, BarChart2, User, PlusCircle } from "lucide-react";
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/events", label: "Events", icon: BarChart2 },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/new-event", label: "New Event", icon: PlusCircle },
];

const AppSidebar: FC = () => {
  const location = useLocation();

  return (
    <UISidebar variant="sidebar" collapsible="icon">
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="pl-4 pr-2 py-4">
  <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Lamma</span>
</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.to}
                    tooltip={item.label}
                  >
                    <NavLink to={item.to}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="md:hidden p-2">
        <SidebarTrigger />
      </div>
    </UISidebar>
  );
};

export default AppSidebar;
