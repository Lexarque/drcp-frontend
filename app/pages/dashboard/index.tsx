import { useAuth } from "~/hooks/useAuth";

export default function dashboard() {
    const { logout } = useAuth();
    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to the dashboard! This is a placeholder page.</p>
            <button onClick={logout}>Logout</button>
        </div>
    )
}