import { NavLink, useLocation } from "react-router-dom";
import {
  Mic,
  LayoutDashboard,
  ListChecks,
  History as HistoryIcon,
  User,
  Info,
  Menu,
  X,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useEffect } from "react";

const navItems = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/history", label: "History", icon: HistoryIcon },
  { to: "/goals", label: "Goals", icon: ListChecks },
  { to: "/about", label: "About", icon: Info },
];

export function AppSidebar() {
  const location = useLocation();
  const { open, setOpen, toggleSidebar } = useSidebar();

  // Close the sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      {/* SIDEBAR */}
      <aside
        className={[
          "fixed md:static top-0 left-0 h-full z-40 border-r bg-card/60 backdrop-blur-sm transition-all duration-300 ease-in-out",
          // width behavior on desktop
          open ? "md:w-64" : "md:w-16",
          // slide-in behavior on mobile
          open ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0",
          "flex flex-col",
        ].join(" ")}
      >
        {/* Header with brand + HAMBURGER */}
        <div
          className={[
            "h-14 border-b flex items-center",
            open ? "justify-between px-3 md:px-4" : "justify-center px-2",
          ].join(" ")}
        >
          {/* Brand (icon + text; text hidden when collapsed) */}
          <div className="flex items-center gap-2">
            <Mic className="text-primary shrink-0" size={20} />
            {open && <span className="font-semibold">Clario Voice Studio</span>}
          </div>

          {/* Hamburger inside sidebar header */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md border bg-background hover:bg-muted transition ml-2"
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* NAV LINKS */}
        <nav className="p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={[
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                  active
                    ? "bg-primary/10 text-foreground border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  open ? "justify-start" : "justify-center",
                ].join(" ")}
              >
                <Icon size={18} className={active ? "text-primary" : ""} />
                {/* Label hidden when collapsed (desktop) */}
                {open && <span className="truncate">{label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={["mt-auto p-3 text-xs text-muted-foreground", open ? "" : "text-center"].join(" ")}>
          {open ? <>© {new Date().getFullYear()} Clario</> : "©"}
        </div>
      </aside>

      {/* MOBILE OVERLAY (click to close) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* FLOATING HAMBURGER WHEN SIDEBAR IS CLOSED ON MOBILE */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md border bg-card shadow-md hover:bg-muted transition md:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
      )}
    </>
  );
}
