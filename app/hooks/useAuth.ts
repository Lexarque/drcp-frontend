import { useKeycloakContext } from "~/context/KeycloakContext";

export const useAuth = () => {
  const { keycloak, initialized, isAuthenticated } = useKeycloakContext();

  return {
    initialized,
    isAuthenticated,
    token: keycloak.token,
    user: {
      id: keycloak.subject,
      email: keycloak.tokenParsed?.email as string | undefined,
      name: keycloak.tokenParsed?.name as string | undefined,
      roles: (keycloak.tokenParsed?.realm_access?.roles ?? []) as string[],
    },
    login: () => keycloak.login(),
    logout: () => keycloak.logout({ redirectUri: window.location.origin }),
    register: () => keycloak.register(),
    hasRole: (role: string) => keycloak.hasRealmRole(role),
  };
};