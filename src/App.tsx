import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ModelProvider } from './context/ModelContext';
import Home from './pages/Home';
import Sow from './pages/Sow';
import CropDetail from './pages/CropDetail';
import Expenses from './pages/Expenses';
import DiseaseFinder from './pages/DiseaseFinder';
import Rotation from './pages/Rotation';
import GrowthTracker from './pages/GrowthTracker';
import MarketPrices from './pages/MarketPrices';
import Community from './pages/Community';
import Schemes from './pages/Schemes';
import Expert from './pages/Expert';
import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

function BottomNav() {
  const { t } = useLanguage();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {showMore && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowMore(false)}
        />
      )}
      {showMore && (
        <div className="fixed bottom-16 right-0 m-4 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <NavLink 
            to="/rotation" 
            onClick={() => setShowMore(false)}
            className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive ? 'bg-green-50 text-green-700 font-bold' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <Icons.Recycle size={20} />
            <span className="text-sm">Rotation</span>
          </NavLink>
          <NavLink 
            to="/expenses" 
            onClick={() => setShowMore(false)}
            className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive ? 'bg-green-50 text-green-700 font-bold' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <Icons.Wallet size={20} />
            <span className="text-sm">{t('nav_expenses' as any) || 'Expenses'}</span>
          </NavLink>
          
          <div className="my-2 border-t border-stone-100" />
          <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">Services</div>
          
          <NavLink 
            to="/market" 
            onClick={() => setShowMore(false)}
            className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive ? 'bg-green-50 text-green-700 font-bold' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <Icons.TrendingUp size={20} />
            <span className="text-sm">{t('nav_market') || 'Market Prices'}</span>
          </NavLink>
          <NavLink 
            to="/community" 
            onClick={() => setShowMore(false)}
            className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive ? 'bg-green-50 text-green-700 font-bold' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <Icons.Users size={20} />
            <span className="text-sm">Community</span>
          </NavLink>
          <NavLink 
            to="/schemes" 
            onClick={() => setShowMore(false)}
            className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive ? 'bg-green-50 text-green-700 font-bold' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <Icons.Landmark size={20} />
            <span className="text-sm">Govt Schemes</span>
          </NavLink>
          <NavLink 
            to="/expert" 
            onClick={() => setShowMore(false)}
            className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive ? 'bg-green-50 text-green-700 font-bold' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <Icons.PhoneCall size={20} />
            <span className="text-sm">Ask Expert</span>
          </NavLink>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-7xl mx-auto bg-white border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-green-700' : 'text-stone-400 hover:text-stone-600'}`
            }
          >
            <Icons.Home size={22} />
            <span className="text-[10px] font-semibold">{t('nav_home')}</span>
          </NavLink>
          <NavLink 
            to="/sow" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-green-700' : 'text-stone-400 hover:text-stone-600'}`
            }
          >
            <Icons.Sprout size={22} />
            <span className="text-[10px] font-semibold">{t('nav_sow')}</span>
          </NavLink>
          <NavLink 
            to="/tracker" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-green-700' : 'text-stone-400 hover:text-stone-600'}`
            }
          >
            <Icons.LineChart size={22} />
            <span className="text-[10px] font-semibold">Tracker</span>
          </NavLink>
          <NavLink 
            to="/diagnose" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-green-700' : 'text-stone-400 hover:text-stone-600'}`
            }
          >
            <Icons.ScanSearch size={22} />
            <span className="text-[10px] font-semibold">Diagnose</span>
          </NavLink>
          <button 
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${showMore ? 'text-green-700' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <Icons.Menu size={22} />
            <span className="text-[10px] font-semibold">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}

function OfflineNotice() {
  const { t } = useLanguage();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-100 text-amber-800 text-xs font-semibold text-center p-2 fixed top-0 w-full z-50 shadow-sm border-b border-amber-200">
      ⚠️ {t('offline_msg')}
    </div>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-stone-100 font-sans max-w-7xl mx-auto relative pt-8">
      <OfflineNotice />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sow" element={<Sow />} />
        <Route path="/crop/:id" element={<CropDetail />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/diagnose" element={<DiseaseFinder />} />
        <Route path="/rotation" element={<Rotation />} />
        <Route path="/tracker" element={<GrowthTracker />} />
        <Route path="/market" element={<MarketPrices />} />
        <Route path="/community" element={<Community />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/expert" element={<Expert />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ModelProvider>
        <Router>
          <AppContent />
        </Router>
      </ModelProvider>
    </LanguageProvider>
  );
}
