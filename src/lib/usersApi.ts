import { apiRequest } from "./api";

export type UserRole = "RESEARCHER" | "PI" | "ADMIN";

export interface ManagedUser {
  id: string;
  name: string;
  surname: string;
  fullName: string;
  mail: string;
  role: UserRole;
  createdAt: string | null;
}

interface BackendUser {
  _id?: string;
  id?: string;
  name?: string;
  surname?: string;
  fullName?: string;
  mail: string;
  role: UserRole;
  createdAt?: string;
}

function mapUser(u: BackendUser): ManagedUser {
  return {
    id: u._id || u.id || "",
    name: u.name || "",
    surname: u.surname || "",
    fullName: u.fullName || [u.name, u.surname].filter(Boolean).join(" ") || u.mail,
    mail: u.mail,
    role: u.role,
    createdAt: u.createdAt ? u.createdAt.slice(0, 10) : null,
  };
}

/** List all non-admin users (Admin only). */
export async function fetchUsers(): Promise<ManagedUser[]> {
  const res = await apiRequest<{ success: boolean; result: BackendUser[] }>("/users");
  return (res?.result ?? []).map(mapUser);
}

/** Create a user (Admin only). The backend emails them a link to set a password. */
export async function createUser(data: {
  name: string;
  surname: string;
  mail: string;
  role: UserRole;
}): Promise<ManagedUser> {
  const res = await apiRequest<{ success: boolean; result: BackendUser }>("/users", {
    method: "PUT",
    body: data,
  });
  return mapUser(res.result);
}

/** Delete a user (Admin only). */
export async function deleteUser(id: string): Promise<void> {
  await apiRequest(`/users/${id}`, { method: "DELETE" });
}
