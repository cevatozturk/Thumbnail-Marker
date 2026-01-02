
import React, { useState } from 'react';
import { AppView } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ThumbnailGenerator from './components/ThumbnailGenerator';
import ImageEditor from './components/ImageEditor';
import ImageAnalyzer from './components/ImageAnalyzer';
import Voiceover from './components/Voiceover';
import ChatGuide from './components/ChatGuide';
import Pricing from './components/Pricing';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [sharedImage, setSharedImage] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<'Starter' | 'Creator Pro' | 'Agency'>('Starter');

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onNavigate={setCurrentView} currentPlan={userPlan} />;
      case AppView.GENERATOR:
        return (
          <ThumbnailGenerator 
            onAnalyze={(img) => {
              setSharedImage(img);
              setCurrentView(AppView.ANALYZER);
            }} 
          />
        );
      case AppView.EDITOR:
        return <ImageEditor />;
      case AppView.ANALYZER:
        return (
          <ImageAnalyzer 
            initialImage={sharedImage} 
            onClearImage={() => setSharedImage(null)} 
          />
        );
      case AppView.VOICEOVER:
        return <Voiceover />;
      case AppView.CHAT:
        return <ChatGuide />;
      case AppView.PRICING:
        return (
          <Pricing 
            currentPlan={userPlan} 
            onSelectPlan={(plan) => setUserPlan(plan)} 
          />
        );
      default:
        return <Dashboard onNavigate={setCurrentView} currentPlan={userPlan} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView} userPlan={userPlan}>
      {renderView()}
    </Layout>
  );
};

export default App;
