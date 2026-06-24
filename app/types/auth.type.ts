export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  roles: string[];
}

export type Role = "ADMIN" | "RESPONDER" | "VICTIM";

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: Role[];
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  roles?: Role[];
}