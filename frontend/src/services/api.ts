import { dbService } from "./mockDb";
import {
  Ingredient,
  PaymentMethod,
  ProductFormValues,
  type Product,
  type Sector,
} from "../../types";
import {
  normalizeProductFromApi,
  normalizeSectorFromApi,
  normalizeIngredienteFromApi,
  paymentMethodToApi,
  pluxUsuarioToUser,
  productFormToApiBody,
  sectorToApiBody,
  type PluxUsuarioApi,
} from "./pluxMappers";
import { IngredientePayloadSchema } from "../../types";
import type { User } from "./authService";

const API_BASE_URL =
  (typeof process.env.REACT_APP_API_URL === "string" &&
  process.env.REACT_APP_API_URL.trim() !== ""
    ? process.env.REACT_APP_API_URL.trim()
    : null) || "http://localhost:3001/api";

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const j = await res.json();
    if (j && typeof j.error === "string") return j.error;
    if (j && typeof j.message === "string") return j.message;
  } catch {
    /* ignore */
  }
  return res.statusText || "Erro na requisição";
}

class ApiService {
  /**
   * Usa HTTP quando há URL explícita (env) ou sessão Plux com JWT —
   * evita ficar só no mock após login real sem REACT_APP_API_URL no Vite.
   */
  private get isCloudActive() {
    const envUrl =
      typeof process.env.REACT_APP_API_URL === "string" &&
      process.env.REACT_APP_API_URL.trim() !== "";
    if (envUrl) return true;
    try {
      return !!localStorage.getItem("plux_auth_token");
    } catch {
      return false;
    }
  }

  private async readJsonBody(
    res: Response,
  ): Promise<Record<string, unknown> | null> {
    const text = await res.text();
    if (!text?.trim()) return null;
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private authInit(): RequestInit {
    const token = localStorage.getItem("plux_auth_token");
    return {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    token: string;
    pluxUid: string;
    locatarioId: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/plux/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email.trim(), password }),
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    const data = await res.json();
    if (!data.token) throw new Error("Resposta de login inválida");
    localStorage.setItem("plux_auth_token", data.token);
    return data;
  }

  async fetchPluxUsuario(uid: string): Promise<PluxUsuarioApi> {
    const res = await fetch(`${API_BASE_URL}/plux/usuario/${uid}`, {
      ...this.authInit(),
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    return res.json();
  }

  /** Login completo: token + perfil para authService. */
  async loginAndBuildUser(email: string, password: string): Promise<User> {
    const { pluxUid, locatarioId } = await this.login(email, password);
    try {
      const u = await this.fetchPluxUsuario(pluxUid);
      return pluxUsuarioToUser(u, locatarioId);
    } catch {
      return {
        id: pluxUid,
        email,
        name: email.split("@")[0] || "Usuário",
        role: "ADMIN",
        tenantId: locatarioId,
        status: "ACTIVE",
      };
    }
  }

  async logout(): Promise<void> {
    if (!this.isCloudActive) return;
    try {
      await fetch(`${API_BASE_URL}/plux/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      /* ignore */
    }
    localStorage.removeItem("plux_auth_token");
  }

  async getIngredients(): Promise<Ingredient[]> {
    if (!this.isCloudActive) return dbService.getIngredients();
    const res = await fetch(`${API_BASE_URL}/ingredients`, this.authInit());
    if (!res.ok) throw new Error(await readErrorMessage(res));
    const rows = (await res.json()) as Record<string, unknown>[];
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => normalizeIngredienteFromApi(r));
  }

  /** GET /ingredients/:id — mesmo contrato da lista (Plux JWT). */
  async getIngredient(id: string): Promise<Ingredient | null> {
    if (!this.isCloudActive) {
      return dbService.getIngredients().find((i) => i.id === id) ?? null;
    }
    const res = await fetch(
      `${API_BASE_URL}/ingredients/${id}`,
      this.authInit(),
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await readErrorMessage(res));
    const row = (await res.json()) as Record<string, unknown>;
    return normalizeIngredienteFromApi(row);
  }

  async saveIngredient(data: Ingredient) {
    if (!this.isCloudActive) return dbService.saveIngredient(data);
    const { id, fiscalConfigId: _fid, locatarioId: _lid, ...payload } = data;
    const body = IngredientePayloadSchema.parse({
      ...payload,
      id: id || undefined,
    });
    const { id: bodyId, ...rest } = body;
    if (bodyId) {
      const res = await fetch(`${API_BASE_URL}/ingredients/${bodyId}`, {
        method: "PUT",
        ...this.authInit(),
        body: JSON.stringify(rest),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      const out = (await res.json()) as Record<string, unknown>;
      return normalizeIngredienteFromApi(out);
    }
    const res = await fetch(`${API_BASE_URL}/ingredients`, {
      method: "POST",
      ...this.authInit(),
      body: JSON.stringify(rest),
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    const out = (await res.json()) as Record<string, unknown>;
    return normalizeIngredienteFromApi(out);
  }

  async deleteIngredient(id: string): Promise<void> {
    if (!this.isCloudActive) {
      dbService.deleteIngredient(id);
      return;
    }
    const res = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
      method: "DELETE",
      ...this.authInit(),
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
  }

  /** GET /sectors — JWT Plux, filtrado por locatário. */
  async getSectors(): Promise<Sector[]> {
    if (!this.isCloudActive) return dbService.getSectors();
    const res = await fetch(`${API_BASE_URL}/sectors`, this.authInit());
    if (!res.ok) throw new Error(await readErrorMessage(res));
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return (rows as Record<string, unknown>[]).map(normalizeSectorFromApi);
  }

  /** GET /sectors/:id */
  async getSector(id: string): Promise<Sector | null> {
    if (!this.isCloudActive) {
      return dbService.getSectors().find((s) => s.id === id) ?? null;
    }
    const res = await fetch(`${API_BASE_URL}/sectors/${id}`, this.authInit());
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await readErrorMessage(res));
    const row = await res.json();
    return normalizeSectorFromApi(row as Record<string, unknown>);
  }

  /** POST /sectors ou PUT /sectors/:id */
  async saveSector(sector: Sector): Promise<Sector> {
    if (!this.isCloudActive) {
      dbService.saveSector(sector);
      const list = dbService.getSectors();
      if (sector.id) {
        const found = list.find((s) => s.id === sector.id);
        if (found) return found;
      }
      return list[list.length - 1] ?? sector;
    }
    const body = sectorToApiBody(sector);
    const hasId = typeof sector.id === "string" && sector.id.trim().length > 0;

    if (hasId) {
      const res = await fetch(
        `${API_BASE_URL}/sectors/${encodeURIComponent(sector.id.trim())}`,
        {
          method: "PUT",
          ...this.authInit(),
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) throw new Error(await readErrorMessage(res));
      const row = await this.readJsonBody(res);
      if (row && String(row.id ?? "").trim()) {
        return normalizeSectorFromApi(row);
      }
      const refetched = await this.getSector(sector.id.trim());
      if (refetched) return refetched;
      throw new Error("Resposta inválida ao atualizar setor.");
    }

    const res = await fetch(`${API_BASE_URL}/sectors`, {
      method: "POST",
      ...this.authInit(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    const row = await this.readJsonBody(res);
    if (row && String(row.id ?? "").trim()) {
      return normalizeSectorFromApi(row);
    }
    const list = await this.getSectors();
    const match = list.find((s) => s.name === sector.name);
    if (match) return match;
    throw new Error(
      "Setor pode ter sido criado, mas a API não retornou JSON com id. Atualize a página.",
    );
  }

  async deleteSector(id: string): Promise<void> {
    if (!this.isCloudActive) {
      dbService.deleteSector(id);
      return;
    }
    const res = await fetch(`${API_BASE_URL}/sectors/${id}`, {
      method: "DELETE",
      ...this.authInit(),
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
  }

  async getProducts(): Promise<Product[]> {
    if (!this.isCloudActive) return dbService.getProducts();
    const res = await fetch(`${API_BASE_URL}/products`, this.authInit());
    if (!res.ok) throw new Error(await readErrorMessage(res));
    const rows = await res.json();
    return (rows as Record<string, unknown>[]).map(normalizeProductFromApi);
  }

  async getProduct(id: string): Promise<Product | null> {
    if (!this.isCloudActive) return dbService.getProductById(id) ?? null;
    const res = await fetch(`${API_BASE_URL}/products/${id}`, this.authInit());
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await readErrorMessage(res));
    const row = await res.json();
    return normalizeProductFromApi(row as Record<string, unknown>);
  }

  async createProduct(productData: ProductFormValues): Promise<Product> {
    if (!this.isCloudActive) {
      return dbService.createProductFull(productData as any);
    }
    const body = productFormToApiBody(productData);
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      ...this.authInit(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    const row = await res.json();
    return normalizeProductFromApi(row as Record<string, unknown>);
  }

  async updateProduct(
    id: string,
    productData: ProductFormValues,
  ): Promise<Product> {
    if (!this.isCloudActive) {
      await dbService.updateProduct(id, productData as any);
      const p = dbService.getProductById(id);
      if (!p) throw new Error("Produto não encontrado");
      return p;
    }
    const body = productFormToApiBody(productData);
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      ...this.authInit(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    const row = await res.json();
    return normalizeProductFromApi(row as Record<string, unknown>);
  }

  async deleteProduct(id: string): Promise<void> {
    if (!this.isCloudActive) {
      dbService.deleteProduct(id);
      return;
    }
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
      ...this.authInit(),
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
  }

  async processSale(
    cart: { product: Product; qty: number }[],
    paymentMethod: PaymentMethod,
    totalRevenue: number,
    totalCost: number,
    sectorId?: string,
    sessionId?: string,
    tableName?: string,
  ) {
    if (!this.isCloudActive)
      return dbService.processSale(
        cart,
        paymentMethod,
        undefined,
        undefined,
        sectorId ?? "",
        tableName,
      );

    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const body: Record<string, unknown> = {
      items: cart.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        qty: i.qty,
        price_at_sale: i.product.sale_price,
        cost_at_sale: i.product.cmv_total,
      })),
      total_revenue: totalRevenue,
      total_cost: totalCost,
      payment_method: paymentMethodToApi(paymentMethod),
    };
    if (sectorId && uuidRe.test(sectorId)) body.sectorId = sectorId;
    if (sessionId && uuidRe.test(sessionId)) body.sessionId = sessionId;
    if (tableName) body.tableName = tableName;

    const res = await fetch(`${API_BASE_URL}/sales`, {
      method: "POST",
      ...this.authInit(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    return res.json();
  }

  async getAccountingReport(startDate: string, endDate: string) {
    if (this.isCloudActive) {
      return {
        revenue: 0,
        tax: 0,
        net: 0,
        note: "Relatório contábil não disponível na API Plux; valores locais.",
      };
    }
    const res = await fetch(
      `${API_BASE_URL}/reports/accounting-export?startDate=${startDate}&endDate=${endDate}`,
      this.authInit(),
    );
    return res.json();
  }

  async getCurrentSession() {
    return dbService.getCurrentSession();
  }

  async openRegister(amount: number) {
    return dbService.openRegister(amount);
  }

  async closeRegister(sessionId: string, closingAmount: number) {
    return dbService.closeRegister(closingAmount);
  }

  async getComparativeAnalytics() {
    return {
      weekly: { current_revenue: 15000, prev_revenue: 12000 },
      monthly: { current_revenue: 62000, prev_revenue: 58000 },
      annual: { current_revenue: 740000, prev_revenue: 690000 },
    };
  }
}

export const api = new ApiService();
