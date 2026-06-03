import type { Role, User } from "@/lib/api/types";

export function hasRole(user: User | null, role: Role) {
  return Boolean(user?.roles.includes(role));
}

export function isAdmin(user: User | null) {
  return hasRole(user, "admin");
}
