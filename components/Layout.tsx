
import React from 'react';
import { Home, List, PlusCircle, BrainCircuit, BookOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'اعداد و شمار', icon: Home },
    { id: 'records', label: 'ریکارڈ', icon: List },
    { id: 'add', label: 'نیا اندراج', icon: PlusCircle },
    { id: 'analysis', label: 'تجزیہ', icon: BrainCircuit },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="text-emerald-700" size={24} />
          <h1 className="font-bold text-lg text-slate-800 tracking-tight">قبرستان کا ریکارڈ</h1>
        </div>
      </header>

      {/* Main Content Area - Increased max-width to 6xl for better desktop usage */}
      <main className="flex-1 pb-24 md:pb-8 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-30 md:bottom-auto md:top-20 md:left-8 md:right-auto md:w-20 md:flex-col md:rounded-2xl md:shadow-xl md:border md:py-8 md:gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-emerald-700 bg-emerald-50 md:bg-emerald-700 md:text-white md:p-3 w-full' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 w-full'
              }`}
            >
              <Icon size={isActive ? 24 : 20} />
              <span className="text-[10px] md:hidden font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
