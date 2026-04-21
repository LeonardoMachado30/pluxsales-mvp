import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../services/api";
import { Sector, SectorType } from "../../types";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  X,
  Grid,
  Layout,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";

export const SectorManagementPage: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  /** Evita POST com id residual ao criar após editar (closure / batching). */
  const saveDraftRef = useRef<{ sectorId: string | null }>({ sectorId: null });

  const loadData = useCallback(async () => {
    try {
      setListLoading(true);
      const list = await api.getSectors();
      setSectors(list);
    } catch (e: unknown) {
      alert(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar os setores.",
      );
      setSectors([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const closeModal = () => {
    saveDraftRef.current = { sectorId: null };
    setIsModalOpen(false);
    setEditingSector(null);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const formData = new FormData(e.currentTarget);
    const editId = saveDraftRef.current.sectorId;
    const payload: Sector = {
      id: editId ?? "",
      name: String(formData.get("name") ?? "").trim(),
      // type: (formData.get("type") as SectorType) || SectorType.HALL,
      tableCount: Number(formData.get("tableCount")) || 0,
    };

    if (!payload.name) {
      alert("Informe o nome do ambiente.");
      return;
    }

    try {
      setSaving(true);
      await api.saveSector(payload);
      await loadData();
      closeModal();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao salvar setor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Deseja realmente excluir este setor? Todas as métricas de geointeligência associadas serão resetadas.",
      )
    ) {
      return;
    }
    try {
      setDeletingId(id);
      await api.deleteSector(id);
      await loadData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao excluir setor.");
    } finally {
      setDeletingId(null);
    }
  };

  const openModal = (sector?: Sector) => {
    saveDraftRef.current = {
      sectorId: sector?.id?.trim() ? sector.id : null,
    };
    setEditingSector(sector ?? null);
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
          <p className="text-slate-500 font-medium mt-1">
            Configure seus pontos de atendimento, setores e capacidade de mesas.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link
            to="/sectors"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Heatmap
          </Link>
          <button
            type="button"
            onClick={() => openModal()}
            disabled={listLoading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Novo Setor
          </button>
        </div>
      </div>

      {listLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-widest">
            Carregando setores…
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sectors.map((sector) => (
            <div
              key={sector.id}
              className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-indigo-50 transition-colors">
                <MapPin className="w-16 h-16" />
              </div>

              <div className="relative z-10 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mt-3">
                    {sector.name}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-slate-500">
                  <div className="flex items-center gap-2">
                    <Grid className="w-4 h-4 text-slate-300" />
                    <span className="text-xs font-bold">
                      {sector.tableCount} Mesas / Pontos
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openModal(sector)}
                      className="inline-flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === sector.id}
                      onClick={() => handleDelete(sector.id)}
                      className="inline-flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      {deletingId === sector.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Link
                    to="/sectors"
                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform"
                  >
                    Ver Métricas <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {sectors.length === 0 && (
            <div className="col-span-full py-32 text-center bg-slate-50 rounded-[56px] border-4 border-dashed border-slate-200">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                Nenhum setor configurado. Comece adicionando o seu primeiro
                ambiente.
              </p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6"
          role="presentation"
          onClick={closeModal}
          onKeyDown={(ev) => {
            if (ev.key === "Escape") closeModal();
          }}
        >
          <div
            className="bg-white rounded-[48px] w-full max-w-lg overflow-hidden animate-[slideUp_0.3s_ease-out] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sector-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3
                  id="sector-modal-title"
                  className="text-2xl font-black text-slate-900 tracking-tight"
                >
                  {editingSector ? "Editar Setor" : "Configurar Novo Setor"}
                </h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                  Configuração de Layout Físico
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-3 text-slate-400 hover:bg-white rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              key={editingSector?.id ?? "new"}
              onSubmit={handleSave}
              className="p-12 space-y-8"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Nome do Ambiente
                </label>
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
                {/* <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Tipo de Canal
                  </label>
                  <select
                    name="type"
                    defaultValue={editingSector?.type ?? SectorType.HALL}
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-[24px] font-bold outline-none"
                  >
                    {Object.values(SectorType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div> */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Qtd. de Mesas
                  </label>
                  <input
                    name="tableCount"
                    type="number"
                    min={0}
                    defaultValue={editingSector?.tableCount ?? 0}
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-[24px] font-black text-xl font-mono text-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-5 font-black text-[10px] uppercase text-slate-400"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-5 bg-indigo-600 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                  Confirmar Setor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
