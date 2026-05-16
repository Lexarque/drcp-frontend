export type IncidentStatus = "REPORTED" | "ACTIVE" | "RESOLVED" | "CLOSED";
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  latitude: number;
  longitude: number;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentDto {
  title: string;
  description: string;
  severity: IncidentSeverity;
  latitude: number;
  longitude: number;
}