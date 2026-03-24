
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ChevronRight, 
  ChevronLeft,
  Check, 
  Loader2, 
  Sparkles,
  Gavel,
  ShieldCheck,
  Package,
  Zap,
  TrendingDown,
  Info,
  Layers,
  Percent,
  BrainCircuit
} from 'lucide-react';
import { ProductSchema, TaxRegime, ProductCategory, ProductFormValues, TaxClassification, FiscalProfile } from '../types';
import { dbService } from '../services/mockDb';
import { geminiService } from '../services/geminiService';

export const ProductWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [taxStrategy, setTaxStrategy] = useState<any>(null);

  const isEditMode = !!id;

  const { register, handleSubmit, watch, trigger, setValue, reset, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
      sale_price: 0,
      active: true,
      category: ProductCategory.HAMBURGUER_CARNE,
      tax_profile: { 
        uf: 'DF', 
        tax_regime: TaxRegime.SIMPLES, 
        fiscal_profile: FiscalProfile.MODERADO,
        ncm: '', 
        pis_cst: '01', 
        cofins_cst: '01', 
        icms_cst: '00', 
        tax_classification: TaxClassification.TRIBUTADO,
        price_breakdown: []
      }
    }
  });

  const watchedName = watch('name');
  const watchedPrice = watch('sale_price');
  const watchedProfile = watch('tax_profile.fiscal_profile');

  useEffect(() => { 
    if (isEditMode) {
      const prod = dbService.getProductById(id);
      if (prod) reset(prod);
    }
  }, [id, isEditMode, reset]);

  const runTaxArchitect = async () => {
    if (!watchedName || !watchedPrice) return;
    setIsAnalyzing(true);
    const result = await geminiService.suggestSmartTaxBreakdown(watchedName, watchedPrice, watchedProfile);
    if (result) {
      setTaxStrategy(result);
      setValue('tax_profile.ncm', result.main_ncm);
      setValue('tax_profile.price_breakdown', result.breakdown);
    }
    setIsAnalyzing(false);
  };

  const nextStep = async () => {
    const fields = currentStep === 1 ? ['name', 'sale_price', 'category'] : 
                   currentStep === 2 ? ['tax_profile.ncm'] : [];
    const isValid = await trigger(fields as any);
    if (isValid) setCurrentStep(prev => prev + 1);
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await dbService.updateProduct(id!, data as any);
      } else {
        await dbService.createProductFull(data as any);
      }
      navigate('/products');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24 font-['Noto_Sans']">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
             <ShieldCheck className="w-8 h-8 text-indigo-600" />
             {isEditMode ? 'Reengenharia Tributária' : 'Engenharia de Produto & Lucro'}
           </h2>
           <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Otimize sua margem através da segregação fiscal inteligente.</p>
        </div>
      </div>

      <div className="bg-white rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-12">
          {currentStep === 1 && (
            <div className="space-y-12 animate-[fadeIn_0.3s_ease-out]">
               <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-lg"><Package className="w-6 h-6" /></div>
                  <h3 className="text-xl font-black text-slate-900 uppercase">Definição do Produto</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Item</label>
                     <input {...register('name')} className="w-full p-6 bg-slate-50 border-none rounded-[24px] text-xl font-bold focus:ring-4 focus:ring-indigo-100 outline-none" placeholder="Ex: Hamburguer Chicago" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço Final ao Consumidor</label>
                     <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">R$</span>
                        <input type="number" step="0.01" {...register('sale_price', { valueAsNumber: true })} className="w-full pl-16 pr-6 py-6 bg-slate-50 border-none rounded-[24px] font-black text-3xl font-mono text-indigo-600 outline-none" />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-12 animate-[fadeIn_0.3s_ease-out]">
               <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-lg"><Gavel className="w-6 h-6" /></div>
                    <h3 className="text-xl font-black text-slate-900 uppercase">Arquitetura Fiscal Aura</h3>
                  </div>
                  <button 
                    onClick={runTaxArchitect}
                    disabled={isAnalyzing}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-indigo-400" />}
                    Calcular Decomposição
                  </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-6 p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível de Agressividade Fiscal</label>
                       <div className="grid grid-cols-1 gap-3">
                          {Object.values(FiscalProfile).map(p => (
                            <label key={p} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all ${watchedProfile === p ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-100'}`}>
                               <div className="flex items-center gap-3">
                                  <input type="radio" {...register('tax_profile.fiscal_profile')} value={p} className="hidden" />
                                  <div className={`w-4 h-4 rounded-full border-2 ${watchedProfile === p ? 'border-white bg-indigo-400' : 'border-slate-200'}`}></div>
                                  <span className="text-[10px] font-black uppercase tracking-widest">{p}</span>
                               </div>
                               {p === FiscalProfile.ARROJADO && <TrendingDown className="w-4 h-4 text-emerald-300" />}
                            </label>
                          ))}
                       </div>
                       <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic">
                         * O perfil arrojado decompõe o produto ao máximo para aproveitar isenções de carnes e hortifruti.
                       </p>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NCM Principal de Saída</label>
                       <input {...register('tax_profile.ncm')} className="w-full p-6 bg-white border-2 border-slate-100 rounded-[24px] font-black text-xl font-mono tracking-widest outline-none focus:border-indigo-500" placeholder="00000000" />
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                     {taxStrategy ? (
                       <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden h-full flex flex-col justify-between">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                          
                          <div className="relative z-10">
                             <div className="flex items-center justify-between mb-8">
                                <h4 className="text-lg font-black uppercase flex items-center gap-2"><Layers className="w-5 h-5 text-indigo-400" /> Breakdown Sugerido</h4>
                                <div className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                   {taxStrategy.total_tax_free_percentage}% Isento
                                </div>
                             </div>

                             <div className="space-y-4 max-h-64 overflow-y-auto pr-4 custom-scrollbar">
                                {taxStrategy.breakdown.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                                     <div>
                                        <p className="text-xs font-black uppercase tracking-tight">{item.name}</p>
                                        <p className="text-[9px] text-slate-500 font-mono">NCM: {item.ncm}</p>
                                     </div>
                                     <div className="text-right">
                                        <p className="text-sm font-black font-mono">R$ {item.allocated_price.toFixed(2)}</p>
                                        <p className={`text-[9px] font-black uppercase ${item.is_tax_free ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                           {item.is_tax_free ? 'Isento' : 'Tributado'}
                                        </p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>

                          <div className="mt-8 pt-8 border-t border-white/5 relative z-10 flex items-start gap-4">
                             <div className="p-3 bg-indigo-600 rounded-xl"><Info className="w-4 h-4" /></div>
                             <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">"{taxStrategy.advice}"</p>
                          </div>
                       </div>
                     ) : (
                       <div className="h-full bg-slate-50 rounded-[48px] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center space-y-4">
                          <BrainCircuit className="w-16 h-16 text-slate-200" />
                          <div>
                             <h4 className="font-black text-slate-400 uppercase tracking-widest">IA Fiscal Desconectada</h4>
                             <p className="text-xs text-slate-300 font-medium">Preencha o nome e preço, e escolha um perfil para ver a mágica da decomposição.</p>
                          </div>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-12 animate-[fadeIn_0.3s_ease-out]">
               <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <div className="p-4 bg-emerald-500 text-white rounded-3xl shadow-lg"><Check className="w-6 h-6" /></div>
                  <h3 className="text-xl font-black text-slate-900 uppercase">Validação & Sincronização</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-10 bg-slate-900 text-white rounded-[48px] space-y-8">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Produto Arquitetado</span>
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                     </div>
                     <div className="space-y-2">
                        <p className="text-3xl font-black tracking-tight">{watchedName}</p>
                        <p className="text-lg font-black font-mono text-indigo-400">R$ {watchedPrice.toFixed(2)}</p>
                     </div>
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400">Estratégia</span>
                        <span className="text-[10px] font-black uppercase text-emerald-400">{watchedProfile}</span>
                     </div>
                  </div>
                  
                  <div className="bg-emerald-50 border-2 border-emerald-100 p-10 rounded-[48px] flex flex-col justify-center space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-600 text-white rounded-3xl"><Percent className="w-6 h-6" /></div>
                        <div>
                           <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Impacto Fiscal Estimado</p>
                           <h4 className="text-2xl font-black text-emerald-900">Redução de ~{taxStrategy?.total_tax_free_percentage || 0}% de Impostos</h4>
                        </div>
                     </div>
                     <p className="text-xs text-emerald-600 font-medium leading-relaxed">
                       Ao utilizar a segregação por ingredientes, sua nota fiscal será emitida com múltiplas linhas internas, garantindo que você não pague imposto integral sobre o pão, carne e vegetais.
                     </p>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
           <button 
             onClick={() => currentStep > 1 ? setCurrentStep(s => s - 1) : navigate('/products')}
             className="px-8 py-4 font-black text-[10px] uppercase text-slate-400 tracking-widest"
           >
             {currentStep === 1 ? 'Cancelar' : 'Voltar'}
           </button>
           
           <div className="flex gap-4">
              {currentStep < 3 ? (
                <button 
                  onClick={nextStep}
                  className="px-12 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-2"
                >
                  Próxima Etapa <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="px-16 py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  Finalizar & Publicar
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};