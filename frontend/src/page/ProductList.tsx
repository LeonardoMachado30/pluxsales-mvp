import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Package,
  ChevronRight,
  Copy,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  Tag,
  Hash,
  Activity,
  Edit2,
  Barcode,
} from "lucide-react";
import { dbService } from "../services/mockDb";
import { api } from "../services/api";
import { Product } from "../../types";

const isCloudActive = !!process.env.REACT_APP_API_URL;

const ProductCard: React.FC<{
  product: Product;
  onDuplicate: (e: React.MouseEvent, p: Product) => void;
}> = ({ product, onDuplicate }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const marginPercent =
    ((product.sale_price - product.cmv_total) / product.sale_price) * 100;

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100 transition-all duration-500 overflow-hidden flex flex-col">
      {/* Primary Section */}
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-black text-2xl text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
              {product.name}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <div
                className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border ${marginPercent > 60 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}
              >
                <TrendingUp className="w-3 h-3" />
                {marginPercent.toFixed(0)}% MARGEM
              </div>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Preço Venda
            </div>
            <div className="font-black text-3xl text-slate-900 font-mono tracking-tighter">
              <span className="text-sm font-bold mr-0.5 text-indigo-600">
                R$
              </span>
              {product.sale_price.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
          >
            Ver Ficha <ChevronRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() =>
              navigate(`/labels`, { state: { initialItem: product } })
            }
            className="p-3 rounded-2xl border border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-600 bg-white transition-all"
            title="Gerar Etiqueta"
          >
            <Barcode className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/products/edit/${product.id}`)}
            className="p-3 rounded-2xl border border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-600 bg-white transition-all"
            title="Editar Engenharia"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-3 rounded-2xl border transition-all ${isExpanded ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-600"}`}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Secondary Info */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-8 pb-8 pt-2 border-t border-slate-50 space-y-4 bg-slate-50/30">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Hash className="w-3 h-3" /> SKU / Ref
              </span>
              <div className="text-xs font-mono font-bold text-slate-600">
                {product.sku || "NÃO DEFINIDO"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Tag className="w-3 h-3" /> Categoria
              </span>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-tighter truncate">
                {product.category}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Activity className="w-3 h-3" /> Status do Catálogo
              </span>
              <div
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${product.active ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-400"}`}
              >
                {product.active ? "Publicado" : "Rascunho / Pausado"}
              </div>
            </div>

            <button
              onClick={(e) => onDuplicate(e, product)}
              className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
              title="Duplicar Produto"
            >
              <Copy className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase">Clonar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isCloudActive) {
        try {
          const list = await api.getProducts();
          if (!cancelled) setProducts(list);
        } catch {
          if (!cancelled) setProducts(dbService.getProducts());
        }
      } else if (!cancelled) {
        setProducts(dbService.getProducts());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDuplicate = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const { id, cmv_total, ...baseData } = product;

    navigate("/products/new", {
      state: {
        initialData: {
          ...baseData,
          name: `${baseData.name} (Cópia)`,
          sku: baseData.sku ? `${baseData.sku}-COPY` : "",
        },
      },
    });
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Catálogo de Produtos
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1 italic">
            Gestão centralizada de preços e engenharia de margens.
          </p>
        </div>
        <Link
          to="/products/new"
          className="w-full md:w-auto flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nova Oferta
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDuplicate={handleDuplicate}
          />
        ))}

        {products.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[48px] border-4 border-dashed border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Package className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-black text-slate-800">
              Cardápio sem itens
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 font-medium">
              Inicie a criação de fichas técnicas para popular sua vitrine de
              vendas e começar a lucrar.
            </p>
            <Link
              to="/products/new"
              className="inline-flex items-center gap-3 mt-10 px-10 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:scale-105 transition-all"
            >
              Iniciar Engenharia <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
