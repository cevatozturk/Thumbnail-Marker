
import React from 'react';
import { AppView } from '../types';
import { Icons } from '../constants';

interface LayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  userPlan: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, userPlan, children }) => {
  const navItems = [
    { view: AppView.DASHBOARD, label: 'Dashboard', icon: Icons.Dashboard },
    { view: AppView.GENERATOR, label: 'Studio Generator', icon: Icons.Image },
    { view: AppView.EDITOR, label: 'AI Photo Editor', icon: Icons.Edit },
    { view: AppView.ANALYZER, label: 'CTR Analyzer', icon: Icons.Scan },
    { view: AppView.VOICEOVER, label: 'Voiceover Studio', icon: Icons.Audio },
    { view: AppView.CHAT, label: 'Growth Assistant', icon: Icons.Search },
    { view: AppView.PRICING, label: 'Pricing', icon: Icons.Price },
  ];

  const getPlanStyles = () => {
    switch(userPlan) {
      case 'Creator Pro': return 'from-red-600 to-orange-500 shadow-red-200';
      case 'Agency': return 'from-gray-900 to-gray-800 shadow-gray-200';
      default: return 'from-gray-400 to-gray-500 shadow-gray-100';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold text-red-600 flex items-center gap-2">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded">T</span>
            Thumbnail Master
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  currentView === item.view
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className={`bg-gradient-to-br ${getPlanStyles()} rounded-xl p-4 text-white shadow-lg transition-all duration-500`}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Current Plan</p>
            <p className="font-bold text-lg mb-3">{userPlan}</p>
            {userPlan !== 'Agency' && (
              <button 
                onClick={() => onNavigate(AppView.PRICING)}
                className="w-full py-2 bg-white/20 backdrop-blur hover:bg-white/30 rounded-lg text-xs font-bold transition-all border border-white/10"
              >
                Upgrade Now
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
           <h1 className="text-lg font-bold text-red-600">Thumbnail Master</h1>
           <button onClick={() => onNavigate(AppView.DASHBOARD)} className="p-2 bg-gray-100 rounded-lg">
             <Icons.Dashboard />
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto h-full">
            {children}
          </div>
        </div>

        <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-white shadow-2xl rounded-2xl border border-gray-200 flex justify-around p-3 z-50">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`p-2 rounded-lg ${currentView === item.view ? 'text-red-600 bg-red-50' : 'text-gray-400'}`}
              >
                <Icon />
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
