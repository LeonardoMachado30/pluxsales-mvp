import { z } from "zod";

export enum UnitMeasure {
  G = "g",
  ML = "ml",
  UN = "un",
  KG = "kg",
  L = "L",
}

export enum TaxRegime {
  SIMPLES = "SIMPLES NACIONAL",
  LUCRO_PRESUMIDO = "LUCRO PRESUMIDO",
  LUCRO_REAL = "LUCRO REAL",
}

export enum FiscalProfile {
  CONSERVADOR = "CONSERVADOR",
  MODERADO = "MODERADO",
  ARROJADO = "ARROJADO",
}

export enum TaxClassification {
  TRIBUTADO = "TRIBUTADO",
  IMUNE = "IMUNE",
  ISENTO = "ISENTO",
  NAO_INCIDENTE = "NÃO INCIDENTE",
  REDUCAO_BASE = "REDUÇÃO DE BASE",
  ALIQUOTA_ZERO = "ALÍQUOTA ZERO",
  ST = "SUBSTITUIÇÃO TRIBUTÁRIA",
}

export enum PaymentMethod {
  CASH = "DINHEIRO",
  PIX = "PIX",
  CREDIT_CARD = "CARTÃO DE CRÉDITO",
  DEBIT_CARD = "CARTÃO DE DÉBITO",
}

export enum ProductCategory {
  HAMBURGUER_CARNE = "hamburguer de carne",
  HAMBURGUER_FRANGO = "hamburger de frango",
  PRATOS = "pratos",
  A_LACARTE = "a lacarte",
  PORCOES = "porções",
  CARNES = "carnes",
  BEBIDAS_ALCOOL = "bebidas c alcool",
  SEM_ALCOOL = "sem alcool",
  REFRIGERANTES = "refrigerantes",
  AGUAS = "aguas",
  BEBIDAS_QUENTES = "bebidas quentes",
  VINHOS = "vinhos",
  CAFES = "cafés",
  SALGADOS = "salgados",
  DOCES = "doces",
}

export enum StockMovementType {
  IN = "ENTRADA",
  OUT = "SAÍDA",
  WASTE = "QUEBRA",
  ADJUSTMENT = "AJUSTE",
}

export enum SectorType {
  HALL = "SALÃO",
  TERRACE = "TERRAÇO",
  COUNTER = "BALCÃO",
  DELIVERY = "DELIVERY",
  OTHER = "OUTRO",
}

export enum TicketStatus {
  PENDING = "PENDENTE",
  PREPARING = "PREPARANDO",
  READY = "PRONTO",
  DELIVERED = "ENTREGUE",
}

export enum WasteReason {
  EXPIRED = "VALIDADE",
  DAMAGED = "AVARIA",
  PROCESS = "PROCESSO",
  OTHER = "OUTRO",
}

export interface PriceBreakdownItem {
  name: string;
  ncm: string;
  allocated_price: number;
  is_tax_free: boolean;
}

// --- Zod Schemas ---

export const ProductTaxProfileSchema = z.object({
  uf: z.string().length(2).toUpperCase(),
  tax_regime: z.nativeEnum(TaxRegime),
  fiscal_profile: z.nativeEnum(FiscalProfile).default(FiscalProfile.MODERADO),
  ncm: z
    .string()
    .length(8, "O NCM deve ter 8 dígitos")
    .regex(/^\d+$/, "Apenas números"),
  pis_cst: z.string().default("01"),
  cofins_cst: z.string().default("01"),
  icms_cst: z.string().default("00"),
  tax_classification: z
    .nativeEnum(TaxClassification)
    .default(TaxClassification.TRIBUTADO),
  ibs_cbs_rate: z.number().optional().default(26.5),
  beneficio_fiscal: z.boolean().default(false),
  price_breakdown: z
    .array(
      z.object({
        name: z.string(),
        ncm: z.string(),
        allocated_price: z.number(),
        is_tax_free: z.boolean(),
      }),
    )
    .optional()
    .default([]),
});

export const ProductIngredientSchema = z.object({
  ingredient_id: z.string().min(1, "Selecione um ingrediente"),
  qty_used: z.number().min(0.0001, "A quantidade deve ser positiva"),
});

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "O nome do produto é obrigatório"),
  category: z.nativeEnum(ProductCategory),
  sale_price: z.number().min(0.01),
  active: z.boolean(),
  ingredients: z.array(ProductIngredientSchema).optional().default([]),
  tax_profile: ProductTaxProfileSchema,
  sku: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof ProductSchema>;

const PRODUCT_CATEGORY_VALUES = new Set(
  Object.values(ProductCategory) as string[],
);
const PRODUCT_CATEGORY_KEYS = Object.keys(ProductCategory).filter((k) =>
  Number.isNaN(Number(k)),
) as (keyof typeof ProductCategory)[];

/** Normaliza dados do wizard/API/IA antes do ProductSchema (NCM, preço, breakdown, UF, ingredientes). */
export function preprocessProductWizardData(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const d = { ...(data as Record<string, unknown>) };

  const sp = Number(d.sale_price);
  d.sale_price =
    Number.isFinite(sp) && !Number.isNaN(sp) && sp >= 0.01 ? sp : 0.01;

  const catRaw = d.category;
  const catStr = typeof catRaw === "string" ? catRaw : String(catRaw ?? "");
  if (PRODUCT_CATEGORY_VALUES.has(catStr)) {
    d.category = catStr;
  } else if (
    PRODUCT_CATEGORY_KEYS.includes(catStr as keyof typeof ProductCategory)
  ) {
    d.category = ProductCategory[catStr as keyof typeof ProductCategory];
  } else {
    d.category = ProductCategory.PRATOS;
  }

  const rawTp = d.tax_profile;
  const tp =
    rawTp && typeof rawTp === "object"
      ? { ...(rawTp as Record<string, unknown>) }
      : {};

  let uf = String(tp.uf ?? "DF")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  if (uf.length < 2) uf = (uf + "DF").slice(0, 2);
  else uf = uf.slice(0, 2);
  tp.uf = uf;

  if (
    typeof tp.tax_regime !== "string" ||
    !(Object.values(TaxRegime) as string[]).includes(tp.tax_regime as string)
  ) {
    tp.tax_regime = TaxRegime.SIMPLES;
  }
  if (
    typeof tp.fiscal_profile !== "string" ||
    !(Object.values(FiscalProfile) as string[]).includes(
      tp.fiscal_profile as string,
    )
  ) {
    tp.fiscal_profile = FiscalProfile.MODERADO;
  }
  if (
    typeof tp.tax_classification !== "string" ||
    !(Object.values(TaxClassification) as string[]).includes(
      tp.tax_classification as string,
    )
  ) {
    tp.tax_classification = TaxClassification.TRIBUTADO;
  }

  const ncmDigits = String(tp.ncm ?? "").replace(/\D/g, "");
  const ncm =
    ncmDigits.length >= 8
      ? ncmDigits.slice(0, 8)
      : ncmDigits.padStart(8, "0").slice(-8);
  tp.ncm = /^\d{8}$/.test(ncm) ? ncm : "00000000";

  tp.pis_cst = String(tp.pis_cst ?? "01").slice(0, 2);
  tp.cofins_cst = String(tp.cofins_cst ?? "01").slice(0, 2);
  tp.icms_cst = String(tp.icms_cst ?? "00").slice(0, 3);

  const ibs = Number(tp.ibs_cbs_rate);
  tp.ibs_cbs_rate = Number.isFinite(ibs) && !Number.isNaN(ibs) ? ibs : 26.5;
  tp.beneficio_fiscal = Boolean(tp.beneficio_fiscal);

  const pb = Array.isArray(tp.price_breakdown) ? tp.price_breakdown : [];
  tp.price_breakdown = pb.map((item: unknown) => {
    const row = (item && typeof item === "object" ? item : {}) as Record<
      string,
      unknown
    >;
    const rowNcm = String(row.ncm ?? "").replace(/\D/g, "");
    const rowNcm8 =
      rowNcm.length >= 8
        ? rowNcm.slice(0, 8)
        : rowNcm.padStart(8, "0").slice(-8);
    const ap = Number(row.allocated_price);
    return {
      name: String(row.name ?? "").trim() || "Item",
      ncm: /^\d{8}$/.test(rowNcm8) ? rowNcm8 : "00000000",
      allocated_price: Number.isFinite(ap) && !Number.isNaN(ap) ? ap : 0,
      is_tax_free: Boolean(row.is_tax_free),
    };
  });

  d.tax_profile = tp;

  const rawIng = d.ingredients;
  const ingList = Array.isArray(rawIng) ? rawIng : [];
  d.ingredients = ingList
    .map((item: unknown) => {
      const row = (item && typeof item === "object" ? item : {}) as Record<
        string,
        unknown
      >;
      const iid = String(row.ingredient_id ?? "").trim();
      const qty = Number(row.qty_used);
      return {
        ingredient_id: iid,
        qty_used: Number.isFinite(qty) && !Number.isNaN(qty) ? qty : 0,
      };
    })
    .filter((row) => row.ingredient_id.length > 0 && row.qty_used >= 0.0001);

  if (typeof d.active !== "boolean") d.active = true;
  if (d.sku !== undefined && d.sku !== null) d.sku = String(d.sku);

  return d;
}

/** Schema do wizard de produto: mesmo contrato de ProductSchema, com sanitização antes da validação. */
export const ProductWizardSchema = z.preprocess(
  preprocessProductWizardData,
  ProductSchema,
);

export const IngredientSchema = z.object({
  name: z.string().min(3, "O nome do ingrediente é obrigatório"),
  barcode: z.string().optional(),
  unit_measure: z.enum(UnitMeasure),
  cost_price: z.number().min(0),
  unit_cost: z.number().min(0),
  stock_current: z.number().min(0),
  ncm: z
    .string()
    .length(8, "O NCM deve ter 8 dígitos")
    .regex(/^\d+$/, "Apenas números"),
  nbs: z.string().optional(),
  tax_classification: z
    .enum(TaxClassification)
    .default(TaxClassification.TRIBUTADO),
  ibs_cbs_rate: z.number().optional().default(26.5),
  cest: z.string().optional(),
  cClassTrib: z.string().optional(),
});

export type IngredientFormValues = z.infer<typeof IngredientSchema>;

export interface Sector {
  id: string;
  name: string;
  // type: SectorType;
  tableCount: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  sale_price: number;
  active: boolean;
  cmv_total: number;
  tax_profile: z.infer<typeof ProductTaxProfileSchema>;
  ingredients: { ingredient_id: string; qty_used: number }[];
  sku?: string;
}

export interface SaleItem {
  product_id: string;
  name: string;
  qty: number;
  price_at_sale: number;
  cost_at_sale: number;
}

export interface Sale {
  id: string;
  timestamp: string;
  items: SaleItem[];
  total_revenue: number;
  total_cost: number;
  payment_method: PaymentMethod;
  tax_optimized: boolean;
  received_amount?: number;
  change_amount?: number;
  sectorId?: string;
  tableName?: string;
  registerSessionId?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit_measure: UnitMeasure;
  cost_price: number;
  unit_cost: number;
  stock_current: number;
  ncm: string;
  tax_classification: TaxClassification;
  barcode?: string;
  nbs?: string;
  ibs_cbs_rate?: number;
  cest?: string;
  cClassTrib?: string;
}

export interface StockMovement {
  id: string;
  ingredient_id: string;
  type: StockMovementType;
  qty: number;
  cost_at_moment: number;
  timestamp: string;
  notes?: string;
}

export interface RegisterSession {
  id: string;
  openedAt: string;
  openedBy: string;
  openingAmount: number;
  status: "OPEN" | "CLOSED";
  salesIds: string[];
  closedAt?: string;
  closedBy?: string;
  closingAmount?: number;
  expectedAmount?: number;
}

export interface KitchenTicket {
  id: string;
  saleId: string;
  timestamp: string;
  items: {
    product_id: string;
    name: string;
    qty: number;
    category: ProductCategory;
  }[];
  status: TicketStatus;
  sectorName: string;
  tableName?: string;
  priority: "NORMAL" | "URGENT";
}

export interface WasteEntry {
  id: string;
  ingredient_id: string;
  qty: number;
  reason: WasteReason;
  notes: string;
  timestamp: string;
  userId: string;
  cost_at_moment: number;
}
