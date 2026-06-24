import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { identityService } from "~/services/identity.service";
import type { UserProfile, CreateUserPayload, Role } from "~/types/auth.type";
import RoleGuard from "~/components/auth/RoleGuard";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { UserPlus, MoreHorizontal, Edit, Trash2, Power, PowerOff, ShieldCheck } from "lucide-react";

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

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading users...</div>;

  return (
    <RoleGuard roles={["ADMIN"]} fallback={<div className="p-8 text-center">Access denied.</div>}>
      <div className="container mx-auto p-6 max-w-7xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Manage system access and roles across the platform.
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2 shadow-sm">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>A complete directory of all registered personnel and their access levels.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(r => (
                            <Badge key={r} variant="secondary" className="text-xs font-medium px-2 py-0.5">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.enabled ? (
                          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" /> Disabled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toggleMutation.mutate({ id: user.id, enabled: !user.enabled, roles: user.roles as Role[] })}
                            >
                              {user.enabled ? (
                                <><PowerOff className="mr-2 h-4 w-4" /> Disable Access</>
                              ) : (
                                <><Power className="mr-2 h-4 w-4" /> Enable Access</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => { if(confirm("Delete this user permanently?")) deleteMutation.mutate(user.id); }}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!users || users.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="sm:max-w-[425px]">
            <CreateUserForm 
              onClose={() => setShowCreate(false)} 
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
                setShowCreate(false);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="sm:max-w-[425px]">
            {editingUser && (
              <EditUserForm 
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
                  setEditingUser(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}

function CreateUserForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
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

  const availableRoles: Role[] = ["ADMIN", "RESPONDER", "VICTIM"];

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New User</DialogTitle>
        <DialogDescription>Add a new user to the system. They will receive access immediately.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>
        <div className="space-y-3 pt-2">
          <Label className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-muted-foreground"/> Assign Roles</Label>
          <div className="grid grid-cols-2 gap-3">
            {availableRoles.map(role => (
              <div key={role} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/30 transition-colors">
                <Checkbox 
                  id={`role-${role}`}
                  checked={form.roles.includes(role)}
                  onCheckedChange={(checked) => setForm(f => ({
                    ...f,
                    roles: checked ? [...f.roles, role] : f.roles.filter(r => r !== role)
                  }))}
                />
                <label htmlFor={`role-${role}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  {role}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create User"}
        </Button>
      </DialogFooter>
    </>
  );
}

function EditUserForm({ user, onClose, onSuccess }: { user: UserProfile; onClose: () => void; onSuccess: () => void }) {
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

  const availableRoles: Role[] = ["ADMIN", "RESPONDER", "VICTIM"];

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit User</DialogTitle>
        <DialogDescription>Make changes to the user's profile and permissions.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-firstName">First name</Label>
            <Input id="edit-firstName" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-lastName">Last name</Label>
            <Input id="edit-lastName" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-3 pt-2">
          <Label className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-muted-foreground"/> Manage Roles</Label>
          <div className="grid grid-cols-2 gap-3">
            {availableRoles.map(role => (
              <div key={role} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/30 transition-colors">
                <Checkbox 
                  id={`edit-role-${role}`}
                  checked={form.roles.includes(role)}
                  onCheckedChange={(checked) => setForm(f => ({
                    ...f,
                    roles: checked ? [...f.roles, role] : f.roles.filter(r => r !== role)
                  }))}
                />
                <label htmlFor={`edit-role-${role}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  {role}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </>
  );
}