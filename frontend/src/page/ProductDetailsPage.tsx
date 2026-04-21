import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ChefHat,
  Gavel,
  Tag,
  ShieldCheck,
  ShoppingBag,
  Eye,
  X,
  Loader2,
  List,
  Trash2,
} from "lucide-react";
import { dbService } from "../services/mockDb";
import { api } from "../services/api";
import { Product, Ingredient } from "../../types";

const isCloudActive = !!process.env.REACT_APP_API_URL;

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-50 pb-3">
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest shrink-0">
        {label}
      </span>
      <span className="text-xs text-slate-700 text-right break-all font-mono">
        {value ?? "—"}
      </span>
    </div>
  );
}

function IngredientDetailReadOnly({ ing }: { ing: Ingredient }) {
  const fc = ing.fiscalConfig;
  return (
    <div className="grid grid-cols-1 gap-0 text-sm">
      <DetailRow label="id" value={ing.id} />
      {ing.fiscalConfigId ? (
        <DetailRow label="fiscalConfigId" value={ing.fiscalConfigId} />
      ) : null}
      {ing.locatarioId ? (
        <DetailRow label="locatarioId" value={ing.locatarioId} />
      ) : null}
      <DetailRow label="nome" value={ing.nome} />
      <DetailRow label="codigoBarras" value={ing.codigoBarras} />
      <DetailRow label="unidadeMedida" value={ing.unidadeMedida} />
      <DetailRow label="precoCustoUltimo" value={`R$ ${ing.precoCustoUltimo.toFixed(2)}`} />
      <DetailRow label="custoMedio" value={`R$ ${ing.custoMedio.toFixed(4)}`} />
      <DetailRow label="estoqueAtual" value={ing.estoqueAtual} />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pt-2">
        fiscalConfig
      </p>
      <DetailRow label="ncm" value={fc.ncm} />
      <DetailRow label="origem" value={fc.origem} />
      <DetailRow label="tipoIncidencia" value={fc.tipoIncidencia ?? "—"} />
      <DetailRow label="aliquota_ibs" value={fc.aliquota_ibs ?? "—"} />
      <DetailRow label="aliquota_cbs" value={fc.aliquota_cbs ?? "—"} />
      <DetailRow label="aliquota_is" value={fc.aliquota_is ?? "—"} />
      <DetailRow label="icms" value={fc.icms ?? "—"} />
      <DetailRow label="icms_cst" value={fc.icms_cst ?? "—"} />
      <DetailRow label="icms_cst_cest" value={fc.icms_cst_cest ?? "—"} />
      <DetailRow label="pis" value={fc.pis ?? "—"} />
      <DetailRow label="pis_cst" value={fc.pis_cst ?? "—"} />
      <DetailRow label="pis_cst_cest" value={fc.pis_cst_cest ?? "—"} />
      <DetailRow label="cofins" value={fc.cofins ?? "—"} />
      <DetailRow label="cofins_cst" value={fc.cofins_cst ?? "—"} />
      <DetailRow label="cofins_cst_natureza" value={fc.cofins_cst_natureza ?? "—"} />
      <DetailRow label="ibs_cClassTrib" value={fc.ibs_cClassTrib ?? "—"} />
      <DetailRow label="ibs_cClassTrib_cst" value={fc.ibs_cClassTrib_cst ?? "—"} />
      <DetailRow label="cbs_cClassTrib" value={fc.cbs_cClassTrib ?? "—"} />
      <DetailRow label="cbs_cClassTrib_cst" value={fc.cbs_cClassTrib_cst ?? "—"} />
    </div>
  );
}

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [ingredientsDB, setIngredientsDB] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [modalIngredient, setModalIngredient] = useState<Ingredient | null>(
    null,
  );
  const [modalLoading, setModalLoading] = useState(false);

  const refreshIngredients = useCallback(async () => {
    try {
      if (isCloudActive) {
        const list = await api.getIngredients();
        setIngredientsDB(list);
      } else {
        setIngredientsDB(dbService.getIngredients());
      }
    } catch {
      setIngredientsDB(dbService.getIngredients());
    }
  }, []);

  const openIngredientModal = async (ing: Ingredient) => {
    setModalIngredient(ing);
    if (!isCloudActive) return;
    setModalLoading(true);
    try {
      const fresh = await api.getIngredient(ing.id);
      if (fresh) setModalIngredient(fresh);
    } catch {
      /* mantém dados da lista */
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteIngredient = async (ing: Ingredient) => {
    if (
      !window.confirm(
        `Remover o insumo "${ing.nome}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    try {
      await api.deleteIngredient(ing.id);
      await refreshIngredients();
      if (modalIngredient?.id === ing.id) setModalIngredient(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao remover insumo");
    }
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (isCloudActive) {
        try {
          const p = await api.getProduct(id);
          if (!cancelled) {
            if (p) setProduct(p);
            else navigate("/products");
          }
        } catch {
          const p = dbService.getProductById(id);
          if (!cancelled) {
            if (p) setProduct(p);
            else navigate("/products");
          }
        }
        try {
          const ings = await api.getIngredients();
          if (!cancelled) setIngredientsDB(ings);
        } catch {
          if (!cancelled) setIngredientsDB(dbService.getIngredients());
        }
      } else {
        const p = dbService.getProductById(id);
        if (!cancelled) {
          if (p) setProduct(p);
          else navigate("/products");
        }
        setIngredientsDB(dbService.getIngredients());
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }
  if (!product) return null;

  const catalogFiltered = ingredientsDB.filter((i) =>
    `${i.nome} ${i.fiscalConfig.ncm ?? ""} ${i.id}`
      .toLowerCase()
      .includes(catalogSearch.trim().toLowerCase()),
  );

  const margin = product.sale_price - product.cmv_total;
  const marginPercent = (margin / product.sale_price) * 100;

  // Calculando o custo total de aquisição (soma dos preços de compra dos insumos envolvidos)
  const totalPurchasePrice = product.ingredients.reduce((acc, item) => {
    const ing = ingredientsDB.find((i) => i.id === item.ingredient_id);
    return acc + (ing ? ing.precoCustoUltimo : 0);
  }, 0);

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out] pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/products"
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
              <Package className="w-3 h-3" /> Ficha Técnica do Produto
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {product.name}
            </h1>
          </div>
        </div>
        <div
          className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest ${product.active ? "bg-green-50 border-green-100 text-green-700" : "bg-slate-50 border-slate-200 text-slate-400"}`}
        >
          {product.active ? "Ativo no Catálogo" : "Pausado"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composition Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Preço de Venda
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                R$ {product.sale_price.toFixed(2)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Custo Total (CMV)
              </div>
              <div className="text-2xl font-black text-red-500 font-mono">
                R$ {product.cmv_total.toFixed(4)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-amber-400">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <ShoppingBag className="w-3 h-3 text-amber-500" /> Custo
                Aquisição
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                R$ {totalPurchasePrice.toFixed(2)}
              </div>
            </div>
            <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-100 text-white">
              <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">
                Margem Bruta
              </div>
              <div className="text-2xl font-black font-mono">
                R$ {margin.toFixed(2)}
              </div>
              <div className="text-[10px] font-bold text-indigo-200 mt-1 uppercase">
                Contribuição: {marginPercent.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-sm uppercase tracking-tight text-slate-800 flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-indigo-600" /> Receita e
                Insumos
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {product.ingredients.length} Itens
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Ingrediente
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Preço Compra
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Custo Unit.
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Subtotal
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-24">
                      Ficha
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {product.ingredients.map((item, idx) => {
                    const ing = ingredientsDB.find(
                      (i) => i.id === item.ingredient_id,
                    );
                    const subtotal = ing ? ing.custoMedio * item.qty_used : 0;
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">
                            {ing?.nome || "Item não encontrado"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono uppercase">
                            {ing?.unidadeMedida}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-slate-600">
                          {item.qty_used.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-amber-600 text-xs font-bold">
                          R$ {ing?.precoCustoUltimo.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-500 text-xs">
                          R$ {ing?.custoMedio.toFixed(4) || "0.0000"}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-black text-indigo-600">
                          R$ {subtotal.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {ing ? (
                            <button
                              type="button"
                              onClick={() => openIngredientModal(ing)}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Ver
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Listagem GET /ingredients */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <h3 className="font-black text-sm uppercase tracking-tight text-slate-800 flex items-center gap-2">
                <List className="w-4 h-4 text-indigo-600" /> Insumos do
                locatário
              </h3>
              <input
                type="search"
                placeholder="Buscar por nome, NCM ou ID..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full sm:max-w-xs px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-300"
              />
            </div>
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      NCM
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Estoque
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Custo unit.
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right min-w-[220px]">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {catalogFiltered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-sm text-slate-400 font-medium"
                      >
                        Nenhum insumo encontrado. Cadastre em Ingredientes ou
                        ajuste a busca.
                      </td>
                    </tr>
                  ) : (
                    catalogFiltered.map((ing) => (
                      <tr
                        key={ing.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {ing.nome}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                          {ing.fiscalConfig.ncm ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm">
                          {ing.estoqueAtual} {ing.unidadeMedida}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-slate-700">
                          R$ {ing.custoMedio.toFixed(4)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openIngredientModal(ing)}
                              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-indigo-600 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Detalhes
                            </button>
                            <Link
                              to={`/ingredients?edit=${ing.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors"
                            >
                              Editar
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteIngredient(ing)}
                              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Info Sidebar Column */}
        <div className="space-y-8">
          {/* Fiscal Profile */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-sm uppercase tracking-tight text-slate-800 flex items-center gap-2">
                <Gavel className="w-4 h-4 text-indigo-600" /> Perfil Tributário
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Regime / UF
                </div>
                <div className="font-bold text-slate-800 text-sm">
                  {product.tax_profile.tax_regime} - {product.tax_profile.uf}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    NCM
                  </div>
                  <div className="font-mono font-bold text-slate-900">
                    {product.tax_profile.ncm}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    IBS/CBS
                  </div>
                  <div className="font-bold text-indigo-600">
                    {product.tax_profile.ibs_cbs_rate}%
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-4 border-t border-slate-50">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Classificação Reforma
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase">
                  <ShieldCheck className="w-3 h-3" />{" "}
                  {product.tax_profile.tax_classification}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    CST PIS
                  </div>
                  <div className="font-mono font-bold text-slate-600 text-xs">
                    {product.tax_profile.pis_cst}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    CST COFINS
                  </div>
                  <div className="font-mono font-bold text-slate-600 text-xs">
                    {product.tax_profile.cofins_cst}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-200 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                <Tag className="w-3 h-3" /> Informações do Catálogo
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">
                    Categoria
                  </span>
                  <span className="font-black uppercase tracking-tight">
                    {product.category}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">
                    SKU / ID
                  </span>
                  <span className="font-mono">
                    {product.sku || product.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <Package className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5" />
          </div>
        </div>
      </div>

      {modalIngredient && (
        <div
          className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ingredient-modal-title"
          onClick={() => setModalIngredient(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setModalIngredient(null);
          }}
        >
          <div
            className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white rounded-t-[32px]">
              <h2
                id="ingredient-modal-title"
                className="text-lg font-black text-slate-900 uppercase tracking-tight pr-4"
              >
                {modalIngredient.nome}
              </h2>
              <button
                type="button"
                onClick={() => setModalIngredient(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              {modalLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                </div>
              ) : (
                <IngredientDetailReadOnly ing={modalIngredient} />
              )}
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed border-t border-slate-100 pt-4">
                Dados conforme{" "}
                <code className="font-mono bg-slate-50 px-1 rounded">
                  GET /api/ingredients/:id
                </code>
                . Documentação interativa:{" "}
                <a
                  href="http://localhost:3001/api/docs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Swagger
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
