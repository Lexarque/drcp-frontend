import { useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { useNavigate } from "react-router";
import Spinner from "~/components/common/Spinner";

export default function LoginPage() {
  const { initialized, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized) return;
    if (isAuthenticated) {
      navigate("/incidents"); // or wherever you want to redirect authenticated users
    } else {
      login(); // hand off to Keycloak immediately
    }
  }, [initialized, isAuthenticated]);

  return <Spinner />;  // shown briefly before redirect
}