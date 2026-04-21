import React, { useState, useEffect } from "react";
import { dbService } from "../services/mockDb";
import { Ingredient, WasteReason, WasteEntry } from "../../types";
import {
  Trash2,
  Plus,
  AlertTriangle,
  Calendar,
  Package,
  ChevronRight,
  History,
  ShieldAlert,
  ArrowLeft,
  X,
  Loader2,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";

export const WasteManagementPage: React.FC = () => {
  const [wastes, setWastes] = useState<WasteEntry[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    setWastes([...dbService.getWaste()].reverse());
    setIngredients(dbService.getIngredients());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegisterWaste = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const payload = {
      ingredient_id: formData.get("ingredientId") as string,
      qty: Number(formData.get("qty")),
      reason: formData.get("reason") as WasteReason,
      notes: formData.get("notes") as string,
    };

    setTimeout(() => {
      dbService.registerWaste(payload);
      loadData();
      setIsModalOpen(false);
      setIsSubmitting(false);
    }, 800);
  };

  const totalWasteValue = wastes.reduce(
    (acc, w) => acc + w.qty * w.cost_at_moment,
    0,
  );

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out] pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-3 bg-red-600 text-white rounded-[20px] shadow-xl">
              <Trash2 className="w-6 h-6" />
            </div>
            Gestão de Quebras
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Controle rigoroso de desperdícios e impacto no CMV.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-6 py-4 rounded-[24px] border border-slate-100 flex items-center gap-4">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Prejuízo Total
              </p>
              <p className="text-xl font-black text-red-600 font-mono">
                R$ {totalWasteValue.toFixed(2)}
              </p>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            <ShieldAlert className="w-6 h-6 text-red-100" />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Registrar Perda
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Insumo
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Motivo
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Quantidade
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Custo Estimado
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {wastes.map((w) => {
                const ing = ingredients.find((i) => i.id === w.ingredient_id);
                return (
                  <tr
                    key={w.id}
                    className="hover:bg-red-50/30 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-sm font-black text-slate-800 block">
                            {ing?.nome || "Insumo Excluído"}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 italic">
                            {w.notes}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100">
                        {w.reason}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-black font-mono">
                        -{w.qty}{" "}
                        <span className="text-[10px] opacity-40 uppercase">
                          {ing?.unidadeMedida}
                        </span>
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-sm font-black text-red-500 font-mono">
                        R$ {(w.qty * w.cost_at_moment).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        {new Date(w.timestamp).toLocaleDateString("pt-BR")}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {wastes.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800">
                      Operação sem quebras
                    </h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                      Sua cozinha está operando com eficiência máxima.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[48px] w-full max-w-lg overflow-hidden animate-[slideUp_0.3s_ease-out] shadow-2xl">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Registrar Quebra
                </h3>
                <p className="text-[10px] text-slate-400 font-black uppercase mt-1">
                  Baixa em tempo real no inventário
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 text-slate-400 hover:bg-white rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRegisterWaste} className="p-12 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Selecionar Insumo
                </label>
                <select
                  name="ingredientId"
                  required
                  className="w-full px-6 py-5 bg-slate-50 border-none rounded-[24px] font-bold outline-none"
                >
                  <option value="">Escolha o item...</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.nome} (Saldo: {ing.estoqueAtual}
                      {ing.unidadeMedida})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Quantidade
                  </label>
                  <input
                    name="qty"
                    type="number"
                    step="0.001"
                    required
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-[24px] font-black text-xl outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Motivo da Baixa
                  </label>
                  <select
                    name="reason"
                    required
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-[24px] font-bold outline-none"
                  >
                    {Object.values(WasteReason).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Observações / Notas
                </label>
                <textarea
                  name="notes"
                  className="w-full px-6 py-5 bg-slate-50 border-none rounded-[24px] font-medium outline-none h-24 resize-none"
                  placeholder="ex: Queimou durante o processo de fritura..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-red-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-red-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                Confirmar Baixa de Estoque
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
