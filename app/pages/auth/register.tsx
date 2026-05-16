import { useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import Spinner from "~/components/common/Spinner";

export default function RegisterPage() {
  const { initialized, register } = useAuth();

  useEffect(() => {
    if (initialized) register();
  }, [initialized]);

  return <Spinner />;
}