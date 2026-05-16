import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("pages/_index.tsx"),

  route("auth/login", "pages/auth/login.tsx"),
  route("auth/register", "pages/auth/register.tsx"),
  route("auth/callback", "pages/auth/callback.tsx"),

  // Protected layout wraps all authenticated pages
  layout("components/layout/AppShell.tsx", [
    route("dashboard", "pages/dashboard/index.tsx"),

    route("incidents", "pages/incidents/index.tsx"),

    // Admin routes
    route("admin/users", "pages/admin/users.tsx"),
  ]),
] satisfies RouteConfig;