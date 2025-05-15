import React, { FC } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout: FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar (top on desktop, bottom on mobile) */}
      <Navbar />

      {/* Main content – padded so mobile nav doesn’t cover */}
      <main className="flex-1 p-6 md:p-8 pb-20 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
