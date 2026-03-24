
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight, Sparkles, User, UserCheck, AlertOctagon } from 'lucide-react';
import { authService } from '../services/authService';

const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof LoginSchema>;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema)
  });

  const handleQuickLogin = (role: 'ADMIN' | 'CASHIER', status: 'PAID' | 'EXPIRED' | 'TRIAL', tenant: string) => {
    setLoading(true);
    setTimeout(() => {
      authService.login({
        id: `usr_${Math.random().toString(36).substr(2, 5)}`,
        name: role === 'ADMIN' ? 'Administrador Plux' : 'Operador de Caixa',
        email: role === 'ADMIN' ? 'admin@empresa.com' : 'caixa@empresa.com',
        role,
        tenantId: tenant,
        status
      });
      // Navega para a home em vez de dar reload
      navigate('/');
    }, 800);
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    authService.login({
      id: 'usr_1',
      name: 'João Dutra',
      email: data.email,
      role: 'ADMIN',
      tenantId: 'tenant_primary',
      status: 'PAID'
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 font-['Roboto'] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-indigo-600 rounded-[24px] text-white shadow-2xl shadow-indigo-500/20 mb-6 animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">PluxSales <span className="text-indigo-500">SaaS</span></h1>
          <p className="text-slate-400 font-medium">Acesse sua central de inteligência gastronômica.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  {...register('email')}
                  className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" 
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 font-bold ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="password"
                  {...register('password')}
                  className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" 
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-red-400 font-bold ml-1">{errors.password.message}</p>}
            </div>

            <button 
              disabled={loading}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Entrar no Sistema <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center mb-4">Acesso Rápido (Protótipo)</p>
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleQuickLogin('ADMIN', 'PAID', 'empresa_a')}
                  className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all flex flex-col items-center gap-1 group"
                >
                   <UserCheck className="w-4 h-4 text-emerald-400" />
                   <span className="text-[9px] font-bold text-slate-300 uppercase">Dono (Pago)</span>
                </button>
                <button 
                  onClick={() => handleQuickLogin('CASHIER', 'PAID', 'empresa_a')}
                  className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all flex flex-col items-center gap-1 group"
                >
                   <User className="w-4 h-4 text-blue-400" />
                   <span className="text-[9px] font-bold text-slate-300 uppercase">Caixa</span>
                </button>
             </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6 text-slate-600">
           <div className="flex items-center gap-2">
             <Sparkles className="w-4 h-4" />
             <span className="text-[10px] font-bold uppercase tracking-tighter">AI Ready</span>
           </div>
           <div className="w-px h-3 bg-slate-800"></div>
           <div className="flex items-center gap-2">
             <ShieldCheck className="w-4 h-4" />
             <span className="text-[10px] font-bold uppercase tracking-tighter">Secure SaaS</span>
           </div>
        </div>
      </div>
    </div>
  );
};
