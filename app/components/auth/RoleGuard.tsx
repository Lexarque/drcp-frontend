import type { ReactNode } from "react";
import { useAuth } from "~/hooks/useAuth";

interface RoleGuardProps {
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

// Wrap any UI element to conditionally render by role
// <RoleGuard roles={["ADMIN"]}><DeleteButton /></RoleGuard>
export default function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { hasRole } = useAuth();
  const permitted = roles.some(hasRole);
  return permitted ? <>{children}</> : <>{fallback}</>;
}