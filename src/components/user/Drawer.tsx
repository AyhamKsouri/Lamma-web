// src/components/Drawer.tsx
import React, { FC, ReactNode } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number; // px
}

export const Drawer: FC<DrawerProps> = ({
  open,
  onClose,
  children,
  width = 280,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transform transition-transform
          ${open ? "translate-x-0" : `-translate-x-[${width}px]`}`}
        style={{ width }}
      >
        {children}
      </aside>
    </>
  );
};
