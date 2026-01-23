import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AtlasControls } from '@/features/atlas/components/AtlasControls';
import { AtlasHeader } from '@/features/atlas/components/AtlasHeader';
import { AtlasListPanel } from '@/features/atlas/components/AtlasListPanel';
import { AtlasMapPanel } from '@/features/atlas/components/AtlasMapPanel';
import { AtlasNearbyModal } from '@/features/atlas/components/AtlasNearbyModal';
import { AtlasPoiDetail } from '@/features/atlas/components/AtlasPoiDetail';
import { AtlasRouteOverlay } from '@/features/atlas/components/AtlasRouteOverlay';
import { AtlasStoryOverlay } from '@/features/atlas/components/AtlasStoryOverlay';
import { AtlasToast } from '@/features/atlas/components/AtlasToast';
import { useAtlasData } from '@/features/atlas/hooks/useAtlasData';
import { useAtlasMap } from '@/features/atlas/hooks/useAtlasMap';
import { useAtlasStory } from '@/features/atlas/hooks/useAtlasStory';
import { useAtlasUiState } from '@/features/atlas/hooks/useAtlasUiState';
import { CATEGORIES } from '@/features/atlas/atlas.data';
import { Tab } from '@/shared/types';

type AtlasPageProps = {
  onNavigate?: (tab: Tab) => void;
};

export const AtlasPage: React.FC<AtlasPageProps> = ({ onNavigate }) => {
  const {
    mode,
    setMode,
    headerCollapsed,
    setHeaderCollapsed,
    mapCollapsed,
    setMapCollapsed,
    showNearbyModal,
    setShowNearbyModal,
    showRouteDetail,
    setShowRouteDetail,
    toast,
    pushToast,
    autoLocate,
    setAutoLocate,
    travelMode,
    setTravelMode,
  } = useAtlasUiState();
  const [mapReady, setMapReady] = useState(false);

  const {
    city,
    cityInput,
    setCityInput,
    keyword,
    setKeyword,
    activeCategory,
    setActiveCategory,
    location,
    locating,
    pois,
    loadingPois,
    selectedPoi,
    weather,
    routeInfo,
    aiContext,
    aiTags,
    loadingAi,
    accuracyMeters,
    isOnline,
    favorites,
    checkins,
    cityHistory,
    searchHistory,
    citySuggestions,
    showCityPanel,
    setShowCityPanel,
    citySearchLoading,
    lastQuery,
    fitVersion,
    centerVersion,
    cityOptions,
    getPosition,
    handleSelectPoi,
    applyCity,
    loadPois,
    loadRoute,
    loadAiContext,
    locateUser,
    toggleFavorite,
    addCheckin,
    sharePoi,
    clearSearchHistory,
  } = useAtlasData({
    autoLocate,
    mapReady,
    travelMode,
    pushToast,
    setShowRouteDetail,
  });

  const { mapContainerRef, mapError, showMapFallback, hasMapKey } = useAtlasMap({
    mode,
    location,
    pois,
    selectedPoi,
    onSelectPoi: handleSelectPoi,
    mapCollapsed,
    mapReady,
    setMapReady,
    autoLocate,
    fitVersion,
    centerVersion,
  });

  const {
    open: storyOpen,
    arc: storyArc,
    currentScene,
    currentIndex,
    loading: storyLoading,
    error: storyError,
    startStory,
    regenerateStory,
    selectScene,
    nextScene,
    prevScene,
    checkinScene,
    closeStory,
    setOpen: setStoryOpen,
  } = useAtlasStory({
    city,
    location,
    onSelectPoi: handleSelectPoi,
    onCheckin: addCheckin,
  });

  const handleStartStory = () => {
    if (storyArc && !storyLoading) {
      setStoryOpen(true);
      return;
    }
    const isRecommend = activeCategory === CATEGORIES[0];
    startStory({
      theme: isRecommend ? '城市漫游' : activeCategory,
      keyword: keyword.trim() || undefined,
      sceneCount: 3,
    });
  };

  const handleNavigateDiary = () => {
    if (onNavigate) onNavigate(Tab.DIARY);
  };

  const handleRouteScene = () => {
    if (!currentScene) return;
    loadRoute({
      id: currentScene.poi.id,
      name: currentScene.poi.name,
      lng: currentScene.poi.lng,
      lat: currentScene.poi.lat,
      address: currentScene.poi.address,
    });
  };

  const isFavorite = selectedPoi ? favorites.some((item) => item.id === selectedPoi.id) : false;
  const hasCheckin = selectedPoi ? checkins.some((item) => item.id === selectedPoi.id) : false;
  return (
    <div className="min-h-full bg-paper pb-8 bg-texture">
      <AtlasHeader
        headerCollapsed={headerCollapsed}
        onToggleHeader={() => setHeaderCollapsed(!headerCollapsed)}
        mode={mode}
        onToggleMode={() => setMode(mode === 'map' ? 'list' : 'map')}
        keyword={keyword}
        onKeywordChange={(value) => setKeyword(value)}
        onSearch={loadPois}
        searchHistory={searchHistory}
        onSelectHistory={(term) => {
          setKeyword(term);
          setActiveCategory('推荐');
          loadPois({ keyword: term, category: '推荐' });
        }}
        onClearHistory={clearSearchHistory}
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={(category) => {
          setActiveCategory(category);
          setKeyword('');
          loadPois({ category, keyword: '' });
        }}
        cityInput={cityInput}
        onCityInputChange={(value) => setCityInput(value)}
        onApplyCity={(value) => {
          if (autoLocate) {
            setAutoLocate(false);
          }
          applyCity(value);
        }}
        citySuggestions={citySuggestions}
        cityHistory={cityHistory}
        cityOptions={cityOptions}
        showCityPanel={showCityPanel}
        onShowCityPanel={(value) => setShowCityPanel(value)}
        citySearchLoading={citySearchLoading}
        city={city}
        weather={weather}
        locating={locating}
        onLocate={locateUser}
        accuracyMeters={accuracyMeters}
        onStartStory={handleStartStory}
        storyLoading={storyLoading}
      />

      {!isOnline && (
        <div className="mx-5 mt-4 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
          <AlertTriangle size={14} />
          当前离线，正在使用缓存数据
        </div>
      )}

      <div className="p-5 space-y-5">
        <AtlasControls
          autoLocate={autoLocate}
          onToggleAutoLocate={() => setAutoLocate((prev) => !prev)}
          travelMode={travelMode}
          onSetTravelMode={setTravelMode}
        />
        {mode === 'map' && (
          <AtlasMapPanel
            mapCollapsed={mapCollapsed}
            onToggleMapCollapsed={() => setMapCollapsed((prev) => !prev)}
            mapContainerRef={mapContainerRef}
            mapReady={mapReady}
            mapError={mapError}
            loadingPois={loadingPois}
            showMapFallback={showMapFallback}
            hasMapKey={hasMapKey}
            pois={pois}
            selectedPoi={selectedPoi}
            onSelectPoi={handleSelectPoi}
            getPosition={getPosition}
            onOpenNearby={() => setShowNearbyModal(true)}
          />
        )}

        {mode === 'list' && (
          <AtlasListPanel loading={loadingPois} pois={pois} lastQuery={lastQuery} onSelectPoi={handleSelectPoi} />
        )}

        <AtlasNearbyModal
          open={showNearbyModal}
          pois={pois}
          onSelectPoi={handleSelectPoi}
          onClose={() => setShowNearbyModal(false)}
        />

        {selectedPoi && (
          <AtlasPoiDetail
            poi={selectedPoi}
            routeInfo={routeInfo}
            showRouteDetail={showRouteDetail}
            onToggleRouteDetail={() => setShowRouteDetail((prev) => !prev)}
            loadingAi={loadingAi}
            aiContext={aiContext}
            aiTags={aiTags}
            isFavorite={isFavorite}
            hasCheckin={hasCheckin}
            onLoadRoute={() => loadRoute(selectedPoi)}
            onLoadAi={() => loadAiContext(selectedPoi)}
            onToggleFavorite={() => toggleFavorite(selectedPoi)}
            onAddCheckin={() => addCheckin(selectedPoi)}
            onShare={() => sharePoi(selectedPoi)}
          />
        )}
      </div>

      <AtlasToast message={toast} />
      <AtlasRouteOverlay
        routeInfo={routeInfo}
        show={Boolean(routeInfo && showRouteDetail)}
        travelMode={travelMode}
        onSetTravelMode={setTravelMode}
        onClose={() => setShowRouteDetail(false)}
      />
      <AtlasStoryOverlay
        open={storyOpen}
        loading={storyLoading}
        error={storyError}
        arc={storyArc}
        currentScene={currentScene}
        currentIndex={currentIndex}
        onClose={closeStory}
        onSelectScene={selectScene}
        onPrev={prevScene}
        onNext={nextScene}
        onRoute={handleRouteScene}
        onCheckin={checkinScene}
        onRegenerate={regenerateStory}
        onNavigateDiary={onNavigate ? handleNavigateDiary : undefined}
      />
    </div>
  );
};
