import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { geminiService } from "../services/geminiService";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BrainCircuit,
  Loader2,
  Sparkles,
  PieChart,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Target,
  Package,
} from "lucide-react";

const ComparisonCard = ({ title, current, previous, label }: any) => {
  const delta = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = delta >= 0;

  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4 group hover:border-indigo-200 transition-all">
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {title}
        </p>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {Math.abs(delta).toFixed(1)}%
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-3xl font-black text-slate-900 font-mono tracking-tighter">
          R$ {current.toLocaleString()}
        </h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase">
          vs R$ {previous.toLocaleString()} ({label})
        </p>
      </div>
    </div>
  );
};

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [auraDiagnosis, setAuraDiagnosis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    const result = await api.getComparativeAnalytics();
    setData(result);
    setLoading(false);
  };

  const runAuraDiagnosis = async () => {
    if (!data) return;
    setIsAnalyzing(true);
    const diagnosis = await geminiService.analyzeBusinessHealth(data);
    setAuraDiagnosis(diagnosis);
    setIsAnalyzing(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600" />
      </div>
    );

  return (
    <div className="space-y-10 animate-[fadeIn_0.3s_ease-out] pb-24 font-['Noto_Sans']">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-[20px] shadow-xl">
              <PieChart className="w-6 h-6" />
            </div>
            Inteligência Operacional
          </h2>
          <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">
            Diagnóstico de Performance e Margens
          </p>
        </div>
        <button
          onClick={runAuraDiagnosis}
          disabled={isAnalyzing}
          className="px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <BrainCircuit className="w-4 h-4" />
          )}
          Diagnóstico Financeiro Aura IA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ComparisonCard
          title="Receita Semanal"
          current={data.weekly.current_revenue}
          previous={data.weekly.prev_revenue}
          label="Semana Passada"
        />
        <ComparisonCard
          title="Faturamento Mensal"
          current={data.monthly.current_revenue}
          previous={data.weekly.prev_revenue}
          label="Mês Anterior"
        />
        <ComparisonCard
          title="Projeção Anual"
          current={data.annual.current_revenue}
          previous={data.weekly.prev_revenue}
          label="Ciclo Anterior"
        />
      </div>

      {auraDiagnosis && (
        <div className="bg-slate-900 p-12 rounded-[56px] shadow-2xl text-white relative overflow-hidden animate-[slideUp_0.4s_ease-out] border border-slate-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px] -mr-40 -mt-40"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-600/20 backdrop-blur-md rounded-3xl border border-indigo-500/20">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  Parecer do CFO Virtual
                </h3>
                <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest">
                  Inteligência Financeira Aura
                </p>
              </div>
            </div>
            <div className="bg-white/5 rounded-[32px] p-8 text-sm font-medium leading-relaxed italic border border-white/5 whitespace-pre-line text-slate-300">
              {auraDiagnosis}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">
            Tendência de Receita
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: "Jan", revenue: 42000 },
                  { name: "Fev", revenue: 48000 },
                  { name: "Mar", revenue: 45000 },
                  { name: "Abr", revenue: 58000 },
                  { name: "Mai", revenue: data.monthly.current_revenue },
                ]}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">
            Composição de Custos
          </h3>
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Package className="w-6 h-6 text-slate-400" />
                <span className="text-sm font-black text-slate-700 uppercase">
                  CMV Teórico
                </span>
              </div>
              <span className="font-mono font-black text-slate-900">32.5%</span>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingDown className="w-6 h-6 text-red-400" />
                <span className="text-sm font-black text-slate-700 uppercase">
                  Quebras/Waste
                </span>
              </div>
              <span className="font-mono font-black text-red-600">4.2%</span>
            </div>
            <div className="p-6 bg-indigo-50 rounded-3xl flex items-center justify-between border border-indigo-100">
              <div className="flex items-center gap-4">
                <DollarSign className="w-6 h-6 text-indigo-600" />
                <span className="text-sm font-black text-indigo-900 uppercase">
                  Lucro Operacional
                </span>
              </div>
              <span className="font-mono font-black text-indigo-600">
                28.1%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
