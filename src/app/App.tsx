import React, { useEffect, useState } from 'react';
import { AuthModal } from '@/features/auth/AuthModal';
import { AtlasPage } from '@/features/atlas/AtlasPage';
import { CommunityPage } from '@/features/community/CommunityPage';
import { DiaryPage } from '@/features/diary/DiaryPage';
import { HomePage } from '@/features/home/HomePage';
import { ItineraryPage } from '@/features/itinerary/ItineraryPage';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { ProfileModal } from '@/features/profile/ProfileModal';
import { ShowcasePage, ShowcaseTarget } from '@/features/showcase/ShowcasePage';
import { SplashPage } from '@/features/splash/SplashPage';
import { StudioPage } from '@/features/studio/StudioPage';
import { Navigation } from '@/shared/components/Navigation';
import { apiPost, apiRequest } from '@/shared/lib/api';
import { readLocal, readLocalString, removeLocal, writeLocalString } from '@/shared/lib/storage';
import { AUTH_TOKEN_KEY, ONBOARDING_COMPLETED_KEY, USER_KEY, ITINERARY_DRAFT_KEY } from '@/shared/lib/storageKeys';
import { OnboardingProfile, Tab, UserAccount, ViewState } from '@/shared/types';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.SHOWCASE);
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.HOME);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [onboardingProfile, setOnboardingProfile] = useState<OnboardingProfile | null>(null);
  const [entryTarget, setEntryTarget] = useState<ShowcaseTarget | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // 检查本地存储的认证信息和引导状态
  useEffect(() => {
    const token = readLocalString(AUTH_TOKEN_KEY);
    const storedUser = readLocal<UserAccount | null>(USER_KEY, null);
    const completed = readLocalString(ONBOARDING_COMPLETED_KEY) === 'true';

    if (token && storedUser) {
      setAuthToken(token);
      setUser(storedUser);
      setOnboardingCompleted(completed);
    } else {
      removeLocal(AUTH_TOKEN_KEY);
      removeLocal(USER_KEY);
      setOnboardingCompleted(false);
    }
  }, []);

  const resolveEntryTarget = (target?: ShowcaseTarget | null) =>
    target ?? entryTarget ?? { type: 'app' };

  const goToTarget = (target?: ShowcaseTarget | null) => {
    const resolved = resolveEntryTarget(target);
    if (resolved.type === 'itinerary') {
      setViewState(ViewState.ITINERARY_PLANNER);
      setEntryTarget(null);
      return;
    }
    if (resolved.type === 'tab') {
      setCurrentTab(resolved.tab);
    }
    setViewState(ViewState.APP);
    setEntryTarget(null);
  };

  const handleEnterProduct = (target: ShowcaseTarget = { type: 'app' }) => {
    setEntryTarget(target);
    if (!authToken) {
      setShowAuth(true);
      return;
    }
    if (!onboardingCompleted) {
      setViewState(ViewState.SPLASH);
      return;
    }
    goToTarget(target);
  };

  const handleSplashComplete = () => setViewState(ViewState.ITINERARY_PLANNER);
  const handleSplashSkip = () => goToTarget();

  const handleItineraryComplete = () => {
    setViewState(ViewState.ONBOARDING);
  };
  
  const handleOnboardingFinish = async (profile: OnboardingProfile) => {
    setOnboardingProfile(profile);
    try {
      await apiPost('/users/profile', profile);
    } catch {
      // ignore
    }
    // 标记引导已完成
    writeLocalString(ONBOARDING_COMPLETED_KEY, 'true');
    setOnboardingCompleted(true);
    const postTarget = entryTarget?.type === 'tab' ? entryTarget : { type: 'app' };
    goToTarget(postTarget);
  };

  const handleAuthSuccess = (user: UserAccount, token: string) => {
    setAuthToken(token);
    setUser(user);
    setShowAuth(false);
    
    // 登录成功后，检查是否完成过引导
    const completed = readLocalString(ONBOARDING_COMPLETED_KEY) === 'true';
    setOnboardingCompleted(completed);
    if (completed) {
      // 已完成引导，直接进入应用
      goToTarget();
    } else {
      // 未完成引导，显示欢迎页
      setViewState(ViewState.SPLASH);
    }
  };

  const handleLogout = () => {
    if (authToken) {
      apiRequest('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }).catch(console.error);
    }
    
    removeLocal(AUTH_TOKEN_KEY);
    removeLocal(USER_KEY);
    removeLocal(ITINERARY_DRAFT_KEY); // Clear any saved itinerary draft
    // 注意：不清除 ONBOARDING_COMPLETED_KEY，这样重新登录时不需要再次引导
    setAuthToken(null);
    setUser(null);
    setShowProfile(false);
    setShowAuth(false);
    setEntryTarget(null);
    setViewState(ViewState.SHOWCASE); // 登出后回到展示页
  };

  const handleShowWelcome = () => {
    setEntryTarget(null);
    setViewState(ViewState.SPLASH);
  };

  const handleExitToShowcase = () => {
    setEntryTarget(null);
    setViewState(ViewState.SHOWCASE);
  };

  if (viewState === ViewState.SHOWCASE) {
    return (
      <>
        <ShowcasePage onEnterProduct={handleEnterProduct} />
        {showAuth && (
          <AuthModal
            onSuccess={handleAuthSuccess}
            onCancel={() => setShowAuth(false)}
          />
        )}
      </>
    );
  }

  // 未登录，显示登录/注册界面
  if (!authToken) {
    return (
      <AuthModal
        onSuccess={handleAuthSuccess}
        onCancel={() => setViewState(ViewState.SHOWCASE)}
      />
    );
  }

  // 已登录，但在欢迎页
  if (viewState === ViewState.SPLASH) {
    return <SplashPage onComplete={handleSplashComplete} onSkip={handleSplashSkip} />;
  }

  // 已登录，在行程规划器
  if (viewState === ViewState.ITINERARY_PLANNER) {
    return <ItineraryPage onComplete={handleItineraryComplete} onCancel={() => setViewState(ViewState.APP)} />;
  }

  // 已登录，在引导页
  if (viewState === ViewState.ONBOARDING) {
    return <OnboardingPage onFinish={handleOnboardingFinish} />;
  }

  return (
    <div className="min-h-screen bg-stone-100 font-serif text-ink flex flex-col md:flex-row">
      
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex flex-col w-64 border-r border-stone-200 bg-paper shadow-lg relative z-10 overflow-visible">
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
        <div className="p-4 border-t border-stone-200 overflow-visible">
          {authToken && user ? (
            <button 
              onClick={() => setShowProfile(true)}
              className="w-full flex items-center gap-3 p-3 rounded-sm hover:bg-stone-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-stone-300 rounded-full flex items-center justify-center overflow-hidden border border-stone-100 group-hover:border-stamp transition-colors">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover"/>
                ) : (
                  <span className="text-sm font-bold">{user.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-ink">{user.username}</div>
                <div className="text-xs text-stone-500">{user.email}</div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="w-full bg-ink text-paper py-3 rounded-sm font-serif font-bold hover:bg-black transition-all hover:-translate-y-0.5 hover:shadow-float"
            >
              登录 / 注册
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Wrapper - App Shell: fixed height, internal scroll */}
      <div className="flex-1 flex flex-col h-screen max-w-md md:max-w-none mx-auto md:mx-0 w-full md:shadow-none shadow-2xl relative overflow-hidden bg-stone-100">
        
        {/* Mobile Top Header (Avatar) - Hidden on desktop, floats above content */}
        <div className="md:hidden absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none">
          {authToken && user ? (
            <button 
              onClick={() => setShowProfile(true)}
              className="pointer-events-auto bg-white/80 backdrop-blur rounded-full p-2 shadow-sm border border-stone-200 hover:scale-105 transition-transform group" 
              title="Profile"
            >
              <div className="w-8 h-8 bg-stone-300 rounded-full flex items-center justify-center overflow-hidden border border-stone-100 group-hover:border-stamp transition-colors">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover"/>
                ) : (
                  <span className="text-xs font-bold">{user.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
            </button>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="pointer-events-auto bg-ink text-paper px-4 py-2 rounded-full text-xs font-bold shadow-md hover:bg-black transition-colors"
            >
              登录
            </button>
          )}
        </div>

        {/* Main Content Area - flex-1 takes remaining space, scrolls internally */}
        <main className="flex-1 overflow-y-auto relative w-full scroll-smooth">
          {currentTab === Tab.HOME && <HomePage onNavigate={setCurrentTab} />}
          {currentTab === Tab.MAP && <AtlasPage onNavigate={setCurrentTab} />}
          {currentTab === Tab.DIARY && <DiaryPage />}
          {currentTab === Tab.STUDIO && <StudioPage />}
          {currentTab === Tab.COMMUNITY && <CommunityPage />}
        </main>

        {/* Mobile Bottom Navigation - Fixed at bottom of App Shell, not using fixed positioning */}
        <div className="md:hidden z-50 bg-paper/95 backdrop-blur-md border-t border-stone-200">
          <Navigation currentTab={currentTab} onTabChange={setCurrentTab} isDesktop={false} />
        </div>

        {/* Profile Modal */}
        {showProfile && (
          <ProfileModal 
            user={user} 
            onClose={() => setShowProfile(false)}
            onLogout={handleLogout}
            onShowWelcome={handleShowWelcome}
            onExitToShowcase={handleExitToShowcase}
          />
        )}

        {/* Auth Modal */}
        {showAuth && (
          <AuthModal 
            onSuccess={handleAuthSuccess}
            onCancel={() => setShowAuth(false)}
          />
        )}
      </div>
    </div>
  );
};

export default App;
