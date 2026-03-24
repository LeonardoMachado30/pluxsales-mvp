
import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/mockDb';
import { Sale, PaymentMethod } from '../types';
import { 
  History, 
  Calendar, 
  DollarSign, 
  ArrowLeft, 
  Receipt,
  Calculator,
  QrCode,
  Banknote,
  CreditCard,
  Search,
  Filter,
  XCircle,
  Hash
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SalesHistoryPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | 'ALL'>('ALL');

  useEffect(() => {
    const data = dbService.getSales();
    setSales([...data].reverse());
  }, []);

  // Filter Logic
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = sale.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = filterMethod === 'ALL' || sale.payment_method === filterMethod;
      return matchesSearch && matchesMethod;
    });
  }, [sales, searchTerm, filterMethod]);

  const stats = useMemo(() => {
    const revenue = filteredSales.reduce((acc, s) => acc + s.total_revenue, 0);
    const cost = filteredSales.reduce((acc, s) => acc + s.total_cost, 0);
    return { revenue, cost, profit: revenue - cost };
  }, [filteredSales]);

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.PIX: return <QrCode className="w-3.5 h-3.5" />;
      case PaymentMethod.CASH: return <Banknote className="w-3.5 h-3.5" />;
      default: return <CreditCard className="w-3.5 h-3.5" />;
    }
  };

  const getPaymentColor = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.PIX: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case PaymentMethod.CASH: return 'bg-amber-50 text-amber-700 border-amber-100';
      case PaymentMethod.DEBIT_CARD: return 'bg-blue-50 text-blue-700 border-blue-100';
      case PaymentMethod.CREDIT_CARD: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
      {/* Top Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-[20px] shadow-xl shadow-indigo-100">
              <History className="w-6 h-6" />
            </div>
            Fluxo de Caixa
          </h2>
          <p className="text-slate-500 font-medium mt-1">Histórico completo de transações e conciliação financeira.</p>
        </div>
        <Link 
          to="/sales" 
          className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-50 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao PDV
        </Link>
      </div>

      {/* Analytics Dashboard mini */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total de Pedidos</span>
          </div>
          <div className="text-4xl font-black text-slate-900 font-mono tracking-tighter">{filteredSales.length}</div>
        </div>
        
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Receita Bruta</span>
          </div>
          <div className="text-4xl font-black text-emerald-600 font-mono tracking-tighter">
            <span className="text-lg font-bold mr-1">R$</span>{stats.revenue.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[32px] shadow-2xl shadow-slate-200 text-white relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-white/10 text-indigo-300 rounded-xl">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lucro Estimado</span>
          </div>
          <div className="text-4xl font-black font-mono tracking-tighter">
            <span className="text-lg font-bold mr-1 text-indigo-400">R$</span>{stats.profit.toFixed(2)}
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <History className="w-32 h-32" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por ID da transação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all font-medium text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
          <Filter className="w-4 h-4 text-slate-300 mr-2 shrink-0" />
          {[
            { id: 'ALL', label: 'Todos' },
            { id: PaymentMethod.PIX, label: 'PIX' },
            { id: PaymentMethod.CASH, label: 'Dinheiro' },
            { id: PaymentMethod.CREDIT_CARD, label: 'Crédito' },
            { id: PaymentMethod.DEBIT_CARD, label: 'Débito' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilterMethod(opt.id as any)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${
                filterMethod === opt.id 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                  : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <div 
              key={sale.id} 
              className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:border-indigo-200 transition-all group"
            >
              {/* Card Header */}
              <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white group-hover:bg-slate-50/30 transition-colors">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-slate-900">ID {sale.id.slice(0, 8).toUpperCase()}</span>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getPaymentColor(sale.payment_method)}`}>
                        {getPaymentIcon(sale.payment_method)}
                        {sale.payment_method}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1.5 uppercase tracking-tighter">
                      <Calendar className="w-3 h-3" />
                      {new Date(sale.timestamp).toLocaleDateString('pt-BR')} às {new Date(sale.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-right border-t lg:border-t-0 pt-6 lg:pt-0 border-slate-50">
                  <div className="hidden sm:block">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Margem</div>
                    <div className="text-xs font-bold text-emerald-500 font-mono">
                      {(((sale.total_revenue - sale.total_cost) / sale.total_revenue) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Insumos</div>
                    <div className="text-sm font-bold text-red-400 font-mono">R$ {sale.total_cost.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Valor Venda</div>
                    <div className="text-3xl font-black text-slate-900 font-mono tracking-tighter">
                      <span className="text-sm font-bold mr-1">R$</span>{sale.total_revenue.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Detail Grid */}
              <div className="bg-slate-50/30 p-8 border-t border-slate-50">
                <div className="flex flex-wrap gap-4">
                  {sale.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm min-w-[200px]">
                      <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                         {item.qty}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-black text-slate-800 truncate max-w-[120px]">{item.name}</div>
                        <div className="text-[9px] text-slate-400 font-mono">R$ {item.price_at_sale.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {sale.payment_method === PaymentMethod.CASH && sale.received_amount && (
                  <div className="mt-6 flex items-center gap-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/30 w-fit">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Valor Recebido</span>
                      <span className="text-sm font-black font-mono text-slate-800">R$ {sale.received_amount.toFixed(2)}</span>
                    </div>
                    <div className="w-px h-6 bg-indigo-100"></div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Troco Devolvido</span>
                      <span className="text-sm font-black font-mono text-emerald-600">R$ {sale.change_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center bg-white rounded-[48px] border-2 border-dashed border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <XCircle className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Nenhuma transação encontrada</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 font-medium">
              Não existem registros para os filtros selecionados ou ainda não houveram vendas.
            </p>
            {(searchTerm || filterMethod !== 'ALL') && (
              <button 
                onClick={() => { setSearchTerm(''); setFilterMethod('ALL'); }}
                className="mt-6 text-indigo-600 font-black text-xs uppercase tracking-widest underline decoration-2 underline-offset-4"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
