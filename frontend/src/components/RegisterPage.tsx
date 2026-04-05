import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { RegisterSession, Sale } from "../../types";
import {
  Wallet,
  LogIn,
  LogOut,
  Receipt,
  DollarSign,
  Calculator,
  Calendar,
  ShieldCheck,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export const RegisterPage: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [amount, setAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    setLoading(true);
    try {
      const current = await api.getCurrentSession();
      setSession(current);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    setIsProcessing(true);
    try {
      const val = parseFloat(amount) || 0;
      const newSession = await api.openRegister(val);
      setSession(newSession);
      setAmount("");
    } catch (e) {
      alert("Erro ao abrir caixa");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = async () => {
    if (!session) return;
    setIsProcessing(true);
    try {
      const val = parseFloat(amount) || 0;
      await api.closeRegister(session.id, val);
      setSession(null);
      setAmount("");
      alert("Caixa fechado com sucesso e sincronizado na nuvem.");
    } catch (e) {
      alert("Erro ao fechar caixa");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out] font-['Noto_Sans']">
        <div className="text-center space-y-4 pt-12">
          <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center mx-auto text-white shadow-2xl shadow-indigo-100">
            <Wallet className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            Caixa Offline
          </h2>
          <p className="text-slate-500 font-medium">
            Abra uma nova sessão para começar a vender.
          </p>
        </div>
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Fundo de Troco
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">
                R$
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full pl-16 pr-8 py-6 bg-slate-50 border-none rounded-[24px] font-black text-3xl font-mono focus:ring-4 focus:ring-indigo-100 outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleOpen}
            disabled={isProcessing}
            className="w-full py-6 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}{" "}
            Abrir Caixa Cloud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out] pb-20 font-['Noto_Sans']">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>{" "}
            Caixa Aberto (Cloud Sync)
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            Gestão do Turno
          </h2>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3 text-slate-500">
          <Calendar className="w-4 h-4" />{" "}
          <span className="text-xs font-bold">
            {new Date(session.opened_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase">
                Encerramento
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Informe o saldo final para conferência.
              </p>
            </div>
          </div>
        </div>
        <div className="p-10 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Saldo em Espécie
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">
                R$
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-16 pr-8 py-6 bg-slate-50 border-none rounded-[24px] font-black text-3xl font-mono text-slate-800"
              />
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing || !amount}
            className="w-full py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}{" "}
            Fechar Caixa e Sincronizar
          </button>
        </div>
      </div>
    </div>
  );
};
