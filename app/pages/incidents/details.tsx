import { useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incidentService } from "~/services/incident.service";
import RoleGuard from "~/components/auth/RoleGuard";
import { useAuth } from "~/hooks/useAuth";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft, MapPin, Clock, AlertTriangle, Paperclip, CheckCircle2, History } from "lucide-react";

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "numeric"
  }).format(new Date(dateStr));
};

export default function IncidentDetailsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState<string>("");
  const [attachmentForm, setAttachmentForm] = useState({ fileName: "", fileUrl: "", contentType: "" });

  const { data: incident, isLoading, isError } = useQuery({
    queryKey: ["incidents", id],
    queryFn: () => incidentService.getById(id!),
    enabled: !!id,
  });

  const { data: historyData } = useQuery({
    queryKey: ["incidents", id, "history"],
    queryFn: () => incidentService.getStatusHistory(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => incidentService.updateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents", id] });
      queryClient.invalidateQueries({ queryKey: ["incidents", id, "history"] });
    }
  });

  const attachmentMutation = useMutation({
    mutationFn: (data: any) => incidentService.addAttachment(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents", id] });
      setAttachmentForm({ fileName: "", fileUrl: "", contentType: "" });
    }
  });

  const { user, hasRole } = useAuth();

  const handleUpdateStatus = () => {
    if (newStatus && newStatus !== incident.status) {
      updateStatusMutation.mutate(newStatus);
    }
  };

  const isVictimOnly = hasRole("VICTIM") && !hasRole("ADMIN") && !hasRole("RESPONDER");
  const isOwner = incident?.reportedBy === user?.id || incident?.reportedBy === user?.email || incident?.reportedBy === user?.name || incident?.reportedBy === (user as any)?.username;

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading incident details...</div>;
  if (isError || !incident) return <div className="p-8 text-center text-destructive font-semibold">Failed to load incident.</div>;
  if (isVictimOnly && !isOwner) {
    return (
      <div className="p-8 text-center animate-in fade-in zoom-in duration-300">
        <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view this incident report.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link to="/incidents">Return to Incidents</Link>
        </Button>
      </div>
    );
  }

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (attachmentForm.fileName && attachmentForm.fileUrl) {
      attachmentMutation.mutate(attachmentForm);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
          <Link to="/incidents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Incidents
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{incident.title}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <span className="font-mono text-sm">#{incident.id}</span>
              <span>•</span>
              <span>Reported by {incident.reportedBy}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="px-3 py-1 text-sm bg-background/50 backdrop-blur-sm">
              {incident.status}
            </Badge>
            <Badge variant={incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'destructive' : 'secondary'} className="px-3 py-1 text-sm">
              {incident.severity}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                {incident.description}
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border border-border/50">
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3"/> Location</div>
                  <div className="font-medium">{incident.latitude}, {incident.longitude}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3"/> Reported At</div>
                  <div className="font-medium">{incident.createdAt ? formatDate(incident.createdAt) : "Unknown"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments Section */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incident.attachments && incident.attachments.length > 0 ? (
                <ul className="space-y-2">
                  {incident.attachments.map((att, idx) => (
                    <li key={idx} className="flex items-center justify-between p-3 rounded-md border bg-muted/20">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-primary/10 p-2 rounded text-primary">
                          <Paperclip className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-medium text-sm truncate">{att.fileName}</p>
                          <p className="text-xs text-muted-foreground">{att.contentType || "Unknown type"}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={att.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4 border border-dashed rounded-md">
                  No attachments provided.
                </p>
              )}
            </CardContent>
            
            {/* Victim can upload new attachments */}
            <RoleGuard roles={["VICTIM"]}>
              <CardFooter className="border-t bg-muted/10 pt-4 flex-col items-start gap-4">
                <h4 className="font-medium text-sm">Add New Attachment</h4>
                <form onSubmit={handleAddAttachment} className="w-full flex flex-col sm:flex-row gap-3">
                  <Input 
                    placeholder="File Name" 
                    value={attachmentForm.fileName}
                    onChange={e => setAttachmentForm(f => ({ ...f, fileName: e.target.value }))}
                    className="sm:w-1/3 text-sm"
                  />
                  <Input 
                    placeholder="External URL" 
                    value={attachmentForm.fileUrl}
                    onChange={e => setAttachmentForm(f => ({ ...f, fileUrl: e.target.value }))}
                    className="sm:flex-1 text-sm"
                  />
                  <Button type="submit" size="sm" disabled={attachmentMutation.isPending || !attachmentForm.fileName || !attachmentForm.fileUrl}>
                    {attachmentMutation.isPending ? "Adding..." : "Add Link"}
                  </Button>
                </form>
              </CardFooter>
            </RoleGuard>
          </Card>
        </div>

        {/* Right Column - Actions & History */}
        <div className="space-y-6">
          <RoleGuard roles={["RESPONDER", "ADMIN"]}>
            <Card className="border-border/50 shadow-sm border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Update Status
                </CardTitle>
                <CardDescription>Manage the lifecycle of this incident.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Status: {incident.status}</Label>
                  <Select value={newStatus || incident.status} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REPORTED">Reported</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleUpdateStatus} 
                  disabled={!newStatus || newStatus === incident.status || updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? "Updating..." : "Save Status"}
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                History Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyData && historyData.length > 0 ? (
                <div className="relative border-l border-border/60 ml-3 pl-4 space-y-6">
                  {historyData.map((record, i) => (
                    <div key={record.id || i} className="relative">
                      <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Status changed to {record.status}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(record.changedAt)} by {record.changedBy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center italic py-2">No history recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
