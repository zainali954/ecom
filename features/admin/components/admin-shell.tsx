"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

export function AdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />
        <div
          className={cn(
            "flex min-h-screen flex-col transition-[margin-left] duration-200",
            "ml-0",
            collapsed ? "md:ml-16" : "md:ml-60",
          )}
        >
          <AdminHeader userName={userName} onMenuToggle={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
