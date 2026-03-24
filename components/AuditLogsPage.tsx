
import React, { useState, useEffect } from 'react';
import { dbService, ActivityLog } from '../services/mockDb';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Clock, 
  User, 
  FileSearch, 
  ChevronDown, 
  Database,
  ArrowUpDown,
  Calendar
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ActivityLog['type'] | 'ALL'>('ALL');

  useEffect(() => {
    setLogs(dbService.getActivityLogs());
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-3 bg-slate-900 text-white rounded-[20px] shadow-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            Audit Trails
          </h2>
          <p className="text-slate-500 font-medium mt-1">Trilha de auditoria completa e imutável para conformidade SaaS.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3 text-slate-400 font-bold text-xs">
           <Database className="w-4 h-4" />
           {logs.length} Eventos Armazenados
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar por usuário, ação ou detalhe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-medium text-sm"
            />
         </div>
         <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-300 mr-2" />
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'INFO', label: 'Info' },
              { id: 'WARNING', label: 'Avisos' },
              { id: 'CRITICAL', label: 'Críticos' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id as any)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  filterType === t.id 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
         </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operador</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação / Entidade</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalhes do Evento</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Severidade</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <Clock className="w-4 h-4 text-slate-300" />
                             <span className="text-xs font-mono font-bold text-slate-600">
                                {new Date(log.timestamp).toLocaleString('pt-BR')}
                             </span>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black text-[10px]">
                                {log.userName[0]}
                             </div>
                             <span className="text-sm font-black text-slate-800">{log.userName}</span>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-md">
                                {log.action}
                             </span>
                             <span className="text-slate-300">/</span>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {log.entity}
                             </span>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <p className="text-xs font-medium text-slate-500 max-w-md line-clamp-2">{log.details}</p>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             log.type === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' :
                             log.type === 'WARNING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                             'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${
                                log.type === 'CRITICAL' ? 'bg-red-500' :
                                log.type === 'WARNING' ? 'bg-amber-500' :
                                'bg-emerald-500'
                             }`}></div>
                             {log.type}
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
            {filteredLogs.length === 0 && (
              <div className="py-32 text-center text-slate-300 font-bold uppercase text-xs tracking-widest italic">
                 Nenhum registro encontrado para a busca.
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
