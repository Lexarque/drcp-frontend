import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { identityService } from "~/services/identity.service";
import type { UserProfile, CreateUserPayload, Role } from "~/types/auth.type";
import RoleGuard from "~/components/auth/RoleGuard";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: identityService.getAllUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: identityService.deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled, roles }: { id: string; enabled: boolean; roles: Role[] }) =>
      identityService.updateUser(id, { enabled, roles }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  if (isLoading) return <p>Loading users...</p>;

  return (
    <RoleGuard roles={["ADMIN"]} fallback={<p>Access denied.</p>}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h1>User Management</h1>
          <button onClick={() => setShowCreate(true)}>Add User</button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.roles.join(", ")}</td>
                <td>{user.enabled ? "Active" : "Disabled"}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => setEditingUser(user)}>Edit</button>
                  <button
                    onClick={() =>
                      toggleMutation.mutate({
                        id: user.id,
                        enabled: !user.enabled,
                        roles: user.roles as Role[],
                      })
                    }
                  >
                    {user.enabled ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => deleteMutation.mutate(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showCreate && (
          <CreateUserModal
            onClose={() => setShowCreate(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
              setShowCreate(false);
            }}
          />
        )}

        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
              setEditingUser(null);
            }}
          />
        )}
      </div>
    </RoleGuard>
  );
}

// ── Create Modal ───────────────────────────────────────────────────────────
function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<CreateUserPayload>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roles: [],
  });

  const mutation = useMutation({
    mutationFn: identityService.createUser,
    onSuccess,
  });

  const roles: Role[] = ["ADMIN", "COORDINATOR", "RESPONDER"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "8px", minWidth: "400px" }}>
        <h2>Create User</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input placeholder="First name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
          <input placeholder="Last name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
          <input placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <input placeholder="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          <div>
            <p style={{ margin: "0 0 0.5rem" }}>Roles</p>
            {roles.map(role => (
              <label key={role} style={{ marginRight: "1rem" }}>
                <input
                  type="checkbox"
                  checked={form.roles.includes(role)}
                  onChange={e => setForm(f => ({
                    ...f,
                    roles: e.target.checked
                      ? [...f.roles, role]
                      : f.roles.filter(r => r !== role)
                  }))}
                />
                {" "}{role}
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button onClick={onClose}>Cancel</button>
            <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSuccess }: { user: UserProfile; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    enabled: user.enabled,
    roles: user.roles as Role[],
  });

  const mutation = useMutation({
    mutationFn: (payload: typeof form) => identityService.updateUser(user.id, payload),
    onSuccess,
  });

  const roles: Role[] = ["ADMIN", "COORDINATOR", "RESPONDER"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "8px", minWidth: "400px" }}>
        <h2>Edit User</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input placeholder="First name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
          <input placeholder="Last name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
          <div>
            <p style={{ margin: "0 0 0.5rem" }}>Roles</p>
            {roles.map(role => (
              <label key={role} style={{ marginRight: "1rem" }}>
                <input
                  type="checkbox"
                  checked={form.roles.includes(role)}
                  onChange={e => setForm(f => ({
                    ...f,
                    roles: e.target.checked
                      ? [...f.roles, role]
                      : f.roles.filter(r => r !== role)
                  }))}
                />
                {" "}{role}
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button onClick={onClose}>Cancel</button>
            <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}