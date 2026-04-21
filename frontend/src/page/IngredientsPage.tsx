import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Edit2, ChefHat, Loader2, Filter } from "lucide-react";
import { api } from "../services/api";
import { dbService } from "../services/mockDb";
import type { Ingredient } from "../../types";
import { IngredientFormModal } from "../components/IngredientFormModal";
import { IngredientViewModal } from "../components/IngredientViewModal";

export const IngredientsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  /** `null` com modal aberto = novo; com objeto = edição. */
  const [modalIngredient, setModalIngredient] = useState<Ingredient | null>(
    null,
  );
  /** UUID do insumo na modal somente leitura (`GET /ingredients/:id`). */
  const [viewIngredientId, setViewIngredientId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getIngredients();
      setIngredients(data);
    } catch {
      console.error("Cloud offline, usando LocalStorage.");
      setIngredients(dbService.getIngredients());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalIngredient(null);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewIngredientId(null);
  }, []);

  const openModal = useCallback((ingredient?: Ingredient) => {
    setModalIngredient(ingredient ?? null);
    setIsModalOpen(true);
  }, []);

  const openEditFromView = useCallback((ing: Ingredient) => {
    setViewIngredientId(null);
    setModalIngredient(ing);
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || ingredients.length === 0) return;
    const ing = ingredients.find((i) => i.id === editId);
    if (ing) {
      openModal(ing);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, ingredients, openModal, setSearchParams]);

  const filteredIngredients = ingredients.filter((ing) => {
    const searchLower = searchTerm.toLowerCase();
    const nomeMatch = ing.nome.toLowerCase().includes(searchLower);
    const ncm = ing.fiscalConfig.ncm ?? "";
    const ncmMatch = String(ncm).toLowerCase().includes(searchLower);
    const matchesLowStock = showOnlyLowStock ? ing.estoqueAtual < 100 : true;
    return (nomeMatch || ncmMatch) && matchesLowStock;
  });

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl">
              <ChefHat className="w-6 h-6" />
            </div>
            Ingredientes
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">
            Controle Sincronizado com o Backend
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl"
          >
            <Plus className="w-4 h-4" /> Novo Ingrediente
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
          type="button"
          onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
          className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${showOnlyLowStock ? "bg-amber-100 border-amber-200 text-amber-700" : "bg-white text-slate-500"}`}
        >
          <Filter className="w-4 h-4 inline mr-2" /> Estoque Crítico
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        {loading && !isModalOpen && viewIngredientId === null ? (
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
                  role="button"
                  tabIndex={0}
                  onClick={() => setViewIngredientId(ing.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setViewIngredientId(ing.id);
                    }
                  }}
                  className="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer"
                >
                  <td className="px-8 py-6 font-bold text-slate-900">
                    {ing.nome}
                  </td>
                  <td className="px-8 py-6 font-mono text-sm">
                    {ing.estoqueAtual} {ing.unidadeMedida}
                  </td>
                  <td className="px-8 py-6 font-mono text-sm">
                    R$ {ing.custoMedio.toFixed(4)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(ing);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600"
                      title="Editar sem abrir visualização"
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

      <IngredientViewModal
        open={viewIngredientId !== null}
        ingredientId={viewIngredientId}
        onClose={closeViewModal}
        onEdit={openEditFromView}
      />

      <IngredientFormModal
        open={isModalOpen}
        ingredient={modalIngredient}
        onClose={closeModal}
        onSaved={loadData}
      />
    </div>
  );
};
