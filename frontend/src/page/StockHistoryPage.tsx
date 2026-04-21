import React, { useState, useEffect } from "react";
import { dbService } from "../services/mockDb";
import { StockMovement, StockMovementType, Ingredient } from "../../types";
import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  Settings2,
  Calendar,
  Package,
  ArrowLeft,
  ChevronRight,
  Tag,
  Search,
  Box,
} from "lucide-react";
import { Link } from "react-router-dom";

export const StockHistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<StockMovement[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLogs([...dbService.getStockLogs()].reverse());
    setIngredients(dbService.getIngredients());
  }, []);

  const filteredLogs = logs.filter((log) => {
    const ing = ingredients.find((i) => i.id === log.ingredient_id);
    return ing?.nome.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out] pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-[20px] shadow-xl">
              <Box className="w-6 h-6" />
            </div>
            Rastreabilidade de Insumos
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Histórico detalhado de entradas, saídas e ajustes manuais de
            estoque.
          </p>
        </div>
        <Link
          to="/ingredients"
          className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Gestão de Insumos
        </Link>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por nome do insumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-medium text-sm"
          />
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
                  Movimentação
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Quantidade
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Custo Momento
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Data / Hora
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Notas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map((log) => {
                const ing = ingredients.find((i) => i.id === log.ingredient_id);
                return (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                          <Package className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-black text-slate-800">
                          {ing?.nome || "Insumo Excluído"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          log.type === StockMovementType.IN
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : log.type === StockMovementType.OUT
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                      >
                        {log.type === StockMovementType.IN ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {log.type}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black font-mono">
                        {log.qty.toLocaleString()}{" "}
                        <span className="text-[10px] opacity-40">
                          {ing?.unidadeMedida}
                        </span>
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        R$ {log.cost_at_moment.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                        <Calendar className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleString("pt-BR")}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-slate-400 font-medium italic truncate max-w-[200px]">
                        {log.notes || "Sem observações"}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
