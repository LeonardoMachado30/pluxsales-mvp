import React, { useState, useEffect } from "react";
import { dbService } from "../services/mockDb";
import { api } from "../services/api";
import { geminiService } from "../services/geminiService";
import { Product, Sale } from "../../types";
import {
  ShieldCheck,
  FileCheck,
  AlertOctagon,
  FileText,
  ArrowRight,
  Sparkles,
  Loader2,
  Database,
  Calculator,
  TrendingUp,
  Gavel,
  Zap,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);

  useEffect(() => {
    setProducts(dbService.getProducts());
    setSales(dbService.getSales());
  }, []);

  const runFiscalAudit = async () => {
    setIsAuditing(true);
    const report = await geminiService.auditSalesForAccountant(sales);
    setAuditReport(report);
    setIsAuditing(false);
  };

  const handleExportToAccountant = async () => {
    setIsExporting(true);
    try {
      const now = new Date();
      const firstDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();
      const lastDay = now.toISOString();

      const reportData = await api.getAccountingReport(firstDay, lastDay);

      // Simula a geração de um arquivo para download
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plux_fiscal_report_${now.getMonth() + 1}_${now.getFullYear()}.json`;
      a.click();

      alert(
        "Relatório Contábil gerado com sucesso! Envie este arquivo para seu contador.",
      );
    } catch (e) {
      alert("Erro ao exportar dados. Verifique sua conexão com a nuvem.");
    } finally {
      setIsExporting(false);
    }
  };

  const estimatedTaxSavings = sales.reduce(
    (acc, s) => acc + s.total_revenue * 0.0925,
    0,
  );
  const productsWithIssues = products.filter(
    (p) => !p.tax_profile.ncm || p.tax_profile.ncm.length !== 8,
  );

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out] font-['Noto_Sans']">
      <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -mr-40 -mt-40"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2 uppercase italic">
              PluxSales Fiscal Core
            </h2>
            <p className="text-slate-400 font-medium max-w-md">
              Sua operação protegida por inteligência tributária e segregação de
              receitas.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={runFiscalAudit}
              disabled={isAuditing}
              className="px-8 py-5 bg-white text-slate-900 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 transition-all"
            >
              {isAuditing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 text-indigo-600" />
              )}
              Auditoria IA
            </button>
            <button
              onClick={handleExportToAccountant}
              disabled={isExporting}
              className="px-8 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-indigo-500 transition-all"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Exportar Contador
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Itens no Catálogo
          </p>
          <h3 className="text-3xl font-black text-slate-900">
            {products.length}
          </h3>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-emerald-600">
            Lucro Recuperado (IA)
          </p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-black text-emerald-600 font-mono">
              R$ {estimatedTaxSavings.toLocaleString()}
            </h3>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div
          className={`bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm ${productsWithIssues.length > 0 ? "border-l-4 border-l-red-500" : ""}`}
        >
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Alertas Fiscais
          </p>
          <h3
            className={`text-3xl font-black ${productsWithIssues.length > 0 ? "text-red-500" : "text-emerald-500"}`}
          >
            {productsWithIssues.length}
          </h3>
        </div>
        <div className="bg-indigo-600 p-8 rounded-[40px] shadow-xl text-white">
          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">
            Vendas Conciliadas
          </p>
          <h3 className="text-3xl font-black font-mono">{sales.length}</h3>
        </div>
      </div>

      {auditReport && (
        <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-[40px] animate-[slideUp_0.3s_ease-out]">
          <div className="flex items-center gap-4 mb-4">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <h4 className="text-lg font-black text-indigo-900 uppercase">
              Relatório de Auditoria Aura
            </h4>
          </div>
          <p className="text-sm text-indigo-800 leading-relaxed italic">
            "{auditReport}"
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <FileCheck className="w-6 h-6 text-indigo-600" /> Conciliação Cloud
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            Arquivos estruturados para integração direta com sistemas contábeis.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-2">
                Último Fechamento
              </p>
              <p className="text-xs font-bold text-slate-700">Ontem às 23:45</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-2">
                Status Sincronismo
              </p>
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> 100% Online
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-6">
            <Gavel className="w-6 h-6 text-indigo-600" /> Margem Fiscal por
            Perfil
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <span className="text-xs font-black text-emerald-800 uppercase">
                Itens de Alíquota Zero
              </span>
              <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full text-emerald-600">
                62% DO VOLUME
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase">
                Itens com Retenção ST
              </span>
              <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full text-slate-500">
                18% DO VOLUME
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
