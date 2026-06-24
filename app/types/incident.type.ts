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
  attachments?: AttachmentDto[];
  statusHistory?: StatusHistoryDto[];
}

export interface CreateIncidentDto {
  title: string;
  description: string;
  severity: IncidentSeverity;
  latitude: number;
  longitude: number;
}

export interface UpdateIncidentDto {
  title?: string;
  description?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  latitude?: number;
  longitude?: number;
}

export interface AttachmentDto {
  id?: string;
  fileUrl: string;
  fileName: string;
  contentType: string;
  uploadedAt?: string;
}

export interface StatusHistoryDto {
  id?: string;
  status: IncidentStatus;
  changedBy: string;
  changedAt: string;
  notes?: string;
}