import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  ChevronRight, 
  ChefHat, 
  Gavel, 
  DollarSign, 
  Calculator, 
  Box, 
  Tag,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { dbService } from '../services/mockDb';
import { Product, Ingredient, TaxClassification } from '../types';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [ingredientsDB, setIngredientsDB] = useState<Ingredient[]>([]);

  useEffect(() => {
    if (id) {
      const p = dbService.getProductById(id);
      if (p) {
        setProduct(p);
      } else {
        navigate('/products');
      }
    }
    setIngredientsDB(dbService.getIngredients());
  }, [id, navigate]);

  if (!product) return null;

  const margin = product.sale_price - product.cmv_total;
  const marginPercent = (margin / product.sale_price) * 100;

  // Calculando o custo total de aquisição (soma dos preços de compra dos insumos envolvidos)
  const totalPurchasePrice = product.ingredients.reduce((acc, item) => {
    const ing = ingredientsDB.find(i => i.id === item.ingredient_id);
    return acc + (ing ? ing.cost_price : 0);
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{product.name}</h1>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest ${product.active ? 'bg-green-50 border-green-100 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          {product.active ? 'Ativo no Catálogo' : 'Pausado'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composition Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Preço de Venda</div>
                <div className="text-2xl font-black text-slate-900 font-mono">R$ {product.sale_price.toFixed(2)}</div>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Total (CMV)</div>
                <div className="text-2xl font-black text-red-500 font-mono">R$ {product.cmv_total.toFixed(4)}</div>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-amber-400">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-amber-500" /> Custo Aquisição
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">R$ {totalPurchasePrice.toFixed(2)}</div>
             </div>
             <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-100 text-white">
                <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Margem Bruta</div>
                <div className="text-2xl font-black font-mono">R$ {margin.toFixed(2)}</div>
                <div className="text-[10px] font-bold text-indigo-200 mt-1 uppercase">Contribuição: {marginPercent.toFixed(1)}%</div>
             </div>
          </div>

          {/* Ingredients Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-sm uppercase tracking-tight text-slate-800 flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-indigo-600" /> Receita e Insumos
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{product.ingredients.length} Itens</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingrediente</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quantidade</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Preço Compra</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Custo Unit.</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {product.ingredients.map((item, idx) => {
                    const ing = ingredientsDB.find(i => i.id === item.ingredient_id);
                    const subtotal = ing ? ing.unit_cost * item.qty_used : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{ing?.name || 'Item não encontrado'}</div>
                          <div className="text-[10px] text-slate-400 font-mono uppercase">{ing?.unit_measure}</div>
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-slate-600">
                          {item.qty_used.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-amber-600 text-xs font-bold">
                          R$ {ing?.cost_price.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-500 text-xs">
                          R$ {ing?.unit_cost.toFixed(4) || '0.0000'}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-black text-indigo-600">
                          R$ {subtotal.toFixed(4)}
                        </td>
                      </tr>
                    );
                  })}
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
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regime / UF</div>
                 <div className="font-bold text-slate-800 text-sm">{product.tax_profile.tax_regime} - {product.tax_profile.uf}</div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NCM</div>
                    <div className="font-mono font-bold text-slate-900">{product.tax_profile.ncm}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IBS/CBS</div>
                    <div className="font-bold text-indigo-600">{product.tax_profile.ibs_cbs_rate}%</div>
                  </div>
               </div>

               <div className="space-y-1 pt-4 border-t border-slate-50">
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classificação Reforma</div>
                 <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase">
                    <ShieldCheck className="w-3 h-3" /> {product.tax_profile.tax_classification}
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CST PIS</div>
                    <div className="font-mono font-bold text-slate-600 text-xs">{product.tax_profile.pis_cst}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CST COFINS</div>
                    <div className="font-mono font-bold text-slate-600 text-xs">{product.tax_profile.cofins_cst}</div>
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
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Categoria</span>
                      <span className="font-black uppercase tracking-tight">{product.category}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">SKU / ID</span>
                      <span className="font-mono">{product.sku || product.id.slice(0, 8).toUpperCase()}</span>
                   </div>
                </div>
             </div>
             <Package className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
};
