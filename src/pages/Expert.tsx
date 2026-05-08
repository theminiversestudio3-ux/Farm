import React, { useState } from 'react';
import * as Icons from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

export default function Expert() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  
  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <div className="mb-6 bg-gradient-to-br from-indigo-900 to-indigo-700 p-6 rounded-[2rem] text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl" />
        <Icons.PhoneCall size={32} className="mb-4 text-indigo-300" />
        <h1 className="text-2xl font-black mb-2">{(t as any)('ask_expert') || 'Ask an Expert'}</h1>
        <p className="text-sm text-indigo-200 font-medium leading-relaxed">
          {(t as any)('expert_desc') || 'Get direct advice from verified agronomists and local extension officers about pests, fertilizers, or farm management.'}
        </p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 p-5 mb-6">
         <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-4"><Icons.MessageCircle size={18} className="text-indigo-500" /> {(t as any)('submit_query') || 'Submit your query'}</h3>
         
         <div className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">{(t as any)('topic') || 'Topic'}</label>
             <select className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
               <option>{(t as any)('pest_disease') || 'Pest & Disease'}</option>
               <option>{(t as any)('fertilizer_app') || 'Fertilizer Application'}</option>
               <option>{(t as any)('soil_health') || 'Soil Health'}</option>
               <option>{(t as any)('other') || 'Other'}</option>
             </select>
           </div>
           
           <div>
             <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">{(t as any)('details') || 'Details'}</label>
             <textarea 
               rows={4}
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               placeholder={(t as any)('describe_issue') || 'Describe your issue in detail...'}
               className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
             />
           </div>
           
           <button className="w-full bg-indigo-600 text-white font-bold p-4 rounded-xl shadow-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2">
             <Icons.Send size={18} /> {(t as any)('send_to_expert') || 'Send to Expert'}
           </button>
         </div>
      </div>

      <div className="space-y-3">
         <h3 className="font-bold text-stone-800 text-sm mb-2">{(t as any)('past_consultations') || 'Past Consultations'}</h3>
         <div className="p-4 border border-stone-200 rounded-2xl bg-stone-50 text-center">
            <Icons.History size={24} className="mx-auto text-stone-300 mb-2" />
            <div className="text-sm font-bold text-stone-400">{(t as any)('no_past_queries') || 'No past queries'}</div>
         </div>
      </div>
    </div>
  );
}
