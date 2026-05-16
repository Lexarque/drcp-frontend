import axios from "axios";
import keycloak from "./keycloak";

// One instance per service — token injection is shared
const createInstance = (baseURL: string) => {
  const instance = axios.create({ baseURL });

  instance.interceptors.request.use(async (config) => {
    // Refresh token if expiring within 30 seconds
    if (keycloak.isTokenExpired(30)) {
      await keycloak.updateToken(30);
    }
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        keycloak.login(); // redirect to Keycloak login
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const identityApi = createInstance(
  import.meta.env.VITE_IDENTITY_SERVICE_URL
);

export const incidentApi = createInstance(
  import.meta.env.VITE_INCIDENT_SERVICE_URL
);