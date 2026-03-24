
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { dbService } from '../services/mockDb';
import { geminiService } from '../services/geminiService';
import { 
  Printer, 
  Barcode, 
  Sparkles, 
  Loader2, 
  ChevronLeft, 
  Package, 
  Layout, 
  Settings2, 
  FileText,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const BarcodeGeneratorPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [labelSize, setLabelSize] = useState('SMALL'); // SMALL, MEDIUM, LARGE
  const [showAuraConsult, setShowAuraConsult] = useState(false);
  const [auraStandard, setAuraStandard] = useState<string | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);

  const allProducts = useMemo(() => dbService.getProducts(), []);
  const allIngredients = useMemo(() => dbService.getIngredients(), []);

  useEffect(() => {
    if (location.state?.initialItem) {
      setSelectedItems([location.state.initialItem]);
    }
  }, [location.state]);

  const handleToggleItem = (item: any) => {
    const exists = selectedItems.find(i => i.id === item.id);
    if (exists) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleAuraConsult = async () => {
    if (selectedItems.length === 0) return;
    setIsConsulting(true);
    setShowAuraConsult(true);
    const item = selectedItems[0];
    const category = item.category || 'Insumo';
    const text = await geminiService.suggestLabelStandards(item.name, category);
    setAuraStandard(text);
    setIsConsulting(false);
  };

  const filteredItems = useMemo(() => {
    const list = [...allProducts, ...allIngredients];
    return list.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 10);
  }, [searchTerm, allProducts, allIngredients]);

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out] pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-3 bg-slate-900 text-white rounded-[20px] shadow-xl">
                <Barcode className="w-6 h-6" />
              </div>
              Label Forge
            </h2>
            <p className="text-slate-500 font-medium mt-1">Gerador de etiquetas de código de barras e identificação.</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={handleAuraConsult}
             disabled={selectedItems.length === 0 || isConsulting}
             className="px-6 py-4 bg-indigo-50 text-indigo-600 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
           >
              {isConsulting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Aura Label Guide
           </button>
           <button 
             onClick={() => window.print()}
             disabled={selectedItems.length === 0}
             className="px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
           >
              <Printer className="w-4 h-4" /> Imprimir Etiquetas
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
        {/* Selection Column */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                 <Search className="w-5 h-5 text-indigo-600" /> Selecionar Itens
              </h3>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Buscar produto ou insumo..."
                   className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-medium text-sm"
                 />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                 {filteredItems.map(item => {
                   const isSelected = selectedItems.find(i => i.id === item.id);
                   return (
                     <button
                       key={item.id}
                       onClick={() => handleToggleItem(item)}
                       className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                         isSelected 
                         ? 'bg-indigo-50 border-indigo-200' 
                         : 'bg-white border-slate-100 hover:border-slate-300'
                       }`}
                     >
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              <Package className="w-4 h-4" />
                           </div>
                           <div className="text-left">
                              <p className="text-xs font-black text-slate-800 truncate max-w-[150px]">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{item.sku || item.barcode || 'Sem Código'}</p>
                           </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                     </button>
                   );
                 })}
              </div>
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                 <Settings2 className="w-5 h-5 text-indigo-600" /> Configurar Layout
              </h3>
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tamanho da Etiqueta</p>
                 <div className="grid grid-cols-3 gap-2">
                    {['SMALL', 'MEDIUM', 'LARGE'].map(size => (
                       <button
                         key={size}
                         onClick={() => setLabelSize(size)}
                         className={`py-3 rounded-xl font-black text-[10px] uppercase transition-all border ${
                           labelSize === size 
                           ? 'bg-slate-900 text-white border-slate-900' 
                           : 'bg-slate-50 text-slate-400 border-slate-50 hover:border-slate-200'
                         }`}
                       >
                          {size === 'SMALL' ? '30x20' : size === 'MEDIUM' ? '40x30' : '60x40'}
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2 space-y-8">
           {showAuraConsult && (
             <div className="bg-indigo-600 p-8 rounded-[40px] shadow-2xl text-white relative overflow-hidden animate-[slideDown_0.3s_ease-out]">
                <div className="relative z-10 space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                            <Sparkles className="w-5 h-5" />
                         </div>
                         <div>
                            <h4 className="font-black uppercase tracking-tight">Parecer de Rotulagem Aura</h4>
                            <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Normas ANVISA & Metrologia</p>
                         </div>
                      </div>
                      <button onClick={() => setShowAuraConsult(false)} className="text-white/50 hover:text-white transition-colors">
                         <FileText className="w-5 h-5" />
                      </button>
                   </div>
                   <div className="bg-black/10 rounded-[24px] p-6 text-sm font-medium leading-relaxed italic text-indigo-50 border border-white/5">
                      {isConsulting ? (
                        <div className="flex items-center gap-3 animate-pulse">
                           <Loader2 className="w-4 h-4 animate-spin" />
                           Aura processando normas técnicas vigentes...
                        </div>
                      ) : auraStandard}
                   </div>
                </div>
             </div>
           )}

           <div className="bg-slate-50 rounded-[56px] p-12 border-4 border-dashed border-slate-200 min-h-[500px] flex flex-col items-center justify-center relative">
              <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                 <Layout className="w-4 h-4" /> Print Preview
              </div>

              {selectedItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 w-full max-w-2xl overflow-y-auto custom-scrollbar p-4">
                   {selectedItems.map((item, idx) => (
                     <div 
                       key={idx} 
                       className={`bg-white shadow-xl rounded-lg flex flex-col items-center justify-center p-6 border border-slate-100 transition-all ${
                         labelSize === 'SMALL' ? 'aspect-[3/2]' : labelSize === 'MEDIUM' ? 'aspect-[4/3]' : 'aspect-[3/2] scale-110'
                       }`}
                     >
                        <p className="text-[10px] font-black text-slate-900 text-center uppercase leading-tight mb-2">{item.name}</p>
                        <div className="w-full h-12 bg-slate-900 rounded-sm mb-2 flex items-center justify-center overflow-hidden">
                           <div className="flex gap-[1px] px-2 h-full items-center bg-white w-full">
                              {Array.from({ length: 40 }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className="bg-black h-8" 
                                  style={{ width: `${Math.random() * 3 + 1}px` }} 
                                />
                              ))}
                           </div>
                        </div>
                        <p className="text-[8px] font-bold font-mono text-slate-500 uppercase">{item.sku || item.barcode || '789123456789'}</p>
                        <div className="mt-2 text-[9px] font-black text-indigo-600">R$ {item.sale_price?.toFixed(2) || '0.00'}</div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center space-y-4">
                   <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto text-white">
                      <Barcode className="w-10 h-10" />
                   </div>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhuma etiqueta configurada</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Actual Print Styles Wrapper (Hidden normally) */}
      <div className="hidden print:block bg-white text-black p-0">
         <div className="grid grid-cols-4 gap-4 p-4">
            {selectedItems.map((item, idx) => (
              <div key={idx} className="border border-black p-4 flex flex-col items-center break-inside-avoid">
                 <p className="text-[10px] font-bold uppercase mb-1">{item.name}</p>
                 <div className="h-10 w-full bg-black mb-1 flex items-center justify-center bg-white border border-black px-1 overflow-hidden">
                    {Array.from({ length: 30 }).map((_, i) => <div key={i} className="bg-black h-8" style={{ width: `${Math.random() * 2 + 1}px`, marginRight: '1px' }} />)}
                 </div>
                 <p className="text-[8px] font-mono">{item.sku || item.barcode || '789123456789'}</p>
                 {item.sale_price && <p className="text-[9px] font-bold mt-1">R$ {item.sale_price.toFixed(2)}</p>}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
