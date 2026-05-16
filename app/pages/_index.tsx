import { redirect } from "react-router";

// Redirect root to dashboard, AppShell will handle auth check
export const loader = () => redirect("dashboard");