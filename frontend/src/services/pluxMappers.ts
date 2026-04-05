import type { z } from "zod";
import {
  PaymentMethod,
  ProductCategory,
  ProductTaxProfileSchema,
  TaxRegime,
  FiscalProfile,
  TaxClassification,
  SectorType,
  type Product,
  type Sector,
} from "../../types";
import type { User } from "./authService";

/** Valores aceitos por mapPaymentToPrisma no backend (MetodoPagamentoVenda). */
export function paymentMethodToApi(p: PaymentMethod): string {
  switch (p) {
    case PaymentMethod.CASH:
      return "DINHEIRO";
    case PaymentMethod.PIX:
      return "PIX";
    case PaymentMethod.CREDIT_CARD:
      return "CARTAO_CREDITO";
    case PaymentMethod.DEBIT_CARD:
      return "CARTAO_DEBITO";
    default:
      return "PIX";
  }
}

const productCategoryKeys = Object.keys(ProductCategory).filter((k) =>
  Number.isNaN(Number(k)),
) as (keyof typeof ProductCategory)[];

/** Nome enum Prisma (ex.: HAMBURGUER_CARNE) a partir do valor do enum TS (rótulo PT). */
export function productCategoryToApi(category: ProductCategory): string {
  const key = productCategoryKeys.find((k) => ProductCategory[k] === category);
  return key ?? "PRATOS";
}

/** Resposta da API (enum Prisma ou valor PT legado) → ProductCategory do app. */
export function apiCategoryToProductCategory(raw: string): ProductCategory {
  const trimmed = String(raw ?? "").trim();
  if (
    productCategoryKeys.includes(trimmed as keyof typeof ProductCategory) &&
    ProductCategory[trimmed as keyof typeof ProductCategory] !== undefined
  ) {
    return ProductCategory[trimmed as keyof typeof ProductCategory];
  }
  const byValue = productCategoryKeys.find(
    (k) => ProductCategory[k] === trimmed,
  );
  if (byValue) return ProductCategory[byValue];
  return ProductCategory.PRATOS;
}

export type ProductTaxProfile = z.infer<typeof ProductTaxProfileSchema>;

/** Normaliza objeto retornado por GET /products. */
export function normalizeProductFromApi(raw: Record<string, unknown>): Product {
  const tax = raw.tax_profile as Record<string, unknown> | undefined;
  const tax_profile: ProductTaxProfile = {
    uf: String(tax?.uf ?? "SP")
      .slice(0, 2)
      .toUpperCase(),
    tax_regime: (Object.values(TaxRegime) as string[]).includes(
      String(tax?.tax_regime),
    )
      ? (tax!.tax_regime as TaxRegime)
      : TaxRegime.SIMPLES,
    fiscal_profile: (Object.values(FiscalProfile) as string[]).includes(
      String(tax?.fiscal_profile),
    )
      ? (tax!.fiscal_profile as FiscalProfile)
      : FiscalProfile.MODERADO,
    ncm: String(tax?.ncm ?? "00000000")
      .padStart(8, "0")
      .slice(0, 8),
    pis_cst: String(tax?.pis_cst ?? "01"),
    cofins_cst: String(tax?.cofins_cst ?? "01"),
    icms_cst: String(tax?.icms_cst ?? "00"),
    tax_classification: (Object.values(TaxClassification) as string[]).includes(
      String(tax?.tax_classification),
    )
      ? (tax!.tax_classification as TaxClassification)
      : TaxClassification.TRIBUTADO,
    ibs_cbs_rate: Number(tax?.ibs_cbs_rate ?? 26.5),
    beneficio_fiscal: Boolean(tax?.beneficio_fiscal),
    price_breakdown: Array.isArray(tax?.price_breakdown)
      ? (tax!.price_breakdown as ProductTaxProfile["price_breakdown"])
      : [],
  };

  const ingredientsRaw = raw.ingredients;
  const ingredients = Array.isArray(ingredientsRaw)
    ? (ingredientsRaw as { ingredient_id: string; qty_used: number }[])
    : [];

  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    category: apiCategoryToProductCategory(String(raw.category ?? "")),
    sale_price: Number(raw.sale_price ?? 0),
    active: raw.active !== false,
    cmv_total: Number(raw.cmv_total ?? 0),
    tax_profile,
    ingredients,
    sku: raw.sku ? String(raw.sku) : undefined,
  };
}

/** Corpo para POST/PUT /products a partir do formulário (category → enum Prisma). */
export function productFormToApiBody(data: {
  name: string;
  category: ProductCategory;
  sale_price: number;
  active: boolean;
  ingredients?: { ingredient_id: string; qty_used: number }[];
  tax_profile: ProductTaxProfile;
  sku?: string;
}): Record<string, unknown> {
  return {
    name: data.name,
    category: productCategoryToApi(data.category),
    sale_price: data.sale_price,
    active: data.active,
    ingredients: data.ingredients ?? [],
    tax_profile: data.tax_profile,
    ...(data.sku !== undefined && { sku: data.sku }),
  };
}

export type PluxUsuarioApi = {
  id: string;
  email: string;
  nome: string;
  papel: string;
  status: string;
  avatar?: string | null;
  locatarioId?: string;
};

export function pluxUsuarioToUser(
  u: PluxUsuarioApi,
  locatarioId: string,
): User {
  const role =
    u.papel === "GERENTE"
      ? "MANAGER"
      : u.papel === "CAIXA"
        ? "CASHIER"
        : "ADMIN";

  const statusMap: Record<string, User["status"]> = {
    ATIVO: "ACTIVE",
    TESTE: "TRIAL",
    EXPIRADO: "EXPIRED",
    PAGO: "PAID",
  };
  const status = statusMap[u.status] ?? "ACTIVE";

  return {
    id: u.id,
    email: u.email,
    name: u.nome,
    role,
    tenantId: locatarioId,
    status,
    avatar: u.avatar ?? undefined,
  };
}

const sectorTypeValues = new Set<string>(Object.values(SectorType));

/** GET /sectors e GET /sectors/:id → modelo do app. */
export function normalizeSectorFromApi(raw: Record<string, unknown>): Sector {
  const id = String(raw.id ?? "");
  const name = String(raw.name ?? "");
  const tableCount = Number(
    raw.table_count ?? raw.tableCount ?? raw.qtdMesas ?? raw.qtd_mesas ?? 0,
  );
  const typeRaw = raw.type ?? raw.tipo ?? raw.sector_type;
  let type: SectorType = SectorType.OTHER;
  if (typeof typeRaw === "string" && sectorTypeValues.has(typeRaw)) {
    type = typeRaw as SectorType;
  }
  return {
    id,
    name,
    tableCount: Number.isFinite(tableCount) ? tableCount : 0,
  };
}

/** POST/PUT /sectors — payload mínimo + aliases opcionais do SetorService. */
export function sectorToApiBody(
  sector: Pick<Sector, "name" | "tableCount">,
): Record<string, unknown> {
  const table_count = Math.max(0, Math.floor(Number(sector.tableCount)) || 0);
  return {
    name: sector.name.trim(),
    table_count,
  };
}
