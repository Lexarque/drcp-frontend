import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { incidentService } from "~/services/incident.service";
import { useNavigate } from "react-router";
import RoleGuard from "~/components/auth/RoleGuard";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { AlertCircle, MapPin, Loader2 } from "lucide-react";

export default function NewIncidentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "MEDIUM" as any,
    latitude: "",
    longitude: "",
  });

  const mutation = useMutation({
    mutationFn: incidentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      navigate("/incidents");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to create incident");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.latitude || !form.longitude) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    mutation.mutate({
      title: form.title,
      description: form.description,
      severity: form.severity,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
    });
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setForm(f => ({
          ...f,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
      }, () => {
        setError("Could not retrieve your location. Please enter it manually.");
      });
    }
  };

  return (
    <RoleGuard roles={["VICTIM"]} fallback={<div className="p-8 text-center text-muted-foreground">Access denied. Only victims can report incidents.</div>}>
      <div className="container mx-auto p-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Report an Incident</h1>
          <p className="text-muted-foreground mt-1">Provide details to alert emergency responders.</p>
        </div>

        <Card className="border-border/50 shadow-md">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
              <CardDescription>All fields marked with an asterisk are required.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title" 
                  placeholder="E.g., Fire at Main St. Building" 
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide as much detail as possible..." 
                  className="min-h-[120px] resize-none"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity Level</Label>
                <Select value={form.severity} onValueChange={(val: any) => setForm(f => ({ ...f, severity: val }))}>
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Location Data</h3>
                  <Button type="button" variant="outline" size="sm" onClick={handleGetCurrentLocation} className="gap-2 text-xs">
                    <MapPin className="h-3 w-3" />
                    Use Current Location
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input 
                      id="latitude" 
                      type="number" 
                      step="any"
                      placeholder="e.g., 40.7128" 
                      value={form.latitude}
                      onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input 
                      id="longitude" 
                      type="number"
                      step="any" 
                      placeholder="e.g., -74.0060" 
                      value={form.longitude}
                      onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 bg-muted/20 border-t p-6">
              <Button type="button" variant="outline" onClick={() => navigate("/incidents")} disabled={mutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="min-w-[120px]">
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </RoleGuard>
  );
}
