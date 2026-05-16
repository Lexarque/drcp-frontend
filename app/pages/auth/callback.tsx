import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import Spinner from "~/components/common/Spinner";

export default function CallbackPage() {
  const { initialized, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized) return;
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [initialized, isAuthenticated]);

  return <Spinner />;
}