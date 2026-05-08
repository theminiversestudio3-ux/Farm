import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

import { useLanguage } from '../context/LanguageContext';

const schemes = [
  { id: 1, name: 'PM-KISAN Samman Nidhi', desc: 'Provides minimum income support up to ₹6,000 per year to all farmer families.', type: 'Financial', icon: '₹' },
  { id: 2, name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', desc: 'Crop insurance scheme that ensures lower premium burden on farmers.', type: 'Insurance', icon: '🛡️' },
  { id: 3, name: 'Paramparagat Krishi Vikas Yojana', desc: 'Promotes organic farming and bio-fertilizer usage.', type: 'Subsidies', icon: '🌱' },
  { id: 4, name: 'Kusum Scheme', desc: 'Subsidized solar pumps for irrigation to reduce reliance on grid power.', type: 'Equipment', icon: '☀️' },
];

export default function Schemes() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filtered = schemes.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2 mb-2">
          <Icons.Landmark className="text-amber-600" /> {(t as any)('govt_schemes') || 'Government Schemes'}
        </h1>
        <p className="text-sm text-stone-500 font-medium">{(t as any)('discover_grants') || 'Discover grants, insurance, and subsidies available for you.'}</p>
      </div>

      <div className="relative mb-6">
        <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        <input 
          type="text" 
          placeholder={(t as any)('search_schemes') || 'Search schemes...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((scheme, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={scheme.id} 
            className="bg-white p-5 rounded-[2rem] shadow-sm border border-stone-200 flex gap-4"
          >
            <div className="w-12 h-12 flex-shrink-0 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl">
               {scheme.icon}
            </div>
            <div>
               <div className="flex items-start justify-between gap-2 mb-1">
                 <h3 className="font-bold text-stone-800 leading-tight">{scheme.name}</h3>
               </div>
               <span className="text-[10px] uppercase font-bold text-amber-600 mb-2 inline-block py-0.5">{scheme.type}</span>
               <p className="text-xs text-stone-500 leading-relaxed mb-3">
                 {scheme.desc}
               </p>
               <button className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition">
                 {(t as any)('check_eligibility') || 'Check Eligibility'} <Icons.ArrowRight size={14} />
               </button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center p-8 text-stone-400 font-bold">{(t as any)('no_schemes') || 'No schemes found.'}</div>
        )}
      </div>
    </div>
  );
}
