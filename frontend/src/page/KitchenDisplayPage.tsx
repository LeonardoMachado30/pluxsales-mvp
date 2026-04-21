import React, { useState, useEffect } from "react";
import { dbService } from "../services/mockDb";
import { KitchenTicket, TicketStatus } from "../../types";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Loader2,
  Flame,
  AlertCircle,
  Utensils,
  Bell,
  ChevronRight,
  Monitor,
} from "lucide-react";

export const KitchenDisplayPage: React.FC = () => {
  const [tickets, setTickets] = useState<KitchenTicket[]>([]);
  const [activeTab, setActiveTab] = useState<TicketStatus>(
    TicketStatus.PENDING,
  );

  const loadData = () => {
    const data = dbService.getKitchenTickets();
    setTickets([...data].reverse());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Polling simulation
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = (ticketId: string, status: TicketStatus) => {
    dbService.updateTicketStatus(ticketId, status);
    loadData();
  };

  const filteredTickets = tickets.filter((t) => t.status === activeTab);

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING:
        return "text-amber-500";
      case TicketStatus.PREPARING:
        return "text-indigo-500";
      case TicketStatus.READY:
        return "text-emerald-500";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out] pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-[20px] shadow-xl">
              <ChefHat className="w-6 h-6" />
            </div>
            KDS - Central de Produção
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Gerencie a fila de preparo em tempo real para otimizar o tempo de
            entrega.
          </p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-[20px] border border-slate-200">
          {[
            TicketStatus.PENDING,
            TicketStatus.PREPARING,
            TicketStatus.READY,
          ].map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === status ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}
            >
              {status} ({tickets.filter((t) => t.status === status).length})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTickets.map((ticket) => {
          const waitTime = Math.floor(
            (new Date().getTime() - new Date(ticket.timestamp).getTime()) /
              60000,
          );
          const isUrgent = waitTime > 15;

          return (
            <div
              key={ticket.id}
              className={`bg-white rounded-[32px] border-2 transition-all flex flex-col shadow-sm ${isUrgent ? "border-red-200 animate-pulse" : "border-slate-100"}`}
            >
              {/* Header */}
              <div
                className={`p-6 rounded-t-[30px] flex justify-between items-start ${isUrgent ? "bg-red-50" : "bg-slate-50/50"}`}
              >
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Mesa / Setor
                  </p>
                  <h3 className="text-lg font-black text-slate-800">
                    {ticket.tableName || "Balcão"}{" "}
                    <span className="text-slate-400 font-medium">
                      ({ticket.sectorName})
                    </span>
                  </h3>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${isUrgent ? "bg-red-100 text-red-600 border-red-200" : "bg-white text-slate-500"}`}
                >
                  <Clock className="w-3 h-3" />
                  {waitTime}m
                </div>
              </div>

              {/* Items */}
              <div className="p-6 flex-1 space-y-4">
                {ticket.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                        {item.qty}
                      </div>
                      <span className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                        {item.name}
                      </span>
                    </div>
                    <Utensils className="w-4 h-4 text-slate-200" />
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="p-6 border-t border-slate-50">
                {ticket.status === TicketStatus.PENDING && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(ticket.id, TicketStatus.PREPARING)
                    }
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4" /> Iniciar Preparo
                  </button>
                )}
                {ticket.status === TicketStatus.PREPARING && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(ticket.id, TicketStatus.READY)
                    }
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4" /> Notificar Pronto
                  </button>
                )}
                {ticket.status === TicketStatus.READY && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(ticket.id, TicketStatus.DELIVERED)
                    }
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Entregar Pedido
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredTickets.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[48px] border-4 border-dashed border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Monitor className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-black text-slate-800">
              Sem pedidos pendentes
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 font-medium uppercase tracking-widest">
              Aguardando novas transações do PDV.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
