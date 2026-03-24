
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  CheckCircle, 
  Package, 
  Loader2, 
  Banknote, 
  QrCode, 
  CreditCard, 
  X,
  Wallet,
  ArrowRight,
  Printer,
  ShieldCheck,
  MapPin,
  ChevronDown,
  Sparkles,
  Zap
} from 'lucide-react';
import { dbService } from '../services/mockDb';
import { api } from '../services/api';
import { Product, Ingredient, PaymentMethod, Sale, Sector, ProductCategory } from '../types';
import { AuraVoiceAssistant } from './AuraVoiceAssistant';

export const SalesPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [cart, setCart] = useState<{ product: Product, qty: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [selectedSector, setSelectedSector] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setProducts(dbService.getProducts());
    setSectors(dbService.getSectors());
    const session = await api.getCurrentSession();
    setCurrentSession(session);
    const initialSectors = dbService.getSectors();
    if (initialSectors.length > 0) setSelectedSector(initialSectors[0].id);
  };

  const total = cart.reduce((acc, item) => acc + (item.product.sale_price * item.qty), 0);
  const totalCost = cart.reduce((acc, item) => acc + (item.product.cmv_total * item.qty), 0);

  const auraSuggestions = useMemo(() => {
    if (cart.length === 0) return [];
    const categoriesInCart = new Set<ProductCategory>(cart.map(i => i.product.category));
    const suggestions: Product[] = [];
    const hasBeverage = Array.from(categoriesInCart).some((c: ProductCategory) => 
      [ProductCategory.REFRIGERANTES, ProductCategory.BEBIDAS_ALCOOL, ProductCategory.VINHOS, ProductCategory.SEM_ALCOOL].includes(c)
    );
    if (!hasBeverage) {
      const bestDrink = products.find(p => [ProductCategory.REFRIGERANTES, ProductCategory.VINHOS].includes(p.category));
      if (bestDrink) suggestions.push(bestDrink);
    }
    return suggestions.slice(0, 2);
  }, [cart, products]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) return { ...item, qty: Math.max(0, item.qty + delta) };
      return item;
    }).filter(item => item.qty > 0));
  };

  const handleCheckout = async () => {
    if (!paymentMethod || !currentSession) return;
    setIsProcessing(true);
    try {
      const sale = await api.processSale(
        cart, 
        paymentMethod, 
        total, 
        totalCost, 
        selectedSector, 
        currentSession.id
      );
      setLastSale({ ...sale, items: cart.map(c => ({ name: c.product.name, qty: c.qty, price_at_sale: c.product.sale_price })), total_revenue: total, payment_method: paymentMethod });
      setCart([]);
      setIsCheckoutOpen(false);
      setIsReceiptOpen(true);
    } catch (e: any) {
      alert("Falha ao sincronizar venda com a nuvem.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentSession) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-[fadeIn_0.3s_ease-out]">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
          <Wallet className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Caixa Fechado</h2>
        <p className="text-slate-500 mb-10 max-w-sm">Você precisa abrir o caixa para realizar vendas Cloud Sync.</p>
        <button onClick={() => navigate('/register')} className="px-10 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3">
          Ir para Gerenciamento <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-[fadeIn_0.4s_ease-out] relative font-['Noto_Sans'] pb-20">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm min-h-[600px]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" /> Cardápio Cloud
            </h2>
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
               <MapPin className="w-4 h-4 text-slate-400" />
               <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} className="bg-transparent border-none font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer text-slate-600">
                 {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
               </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {products.map(p => (
              <button key={p.id} onClick={() => addToCart(p)} className="flex items-center justify-between p-6 border border-slate-100 rounded-[24px] hover:border-indigo-400 hover:shadow-xl transition-all text-left bg-slate-50/30 active:scale-95 group">
                <div>
                  <div className="font-black text-slate-900 group-hover:text-indigo-600 uppercase tracking-tight">{p.name}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">{p.category}</div>
                </div>
                <div className="font-black text-xl text-slate-900 font-mono">R$ {p.sale_price.toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <AuraVoiceAssistant onCommand={(cmd, payload) => {
           if (cmd === "ADD") {
              const p = products.find(prod => prod.name.toLowerCase().includes(payload.toLowerCase()));
              if (p) addToCart(p);
           } else if (cmd === "CHECKOUT") {
              if (cart.length > 0) setIsCheckoutOpen(true);
           }
        }} />
        
        <div className="bg-slate-900 text-white rounded-[40px] shadow-3xl p-8 flex flex-col min-h-[500px] border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-xl font-black flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-indigo-400" /> Checkout
            </h2>
            <span className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{cart.length} itens</span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar relative z-10">
            {cart.map(item => (
              <div key={item.product.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group">
                <div className="flex-1">
                  <div className="text-sm font-black text-white uppercase tracking-tight">{item.product.name}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">R$ {item.product.sale_price.toFixed(2)} un</div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQty(item.product.id, -1)} className="p-1.5 text-slate-500 hover:text-white rounded-lg"><Minus className="w-4 h-4" /></button>
                  <span className="font-black font-mono w-6 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.product.id, 1)} className="p-1.5 text-indigo-500 hover:text-white rounded-lg"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            
            {auraSuggestions.map(p => (
               <button key={p.id} onClick={() => addToCart(p)} className="w-full p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between hover:bg-indigo-600/20 transition-all group">
                  <div className="flex items-center gap-3">
                     <Zap className="w-4 h-4 text-indigo-400" />
                     <div className="text-left">
                        <p className="text-xs font-black text-indigo-100 uppercase">{p.name}</p>
                        <p className="text-[9px] font-bold text-indigo-400">Sugestão Aura</p>
                     </div>
                  </div>
                  <span className="text-xs font-black font-mono text-indigo-200">+R$ {p.sale_price.toFixed(2)}</span>
               </button>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</span>
              <span className="text-4xl font-black font-mono">R$ {total.toFixed(2)}</span>
            </div>
            <button onClick={() => setIsCheckoutOpen(true)} disabled={cart.length === 0} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all">
              Concluir <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
           <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-xl font-black text-slate-900 uppercase">Pagamento</h3>
                 <button onClick={() => setIsCheckoutOpen(false)} className="p-2 text-slate-400"><X /></button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { m: PaymentMethod.PIX, icon: QrCode }, 
                      { m: PaymentMethod.CREDIT_CARD, icon: CreditCard }, 
                      { m: PaymentMethod.DEBIT_CARD, icon: CreditCard }, 
                      { m: PaymentMethod.CASH, icon: Banknote }
                    ].map(({ m, icon: Icon }) => (
                      <button key={m} onClick={() => setPaymentMethod(m)} className={`p-6 rounded-[24px] border-2 flex flex-col items-center gap-3 font-black text-[10px] uppercase transition-all ${paymentMethod === m ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-50 text-slate-400'}`}>
                        <Icon className="w-6 h-6" /> {m}
                      </button>
                    ))}
                 </div>
                 <button onClick={handleCheckout} disabled={!paymentMethod || isProcessing} className="w-full py-6 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                   {isProcessing ? <Loader2 className="animate-spin" /> : <ShieldCheck className="w-5 h-5" />} Finalizar Venda
                 </button>
              </div>
           </div>
        </div>
      )}

      {isReceiptOpen && lastSale && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
           <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-dashed flex flex-col items-center text-center">
                 <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mb-4"><CheckCircle className="w-8 h-8" /></div>
                 <h3 className="text-xl font-black text-slate-900">Venda Realizada!</h3>
                 <p className="text-[10px] text-slate-400 font-black uppercase">Sincronizado com Render Cloud</p>
              </div>
              <div className="p-8 space-y-4">
                 {lastSale.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm font-bold">
                       <span>{item.qty}x {item.name}</span>
                       <span>R$ {(item.qty * item.price_at_sale).toFixed(2)}</span>
                    </div>
                 ))}
                 <div className="pt-4 border-t border-dashed flex justify-between items-center text-lg font-black">
                    <span>Total</span>
                    <span>R$ {lastSale.total_revenue.toFixed(2)}</span>
                 </div>
              </div>
              <div className="p-8 bg-slate-50 flex gap-3">
                 <button onClick={() => setIsReceiptOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase">Fechar</button>
                 <button onClick={() => window.print()} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2"><Printer className="w-4 h-4" /> Cupom</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};