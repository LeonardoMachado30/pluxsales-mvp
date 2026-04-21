import {
  type Ingredient,
  Product,
  Sale,
  SaleItem,
  StockMovement,
  StockMovementType,
  TaxClassification,
  UnitMeasure,
  PaymentMethod,
  RegisterSession,
  Sector,
  SectorType,
  KitchenTicket,
  TicketStatus,
  WasteEntry,
  WasteReason,
} from "../../types";
import { normalizeIngredienteFromApi } from "./pluxMappers";

/** Mesma chave que authService — leitura direta evita ciclo authService → api → mockDb → authService. */
const AUTH_SESSION_KEY = "plux_auth_session";

type SessionUserSnapshot = { id: string; name: string; tenantId?: string };

function readSessionUser(): SessionUserSnapshot | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as SessionUserSnapshot;
    if (!u || typeof u.id !== "string") return null;
    return u;
  } catch {
    return null;
  }
}

function readSessionTenantId(): string {
  return readSessionUser()?.tenantId || "default";
}

const BASE_KEYS = {
  INGREDIENTS: "ingredients",
  PRODUCTS: "products",
  SALES: "sales",
  STOCK_LOGS: "stock_logs",
  SETTINGS: "settings",
  ACTIVITY_LOGS: "activity_logs",
  REGISTER_SESSIONS: "register_sessions",
  SECTORS: "sectors",
  BUDGET: "budget",
  KITCHEN_TICKETS: "kitchen_tickets",
  WASTE: "waste",
  NOTIFICATIONS: "notifications",
};

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  details: string;
  timestamp: string;
  type: "INFO" | "WARNING" | "CRITICAL";
}

export interface AppSettings {
  lowStockThreshold: number;
  monthlyGoal: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "SUCCESS" | "WARNING" | "INFO";
  read: boolean;
  timestamp: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  lowStockThreshold: 100,
  monthlyGoal: 50000,
};

const INITIAL_SECTORS: Sector[] = [
  {
    id: "sec_1",
    name: "Salão Principal",
    // type: SectorType.HALL,
    tableCount: 15,
  },
  {
    id: "sec_2",
    name: "Terraço Gourmet",
    // type: SectorType.TERRACE,
    tableCount: 8,
  },
  {
    id: "sec_3",
    name: "Balcão Express",
    // type: SectorType.COUNTER,
    tableCount: 0,
  },
  { id: "sec_4", name: "Delivery", tableCount: 0 },
];

class MockDbService {
  private get tenantId() {
    return readSessionTenantId();
  }

  private getKey(key: string) {
    return `plux_${this.tenantId}_${key}`;
  }

  constructor() {
    this.init();
  }

  private init() {
    const keys = Object.values(BASE_KEYS);
    keys.forEach((k) => {
      const fullKey = this.getKey(k);
      if (!localStorage.getItem(fullKey)) {
        localStorage.setItem(fullKey, JSON.stringify([]));
      }
    });

    const settingsKey = this.getKey(BASE_KEYS.SETTINGS);
    if (
      !localStorage.getItem(settingsKey) ||
      localStorage.getItem(settingsKey) === "[]"
    ) {
      localStorage.setItem(settingsKey, JSON.stringify(DEFAULT_SETTINGS));
    }

    const sectorKey = this.getKey(BASE_KEYS.SECTORS);
    if (
      !localStorage.getItem(sectorKey) ||
      localStorage.getItem(sectorKey) === "[]"
    ) {
      localStorage.setItem(sectorKey, JSON.stringify(INITIAL_SECTORS));
    }
  }

  getNotifications(): Notification[] {
    return JSON.parse(
      localStorage.getItem(this.getKey(BASE_KEYS.NOTIFICATIONS)) || "[]",
    );
  }

  addNotification(
    title: string,
    message: string,
    type: Notification["type"] = "INFO",
  ) {
    const notifications = this.getNotifications();
    notifications.unshift({
      id: crypto.randomUUID(),
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(
      this.getKey(BASE_KEYS.NOTIFICATIONS),
      JSON.stringify(notifications.slice(0, 50)),
    );
  }

  markNotificationRead(id: string) {
    const notifications = this.getNotifications().map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    localStorage.setItem(
      this.getKey(BASE_KEYS.NOTIFICATIONS),
      JSON.stringify(notifications),
    );
  }

  logActivity(
    action: string,
    entity: string,
    details: string,
    type: ActivityLog["type"] = "INFO",
  ) {
    const user = readSessionUser();
    if (!user) return;
    const logsKey = this.getKey(BASE_KEYS.ACTIVITY_LOGS);
    const logs: ActivityLog[] = JSON.parse(
      localStorage.getItem(logsKey) || "[]",
    );
    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      action,
      entity,
      details,
      timestamp: new Date().toISOString(),
      type,
    };
    logs.unshift(newLog);
    localStorage.setItem(logsKey, JSON.stringify(logs.slice(0, 500)));
  }

  getActivityLogs(): ActivityLog[] {
    return JSON.parse(
      localStorage.getItem(this.getKey(BASE_KEYS.ACTIVITY_LOGS)) || "[]",
    );
  }

  getWaste(): WasteEntry[] {
    return JSON.parse(
      localStorage.getItem(this.getKey(BASE_KEYS.WASTE)) || "[]",
    );
  }

  registerWaste(
    entry: Omit<WasteEntry, "id" | "timestamp" | "userId" | "cost_at_moment">,
  ) {
    const user = readSessionUser();
    if (!user) return;
    const ingredients = this.getIngredients();
    const idx = ingredients.findIndex((i) => i.id === entry.ingredient_id);
    if (idx === -1) return;
    const ing = ingredients[idx];
    const cost = ing.custoMedio;
    const newEntry: WasteEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      cost_at_moment: cost,
    };
    ing.estoqueAtual -= entry.qty;
    localStorage.setItem(
      this.getKey(BASE_KEYS.INGREDIENTS),
      JSON.stringify(ingredients),
    );
    const waste = this.getWaste();
    waste.push(newEntry);
    localStorage.setItem(this.getKey(BASE_KEYS.WASTE), JSON.stringify(waste));
    this.addStockLog({
      id: crypto.randomUUID(),
      ingredient_id: ing.id,
      type: StockMovementType.WASTE,
      qty: entry.qty,
      cost_at_moment: cost,
      timestamp: new Date().toISOString(),
      notes: `Quebra: ${entry.reason}`,
    });
    this.logActivity(
      "WASTE",
      "INVENTORY",
      `${ing.nome} (-${entry.qty}) Motivo: ${entry.reason}`,
      "WARNING",
    );
  }

  getKitchenTickets(): KitchenTicket[] {
    return JSON.parse(
      localStorage.getItem(this.getKey(BASE_KEYS.KITCHEN_TICKETS)) || "[]",
    );
  }

  updateTicketStatus(ticketId: string, status: TicketStatus) {
    const tickets = this.getKitchenTickets();
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index >= 0) {
      tickets[index].status = status;
      localStorage.setItem(
        this.getKey(BASE_KEYS.KITCHEN_TICKETS),
        JSON.stringify(tickets),
      );
      if (status === TicketStatus.READY) {
        this.addNotification(
          "Pedido Pronto!",
          `O pedido para a mesa ${tickets[index].tableName || "Balcão"} está pronto para entrega.`,
          "SUCCESS",
        );
      }
      this.logActivity(
        "UPDATE",
        "KITCHEN_TICKET",
        `Ticket #${ticketId.slice(0, 6)} -> ${status}`,
      );
    }
  }

  getSessions(): RegisterSession[] {
    return JSON.parse(
      localStorage.getItem(this.getKey(BASE_KEYS.REGISTER_SESSIONS)) || "[]",
    );
  }

  getCurrentSession(): RegisterSession | null {
    return this.getSessions().find((s) => s.status === "OPEN") || null;
  }

  openRegister(amount: number): RegisterSession {
    const user = readSessionUser();
    const sessions = this.getSessions();
    const newSession: RegisterSession = {
      id: crypto.randomUUID(),
      openedAt: new Date().toISOString(),
      openedBy: user?.name || "Sistema",
      openingAmount: amount,
      status: "OPEN",
      salesIds: [],
    };
    sessions.push(newSession);
    localStorage.setItem(
      this.getKey(BASE_KEYS.REGISTER_SESSIONS),
      JSON.stringify(sessions),
    );
    this.logActivity(
      "OPEN",
      "REGISTER",
      `Caixa aberto com R$ ${amount.toFixed(2)}`,
    );
    return newSession;
  }

  closeRegister(closingAmount: number): RegisterSession {
    const session = this.getCurrentSession();
    if (!session) throw new Error("Nenhum caixa aberto.");
    const user = readSessionUser();
    const sessions = this.getSessions();
    const sales = this.getSales().filter(
      (s) => s.registerSessionId === session.id,
    );
    const totalSales = sales.reduce((acc, s) => acc + s.total_revenue, 0);
    const expectedAmount = session.openingAmount + totalSales;
    const updatedSessions = sessions.map((s) => {
      if (s.id === session.id) {
        return {
          ...s,
          status: "CLOSED" as const,
          closedAt: new Date().toISOString(),
          closedBy: user?.name,
          closingAmount,
          expectedAmount,
        };
      }
      return s;
    });
    localStorage.setItem(
      this.getKey(BASE_KEYS.REGISTER_SESSIONS),
      JSON.stringify(updatedSessions),
    );
    this.logActivity(
      "CLOSE",
      "REGISTER",
      `Caixa fechado. Diferença: R$ ${(closingAmount - expectedAmount).toFixed(2)}`,
    );
    return updatedSessions.find((s) => s.id === session.id)!;
  }

  getSettings(): AppSettings {
    return JSON.parse(
      localStorage.getItem(this.getKey(BASE_KEYS.SETTINGS)) ||
        JSON.stringify(DEFAULT_SETTINGS),
    );
  }
  saveSettings(settings: AppSettings) {
    localStorage.setItem(
      this.getKey(BASE_KEYS.SETTINGS),
      JSON.stringify(settings),
    );
    this.logActivity("UPDATE", "SETTINGS", "Parâmetros alterados");
  }
  getIngredients(): Ingredient[] {
    const raw = JSON.parse(
      localStorage.getItem(this.getKey(BASE_KEYS.INGREDIENTS)) || "[]",
    ) as Record<string, unknown>[];
    if (!Array.isArray(raw)) return [];
    return raw.map((row) => normalizeIngredienteFromApi(row));
  }

  saveIngredient(ingredient: Ingredient) {
    const list = this.getIngredients();
    const index = list.findIndex((i) => i.id === ingredient.id);
    if (index >= 0) list[index] = ingredient;
    else list.push({ ...ingredient, id: crypto.randomUUID() });
    localStorage.setItem(
      this.getKey(BASE_KEYS.INGREDIENTS),
      JSON.stringify(list),
    );
    this.logActivity(
      index >= 0 ? "UPDATE" : "CREATE",
      "INGREDIENT",
      `Item: ${ingredient.nome}`,
    );
    this.recalculateAllProductCMV();
  }

  deleteIngredient(id: string) {
    const list = this.getIngredients();
    const filtered = list.filter((i) => i.id !== id);
    localStorage.setItem(
      this.getKey(BASE_KEYS.INGREDIENTS),
      JSON.stringify(filtered),
    );
    this.recalculateAllProductCMV();
  }

  restockIngredient(id: string, qty: number, newCost?: number) {
    const ingredients = this.getIngredients();
    const index = ingredients.findIndex((i) => i.id === id);
    if (index === -1) return;
    const oldCost = ingredients[index].custoMedio;
    ingredients[index].estoqueAtual += qty;
    if (newCost) ingredients[index].custoMedio = newCost;
    localStorage.setItem(
      this.getKey(BASE_KEYS.INGREDIENTS),
      JSON.stringify(ingredients),
    );
    this.addStockLog({
      id: crypto.randomUUID(),
      ingredient_id: id,
      type: StockMovementType.IN,
      qty,
      cost_at_moment: newCost || oldCost,
      timestamp: new Date().toISOString(),
      notes: "Manual Restock",
    });
    this.recalculateAllProductCMV();
  }

  private addStockLog(log: StockMovement) {
    const logs = JSON.parse(
      localStorage.getItem(this.getKey(BASE_KEYS.STOCK_LOGS)) || "[]",
    );
    logs.push(log);
    localStorage.setItem(
      this.getKey(BASE_KEYS.STOCK_LOGS),
      JSON.stringify(logs),
    );
  }

  getStockLogs(): StockMovement[] {
    return JSON.parse(
      localStorage.getItem(this.getKey(BASE_KEYS.STOCK_LOGS)) || "[]",
    );
  }

  private recalculateAllProductCMV() {
    const products = this.getProducts();
    const ingredients = this.getIngredients();
    const updated = products.map((p) => {
      let cmv = 0;
      p.ingredients.forEach((comp) => {
        const ing = ingredients.find((i) => i.id === comp.ingredient_id);
        if (ing) cmv += ing.custoMedio * comp.qty_used;
      });
      return { ...p, cmv_total: Number(cmv.toFixed(4)) };
    });
    localStorage.setItem(
      this.getKey(BASE_KEYS.PRODUCTS),
      JSON.stringify(updated),
    );
  }

  getProducts(): Product[] {
    return JSON.parse(
      localStorage.getItem(this.getKey(BASE_KEYS.PRODUCTS)) || "[]",
    );
  }
  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  async createProductFull(
    productData: Omit<Product, "id" | "cmv_total">,
  ): Promise<Product> {
    const ings = this.getIngredients();
    let cmv = 0;
    productData.ingredients.forEach((ci) => {
      const ing = ings.find((i) => i.id === ci.ingredient_id);
      if (ing) cmv += ing.custoMedio * ci.qty_used;
    });
    const newProd = {
      ...productData,
      id: crypto.randomUUID(),
      cmv_total: Number(cmv.toFixed(4)),
    } as Product;
    const list = this.getProducts();
    list.push(newProd);
    localStorage.setItem(this.getKey(BASE_KEYS.PRODUCTS), JSON.stringify(list));
    return newProd;
  }

  async updateProduct(
    id: string,
    productData: Omit<Product, "id" | "cmv_total">,
  ): Promise<Product> {
    const ings = this.getIngredients();
    let cmv = 0;
    productData.ingredients.forEach((ci) => {
      const ing = ings.find((i) => i.id === ci.ingredient_id);
      if (ing) cmv += ing.custoMedio * ci.qty_used;
    });
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Não encontrado");
    const updatedProd = {
      ...productData,
      id,
      cmv_total: Number(cmv.toFixed(4)),
    } as Product;
    products[index] = updatedProd;
    localStorage.setItem(
      this.getKey(BASE_KEYS.PRODUCTS),
      JSON.stringify(products),
    );
    return updatedProd;
  }

  deleteProduct(id: string) {
    const products = this.getProducts().filter((p) => p.id !== id);
    localStorage.setItem(
      this.getKey(BASE_KEYS.PRODUCTS),
      JSON.stringify(products),
    );
  }

  getSales(): Sale[] {
    return JSON.parse(
      localStorage.getItem(this.getKey(BASE_KEYS.SALES)) || "[]",
    );
  }

  async processSale(
    cart: { product: Product; qty: number }[],
    paymentMethod: PaymentMethod,
    receivedAmount?: number,
    changeAmount?: number,
    sectorId?: string,
    tableName?: string,
  ): Promise<Sale> {
    const session = this.getCurrentSession();
    if (!session) throw new Error("Caixa fechado.");
    const products = this.getProducts();
    const ingredients = this.getIngredients();
    let totalRevenue = 0;
    let totalCost = 0;
    const saleItems: SaleItem[] = [];
    const ticketItems: KitchenTicket["items"] = [];
    cart.forEach((entry) => {
      const product = products.find((p) => p.id === entry.product.id);
      if (!product) return;
      totalRevenue += product.sale_price * entry.qty;
      totalCost += product.cmv_total * entry.qty;
      saleItems.push({
        product_id: product.id,
        name: product.name,
        qty: entry.qty,
        price_at_sale: product.sale_price,
        cost_at_sale: product.cmv_total,
      });
      ticketItems.push({
        product_id: product.id,
        name: product.name,
        qty: entry.qty,
        category: product.category,
      });
      product.ingredients.forEach((comp) => {
        const ingIndex = ingredients.findIndex(
          (i) => i.id === comp.ingredient_id,
        );
        if (ingIndex >= 0) {
          ingredients[ingIndex].estoqueAtual -= comp.qty_used * entry.qty;
          this.addStockLog({
            id: crypto.randomUUID(),
            ingredient_id: ingredients[ingIndex].id,
            type: StockMovementType.OUT,
            qty: comp.qty_used * entry.qty,
            cost_at_moment: ingredients[ingIndex].custoMedio,
            timestamp: new Date().toISOString(),
            notes: `Venda: ${product.name}`,
          });
        }
      });
    });
    // Fix: Added missing required property 'tax_optimized' to satisfy Sale interface in types.ts
    const newSale: Sale = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      items: saleItems,
      total_revenue: totalRevenue,
      total_cost: totalCost,
      payment_method: paymentMethod,
      tax_optimized: false,
      received_amount: receivedAmount,
      change_amount: changeAmount,
      registerSessionId: session.id,
      sectorId,
      tableName,
    };
    const sales = this.getSales();
    sales.push(newSale);
    localStorage.setItem(this.getKey(BASE_KEYS.SALES), JSON.stringify(sales));
    localStorage.setItem(
      this.getKey(BASE_KEYS.INGREDIENTS),
      JSON.stringify(ingredients),
    );
    const updatedSessions = this.getSessions().map((s) =>
      s.id === session.id ? { ...s, salesIds: [...s.salesIds, newSale.id] } : s,
    );
    localStorage.setItem(
      this.getKey(BASE_KEYS.REGISTER_SESSIONS),
      JSON.stringify(updatedSessions),
    );
    const tickets = this.getKitchenTickets();
    tickets.push({
      id: crypto.randomUUID(),
      saleId: newSale.id,
      timestamp: new Date().toISOString(),
      items: ticketItems,
      status: TicketStatus.PENDING,
      sectorName: "Geral",
      tableName,
      priority: "NORMAL",
    });
    localStorage.setItem(
      this.getKey(BASE_KEYS.KITCHEN_TICKETS),
      JSON.stringify(tickets),
    );
    return newSale;
  }

  getSectors(): Sector[] {
    return JSON.parse(
      localStorage.getItem(this.getKey(BASE_KEYS.SECTORS)) || "[]",
    );
  }
  saveSector(sector: Sector) {
    const sectors = this.getSectors();
    const index = sectors.findIndex((s) => s.id === sector.id);
    if (index >= 0) sectors[index] = sector;
    else sectors.push({ ...sector, id: crypto.randomUUID() });
    localStorage.setItem(
      this.getKey(BASE_KEYS.SECTORS),
      JSON.stringify(sectors),
    );
  }
  deleteSector(id: string) {
    const sectors = this.getSectors();
    const filtered = sectors.filter((s) => s.id !== id);
    localStorage.setItem(
      this.getKey(BASE_KEYS.SECTORS),
      JSON.stringify(filtered),
    );
  }

  getAnalyticsSummary() {
    const sales = this.getSales();
    const ingredients = this.getIngredients();
    const sectors = this.getSectors();
    const wastes = this.getWaste();
    const productPerformance = sales.reduce(
      (acc, sale) => {
        sale.items.forEach((item) => {
          if (!acc[item.name]) acc[item.name] = { qty: 0, revenue: 0 };
          acc[item.name].qty += item.qty;
          acc[item.name].revenue += item.qty * item.price_at_sale;
        });
        return acc;
      },
      {} as Record<string, { qty: number; revenue: number }>,
    );
    const sectorPerformance = sales.reduce(
      (acc, sale) => {
        const sId = sale.sectorId || "unassigned";
        if (!acc[sId]) acc[sId] = { revenue: 0, cost: 0, orders: 0 };
        acc[sId].revenue += sale.total_revenue;
        acc[sId].cost += sale.total_cost;
        acc[sId].orders += 1;
        return acc;
      },
      {} as Record<string, { revenue: number; cost: number; orders: number }>,
    );
    const sectorStats = Object.entries(sectorPerformance).map(([id, stats]) => {
      const sector = sectors.find((s) => s.id === id);
      return {
        id,
        name: sector?.name || "Geral",
        // type: sector?.type || "OUTRO",
        tableCount: sector?.tableCount ?? 0,
        ...stats,
        margin:
          stats.revenue > 0
            ? ((stats.revenue - stats.cost) / stats.revenue) * 100
            : 0,
      };
    });
    const totalWasteCost = wastes.reduce(
      (acc, w) => acc + w.qty * w.cost_at_moment,
      0,
    );
    return {
      totalSales: sales.length,
      revenue: sales.reduce((acc, s) => acc + s.total_revenue, 0),
      cost: sales.reduce((acc, s) => acc + s.total_cost, 0),
      wasteCost: totalWasteCost,
      sectorStats,
      topProducts: Object.entries(productPerformance)
        .sort((a, b) => b[1].qty - a[1].qty)
        .slice(0, 5),
      stockStatus: {
        low: ingredients.filter((i) => i.estoqueAtual < 100).length,
        total: ingredients.length,
      },
    };
  }
}

export const dbService = new MockDbService();
