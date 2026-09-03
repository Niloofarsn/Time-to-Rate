import { apiRequest } from "./api";

export type UserRole = "RESEARCHER" | "PI" | "ADMIN";
export type ResearcherStatus = "UNDERGRADUATE" | "PHD" | "POSTDOC" | "";

export const STATUS_LABEL: Record<ResearcherStatus, string> = {
  UNDERGRADUATE: "Undergraduate",
  PHD: "PhD",
  POSTDOC: "Post-doc",
  "": "—",
};

export interface ManagedUser {
  id: string;
  name: string;
  surname: string;
  fullName: string;
  mail: string;
  role: UserRole;
  status: ResearcherStatus;
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
  status?: ResearcherStatus;
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
    status: u.status || "",
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
  status?: ResearcherStatus;
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
