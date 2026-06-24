import { incidentApi } from "~/lib/axios";
import type { Incident, CreateIncidentDto, UpdateIncidentDto, AttachmentDto, StatusHistoryDto } from "~/types/incident.type";

// Helper to extract data from ApiResponse wrapper
const extractData = (response: any) => {
  if (response?.data?.data !== undefined) {
    return response.data.data;
  }
  return response?.data;
};

export const incidentService = {
  getAll: async (): Promise<Incident[]> => {
    const response = await incidentApi.get("/api/incidents");
    return extractData(response);
  },

  getById: async (id: string): Promise<Incident> => {
    const response = await incidentApi.get(`/api/incidents/${id}`);
    return extractData(response);
  },

  create: async (payload: CreateIncidentDto): Promise<Incident> => {
    const response = await incidentApi.post("/api/incidents", payload);
    return extractData(response);
  },

  update: async (id: string, payload: UpdateIncidentDto): Promise<Incident> => {
    const response = await incidentApi.put(`/api/incidents/${id}`, payload);
    return extractData(response);
  },

  updateStatus: async (id: string, status: string): Promise<Incident> => {
    const response = await incidentApi.patch(`/api/incidents/${id}/status`, { status });
    return extractData(response);
  },

  delete: async (id: string): Promise<void> => {
    await incidentApi.delete(`/api/incidents/${id}`);
  },

  addAttachment: async (incidentId: string, payload: AttachmentDto): Promise<AttachmentDto> => {
    const response = await incidentApi.post(`/api/incidents/${incidentId}/attachments`, payload);
    return extractData(response);
  },

  getStatusHistory: async (incidentId: string): Promise<StatusHistoryDto[]> => {
    const response = await incidentApi.get(`/api/incidents/${incidentId}/status-history`);
    return extractData(response);
  },
};