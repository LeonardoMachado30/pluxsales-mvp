
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/mockDb';
import { geminiService } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie
} from 'recharts';
import { 
  Map, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  ArrowUpRight, 
  Sparkles, 
  Loader2, 
  BrainCircuit,
  MapPin,
  ChevronRight,
  Info,
  Grid
} from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const SectorAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);

  useEffect(() => {
    const data = dbService.getAnalyticsSummary();
    setAnalytics(data);
    if (data.sectorStats.length > 0) {
      setSelectedSectorId(data.sectorStats[0].id);
    }
  }, []);

  const handlePredict = async () => {
    if (!analytics) return;
    setIsPredicting(true);
    const text = await geminiService.analyzeSectors(analytics.sectorStats);
    setPrediction(text);
    setIsPredicting(false);
  };

  if (!analytics) return null;

  const chartData = analytics.sectorStats.map((s: any) => ({
    name: s.name,
    revenue: s.revenue,
    profit: s.profit,
    orders: s.orders
  }));

  const selectedSector = analytics.sectorStats.find((s: any) => s.id === selectedSectorId);

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out] pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-[20px] shadow-xl shadow-indigo-100">
              <Map className="w-6 h-6" />
            </div>
            Geointeligência de Lucro
          </h2>
          <p className="text-slate-500 font-medium mt-1">Rentabilidade por áreas físicas, mesas e canais de atendimento.</p>
        </div>
        <button 
          onClick={handlePredict}
          disabled={isPredicting || analytics.sectorStats.length === 0}
          className="px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
        >
          {isPredicting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
          Consultoria de Layout IA
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Section Selection Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {analytics.sectorStats.map((s: any) => (
              <button
                key={s.id}
                onClick={() => setSelectedSectorId(s.id)}
                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border ${
                  selectedSectorId === s.id 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Table Heatmap View */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Grid className="w-5 h-5 text-indigo-600" /> Heatmap de Mesas: {selectedSector?.name}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lucratividade por Ponto de Venda</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-slate-100"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Vazia</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Alta Margem</span>
                </div>
              </div>
            </div>

            {selectedSector?.tableCount > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                {Array.from({ length: selectedSector.tableCount }).map((_, i) => {
                  const tableNum = i + 1;
                  // Simulando dados por mesa para o protótipo
                  const isBusy = Math.random() > 0.4;
                  const isHighProfit = Math.random() > 0.7;
                  
                  return (
                    <div 
                      key={i}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all cursor-help group relative ${
                        isBusy 
                        ? (isHighProfit ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-indigo-600 border-indigo-700 text-white')
                        : 'bg-slate-50 border-slate-100 text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-black">{tableNum}</span>
                      {isBusy && <Users className="w-3 h-3 mt-1 opacity-50" />}
                      
                      {/* Tooltip Simulado */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-900 text-white p-3 rounded-xl text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl">
                        <p className="uppercase text-indigo-400 mb-1">Mesa {tableNum}</p>
                        <p>Ticket: R$ {(Math.random() * 200 + 50).toFixed(2)}</p>
                        <p className="text-emerald-400">Margem: {(Math.random() * 20 + 60).toFixed(0)}%</p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Este setor não possui mesas fixas (Delivery/Balcão)</p>
              </div>
            )}
          </div>

          {/* AI Advisor Card */}
          <div className="bg-indigo-600 p-12 rounded-[56px] shadow-2xl text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[120px] -mr-40 -mt-40 transition-transform group-hover:scale-110"></div>
             
             <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                   <div className="p-4 bg-white/20 backdrop-blur-md rounded-3xl">
                      <Sparkles className="w-8 h-8 text-white" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">Consultoria Aura Space</h3>
                      <p className="text-indigo-100 text-sm font-medium">Análise de eficiência por metro quadrado</p>
                   </div>
                </div>

                <div className="bg-black/10 rounded-[32px] p-8 min-h-[120px] flex items-center">
                   {prediction ? (
                     <div className="text-indigo-50 text-sm font-medium leading-relaxed italic animate-[fadeIn_0.5s_ease-out]">
                        "{prediction}"
                     </div>
                   ) : (
                     <div className="flex items-center gap-4 text-indigo-300/50">
                        <BrainCircuit className="w-10 h-10" />
                        <p className="text-xs font-black uppercase tracking-widest">Aguardando solicitação de processamento espacial...</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Sectors List & Mini Stats */}
        <div className="space-y-6">
           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
              <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Rank de Faturamento</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Performance por Canal</p>
              </div>

              <div className="space-y-4">
                 {analytics.sectorStats.sort((a:any, b:any) => b.revenue - a.revenue).map((s: any, idx: number) => (
                    <div key={s.id} className="p-5 bg-slate-50 rounded-[32px] border border-slate-100 group hover:border-indigo-200 transition-all">
                       <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <span className="font-black text-xs">{idx + 1}º</span>
                             </div>
                             <div>
                                <h4 className="text-sm font-black text-slate-800">{s.name}</h4>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.type}</span>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-[10px] font-black text-indigo-600 font-mono">R$ {s.revenue.toFixed(2)}</div>
                             <div className="text-[9px] font-bold text-emerald-500 uppercase">+{s.margin.toFixed(0)}% L</div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col justify-between relative overflow-hidden group h-64 border border-slate-800">
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Insight de Ocupação</p>
                 <h4 className="text-2xl font-black">Área de Giro Lento</h4>
                 <p className="text-xs text-slate-500 mt-2 font-medium">As mesas no fundo do {analytics.sectorStats[0]?.name} estão com ociocidade de 45% nas terças-feiras.</p>
                 <div className="mt-4 flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                    <ArrowUpRight className="w-4 h-4" /> Ver Sugestão IA
                 </div>
              </div>
              <MapPin className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 transition-transform group-hover:scale-110" />
           </div>
        </div>
      </div>
    </div>
  );
};
