import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Sparkles, 
  Flame, 
  CreditCard, 
  Check, 
  X, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Award, 
  ShoppingBag,
  TrendingUp,
  ArrowLeft,
  ChevronLeft,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

interface CoinShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  currentHasanat?: number;
  onHasanatDeducted?: (amount: number) => void;
  onCoinsPurchased?: (coinsGained: number) => void;
}

export const getStoredCoins = (): number => {
  const stored = localStorage.getItem('sanctuary_coins');
  return stored ? parseInt(stored, 10) : 500; // Starting gift of 500 Noor coins
};

export const updateStoredCoins = (newAmount: number, user?: any) => {
  localStorage.setItem('sanctuary_coins', newAmount.toString());
  window.dispatchEvent(new CustomEvent('sanctuary_coins_updated', { detail: { coins: newAmount } }));
  
  const targetUser = user || auth.currentUser;
  if (targetUser?.uid && !targetUser.uid.startsWith('local_') && !targetUser.uid.startsWith('rest_')) {
    try {
      const userRef = doc(db, 'users', targetUser.uid);
      updateDoc(userRef, { coins: newAmount }).catch(err => {
        console.warn("Firestore coin sync warning:", err);
      });
    } catch (e) {
      console.warn("Firestore coin update exception:", e);
    }
  }
};

export const addStoredCoins = (gained: number, user?: any): number => {
  const current = getStoredCoins();
  const next = Math.max(0, current + gained);
  updateStoredCoins(next, user);
  return next;
};

export const deductStoredCoins = (spent: number, user?: any): boolean => {
  const current = getStoredCoins();
  if (current < spent) return false;
  const next = Math.max(0, current - spent);
  updateStoredCoins(next, user);
  return true;
};

export default function CoinShopModal({
  isOpen,
  onClose,
  currentUser,
  currentHasanat = 0,
  onHasanatDeducted,
  onCoinsPurchased
}: CoinShopModalProps) {
  const [activeTab, setActiveTab] = useState<'hasanat' | 'money'>('hasanat');
  const [coinsBalance, setCoinsBalance] = useState<number>(getStoredCoins());
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [customHasanatInput, setCustomHasanatInput] = useState<string>('');

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail?.coins !== undefined) {
        setCoinsBalance(e.detail.coins);
      }
    };
    window.addEventListener('sanctuary_coins_updated', handleSync);
    return () => window.removeEventListener('sanctuary_coins_updated', handleSync);
  }, []);

  if (!isOpen) return null;

  // Hasanat to Noor Coin Exchange Packages (10 Hasanat = ~1 Noor Coin with volume bonuses)
  const hasanatPackages = [
    { id: 'h1', hasanatCost: 500, coins: 50, bonus: 5, title: 'Seeker Handful' },
    { id: 'h2', hasanatCost: 1500, coins: 180, bonus: 30, title: 'Barakah Purse', popular: true },
    { id: 'h3', hasanatCost: 5000, coins: 750, bonus: 250, title: 'Ummah Chest' },
    { id: 'h4', hasanatCost: 12000, coins: 2000, bonus: 800, title: 'Imperial Vault' },
  ];

  // Real Money Coin Packages
  const moneyPackages = [
    { id: 'm1', usdPrice: 1.99, coins: 250, bonus: 0, title: 'Starter Coin Sack' },
    { id: 'm2', usdPrice: 4.99, coins: 750, bonus: 125, title: 'Spiritual Trader Cache', popular: true },
    { id: 'm3', usdPrice: 9.99, coins: 1800, bonus: 450, title: 'Sultan Gold Treasury' },
    { id: 'm4', usdPrice: 19.99, coins: 4500, bonus: 1500, title: 'Grand Ummah Vault' },
  ];

  // Handle Hasanat Exchange Package
  const handleExchangeHasanat = async (pkg: typeof hasanatPackages[0]) => {
    if (currentHasanat < pkg.hasanatCost) {
      setErrorToast(`You need ${pkg.hasanatCost.toLocaleString()} Hasanat (you currently have ${currentHasanat.toLocaleString()}). Recite Quran or complete prayers to earn more!`);
      setTimeout(() => setErrorToast(null), 4000);
      return;
    }

    setProcessingId(pkg.id);
    try {
      if (onHasanatDeducted) {
        onHasanatDeducted(pkg.hasanatCost);
      }

      const totalCoins = pkg.coins + pkg.bonus;
      const nextCoins = addStoredCoins(totalCoins);
      setCoinsBalance(nextCoins);

      if (currentUser?.uid && !currentUser.uid.startsWith('local_')) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          coins: increment(totalCoins),
          hasanat: increment(-pkg.hasanatCost)
        }).catch(err => console.warn("Firestore coin sync:", err));
      }

      if (onCoinsPurchased) onCoinsPurchased(totalCoins);

      setSuccessToast(`✨ Barakah! Successfully exchanged ${pkg.hasanatCost.toLocaleString()} Hasanat for +${totalCoins} Noor Coins!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (e) {
      console.error(e);
      setErrorToast('Transaction failed. Please try again.');
      setTimeout(() => setErrorToast(null), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Custom Amount Hasanat Exchange
  const handleCustomHasanatExchange = async () => {
    const amount = parseInt(customHasanatInput, 10);
    if (isNaN(amount) || amount < 100) {
      setErrorToast('Please enter at least 100 Hasanat for custom exchange.');
      setTimeout(() => setErrorToast(null), 3500);
      return;
    }
    if (currentHasanat < amount) {
      setErrorToast(`Insufficient Hasanat. You have ${currentHasanat.toLocaleString()} Hasanat.`);
      setTimeout(() => setErrorToast(null), 3500);
      return;
    }

    // Rate: 10 Hasanat = 1 Noor Coin + 10% bonus if > 2000
    const baseCoins = Math.floor(amount / 10);
    const bonus = amount >= 2000 ? Math.floor(baseCoins * 0.15) : 0;
    const totalCoins = baseCoins + bonus;

    setProcessingId('custom');
    try {
      if (onHasanatDeducted) {
        onHasanatDeducted(amount);
      }
      const nextCoins = addStoredCoins(totalCoins);
      setCoinsBalance(nextCoins);

      if (currentUser?.uid && !currentUser.uid.startsWith('local_')) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          coins: increment(totalCoins),
          hasanat: increment(-amount)
        }).catch(err => console.warn("Firestore custom coin sync:", err));
      }

      if (onCoinsPurchased) onCoinsPurchased(totalCoins);

      setSuccessToast(`✨ Exchanged ${amount.toLocaleString()} Hasanat for +${totalCoins.toLocaleString()} Noor Coins!`);
      setCustomHasanatInput('');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (e) {
      console.error(e);
      setErrorToast('Exchange could not be completed.');
      setTimeout(() => setErrorToast(null), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Real Money Purchase (Simulated instant payment + Sendwave support)
  const handleBuyMoneyPackage = async (pkg: typeof moneyPackages[0]) => {
    setProcessingId(pkg.id);
    try {
      await new Promise(res => setTimeout(res, 800));
      const totalCoins = pkg.coins + pkg.bonus;
      const nextCoins = addStoredCoins(totalCoins);
      setCoinsBalance(nextCoins);

      if (currentUser?.uid && !currentUser.uid.startsWith('local_')) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          coins: increment(totalCoins)
        }).catch(err => console.warn("Firestore coin purchase:", err));
      }

      if (onCoinsPurchased) onCoinsPurchased(totalCoins);

      setSuccessToast(`🎉 Success! +${totalCoins.toLocaleString()} Noor Coins credited to your Treasury!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (e) {
      console.error(e);
      setErrorToast('Payment could not be completed.');
      setTimeout(() => setErrorToast(null), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-slate-950 border border-amber-500/30 rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-amber-500/10 space-y-6 overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header with Back Button and Close */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10 text-xs font-black uppercase tracking-wider group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform text-amber-400" />
            <span>Back to Marketplace</span>
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Header Title & Balance Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-black shadow-lg shadow-amber-500/20 shrink-0">
              <Coins size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
                Treasury & Halal Exchange
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white italic">Noor Coin Shop</h2>
            </div>
          </div>

          {/* Current Live Coin & Hasanat Balance */}
          <div className="flex items-center gap-3 bg-black/50 p-2 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/15 rounded-xl border border-amber-500/30">
              <Coins size={15} className="text-amber-400" />
              <div className="text-left">
                <p className="text-[9px] text-amber-300/80 uppercase font-bold">Your Coins</p>
                <p className="text-sm font-black text-amber-400 font-mono">{coinsBalance.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 rounded-xl border border-emerald-500/30">
              <Flame size={15} className="text-emerald-400" />
              <div className="text-left">
                <p className="text-[9px] text-emerald-300/80 uppercase font-bold">Hasanat</p>
                <p className="text-sm font-black text-emerald-400 font-mono">{currentHasanat.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10 w-fit shrink-0">
          <button
            onClick={() => setActiveTab('hasanat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'hasanat'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame size={14} />
            <span>Exchange Hasanat for Coins</span>
          </button>
          <button
            onClick={() => setActiveTab('money')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'money'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard size={14} />
            <span>Buy with Real Money</span>
          </button>
        </div>

        {/* Toasts */}
        <AnimatePresence>
          {successToast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 shrink-0"
            >
              <Check size={16} className="text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </motion.div>
          )}

          {errorToast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold rounded-2xl flex items-center gap-2 shrink-0"
            >
              <X size={16} className="text-red-400 shrink-0" />
              <span>{errorToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Main Content */}
        <div className="overflow-y-auto space-y-6 pr-1 no-scrollbar flex-1">
          {/* Packages Grid */}
          {activeTab === 'hasanat' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Spiritual Exchange Rate</h4>
                    <p className="text-[11px] text-slate-300">
                      Convert earned spiritual deeds (Hasanat) into Noor Coins to trade in the Halal Marketplace!
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-black/40 px-3 py-1 rounded-xl border border-emerald-500/30 whitespace-nowrap">
                  10 Hasanat ≈ 1 Coin
                </span>
              </div>

              {/* Preset Packages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hasanatPackages.map((pkg) => {
                  const canAfford = currentHasanat >= pkg.hasanatCost;
                  return (
                    <div
                      key={pkg.id}
                      className={`relative p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                        pkg.popular
                          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xl'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                          Most Popular
                        </span>
                      )}

                      <div className="space-y-1.5">
                        <p className="text-xs font-black text-white">{pkg.title}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-amber-400 font-mono flex items-center gap-1">
                            <Coins size={18} />
                            {(pkg.coins + pkg.bonus).toLocaleString()}
                          </span>
                          {pkg.bonus > 0 && (
                            <span className="text-[10px] text-emerald-400 font-bold">
                              (+{pkg.bonus} Bonus!)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <div className="text-xs text-slate-400 font-medium">
                          Cost: <strong className="text-white font-mono">{pkg.hasanatCost.toLocaleString()}</strong> Hasanat
                        </div>

                        <button
                          onClick={() => handleExchangeHasanat(pkg)}
                          disabled={processingId === pkg.id || !canAfford}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                            canAfford
                              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md active:scale-95'
                              : 'bg-white/10 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {processingId === pkg.id ? 'Exchanging...' : 'Exchange'}
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Hasanat Amount Converter Box */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white flex items-center gap-2">
                    <Sliders size={14} className="text-emerald-400" />
                    Custom Hasanat Exchange Calculator
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Available: <strong className="text-emerald-400 font-mono">{currentHasanat.toLocaleString()}</strong>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Flame size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={customHasanatInput}
                      onChange={(e) => setCustomHasanatInput(e.target.value)}
                      placeholder="Enter amount (e.g. 2000 Hasanat)..."
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs text-white font-mono outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="px-3 py-2.5 bg-black/40 rounded-2xl border border-white/10 text-center shrink-0">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">You Get</p>
                      <p className="text-xs font-black text-amber-400 font-mono">
                        ≈ {customHasanatInput && !isNaN(parseInt(customHasanatInput, 10)) ? Math.floor(parseInt(customHasanatInput, 10) / 10).toLocaleString() : 0} Coins
                      </p>
                    </div>

                    <button
                      onClick={handleCustomHasanatExchange}
                      disabled={processingId === 'custom' || !customHasanatInput}
                      className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-emerald-500 text-black text-xs font-black uppercase tracking-wider hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw size={13} className={processingId === 'custom' ? 'animate-spin' : ''} />
                      <span>Convert</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-slate-300 font-medium flex items-center justify-between">
                <span>Instantly purchase Noor Coins with Card or Direct Mobile:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {moneyPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                      pkg.popular
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-xl'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider">
                        Best Value
                      </span>
                    )}

                    <div className="space-y-1.5">
                      <p className="text-xs font-black text-white">{pkg.title}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-amber-400 font-mono flex items-center gap-1">
                          <Coins size={18} />
                          {(pkg.coins + pkg.bonus).toLocaleString()}
                        </span>
                        {pkg.bonus > 0 && (
                          <span className="text-[10px] text-amber-300 font-bold">
                            (+{pkg.bonus} Extra)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <div className="text-xs text-slate-400 font-medium">
                        Price: <strong className="text-white font-mono">${pkg.usdPrice.toFixed(2)}</strong> USD
                      </div>

                      <button
                        onClick={() => handleBuyMoneyPackage(pkg)}
                        disabled={processingId === pkg.id}
                        className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
                      >
                        {processingId === pkg.id ? 'Processing...' : `Buy $${pkg.usdPrice.toFixed(2)}`}
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile / Sendwave instructions */}
              <div className="p-3.5 bg-white/5 border border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-slate-400">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Smartphone size={14} />
                  <span>Direct Sendwave / Mobile Money Number:</span>
                </div>
                <p className="text-white font-mono font-bold">+256 708515639</p>
              </div>
            </div>
          )}

          {/* Market Trade Utility Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-200">
            <ShoppingBag size={18} className="text-amber-400 shrink-0" />
            <p className="leading-tight">
              <strong>Halal Market Ready:</strong> Use your Noor Coins to purchase physical and digital Islamic instruments, prayer robes, handcrafted oud, and trade safely with pilgrims worldwide.
            </p>
          </div>
        </div>

        {/* Bottom Back Button Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Sanctuary Market</span>
          </button>

          <span className="text-[10px] text-slate-400 font-mono">
            Treasury Balance: <strong className="text-amber-400 font-mono">{coinsBalance.toLocaleString()} Coins</strong>
          </span>
        </div>
      </motion.div>
    </div>
  );
}

