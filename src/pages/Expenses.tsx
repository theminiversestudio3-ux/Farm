import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { crops } from '../data/crops';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';

interface Expense {
  id: string;
  cropId: string;
  category: string;
  amount: number;
  date: string;
  notes: string;
}

export default function Expenses() {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [cropId, setCropId] = useState(crops[0]?.id || '');
  const [category, setCategory] = useState('cat_seeds');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const saved = localStorage.getItem('farm_expenses');
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load expenses");
      }
    }
  }, []);

  const saveExpense = () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    
    const newExpense: Expense = {
      id: Date.now().toString(),
      cropId,
      category,
      amount: parseFloat(amount),
      date,
      notes
    };
    
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    localStorage.setItem('farm_expenses', JSON.stringify(updated));
    
    // Reset form & hide
    setAmount('');
    setNotes('');
    setShowForm(false);
  };

  const deleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    localStorage.setItem('farm_expenses', JSON.stringify(updated));
  };

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const getCropName = (id: string) => crops.find(c => c.id === id)?.name || id;

  const categories = ['cat_seeds', 'cat_fertilizers', 'cat_pesticides', 'cat_labor', 'cat_machinery', 'cat_other'];

  return (
    <div className="p-4 pb-24 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2"><Icons.Wallet className="text-green-700" /> {t('expenses_title' as any) || 'Track Expenses'}</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm transition-transform active:scale-95"
        >
          {showForm ? <Icons.X size={20} /> : <Icons.Plus size={24} />}
        </button>
      </div>

      <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 shadow-sm mb-6 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-stone-500 mb-1">{t('total_expenses' as any) || 'Total Expenses'}</div>
          <div className="text-3xl font-bold text-red-600">₹ {totalExpense.toLocaleString('en-IN')}</div>
        </div>
        <div className="text-stone-300">
           <Icons.Coins size={48} />
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">{t('amount' as any) || 'Amount'}</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500"
                    className="w-full p-3 rounded-xl border border-stone-300 outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 outline-none focus:border-green-500 text-stone-700 bg-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">{t('select_crop' as any) || 'Crop'}</label>
                  <select 
                    value={cropId}
                    onChange={(e) => setCropId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 outline-none focus:border-green-500 bg-white text-stone-700"
                  >
                    {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">{t('category' as any) || 'Category'}</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 outline-none focus:border-green-500 bg-white text-stone-700"
                  >
                    {categories.map(c => <option key={c} value={c}>{t(c as any)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">{t('notes' as any) || 'Notes'}</label>
                <input 
                  type="text" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Urea bags"
                  className="w-full p-3 rounded-xl border border-stone-300 outline-none focus:border-green-500"
                />
              </div>

              <button 
                onClick={saveExpense}
                disabled={!amount}
                className="w-full bg-amber-500 disabled:bg-stone-300 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-sm transition-colors mt-2 flex justify-center items-center gap-2"
              >
                <Icons.Save size={18} /> {t('save' as any) || 'Save'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center text-stone-400 py-10 bg-white/50 rounded-2xl border border-stone-200 border-dashed flex flex-col items-center gap-2">
            <Icons.ReceiptText className="opacity-50" size={32} />
            No expenses logged yet.
          </div>
        ) : (
          expenses.map(exp => (
            <div key={exp.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <div className="font-bold text-stone-800">{t(exp.category as any)}</div>
                  <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                    <Icons.Sprout size={12} /> <span className="font-medium mr-2">{getCropName(exp.cropId)}</span> 
                    <Icons.Calendar size={12} /> <span>{exp.date}</span>
                  </div>
                  {exp.notes && <div className="text-xs text-stone-400 mt-1">{exp.notes}</div>}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="font-bold text-lg text-stone-800">
                  {exp.amount.toLocaleString('en-IN')}
                </div>
                <button 
                  onClick={() => deleteExpense(exp.id)}
                  className="text-stone-300 hover:text-red-500 text-xs font-semibold mt-1 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
