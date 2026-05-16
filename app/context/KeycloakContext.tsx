import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type Keycloak from "keycloak-js";
import keycloak from "~/lib/keycloak";

interface KeycloakContextType {
  initialized: boolean;
  isAuthenticated: boolean;
  keycloak: Keycloak;
}

const KeycloakContext = createContext<KeycloakContextType | null>(null);

export function KeycloakProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    keycloak.onAuthSuccess = () => {
      setIsAuthenticated(true);
      setInitialized(true);
    };

    keycloak.onAuthError = () => {
      setIsAuthenticated(false);
      setInitialized(true);
    };

    keycloak.onAuthLogout = () => {
      setIsAuthenticated(false);
    };

    keycloak
      .init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri:
          window.location.origin + "/silent-check-sso.html",
        pkceMethod: "S256",
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        setIsAuthenticated(authenticated);
        setInitialized(true);
      })
      .catch(() => {
        setInitialized(true);
      });
  }, []);

  return (
    <KeycloakContext.Provider value={{ initialized, isAuthenticated, keycloak }}>
      {children}
    </KeycloakContext.Provider>
  );
}

export function useKeycloakContext() {
  const ctx = useContext(KeycloakContext);
  if (!ctx) throw new Error("useKeycloakContext must be used inside KeycloakProvider");
  return ctx;
}