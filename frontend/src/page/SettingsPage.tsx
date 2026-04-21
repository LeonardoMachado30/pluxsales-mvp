import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  CreditCard,
  User,
  Building,
  ExternalLink,
  Users,
  Plus,
  Trash2,
  Mail,
  ShieldAlert,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { dbService, AppSettings } from "../services/mockDb";
import { authService, User as UserType } from "../services/authService";

export const SettingsPage: React.FC = () => {
  const [tab, setTab] = useState<"PROFILE" | "TEAM" | "BILLING">("PROFILE");
  const [settings, setSettings] = useState<AppSettings>({
    lowStockThreshold: 100,
    monthlyGoal: 50000,
  });
  const [saved, setSaved] = useState(false);
  const [team, setTeam] = useState<UserType[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);

  const user = authService.getCurrentUser();

  useEffect(() => {
    setSettings(dbService.getSettings());
    setTeam(authService.getTenantUsers());
  }, []);

  const handleSave = () => {
    dbService.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const simulatePayment = () => {
    if (user) {
      const updatedUser = { ...user, status: "PAID" as any };
      authService.login(updatedUser);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out] pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-indigo-600" />
            Configurações SaaS
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Gestão de conta corporativa, segurança e equipe.
          </p>
        </div>
        <Link
          to="/"
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Painel Principal
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Nav Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm space-y-2">
            <button
              onClick={() => setTab("PROFILE")}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${tab === "PROFILE" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <User className="w-4 h-4" /> Conta
            </button>
            <button
              onClick={() => setTab("TEAM")}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${tab === "TEAM" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Users className="w-4 h-4" /> Equipe
            </button>
            <button
              onClick={() => setTab("BILLING")}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${tab === "BILLING" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <CreditCard className="w-4 h-4" /> Faturamento
            </button>
          </div>

          <div className="bg-slate-900 p-8 rounded-[32px] text-white relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-4">
                Seu Plano
              </p>
              <h3 className="text-2xl font-black mb-1">
                {user?.status === "PAID" ? "Premium" : "Período Trial"}
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-6">
                ID: {user?.tenantId}
              </p>
              <button
                onClick={simulatePayment}
                className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Ver Planos
              </button>
            </div>
            <Cpu className="absolute -right-6 -bottom-6 w-24 h-24 opacity-5" />
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {tab === "PROFILE" && (
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-[fadeIn_0.2s_ease-out]">
              <div className="p-10 space-y-12">
                <section className="space-y-6">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <Building className="w-5 h-5 text-indigo-600" /> Empresa &
                    Tenant
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        E-mail Corporativo
                      </label>
                      <input
                        disabled
                        value={user?.email}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Tenant ID
                      </label>
                      <div className="relative">
                        <input
                          disabled
                          value={user?.tenantId}
                          className="w-full p-4 bg-slate-50 border-none rounded-2xl font-mono text-[10px] font-bold text-slate-400"
                        />
                        <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="h-px bg-slate-50"></div>

                <section className="space-y-6">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-indigo-600" /> Regras
                    de Inventário & Negócio
                  </h3>
                  <div className="space-y-4">
                    <div className="p-8 bg-slate-50 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <p className="text-sm font-black text-slate-800">
                          Limiar Global de Estoque
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Define o ponto de alerta crítico em todo o sistema.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={settings.lowStockThreshold}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              lowStockThreshold: Number(e.target.value),
                            })
                          }
                          className="w-24 p-4 border-2 border-slate-200 rounded-2xl font-black text-center focus:border-indigo-500 outline-none transition-all"
                        />
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          Unidades
                        </span>
                      </div>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">
                            Meta Mensal de Faturamento
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            Alvo de faturamento para análise da Aura Forecaster.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-400 font-mono">
                          R$
                        </span>
                        <input
                          type="number"
                          value={settings.monthlyGoal}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              monthlyGoal: Number(e.target.value),
                            })
                          }
                          className="w-40 p-4 border-2 border-slate-200 rounded-2xl font-black text-center focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                >
                  {saved ? "Alterações Salvas" : "Salvar Preferências"}
                </button>
              </div>
            </div>
          )}

          {tab === "TEAM" && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <Users className="w-5 h-5 text-indigo-600" /> Membros da
                    Equipe
                  </h3>
                  <button
                    onClick={() => setShowAddUser(true)}
                    className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {team.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-black text-sm">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight">
                            {member.name} {member.id === user?.id && "(Você)"}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                            member.role === "ADMIN"
                              ? "bg-purple-50 text-purple-700 border-purple-100"
                              : member.role === "CASHIER"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-slate-50 text-slate-600 border-slate-100"
                          }`}
                        >
                          {member.role}
                        </span>
                        {member.id !== user?.id && (
                          <button className="p-2 text-slate-300 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 flex items-center gap-4">
                <ShieldAlert className="w-6 h-6 text-indigo-600" />
                <p className="text-xs font-bold text-indigo-900">
                  O cargo do usuário define o que ele pode ver e operar no
                  PluxSales. <br />
                  <span className="text-indigo-600 font-medium">
                    Saiba mais sobre as hierarquias RBAC.
                  </span>
                </p>
              </div>
            </div>
          )}

          {tab === "BILLING" && (
            <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[40px] border-4 border-indigo-600 shadow-2xl relative overflow-hidden">
                  <div className="inline-block px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-6">
                    Plano Atual
                  </div>
                  <h4 className="text-3xl font-black text-slate-900 mb-2">
                    Plux Premium
                  </h4>
                  <p className="text-slate-500 text-sm font-medium mb-8">
                    Toda a inteligência da Aura IA desbloqueada para seu
                    negócio.
                  </p>

                  <div className="space-y-4 mb-10">
                    {[
                      "Audit Trails ilimitados",
                      "Aura Voice Assistance",
                      "Dashboard Financeiro",
                      "NCM Cloud Analysis",
                    ].map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-3 text-sm font-bold text-slate-700"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" /> {f}
                      </div>
                    ))}
                  </div>
                  <div className="text-3xl font-black font-mono">
                    R$ 149,90{" "}
                    <span className="text-sm font-bold text-slate-400">
                      /mês
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 flex flex-col justify-center items-center text-center">
                  <div className="p-5 bg-white rounded-full shadow-sm mb-6">
                    <CreditCard className="w-10 h-10 text-slate-400" />
                  </div>
                  <h4 className="text-xl font-black text-slate-800 mb-2">
                    Histórico de Faturas
                  </h4>
                  <p className="text-sm text-slate-500 font-medium mb-6">
                    Visualize e baixe seus comprovantes de pagamento.
                  </p>
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                    Solicitar Conciliação
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal Sim */}
      {showAddUser && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden animate-[slideUp_0.3s_ease-out]">
            <div className="p-10 border-b border-slate-50">
              <h3 className="text-xl font-black text-slate-900">
                Novo Colaborador
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                O convite será enviado para o e-mail do colaborador.
              </p>
            </div>
            <div className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Nome Completo
                </label>
                <input
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold"
                  placeholder="ex: Ricardo Silva"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Cargo / Função
                </label>
                <select className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none">
                  <option value="CASHIER">Operador de Caixa</option>
                  <option value="MANAGER">Gerente de Loja</option>
                </select>
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 py-4 font-black text-[10px] uppercase text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100"
                >
                  Enviar Convite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
