import { Outlet, Link, useLocation } from "react-router";
import { useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import Spinner from "../common/Spinner";
import { Button } from "~/components/ui/button";
import { Activity, ShieldAlert, Users, LogOut, LayoutDashboard } from "lucide-react";
import RoleGuard from "~/components/auth/RoleGuard";

export default function AppShell() {
  const { initialized, isAuthenticated, login, logout, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      login();
    }
  }, [initialized, isAuthenticated]);

  if (!initialized) return <Spinner />;
  if (!isAuthenticated) return null;

  const NavLink = ({ to, icon: Icon, children }: any) => {
    const isActive = location.pathname.startsWith(to) && (to !== "/dashboard" || location.pathname === "/dashboard");
    return (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        asChild
        className={`gap-2 justify-start ${isActive ? "bg-secondary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
      >
        <Link to={to}>
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{children}</span>
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 px-4 md:px-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 font-bold text-lg text-primary mr-4 md:mr-8">
          <Activity className="h-6 w-6" />
          <span className="hidden md:inline">DRCP System</span>
        </div>
        
        <nav className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
          <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
          <NavLink to="/incidents" icon={ShieldAlert}>Incidents</NavLink>
          <RoleGuard roles={["ADMIN"]}>
            <NavLink to="/admin/users" icon={Users}>Users</NavLink>
          </RoleGuard>
        </nav>

        <div className="flex items-center gap-4 ml-auto">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-muted-foreground mt-1">{user?.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}