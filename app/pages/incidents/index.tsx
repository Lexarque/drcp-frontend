import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incidentService } from "~/services/incident.service";
import { Link } from "react-router";
import RoleGuard from "~/components/auth/RoleGuard";
import { useAuth } from "~/hooks/useAuth";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Plus, Trash2, MapPin } from "lucide-react";

// Helper for formatting date without heavy libraries
const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "numeric"
  }).format(new Date(dateStr));
};

export default function IncidentsPage() {
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  
  const { data: incidents, isLoading, isError } = useQuery({
    queryKey: ["incidents"],
    queryFn: incidentService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: incidentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading incidents...</div>;
  // If a VICTIM gets a 403, it means the backend strictly forbids them.
  if (isError) return <div className="p-8 text-center text-destructive font-semibold">Failed to load incidents. You may not have permission.</div>;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "destructive";
      case "HIGH": return "destructive";
      case "MEDIUM": return "outline";
      case "LOW": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "REPORTED": return "default";
      case "ACTIVE": return "destructive";
      case "RESOLVED": return "secondary";
      case "CLOSED": return "outline";
      default: return "default";
    }
  };

  // Filter incidents: VICTIMs only see their own reports.
  // We assume reportedBy matches either user id, email, or name.
  const isVictimOnly = hasRole("VICTIM") && !hasRole("ADMIN") && !hasRole("RESPONDER");
  const displayedIncidents = isVictimOnly
    ? incidents?.filter(i => 
        i.reportedBy === user?.id || 
        i.reportedBy === user?.email || 
        i.reportedBy === user?.name ||
        i.reportedBy === (user as any)?.username
      )
    : incidents;

  return (
    <div className="container mx-auto p-6 max-w-7xl animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-neutral-100 dark:to-neutral-500">
            Incident Command
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Monitor and manage active emergency responses.
          </p>
        </div>
        <RoleGuard roles={["VICTIM"]}>
          <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all">
            <Link to="/incidents/new">
              <Plus className="mr-2 h-5 w-5" />
              Report Incident
            </Link>
          </Button>
        </RoleGuard>
      </div>

      <Card className="border-border/50 shadow-sm backdrop-blur-sm bg-card/95">
        <CardHeader>
          <CardTitle>{isVictimOnly ? "Your Reported Incidents" : "Recent Incidents"}</CardTitle>
          <CardDescription>
            {isVictimOnly 
              ? "A list of all incidents you have submitted." 
              : "A list of all reported and active incidents across sectors."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">Reported</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!displayedIncidents || displayedIncidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No incidents found.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedIncidents.map((incident) => (
                    <TableRow key={incident.id} className="group hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium text-muted-foreground">
                        #{String(incident.id || "").slice(0, 6)}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        <Link to={`/incidents/${incident.id}`} className="hover:underline flex items-center gap-2">
                          {incident.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(incident.status) as any} className="capitalize">
                          {(incident.status || "UNKNOWN").toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(incident.severity) as any} className={incident.severity === 'MEDIUM' ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20' : ''}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {incident.latitude != null ? Number(incident.latitude).toFixed(4) : "N/A"}, {incident.longitude != null ? Number(incident.longitude).toFixed(4) : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {incident.createdAt ? formatDate(incident.createdAt) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/incidents/${incident.id}`}>View</Link>
                          </Button>
                          <RoleGuard roles={["ADMIN"]}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault();
                                if (confirm("Are you sure you want to delete this incident?")) {
                                  deleteMutation.mutate(incident.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </RoleGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}