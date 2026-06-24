import { useAuth } from "~/hooks/useAuth";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ShieldAlert, Users, Activity } from "lucide-react";
import RoleGuard from "~/components/auth/RoleGuard";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto max-w-5xl animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Welcome back, {user?.firstName || "Responder"}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Here's an overview of the Disaster Response Command Platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Incidents Card */}
        <Card className="hover:shadow-md transition-all border-border/50">
          <CardHeader className="pb-4">
            <ShieldAlert className="h-8 w-8 text-destructive mb-2" />
            <CardTitle>Incidents</CardTitle>
            <CardDescription>View, report, and manage disaster incidents in real-time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full shadow-sm">
              <Link to="/incidents">Go to Incidents</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Users Card - Admin Only */}
        <RoleGuard roles={["ADMIN"]}>
          <Card className="hover:shadow-md transition-all border-border/50">
            <CardHeader className="pb-4">
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage personnel roles, statuses, and system access.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <Link to="/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>
        </RoleGuard>

        {/* Activity Card */}
        <Card className="hover:shadow-md transition-all border-border/50 opacity-70">
          <CardHeader className="pb-4">
            <Activity className="h-8 w-8 text-muted-foreground mb-2" />
            <CardTitle>System Health</CardTitle>
            <CardDescription>Platform operational metrics (Coming Soon).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              View Metrics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}