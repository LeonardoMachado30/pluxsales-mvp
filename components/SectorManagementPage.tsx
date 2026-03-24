
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/mockDb';
import { Sector, SectorType } from '../types';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Grid, 
  Layout, 
  Save, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SectorManagementPage: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);

  const loadData = () => {
    setSectors(dbService.getSectors());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Sector = {
      id: editingSector?.id || '',
      name: formData.get('name') as string,
      type: formData.get('type') as SectorType,
      tableCount: Number(formData.get('tableCount'))
    };

    dbService.saveSector(payload);
    loadData();
    setIsModalOpen(false);
    setEditingSector(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Deseja realmente excluir este setor? Todas as métricas de geointeligência associadas serão resetadas.")) {
      dbService.deleteSector(id);
      loadData();
    }
  };

  const openModal = (sector?: Sector) => {
    setEditingSector(sector || null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out] pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-[20px] shadow-xl">
              <Layout className="w-6 h-6" />
            </div>
            Gestão de Infraestrutura
          </h2>
          <p className="text-slate-500 font-medium mt-1">Configure seus pontos de atendimento, setores e capacidade de mesas.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <Link to="/sectors" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Heatmap
           </Link>
           <button 
             onClick={() => openModal()}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
           >
              <Plus className="w-4 h-4" /> Novo Setor
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sectors.map(sector => (
          <div key={sector.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-indigo-50 transition-colors">
                <MapPin className="w-16 h-16" />
             </div>
             
             <div className="relative z-10 space-y-6">
                <div>
                   <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                      {sector.type}
                   </span>
                   <h3 className="text-xl font-black text-slate-900 mt-3">{sector.name}</h3>
                </div>

                <div className="flex items-center gap-4 text-slate-500">
                   <div className="flex items-center gap-2">
                      <Grid className="w-4 h-4 text-slate-300" />
                      <span className="text-xs font-bold">{sector.tableCount} Mesas / Pontos</span>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                   <div className="flex gap-2">
                      <button 
                        onClick={() => openModal(sector)}
                        className="p-3 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                      >
                         <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(sector.id)}
                        className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                   <Link to="/sectors" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                      Ver Métricas <ChevronRight className="w-4 h-4" />
                   </Link>
                </div>
             </div>
          </div>
        ))}

        {sectors.length === 0 && (
          <div className="col-span-full py-32 text-center bg-slate-50 rounded-[56px] border-4 border-dashed border-slate-200">
             <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum setor configurado. Comece adicionando o seu primeiro ambiente.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white rounded-[48px] w-full max-w-lg overflow-hidden animate-[slideUp_0.3s_ease-out] shadow-2xl">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                       {editingSector ? 'Editar Setor' : 'Configurar Novo Setor'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Configuração de Layout Físico</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:bg-white rounded-full transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <form onSubmit={handleSave} className="p-12 space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Ambiente</label>
                    <input 
                      name="name" 
                      defaultValue={editingSector?.name}
                      required 
                      autoFocus
                      className="w-full px-6 py-5 bg-slate-50 border-none rounded-[24px] font-black text-xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all" 
                      placeholder="ex: Jardim de Inverno"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Canal</label>
                       <select 
                         name="type" 
                         defaultValue={editingSector?.type}
                         className="w-full px-6 py-5 bg-slate-50 border-none rounded-[24px] font-bold outline-none"
                       >
                          {Object.values(SectorType).map(type => <option key={type} value={type}>{type}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qtd. de Mesas</label>
                       <input 
                         name="tableCount" 
                         type="number"
                         defaultValue={editingSector?.tableCount || 0}
                         className="w-full px-6 py-5 bg-slate-50 border-none rounded-[24px] font-black text-xl font-mono text-indigo-600 outline-none"
                       />
                    </div>
                 </div>

                 <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 font-black text-[10px] uppercase text-slate-400">Descartar</button>
                    <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                       <ShieldCheck className="w-5 h-5" /> Confirmar Setor
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
