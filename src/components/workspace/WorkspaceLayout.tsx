"use client";

import { ReactNode } from "react";

interface WorkspaceLayoutProps {
  leftSidebar: ReactNode;
  children: ReactNode;
  rightSidebar: ReactNode;
}

export function WorkspaceLayout({ leftSidebar, children, rightSidebar }: WorkspaceLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-bg-base">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-border-default bg-bg-elevated flex flex-col shrink-0">
        {leftSidebar}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-bg-base custom-scrollbar">
        {children}
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 border-l border-border-default bg-bg-elevated flex flex-col shrink-0">
        {rightSidebar}
      </aside>
    </div>
  );
}
