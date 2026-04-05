import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ChefHat,
  Settings,
  Menu,
  ShoppingCart,
  History,
  Cpu,
  X,
  LogOut,
  UserCircle,
  Wallet,
  FileText,
  ShieldAlert,
  Map,
  Barcode,
  Layout as LayoutIcon,
  Monitor,
  Database,
  Trash2,
  Cloud,
  CloudOff,
} from "lucide-react";
import { authService } from "../services/authService";
import { dbService } from "../services/mockDb";
import { PDVNotification } from "./PDVNotification";

const SidebarItem = ({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  icon: any;
  label: string;
  onClick?: () => void;
}) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 ${
          isActive
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]"
            : "text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm"
        }`
      }
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  );
};

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const user = authService.getCurrentUser();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsRegisterOpen(!!dbService.getCurrentSession());
    setIsOnline(!!process.env.REACT_APP_API_URL);
  }, [location.pathname]);

  const getTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard Analítico";
      case "/ingredients":
        return "Gestão de Insumos";
      case "/ingredients/history":
        return "Rastreabilidade de Insumos";
      case "/inventory/waste":
        return "Gestão de Quebras";
      case "/products":
        return "Cardápio Digital";
      case "/products/new":
        return "Assistente de Engenharia";
      case "/sales":
        return "PDV - Frente de Loja";
      case "/sales-history":
        return "Histórico de Vendas";
      case "/register":
        return "Gerenciamento de Caixa";
      case "/kitchen":
        return "KDS - Painel de Produção";
      case "/settings":
        return "Configurações SaaS";
      case "/reports":
        return "Relatórios Corporativos";
      case "/audit":
        return "Trilha de Auditoria";
      case "/sectors":
        return "Geointeligência de Lucro";
      case "/sectors/manage":
        return "Gestão de Infraestrutura";
      case "/labels":
        return "Label Forge";
      default:
        return "PluxSales";
    }
  };

  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";

  return (
    <div className="flex h-screen bg-slate-50/30 overflow-hidden relative font-['Noto_Sans']">
      <PDVNotification />
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-50 border-r border-slate-200/60 flex flex-col 
        transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:flex"}
      `}
      >
        <div className="p-8 flex items-center justify-between">
          <div
            className="flex items-center gap-3 text-indigo-600 font-black text-2xl group cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="p-2 bg-indigo-600 rounded-2xl text-white shadow-indigo-100 shadow-xl">
              <Package className="w-6 h-6" />
            </div>
            <span className="tracking-tighter">PluxSales</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <div className="px-4 pb-2">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Operacional
            </p>
          </div>
          {(isAdmin || isManager) && (
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
          )}
          <SidebarItem to="/sales" icon={ShoppingCart} label="Vender (PDV)" />
          <SidebarItem to="/register" icon={Wallet} label="Caixa" />
          <SidebarItem to="/kitchen" icon={Monitor} label="Cozinha (KDS)" />
          <SidebarItem to="/sales-history" icon={History} label="Histórico" />
          {isAdmin && (
            <>
              <div className="px-4 pt-6 pb-2">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Engenharia (Administrador)
                </p>
              </div>
              <SidebarItem to="/ingredients" icon={ChefHat} label="Insumos" />
              <SidebarItem
                to="/ingredients/history"
                icon={Database}
                label="Log de Estoque"
              />
              <SidebarItem
                to="/inventory/waste"
                icon={Trash2}
                label="Gestão de Quebras"
              />
              <SidebarItem to="/products" icon={Menu} label="Cardápio" />
              <SidebarItem to="/labels" icon={Barcode} label="Etiquetas" />
              <div className="px-4 pt-6 pb-2">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Estratégia
                </p>
              </div>
              <SidebarItem to="/sectors" icon={Map} label="Geointeligência" />
              <SidebarItem
                to="/sectors/manage"
                icon={LayoutIcon}
                label="Infraestrutura"
              />
              <div className="px-4 pt-6 pb-2">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Admin
                </p>
              </div>
              <SidebarItem to="/reports" icon={FileText} label="Relatórios" />
              <SidebarItem to="/audit" icon={ShieldAlert} label="Audit Logs" />
              <SidebarItem
                to="/settings"
                icon={Settings}
                label="Configurações"
              />
            </>
          )}
        </nav>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
              <UserCircle className="w-6 h-6" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-slate-800 truncate">
                {user?.name}
              </p>
              <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest">
                {user?.role}
              </p>
            </div>
            <button
              onClick={() => authService.logout()}
              className="text-slate-300 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[24px] text-white shadow-xl relative overflow-hidden group">
            <Cpu className="absolute -right-4 -bottom-4 w-20 h-20 opacity-10" />
            <div className="relative z-10">
              <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">
                Status Licença
              </div>
              <div className="text-xs font-bold">
                {user?.status === "PAID" ? "Plano Premium" : "Período Trial"}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-white md:m-4 md:rounded-[40px] md:shadow-2xl md:border md:border-slate-100 transition-all">
        <header className="h-20 flex items-center justify-between px-6 md:px-8 border-b border-slate-50 shrink-0 print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black text-slate-800 tracking-tight hidden md:block">
              {getTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${isOnline ? "bg-indigo-50 border-indigo-100 text-indigo-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}
            >
              {isOnline ? (
                <Cloud className="w-3 h-3" />
              ) : (
                <CloudOff className="w-3 h-3" />
              )}
              <span className="text-[9px] font-black uppercase tracking-widest">
                {isOnline ? "Cloud Sync (Render)" : "Local Mode"}
              </span>
            </div>
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${isRegisterOpen ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${isRegisterOpen ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
              ></div>
              <span className="text-[9px] font-black uppercase tracking-widest">
                {isRegisterOpen ? "Caixa Aberto" : "Caixa Fechado"}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 lg:p-12 print:p-0">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
