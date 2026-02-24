"use client";

import { Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 glass">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {/* Breadcrumb will go here */}
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-md hover:bg-muted/50 transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>
      </div>
    </header>
  );
}
