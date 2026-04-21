import React, { useEffect, useState } from "react";
import { X, Loader2, Pencil } from "lucide-react";
import { api } from "../services/api";
import type { Ingredient } from "../../types";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 border-b border-slate-50 pb-3">
      <span className="text-md font-black uppercase tracking-widest shrink-0">
        {label}:
      </span>
      <span className="text-md text-slate-700 text-right break-all font-mono">
        {value ?? "—"}
      </span>
    </div>
  );
}

function IngredientReadOnlyBody({ ing }: { ing: Ingredient }) {
  const fc = ing.fiscalConfig;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 text-sm space-y-1">
      <DetailRow label="nome" value={ing.nome} />
      <DetailRow label="codigoBarras" value={ing.codigoBarras ?? "—"} />
      <DetailRow label="unidadeMedida" value={ing.unidadeMedida} />
      <DetailRow
        label="precoCustoUltimo"
        value={`R$ ${ing.precoCustoUltimo.toFixed(2)}`}
      />
      <DetailRow label="custoMedio" value={`R$ ${ing.custoMedio.toFixed(4)}`} />
      <DetailRow label="estoqueAtual" value={ing.estoqueAtual} />

      <details className="space-y-4 rounded-xl bg-slate-100 px-2 py-3 col-span-2">
        <summary className="cursor-pointer text-lg font-black text-slate-900 uppercase tracking-tight hover:bg-slate-200 transition-colors select-none">
          Área de tributações
        </summary>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-0 text-sm space-y-1">
          <DetailRow label="NCM" value={fc.ncm} />
          <DetailRow label="Origem" value={fc.origem} />
          <DetailRow label="Tipo Incidencia" value={fc.tipoIncidencia ?? "—"} />
          <DetailRow label="Alíquota IBS" value={fc.aliquota_ibs ?? "—"} />
          <DetailRow label="Alíquota CBS" value={fc.aliquota_cbs ?? "—"} />
          <DetailRow label="Alíquota IS" value={fc.aliquota_is ?? "—"} />
          <DetailRow label="ICMS" value={fc.icms ?? "—"} />
          <DetailRow label="ICMS CST" value={fc.icms_cst ?? "—"} />
          <DetailRow label="ICMS CST CEST" value={fc.icms_cst_cest ?? "—"} />
          <DetailRow label="PIS" value={fc.pis ?? "—"} />
          <DetailRow label="PIS CST" value={fc.pis_cst ?? "—"} />
          <DetailRow label="PIS CST CEST" value={fc.pis_cst_cest ?? "—"} />
          <DetailRow label="COFINS" value={fc.cofins ?? "—"} />
          <DetailRow label="COFINS CST" value={fc.cofins_cst ?? "—"} />
          <DetailRow
            label="COFINS CST Natureza"
            value={fc.cofins_cst_natureza ?? "—"}
          />
          <DetailRow label="IBS CClassTrib" value={fc.ibs_cClassTrib ?? "—"} />
          <DetailRow
            label="IBS CClassTrib CST"
            value={fc.ibs_cClassTrib_cst ?? "—"}
          />
          <DetailRow label="CBS CClassTrib" value={fc.cbs_cClassTrib ?? "—"} />
          <DetailRow
            label="CBS CClassTrib CST"
            value={fc.cbs_cClassTrib_cst ?? "—"}
          />
        </section>

      </details>
    </div>
  );
}

export type IngredientViewModalProps = {
  open: boolean;
  /** UUID do ingrediente; consulta `GET /ingredients/:id` quando aberto. */
  ingredientId: string | null;
  onClose: () => void;
  /** Fecha a visualização e deve abrir o fluxo de edição com o mesmo registro. */
  onEdit: (ingredient: Ingredient) => void;
};

export const IngredientViewModal: React.FC<IngredientViewModalProps> = ({
  open,
  ingredientId,
  onClose,
  onEdit,
}) => {
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !ingredientId) {
      setIngredient(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setIngredient(null);

    api
      .getIngredient(ingredientId)
      .then((data) => {
        if (cancelled) return;
        if (data) setIngredient(data);
        else setError("Insumo não encontrado.");
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erro ao carregar insumo.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, ingredientId]);

  if (!open) return null;

  const handleEdit = () => {
    if (!ingredient) return;
    onEdit(ingredient);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-[40px] w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-[slideUp_0.3s_ease-out] my-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ingredient-view-title"
      >
        <div className="p-8 border-b flex justify-between items-center gap-4 sticky top-0 bg-white z-10 rounded-t-[40px]">
          <h3
            id="ingredient-view-title"
            className="text-2xl font-black uppercase truncate pr-2"
          >
            {ingredient?.nome ?? "Ingrediente"}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              disabled={!ingredient || loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Pencil className="w-4 h-4" />
              Editar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100"
              aria-label="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8 md:p-10">
          {loading && (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
          )}
          {!loading && error && (
            <p className="text-sm font-bold text-red-600 text-center py-8">
              {error}
            </p>
          )}
          {!loading && !error && ingredient && (
            <IngredientReadOnlyBody ing={ingredient} />
          )}
        </div>
      </div>
    </div>
  );
};
