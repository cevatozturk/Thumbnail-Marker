
import React from 'react';
import { AppView } from '../types';
import { Icons } from '../constants';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
  currentPlan?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, currentPlan = 'Starter' }) => {
  const stats = [
    { label: 'Generated', value: '12', icon: Icons.Image },
    { label: 'Analyzed', value: '4', icon: Icons.Scan },
    { label: 'Current Plan', value: currentPlan, icon: Icons.Price },
  ];

  const tools = [
    { 
      view: AppView.GENERATOR, 
      title: 'Studio Generator', 
      desc: 'SEO-optimized and 4K supported thumbnail designs.',
      color: 'bg-blue-50 text-blue-600',
      icon: Icons.Image
    },
    { 
      view: AppView.EDITOR, 
      title: 'AI Photo Editor', 
      desc: 'Retouch your images in seconds using natural language.',
      color: 'bg-purple-50 text-purple-600',
      icon: Icons.Edit
    },
    { 
      view: AppView.ANALYZER, 
      title: 'CTR Optimizer', 
      desc: 'Test your imagery with AI to maximize click-through rates.',
      color: 'bg-green-50 text-green-600',
      icon: Icons.Scan
    },
    { 
      view: AppView.VOICEOVER, 
      title: 'Pro Voiceover', 
      desc: 'Turn scripts into viral-ready YouTube narrations.',
      color: 'bg-orange-50 text-orange-600',
      icon: Icons.Audio
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back, Creator!</h2>
        <p className="text-gray-500 mt-1">What would you like to create for your next viral video today?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
              <s.icon />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <button
            key={tool.view}
            onClick={() => onNavigate(tool.view)}
            className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${tool.color}`}>
              <tool.icon />
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-red-600 transition-colors">{tool.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{tool.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-red-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-red-200">
        <div className="relative z-10 max-w-lg">
          <h3 className="text-2xl font-bold mb-4">Monetize Your Creative Services</h3>
          <p className="mb-6 opacity-90 leading-relaxed">Thousands of creators use our Pro platform to build high-converting thumbnails for major brands. Stand out with 4K exports and SEO support.</p>
          <button 
             onClick={() => onNavigate(AppView.PRICING)}
             className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            {currentPlan === 'Creator Pro' ? 'Manage Plan' : 'Go Pro'}
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
      </div>
    </div>
  );
};

export default Dashboard;
