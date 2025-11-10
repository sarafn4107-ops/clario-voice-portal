import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { AnimatedBackground } from "../AnimatedBackground"; // optional

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // ✅ No SidebarProvider here. It's already applied at the top level (main.tsx)
  return (
    <div className="min-h-screen flex w-full">
      {/* Optional background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <AnimatedBackground />
      </div>

      <AppSidebar />

      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 relative z-10">{children}</main>
      </div>
    </div>
  );
}
