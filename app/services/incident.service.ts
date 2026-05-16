import { incidentApi } from "~/lib/axios";
import type { Incident, CreateIncidentDto } from "~/types/incident.type";

export const incidentService = {
  getAll: async (): Promise<Incident[]> => {
    const { data } = await incidentApi.get("/api/incidents");
    return data;
  },

  getById: async (id: string): Promise<Incident> => {
    const { data } = await incidentApi.get(`/api/incidents/${id}`);
    return data;
  },

  create: async (payload: CreateIncidentDto): Promise<Incident> => {
    const { data } = await incidentApi.post("/api/incidents", payload);
    return data;
  },

  updateStatus: async (id: string, status: string): Promise<Incident> => {
    const { data } = await incidentApi.patch(`/api/incidents/${id}/status`, { status });
    return data;
  },
};