import React, { useEffect, useState } from "react";
import { Resolver, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { api } from "../services/api";
import {
  IngredientePayloadSchema,
  UnidadeMedida,
  type Ingredient,
  type IngredienteFormValues,
} from "../../types";
import { emptyFiscalConfig } from "../services/pluxMappers";

function defaultFormValues(): IngredienteFormValues {
  return {
    nome: "",
    codigoBarras: null,
    unidadeMedida: UnidadeMedida.G,
    precoCustoUltimo: 0,
    custoMedio: 0,
    estoqueAtual: 0,
    fiscalConfig: emptyFiscalConfig(),
  };
}

function ingredientToFormValues(ing: Ingredient): IngredienteFormValues {
  return {
    nome: ing.nome,
    codigoBarras: ing.codigoBarras ?? null,
    unidadeMedida: ing.unidadeMedida,
    precoCustoUltimo: ing.precoCustoUltimo,
    custoMedio: ing.custoMedio,
    estoqueAtual: ing.estoqueAtual,
    fiscalConfig: {
      ...emptyFiscalConfig(),
      ...ing.fiscalConfig,
      origem: ing.fiscalConfig.origem ?? 0,
      ncm: ing.fiscalConfig.ncm ?? "00000000",
    },
  };
}

function sanitizeBeforeParse(data: IngredienteFormValues): IngredienteFormValues {
  const fc = { ...data.fiscalConfig };
  const nullableStrKeys: (keyof typeof fc)[] = [
    "ncm",
    "icms",
    "icms_cst",
    "icms_cst_cest",
    "pis",
    "pis_cst",
    "pis_cst_cest",
    "cofins",
    "cofins_cst",
    "cofins_cst_natureza",
    "ibs_cClassTrib",
    "ibs_cClassTrib_cst",
    "cbs_cClassTrib",
    "cbs_cClassTrib_cst",
  ];
  for (const k of nullableStrKeys) {
    const v = fc[k];
    if (v === "") (fc as Record<string, unknown>)[k as string] = null;
  }
  const ncmDigits = String(fc.ncm ?? "").replace(/\D/g, "");
  fc.ncm =
    ncmDigits.length >= 8
      ? ncmDigits.slice(0, 8)
      : ncmDigits.padStart(8, "0").slice(-8);
  const numNullable = (
    v: number | null | undefined,
  ): number | null | undefined =>
    v === undefined || (typeof v === "number" && Number.isNaN(v)) ? null : v;

  fc.tipoIncidencia = numNullable(fc.tipoIncidencia) as number | null | undefined;
  fc.aliquota_ibs = numNullable(fc.aliquota_ibs) as number | null | undefined;
  fc.aliquota_cbs = numNullable(fc.aliquota_cbs) as number | null | undefined;
  fc.aliquota_is = numNullable(fc.aliquota_is) as number | null | undefined;

  return {
    ...data,
    codigoBarras:
      data.codigoBarras != null && String(data.codigoBarras).trim() === ""
        ? null
        : data.codigoBarras,
    fiscalConfig: fc,
  };
}

const fieldClass =
  "w-full p-4 bg-slate-50 border rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100";
const labelClass =
  "text-[10px] font-black uppercase tracking-widest ml-1 text-primary";
const sectionTitle =
  "text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2";

export type IngredientFormModalProps = {
  open: boolean;
  /** `null` = novo insumo; caso contrário edição. */
  ingredient: Ingredient | null;
  onClose: () => void;
  /** Chamado após salvar com sucesso (ex.: recarregar lista na página). */
  onSaved: () => void | Promise<void>;
};

export const IngredientFormModal: React.FC<IngredientFormModalProps> = ({
  open,
  ingredient,
  onClose,
  onSaved,
}) => {
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<IngredienteFormValues>({
    resolver: zodResolver(
      IngredientePayloadSchema,
    ) as Resolver<IngredienteFormValues>,
    defaultValues: defaultFormValues(),
  });

  useEffect(() => {
    if (!open) return;
    if (ingredient) {
      reset(ingredientToFormValues(ingredient));
    } else {
      reset(defaultFormValues());
    }
  }, [open, ingredient, reset]);

  const icms = useWatch({ control, name: "fiscalConfig.icms" });
  const icmsCst = useWatch({ control, name: "fiscalConfig.icms_cst" });
  const pis = useWatch({ control, name: "fiscalConfig.pis" });
  const pisCst = useWatch({ control, name: "fiscalConfig.pis_cst" });
  const cofins = useWatch({ control, name: "fiscalConfig.cofins" });
  const cofinsCst = useWatch({ control, name: "fiscalConfig.cofins_cst" });

  const showIcmsCst = Boolean(icms != null && String(icms).trim() !== "");
  const showIcmsCest = Boolean(
    showIcmsCst && icmsCst != null && String(icmsCst).trim() !== "",
  );
  const showPisCst = Boolean(pis != null && String(pis).trim() !== "");
  const showPisNatureza = Boolean(
    showPisCst && pisCst != null && String(pisCst).trim() !== "",
  );
  const showCofinsCst = Boolean(cofins != null && String(cofins).trim() !== "");
  const showCofinsNatureza = Boolean(
    showCofinsCst &&
      cofinsCst != null &&
      String(cofinsCst).trim() !== "",
  );

  const editingId = ingredient?.id ?? null;

  const onSubmit = async (raw: IngredienteFormValues) => {
    setSaving(true);
    try {
      const data = IngredientePayloadSchema.parse(sanitizeBeforeParse(raw));
      const payload: Ingredient = editingId
        ? { ...data, id: editingId }
        : { ...data, id: "" };
      await api.saveIngredient(payload);
      await onSaved();
      onClose();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao salvar insumo.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-[slideUp_0.3s_ease-out] my-6">
        <div className="p-8 md:p-10 border-b flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-[40px]">
          <h3 className="text-xl font-black uppercase">
            {editingId ? "Editar" : "Novo"} Ingrediente
          </h3>
          <button type="button" onClick={onClose} disabled={saving}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-8 md:p-10 space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className={labelClass}>nome</label>
              <input
                {...register("nome")}
                className={fieldClass}
                placeholder="Nome (mín. 3 caracteres)"
              />
              {errors.nome && (
                <p className="text-xs text-red-500 font-bold">
                  {errors.nome.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Estoque Atual</label>
              <input
                type="number"
                step="0.001"
                {...register("estoqueAtual", { valueAsNumber: true })}
                className={`${fieldClass} font-mono`}
              />
              {errors.estoqueAtual && (
                <p className="text-xs text-red-500 font-bold">
                  {errors.estoqueAtual.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Unidade Medida</label>
              <select {...register("unidadeMedida")} className={fieldClass}>
                {Object.values(UnidadeMedida).map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>preço Custo Último</label>
              <input
                type="number"
                step="0.01"
                {...register("precoCustoUltimo", { valueAsNumber: true })}
                className={`${fieldClass} font-mono`}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Custo Médio</label>
              <input
                type="number"
                step="0.0001"
                {...register("custoMedio", { valueAsNumber: true })}
                className={`${fieldClass} font-mono`}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className={labelClass}>Código de Barras</label>
              <input
                {...register("codigoBarras")}
                className={fieldClass}
                placeholder="Opcional"
              />
            </div>
          </div>

          <details className="space-y-4 rounded-xl bg-slate-100 px-2 py-3 ">
            <summary className="cursor-pointer text-lg font-black text-slate-900 uppercase tracking-tight hover:bg-slate-200 transition-colors select-none">
              Área de tributações
            </summary>
            <div className="pt-2 space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>icms</label>
                    <input
                      {...register("fiscalConfig.icms")}
                      className={fieldClass}
                      placeholder="Ex: 18"
                    />
                  </div>
                  {showIcmsCst && (
                    <div className="space-y-1">
                      <label className={labelClass}>ICMS CST</label>
                      <input
                        {...register("fiscalConfig.icms_cst")}
                        className={fieldClass}
                        placeholder="Ex: 00, 20, 60"
                      />
                    </div>
                  )}
                  {showIcmsCest && (
                    <div className="space-y-1">
                      <label className={labelClass}>ICMS CST CEST</label>
                      <input
                        {...register("fiscalConfig.icms_cst_cest")}
                        className={fieldClass}
                        placeholder="Ex: 0101010"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className={sectionTitle}>PIS / COFINS</h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1">
                    <label className={labelClass}>pis</label>
                    <input
                      {...register("fiscalConfig.pis")}
                      className={fieldClass}
                      placeholder="Ex: 1.65"
                    />
                  </div>
                  {showPisCst && (
                    <div className="space-y-1">
                      <label className={labelClass}>PIS CST</label>
                      <input
                        {...register("fiscalConfig.pis_cst")}
                        className={fieldClass}
                        placeholder="Ex: 01, 04, 06"
                      />
                    </div>
                  )}
                  {showPisNatureza && (
                    <div className="space-y-1">
                      <label className={labelClass}>PIS CST CEST</label>
                      <input
                        {...register("fiscalConfig.pis_cst_cest")}
                        className={fieldClass}
                        placeholder="Ex: 049"
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1">
                    <label className={labelClass}>COFINS</label>
                    <input
                      {...register("fiscalConfig.cofins")}
                      className={fieldClass}
                      placeholder="Ex: 7.60"
                    />
                  </div>
                  {showCofinsCst && (
                    <div className="space-y-1">
                      <label className={labelClass}>COFINS CST</label>
                      <input
                        {...register("fiscalConfig.cofins_cst")}
                        className={fieldClass}
                        placeholder="Ex: 01, 04, 06"
                      />
                    </div>
                  )}
                  {showCofinsNatureza && (
                    <div className="space-y-1">
                      <label className={labelClass}>COFINS CST Natureza</label>
                      <input
                        {...register("fiscalConfig.cofins_cst_natureza")}
                        className={fieldClass}
                        placeholder="Ex: 049"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className={sectionTitle}>NCM / reforma</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>NCM</label>
                    <input
                      {...register("fiscalConfig.ncm")}
                      maxLength={8}
                      inputMode="numeric"
                      className={`${fieldClass} font-mono`}
                      placeholder="Ex: 12345678"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Origem</label>
                    <input
                      type="number"
                      {...register("fiscalConfig.origem", {
                        valueAsNumber: true,
                      })}
                      className={`${fieldClass} font-mono`}
                      placeholder="Ex: 0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Tipo Incidencia</label>
                    <input
                      type="number"
                      step="any"
                      {...register("fiscalConfig.tipoIncidencia", {
                        valueAsNumber: true,
                      })}
                      className={`${fieldClass} font-mono`}
                      placeholder="Ex: 1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Alíquota IS</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("fiscalConfig.aliquota_is", {
                        valueAsNumber: true,
                      })}
                      className={`${fieldClass} font-mono`}
                      placeholder="Ex: 0.01"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>Alíquota IBS</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("fiscalConfig.aliquota_ibs", {
                        valueAsNumber: true,
                      })}
                      className={`${fieldClass} font-mono`}
                      placeholder="Ex: 0.05"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>IBS cClassTrib</label>
                    <input
                      maxLength={1}
                      {...register("fiscalConfig.ibs_cClassTrib")}
                      className={`${fieldClass} font-mono`}
                      placeholder="Ex: A"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>IBS cClassTrib CST</label>
                    <input
                      maxLength={1}
                      {...register("fiscalConfig.ibs_cClassTrib_cst")}
                      className={`${fieldClass} font-mono`}
                      placeholder="Ex: 1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>Alíquota CBS (linha CBS)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("fiscalConfig.aliquota_cbs", {
                        valueAsNumber: true,
                      })}
                      className={`${fieldClass} font-mono`}
                      placeholder="Ex: 0.12"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>CBS cClassTrib</label>
                    <input
                      maxLength={1}
                      {...register("fiscalConfig.cbs_cClassTrib")}
                      className={`${fieldClass} font-mono`}
                      placeholder="Ex: B"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>CBS cClassTrib CST</label>
                    <input
                      maxLength={1}
                      {...register("fiscalConfig.cbs_cClassTrib_cst")}
                      className={`${fieldClass} font-mono`}
                      placeholder="Ex: 1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </details>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Salvar Insumo
          </button>
        </form>
      </div>
    </div>
  );
};
