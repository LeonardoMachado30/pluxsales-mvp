import { z } from "zod";
import { api } from "./api";

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER"]),
  tenantId: z.string(),
  status: z.enum(["ACTIVE", "TRIAL", "EXPIRED", "PAID"]),
  avatar: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const PERMISSIONS = {
  VIEW_DASHBOARD: ["ADMIN", "MANAGER"],
  MANAGE_INVENTORY: ["ADMIN", "MANAGER"],
  MANAGE_PRODUCTS: ["ADMIN", "MANAGER"],
  MANAGE_USERS: ["ADMIN"],
  VIEW_SALES_HISTORY: ["ADMIN", "MANAGER", "CASHIER"],
  PERFORM_SALE: ["ADMIN", "MANAGER", "CASHIER"],
  EDIT_SETTINGS: ["ADMIN"],
};

class AuthService {
  private readonly AUTH_KEY = "plux_auth_session";

  login(user: User) {
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
  }

  logout() {
    const finish = () => {
      localStorage.removeItem(this.AUTH_KEY);
      localStorage.removeItem("plux_auth_token");
      window.location.reload();
    };
    const hasJwt = !!localStorage.getItem("plux_auth_token");
    const envApi =
      typeof process.env.REACT_APP_API_URL === "string" &&
      process.env.REACT_APP_API_URL.trim() !== "";
    if (envApi || hasJwt) {
      void api.logout().finally(finish);
    } else {
      finish();
    }
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem(this.AUTH_KEY);
    if (!data) return null;
    return JSON.parse(data);
  }

  hasPermission(permission: keyof typeof PERMISSIONS): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return (PERMISSIONS[permission] as string[]).includes(user.role);
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  isLicenseValid(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return ["PAID", "TRIAL", "ACTIVE"].includes(user.status);
  }

  // Simulação de busca de usuários do mesmo tenant
  getTenantUsers(): User[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];

    const allUsersKey = "plux_global_users_mock";
    const allUsers: User[] = JSON.parse(
      localStorage.getItem(allUsersKey) || "[]",
    );

    // Se estiver vazio, popula com o atual
    if (allUsers.length === 0) {
      localStorage.setItem(allUsersKey, JSON.stringify([currentUser]));
      return [currentUser];
    }

    return allUsers.filter((u) => u.tenantId === currentUser.tenantId);
  }

  addTenantUser(userData: Omit<User, "id" | "tenantId" | "status">) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const allUsersKey = "plux_global_users_mock";
    const allUsers: User[] = JSON.parse(
      localStorage.getItem(allUsersKey) || "[]",
    );

    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      tenantId: currentUser.tenantId,
      status: currentUser.status,
    };

    allUsers.push(newUser);
    localStorage.setItem(allUsersKey, JSON.stringify(allUsers));
  }
}

export const authService = new AuthService();
