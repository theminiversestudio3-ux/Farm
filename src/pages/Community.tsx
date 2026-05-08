import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

import { useLanguage } from '../context/LanguageContext';

const mockPosts = [
  { id: 1, author: 'Ramesh Singh', time: '2 hours ago', avatar: 'R', content: 'Has anyone tried the new wheat variety HD-3226? Im planning to sow it this season in MP.', likes: 12, comments: 4, type: 'Question' },
  { id: 2, author: 'Amit Patel', time: '5 hours ago', avatar: 'A', content: 'Pink bollworm attacks seem higher this year. Using Neem oil spray as a preventive measure.', likes: 34, comments: 8, type: 'Tip' },
  { id: 3, author: 'Dr. Sharma', time: '1 day ago', avatar: 'S', content: 'Approaching monsoon means you should check your drainage lines. Here is a quick guide on sloping your fields...', likes: 89, comments: 15, type: 'Expert Advice' },
  { id: 4, author: 'Kisan Krishi', time: '2 days ago', avatar: 'K', content: 'Just sold soybean at 4700/Q. Rates seem to be picking up.', likes: 45, comments: 12, type: 'Market' },
];

export default function Community() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('All');
  
  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <Icons.Users className="text-green-600" /> {(t as any)('farmers_community') || 'Farmers Community'}
        </h1>
        <button className="bg-green-600 text-white p-2 px-4 rounded-full text-sm font-bold shadow-sm shadow-green-600/30">
          {(t as any)('new_post') || 'New Post'}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
        {['all', 'questions', 'tips', 'market_news'].map(tabKey => (
           <button 
             key={tabKey}
             onClick={() => setActiveTab(tabKey)}
             className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tabKey ? 'bg-stone-800 text-white' : 'bg-stone-200/50 text-stone-600'}`}
           >
             {(t as any)(tabKey)}
           </button>
        ))}
      </div>

      <div className="space-y-4">
        {mockPosts.map((post, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={post.id} 
            className="bg-white p-5 rounded-[2rem] shadow-sm border border-stone-200"
          >
            <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {post.avatar}
                 </div>
                 <div>
                    <div className="font-bold text-stone-800 text-sm">{post.author}</div>
                    <div className="text-xs text-stone-400">{post.time}</div>
                 </div>
               </div>
               <span className="text-[10px] uppercase font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{post.type}</span>
            </div>
            
            <p className="text-sm text-stone-600 leading-relaxed mb-4">
              {post.content}
            </p>
            
            <div className="flex items-center gap-4 text-sm font-bold text-stone-400 pt-3 border-t border-stone-100">
               <button className="flex items-center gap-1 hover:text-green-600 transition">
                  <Icons.ThumbsUp size={16} /> {post.likes}
               </button>
               <button className="flex items-center gap-1 hover:text-indigo-600 transition">
                  <Icons.MessageSquare size={16} /> {post.comments}
               </button>
               <button className="flex items-center gap-1 hover:text-stone-600 transition ml-auto">
                  <Icons.Share2 size={16} /> {(t as any)('share') || 'Share'}
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
