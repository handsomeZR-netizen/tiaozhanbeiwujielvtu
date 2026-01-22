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
    <div className="min-h-screen bg-stone-100 font-serif text-ink flex flex-col md:flex-row">
      
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex flex-col w-64 border-r border-stone-200 bg-paper shadow-lg">
        {/* Logo & Brand */}
        <div className="p-6 border-b border-stone-200">
          <h1 className="text-2xl font-bold text-ink mb-1">无界旅图</h1>
          <p className="text-xs text-stone-500 tracking-[0.2em] uppercase">Boundless Lens</p>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Navigation currentTab={currentTab} onTabChange={setCurrentTab} isDesktop={true} />
        </nav>

        {/* Desktop Profile */}
        <div className="p-4 border-t border-stone-200">
          <button 
            onClick={() => setShowProfile(true)}
            className="w-full flex items-center gap-3 p-3 rounded-sm hover:bg-stone-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-stone-300 rounded-full flex items-center justify-center overflow-hidden border border-stone-100 group-hover:border-stamp transition-colors">
              <img src="https://picsum.photos/100/100" alt="Avatar" className="w-full h-full object-cover"/>
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold text-ink">我的账户</div>
              <div className="text-xs text-stone-500">Profile</div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen max-w-md md:max-w-none mx-auto md:mx-0 w-full md:shadow-none shadow-2xl relative overflow-hidden bg-stone-100">
        
        {/* Mobile Top Header (Avatar) - Hidden on desktop */}
        <div className="md:hidden fixed top-0 left-0 right-0 max-w-md mx-auto z-40 p-4 flex justify-between items-start pointer-events-none">
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
        <main className="flex-1 overflow-y-auto">
          {currentTab === Tab.HOME && <Home onNavigate={setCurrentTab} />}
          {currentTab === Tab.MAP && <MapPage />}
          {currentTab === Tab.DIARY && <Diary />}
          {currentTab === Tab.STUDIO && <Studio />}
          {currentTab === Tab.COMMUNITY && <Community />}
        </main>

        {/* Mobile Bottom Navigation - Hidden on desktop */}
        <div className="md:hidden">
          <Navigation currentTab={currentTab} onTabChange={setCurrentTab} isDesktop={false} />
        </div>

        {/* Profile Modal */}
        {showProfile && (
          <Profile user={userProfile} onClose={() => setShowProfile(false)} />
        )}
      </div>
    </div>
  );
};

export default App;