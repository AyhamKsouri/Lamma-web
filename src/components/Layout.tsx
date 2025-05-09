import { Outlet } from "react-router-dom";
import { FC } from "react";
import Navbar from "./Navbar";
import AppSidebar from "./Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const Layout: FC = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        {/* Sidebar always on the left */}
        <AppSidebar />

        {/* Right section: navbar + content */}
        <div className="flex-1 flex flex-col">
          {/* Fixed navbar */}
          <Navbar />
         
            <SidebarInset className="p-6 w-full">
              <Outlet />
            </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
