import { describe, expect, it } from "vitest";
import type { User } from "@/lib/api/types";
import { hasRole, isAdmin } from "./rbac";

const baseUser: User = {
  id: "user_1",
  workspace_id: "workspace_1",
  email: "admin@example.com",
  display_name: "Admin",
  roles: ["user", "admin"],
  status: "active",
  created_at: "2026-06-03T00:00:00.000Z"
};

describe("rbac", () => {
  it("detects assigned roles", () => {
    expect(hasRole(baseUser, "admin")).toBe(true);
    expect(hasRole(baseUser, "power_user")).toBe(false);
  });

  it("treats null users as non-admin", () => {
    expect(isAdmin(null)).toBe(false);
  });
});
