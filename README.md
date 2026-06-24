# drcp-frontend — Local Development Guide

## 📑 Table of Contents
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Project Directory Structure](#-project-directory-structure)
- [Environment Variables](#-environment-variables)
- [Keycloak Configuration](#-keycloak-configuration)
- [Branch Naming Convention](#-branch-naming-convention)

---

## 📦 Prerequisites

Make sure the following are installed on your local machine (Windows):

| Tool | Version |
| :--- | :--- |
| Node.js | 20+ |
| npm | Latest |
| Docker | Latest (for backend infrastructure) |

---

## 🚀 Getting Started

### 1. Ensure the backend infrastructure is running

> ⚠️ The frontend depends on Keycloak for authentication. The `drcp-identity-service` Docker containers must be running before starting the frontend.

In the `drcp-identity-service` project directory:
```bash
docker compose start
```

Verify Keycloak is accessible at: `http://localhost:4001`

### 2. Clone the project
```bash
git clone <this-repository-url>
cd drcp-frontend
```

### 3. Install dependencies
```bash
npm install
```

### 4. Set up environment variables
```bash
cp .env.example .env
```

Then edit the `.env` file and fill in the values:
```env
VITE_KEYCLOAK_URL=http://localhost:4001
VITE_KEYCLOAK_REALM=drcp
VITE_KEYCLOAK_CLIENT_ID=drcp-frontend
VITE_IDENTITY_SERVICE_URL=http://localhost:8900
VITE_INCIDENT_SERVICE_URL=http://localhost:8082
```

### 5. Run the project in development mode
```bash
npm run dev
```

The app starts at: `http://localhost:5173`

> 💡 The app uses Keycloak's `check-sso` on load — it silently checks if a session exists without forcing a redirect. You will only be redirected to Keycloak when navigating to a protected route or explicitly calling login.

### 6. Build for production
```bash
npm run build
```

---

## 📁 Project Directory Structure

```text
.
├── app/
│   ├── components/                   # Reusable UI components
│   │   ├── auth/                     # Auth-specific components (RoleGuard)
│   │   ├── common/                   # Shared components (Button, Spinner, etc.)
│   │   └── layout/                   # Layout components (AppShell, Navbar, Sidebar)
│   ├── context/                      # React context providers
│   │   └── KeycloakContext.tsx       # Keycloak initialization and auth state
│   ├── hooks/                        # Custom React hooks
│   │   └── useAuth.ts                # Auth hook — single entry point for auth state
│   ├── lib/                          # Third-party client configurations
│   │   ├── axios.ts                  # Axios instances per service with JWT interceptor
│   │   └── keycloak.ts               # Keycloak-js client instance
│   ├── pages/                        # Page-level components
│   ├── public/                       # Static assets served by Vite
│   │   └── silent-check-sso.html     # Required for Keycloak silent SSO check
│   ├── services/                     # API call functions (never call axios directly in components)
│   │   ├── identity.service.ts       # Identity Service API calls
│   │   └── incident.service.ts       # Incident Service API calls
│   ├── types/                        # TypeScript type definitions
│   │   ├── auth.types.ts             # User, Role, and auth-related types
│   │   └── incident.types.ts         # Incident-related types
│   ├── welcome/                      # Default welcome page
│   ├── app.css                       # Global styles
│   ├── root.tsx                      # App root — providers and HTML shell
│   └── routes.ts                     # React Router v7 route definitions
├── public/                           # Root-level public assets
├── .dockerignore                     # Files excluded from Docker build context
├── .env                              # Local environment variables (Git ignored)
├── .env.example                      # Template for environment variables
├── .gitignore                        # Files excluded from Git
├── components.json                   # shadcn/ui component configuration
├── Dockerfile                        # Docker image definition
├── package.json                      # Node dependencies and scripts
├── react-router.config.ts            # React Router v7 configuration
├── tsconfig.json                     # TypeScript configuration
└── vite.config.ts                    # Vite bundler configuration
```

---

## 🔐 Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the browser. Variables without this prefix are not exposed to the client.

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_KEYCLOAK_URL` | Keycloak server base URL | `http://localhost:4001` |
| `VITE_KEYCLOAK_REALM` | Keycloak realm name | `drcp` |
| `VITE_KEYCLOAK_CLIENT_ID` | Public client ID for the frontend | `drcp-frontend` |
| `VITE_IDENTITY_SERVICE_URL` | Base URL of the Identity Service | `http://localhost:8900` |
| `VITE_INCIDENT_SERVICE_URL` | Base URL of the Incident Service | `http://localhost:8901` |

> ⚠️ Never put secrets (client secrets, passwords) in frontend environment variables. All `VITE_` variables are bundled into the JavaScript and visible in the browser.

---

## 🔑 Keycloak Configuration

The frontend uses `keycloak-js` directly with a custom React context for auth state management. No third-party Keycloak wrapper is used.

### How authentication works

```
User visits protected route
→ AppShell checks isAuthenticated
→ If false, calls keycloak.login()
→ Redirects to Keycloak login page (http://localhost:4001)
→ User logs in
→ Keycloak redirects back to the app with a JWT token
→ KeycloakContext updates initialized and isAuthenticated state
→ AppShell renders the protected content
```

### Key files

| File | Purpose |
| :--- | :--- |
| `app/lib/keycloak.ts` | Keycloak-js client instance — reads from `.env` |
| `app/context/KeycloakContext.tsx` | Initializes Keycloak, exposes `initialized` and `isAuthenticated` state |
| `app/hooks/useAuth.ts` | Wraps the context — use this in all components, never import Keycloak directly |
| `app/lib/axios.ts` | Automatically attaches the JWT `Bearer` token to every API request |
| `app/public/silent-check-sso.html` | Required static file for Keycloak's silent SSO iframe check |

### Role-based access control

Use `RoleGuard` to conditionally render UI elements based on the user's realm roles:

```tsx
import RoleGuard from "~/components/auth/RoleGuard";

// Only renders for ADMIN role
<RoleGuard roles={["ADMIN"]}>
  <DeleteButton />
</RoleGuard>

// Renders for ADMIN or COORDINATOR, shows fallback for others
<RoleGuard roles={["ADMIN", "COORDINATOR"]} fallback={<p>Access denied.</p>}>
  <CreateIncidentButton />
</RoleGuard>
```

Available roles match what is configured in Keycloak:

| Role | Access level |
| :--- | :--- |
| `ADMIN` | Full access including user management |
| `COORDINATOR` | Incident management and responder assignment |
| `RESPONDER` | Field access, incident status updates |

### Silent SSO check

The `public/silent-check-sso.html` file is required for Keycloak's silent session check. It must be accessible at:

```
http://localhost:5173/silent-check-sso.html
```

This file passes the Keycloak auth response back to the parent window through a hidden iframe. It contains no secrets and is safe in production as long as `silentCheckSsoRedirectUri` uses `window.location.origin` dynamically rather than a hardcoded URL.

---

## 🌿 Branch Naming Convention

Always use lowercase and separate words with hyphens (`kebab-case`).

**Format:** `type/short-description`

| Type | Purpose | Example |
| :--- | :--- | :--- |
| `feature/` | A new feature or functionality | `feature/incident-data-table` |
| `fix/` | A bug fix | `fix/keycloak-redirect-loop` |