import { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, DollarSign, Info } from 'lucide-react';

export default function ZakatCalculator() {
  const [cash, setCash] = useState(0);
  const [gold, setGold] = useState(0);
  const [silver, setSilver] = useState(0);
  const [investments, setInvestments] = useState(0);
  const [debts, setDebts] = useState(0);

  const nisabGold = 87.48; // Grams
  const goldPriceIdx = 65; // Approx USD per gram
  const nisabValue = nisabGold * goldPriceIdx;

  const totalAssets = cash + (gold * goldPriceIdx) + investments + silver;
  const netAssets = totalAssets - debts;
  const zakatDue = netAssets >= nisabValue ? netAssets * 0.025 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-10 glass-panel rounded-[3rem] border-white/5 shadow-2xl">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
          <Calculator size={32} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">Zakat Calculator</h3>
          <p className="text-slate-500 font-medium">Calculate your obligatory almsgiving based on current wealth.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Cash & Savings (USD)</label>
          <input 
            type="number" 
            value={cash || ''} 
            onChange={(e) => setCash(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-xl font-bold outline-none focus:border-brand-primary/40 transition-all"
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Gold (Grams)</label>
          <input 
            type="number" 
            value={gold || ''} 
            onChange={(e) => setGold(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-xl font-bold outline-none focus:border-brand-primary/40 transition-all"
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Investments (USD)</label>
          <input 
            type="number" 
            value={investments || ''} 
            onChange={(e) => setInvestments(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-xl font-bold outline-none focus:border-brand-primary/40 transition-all"
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Debts (USD)</label>
          <input 
            type="number" 
            value={debts || ''} 
            onChange={(e) => setDebts(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-xl font-bold outline-none focus:border-brand-primary/40 transition-all"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="bg-brand-depth/50 rounded-3xl p-8 border border-white/5 space-y-6">
        <div className="flex justify-between items-center">
           <span className="text-slate-500 font-bold">Current Nisab (Gold)</span>
           <span className="text-white font-black">${nisabValue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-xl">
           <span className="text-slate-300 font-bold">Net Eligible Wealth</span>
           <span className="text-white font-black">${netAssets.toLocaleString()}</span>
        </div>
        <div className="h-[1px] bg-white/5" />
        <div className="flex justify-between items-center">
           <div>
              <p className="text-brand-primary text-xs font-black uppercase tracking-widest mb-1">Zakat Amount Due (2.5%)</p>
              <h2 className="text-5xl font-black text-white">${zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
           </div>
           {zakatDue > 0 && <div className="bg-brand-primary/20 p-4 rounded-2xl text-brand-primary">
              <DollarSign size={32} />
           </div>}
        </div>
      </div>

      <div className="bg-blue-500/10 p-4 rounded-2xl flex gap-4 text-blue-400 border border-blue-500/20">
        <Info size={20} className="shrink-0" />
        <p className="text-xs font-medium leading-relaxed">
           Your net wealth must exceed the Nisab for one lunar year before Zakat is due. This calculation is an estimate; consult a scholar for complex cases.
        </p>
      </div>
    </div>
  );
}
