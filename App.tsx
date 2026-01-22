import React, { useState } from 'react';
import { ViewState, Tab, UserProfile } from './types';
import { Navigation } from './components/Navigation';
import { Splash } from './pages/Splash';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { MapPage } from './pages/MapPage';
import { Diary } from './pages/Diary';
import { Studio } from './pages/Studio';
import { Community } from './pages/Community';
import { Profile } from './pages/Profile';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.SPLASH);
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.HOME);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const handleSplashComplete = () => setViewState(ViewState.ONBOARDING);
  const handleSplashSkip = () => setViewState(ViewState.APP);
  
  const handleOnboardingFinish = (profile: UserProfile) => {
    setUserProfile(profile);
    setViewState(ViewState.APP);
  };

  if (viewState === ViewState.SPLASH) {
    return <Splash onComplete={handleSplashComplete} onSkip={handleSplashSkip} />;
  }

  if (viewState === ViewState.ONBOARDING) {
    return <Onboarding onFinish={handleOnboardingFinish} />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-stone-100 shadow-2xl overflow-hidden relative font-serif text-ink">
      
      {/* Top Header (Avatar) */}
      <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-40 p-4 flex justify-between items-start pointer-events-none">
        <button 
            onClick={() => setShowProfile(true)}
            className="pointer-events-auto bg-white/80 backdrop-blur rounded-full p-2 shadow-sm border border-stone-200 hover:scale-105 transition-transform group" 
            title="Profile"
        >
           <div className="w-8 h-8 bg-stone-300 rounded-full flex items-center justify-center overflow-hidden border border-stone-100 group-hover:border-stamp transition-colors">
                <img src="https://picsum.photos/100/100" alt="Avatar" className="w-full h-full object-cover"/>
           </div>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="min-h-screen">
        {currentTab === Tab.HOME && <Home onNavigate={setCurrentTab} />}
        {currentTab === Tab.MAP && <MapPage />}
        {currentTab === Tab.DIARY && <Diary />}
        {currentTab === Tab.STUDIO && <Studio />}
        {currentTab === Tab.COMMUNITY && <Community />}
      </main>

      {/* Bottom Navigation */}
      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Profile Modal */}
      {showProfile && (
        <Profile user={userProfile} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default App;