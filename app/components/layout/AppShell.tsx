import { Outlet } from "react-router";
import { useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import Spinner from "../common/Spinner";

export default function AppShell() {
  const { initialized, isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      login();
    }
  }, [initialized, isAuthenticated]);

  if (!initialized) return <Spinner />;
  if (!isAuthenticated) return null;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <main style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}