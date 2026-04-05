import React, { useState, useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  Box,
  ArrowUpCircle,
  Sparkles,
  Barcode,
  Filter,
  CheckCircle2,
  ChefHat,
  Loader2,
  ShoppingCart,
  BrainCircuit,
  AlertTriangle,
} from "lucide-react";
import { api } from "../services/api";
import { dbService } from "../services/mockDb";
import { geminiService } from "../services/geminiService";
import {
  Ingredient,
  IngredientSchema,
  UnitMeasure,
  IngredientFormValues,
  TaxClassification,
} from "../../types";

/** NCM fiscal: 8 dígitos; normaliza API/form vazio ou com máscara. */
function ingredientToFormValues(ing: Ingredient): IngredientFormValues {
  const digits = String(ing.ncm ?? "").replace(/\D/g, "");
  const ncm =
    digits.length >= 8 ? digits.slice(0, 8) : digits.padStart(8, "0").slice(-8);

  return {
    name: ing.name,
    barcode: ing.barcode ?? "",
    unit_measure: ing.unit_measure,
    cost_price: ing.cost_price,
    unit_cost: ing.unit_cost,
    stock_current: ing.stock_current,
    ncm,
    tax_classification: ing.tax_classification,
    ibs_cbs_rate: ing.ibs_cbs_rate ?? 26.5,
    cest: ing.cest ?? "",
    nbs: ing.nbs ?? "",
    cClassTrib: ing.cClassTrib ?? "",
  };
}

export const IngredientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);
  const [replenishmentList, setReplenishmentList] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(IngredientSchema) as Resolver<IngredientFormValues>,
    defaultValues: {
      name: "",
      barcode: "",
      nbs: "",
      cest: "",
      cClassTrib: "",
      cost_price: 0,
      unit_cost: 0,
      stock_current: 0,
      // Vazio quebra o Zod (.length(8)); alinhado a ProductDetailsPage
      ncm: "00000000",
      unit_measure: UnitMeasure.G,
      tax_classification: TaxClassification.TRIBUTADO,
      ibs_cbs_rate: 26.5,
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getIngredients();
      setIngredients(data);
    } catch (e) {
      console.error("Cloud offline, usando LocalStorage.");
      setIngredients(dbService.getIngredients());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingId(ingredient.id);
      reset(ingredientToFormValues(ingredient));
    } else {
      setEditingId(null);
      reset({
        name: "",
        barcode: "",
        nbs: "",
        cest: "",
        cClassTrib: "",
        unit_measure: UnitMeasure.G,
        cost_price: 0,
        unit_cost: 0,
        stock_current: 0,
        ncm: "00000000",
        tax_classification: TaxClassification.TRIBUTADO,
        ibs_cbs_rate: 26.5,
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: IngredientFormValues) => {
    setLoading(true);
    try {
      const payload = editingId
        ? ({ ...data, id: editingId } as Ingredient)
        : (data as Ingredient);
      await api.saveIngredient(payload);
      loadData();
      setIsModalOpen(false);
    } catch (e) {
      alert("Erro ao salvar insumo.");
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = ingredients.filter((ing) => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = ing.name.toLowerCase().includes(searchLower);
    const ncmMatch = ing.ncm.toLowerCase().includes(searchLower);
    const matchesLowStock = showOnlyLowStock ? ing.stock_current < 100 : true;
    return (nameMatch || ncmMatch) && matchesLowStock;
  });

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl">
              <ChefHat className="w-6 h-6" />
            </div>
            Insumos & Inventário Cloud
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">
            Controle Sincronizado com o Backend
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl"
          >
            <Plus className="w-4 h-4" /> Novo Insumo
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar insumos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none"
          />
        </div>
        <button
          onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
          className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${showOnlyLowStock ? "bg-amber-100 border-amber-200 text-amber-700" : "bg-white text-slate-500"}`}
        >
          <Filter className="w-4 h-4 inline mr-2" /> Estoque Crítico
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Nome
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Estoque
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Custo Unit.
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map((ing) => (
                <tr
                  key={ing.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50"
                >
                  <td className="px-8 py-6 font-bold text-slate-900">
                    {ing.name}
                  </td>
                  <td className="px-8 py-6 font-mono text-sm">
                    {ing.stock_current} {ing.unit_measure}
                  </td>
                  <td className="px-8 py-6 font-mono text-sm">
                    R$ {ing.unit_cost.toFixed(4)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => openModal(ing)}
                      className="p-2 text-slate-400 hover:text-indigo-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] w-full max-w-lg animate-[slideUp_0.3s_ease-out]">
            <div className="p-10 border-b flex justify-between items-center">
              <h3 className="text-xl font-black uppercase">
                {editingId ? "Editar" : "Novo"} Insumo
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-6">
              <div className="space-y-1">
                <input
                  {...register("name")}
                  placeholder="Nome do Insumo (mín. 3 caracteres)"
                  className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 font-bold">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <input
                    {...register("stock_current", { valueAsNumber: true })}
                    placeholder="Qtd Atual"
                    type="number"
                    step="0.001"
                    min={0}
                    className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold"
                  />
                  {errors.stock_current && (
                    <p className="text-xs text-red-500 font-bold">
                      {errors.stock_current.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    {...register("unit_cost", { valueAsNumber: true })}
                    placeholder="Custo Unit"
                    type="number"
                    step="0.0001"
                    min={0}
                    className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold"
                  />
                  {errors.unit_cost && (
                    <p className="text-xs text-red-500 font-bold">
                      {errors.unit_cost.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <input
                  {...register("ncm")}
                  placeholder="NCM (8 dígitos, só números)"
                  maxLength={8}
                  inputMode="numeric"
                  className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold font-mono"
                />
                {errors.ncm && (
                  <p className="text-xs text-red-500 font-bold">
                    {errors.ncm.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl"
              >
                Salvar Insumo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
