import { identityApi } from "~/lib/axios";
import type { UserProfile, CreateUserPayload, UpdateUserPayload } from "~/types/auth.type";

export const identityService = {
  getMe: async (): Promise<UserProfile> => {
    const { data } = await identityApi.get("/api/users/me");
    return data;
  },

  // Admin only
  getAllUsers: async (): Promise<UserProfile[]> => {
    const { data } = await identityApi.get("/api/admin/users");
    return data;
  },

  createUser: async (payload: CreateUserPayload): Promise<UserProfile> => {
    const { data } = await identityApi.post("/api/admin/users", payload);
    return data;
  },

  updateUser: async (id: string, payload: UpdateUserPayload): Promise<UserProfile> => {
    const { data } = await identityApi.put(`/api/admin/users/${id}`, payload);
    return data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await identityApi.delete(`/api/admin/users/${id}`);
  },
};