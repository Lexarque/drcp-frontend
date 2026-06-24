import { identityApi } from "~/lib/axios";
import type { UserProfile, CreateUserPayload, UpdateUserPayload } from "~/types/auth.type";

// Helper to extract data from ApiResponse wrapper
const extractData = (response: any) => {
  if (response?.data?.data !== undefined) {
    return response.data.data;
  }
  return response?.data;
};

export const identityService = {
  getMe: async (): Promise<UserProfile> => {
    const response = await identityApi.get("/api/users/me");
    return extractData(response);
  },

  // Admin only
  getAllUsers: async (): Promise<UserProfile[]> => {
    const response = await identityApi.get("/api/admin/users");
    return extractData(response);
  },

  createUser: async (payload: CreateUserPayload): Promise<UserProfile> => {
    const response = await identityApi.post("/api/admin/users", payload);
    return extractData(response);
  },

  updateUser: async (id: string, payload: UpdateUserPayload): Promise<UserProfile> => {
    const response = await identityApi.put(`/api/admin/users/${id}`, payload);
    return extractData(response);
  },

  deleteUser: async (id: string): Promise<void> => {
    await identityApi.delete(`/api/admin/users/${id}`);
  },
};