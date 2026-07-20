import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, MapPin, Compass, Layers, ChevronRight } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Container from '../../components/ui/Container';
import Card from '../../components/ui/Card';
import tourApi from '../../api/tourApi';
import propertyApi from '../../api/propertyApi';
import { getImageUrl } from '../../utils/media';
import TourSceneManager from '../../components/admin/tour/TourSceneManager';
import TourHotspotEditor from '../../components/admin/tour/TourHotspotEditor';
import toast from 'react-hot-toast';

const TourEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 'scenes' or 'hotspots' view
  const [view, setView] = useState('scenes');
  const [activeSceneId, setActiveSceneId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propData, tourData] = await Promise.all([
        propertyApi.getPropertyById(id),
        tourApi.getTour(id).catch(err => {
          // It's fine if tour doesn't exist yet, it just returns 404
          if (err.response && err.response.status === 404) {
            return { scenes: [] };
          }
          throw err;
        })
      ]);
      
      setProperty(propData);
      setTour(tourData);
      
      if (tourData && tourData.scenes && tourData.scenes.length > 0 && !activeSceneId) {
        setActiveSceneId(tourData.scenes[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load property data');
    } finally {
      setLoading(false);
    }
  };

  const handleSceneAdded = (newScene) => {
    fetchData(); // Refresh to get all scenes
    setActiveSceneId(newScene.id);
  };

  const handleSceneUpdated = () => {
    fetchData();
  };

  const handleSceneDeleted = (deletedSceneId) => {
    if (activeSceneId === deletedSceneId) {
      setActiveSceneId(null);
    }
    fetchData();
  };

  const activeScene = tour?.scenes?.find(s => s.id === activeSceneId);

  if (loading) {
    return (
      <AdminLayout>
        <Container className="py-8">
          {/* Shimmer loading skeleton */}
          <div className="animate-pulse">
            <div className="h-6 w-48 bg-neutral-200 rounded mb-2" />
            <div className="h-9 w-72 bg-neutral-200 rounded mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-14 h-14 bg-neutral-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-neutral-200 rounded mb-2" />
                      <div className="h-3 w-16 bg-neutral-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-3">
                <div className="h-80 bg-neutral-200 rounded-xl" />
              </div>
            </div>
          </div>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container className="py-4 sm:py-6">
        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="mb-5 sm:mb-6">
          <Link
            to="/admin/properties"
            className="inline-flex items-center text-sm text-neutral-500 hover:text-primary-600 mb-2 transition-colors group"
          >
            <ArrowLeft size={15} className="mr-1 group-hover:-translate-x-0.5 transition-transform" />
            Back to Properties
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <Compass size={18} className="text-primary-600" />
              </div>
              Virtual Tour Editor
            </h1>
            {property?.name && (
              <span className="text-xs sm:text-sm font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200 self-start">
                {property.name}
              </span>
            )}
          </div>
        </div>

        {/* ── Tab Switcher ────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-5 sm:mb-6">
          <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200/50">
            <button
              onClick={() => setView('scenes')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                view === 'scenes'
                  ? 'bg-white text-primary-700 shadow-sm border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Layers size={15} />
              <span className="hidden xs:inline">Scenes</span>
            </button>
            <button
              onClick={() => { if (activeSceneId) setView('hotspots'); }}
              disabled={!activeSceneId}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                !activeSceneId
                  ? 'opacity-40 cursor-not-allowed text-neutral-400'
                  : view === 'hotspots'
                    ? 'bg-white text-primary-700 shadow-sm border border-neutral-200/80'
                    : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <MapPin size={15} />
              <span className="hidden xs:inline">Hotspots</span>
            </button>
          </div>
          
          {/* Active scene indicator in tab bar */}
          {activeScene && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 ml-2">
              <ChevronRight size={14} className="text-neutral-300" />
              <span className="font-medium text-neutral-700">{activeScene.name}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">

          {/* ── Mobile: Horizontal Scene Strip ────────────────────── */}
          <div className="lg:hidden">
            {tour?.scenes?.length > 0 && (
              <div className="flex gap-2.5 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-neutral-300">
                {tour.scenes.map(scene => (
                  <button
                    key={scene.id}
                    onClick={() => setActiveSceneId(scene.id)}
                    className={`flex-shrink-0 snap-start rounded-xl overflow-hidden transition-all duration-200 ${
                      activeSceneId === scene.id
                        ? 'ring-2 ring-primary-500 ring-offset-2 shadow-md'
                        : 'ring-1 ring-neutral-200 opacity-80 hover:opacity-100'
                    }`}
                    style={{ width: 110 }}
                  >
                    <div className="aspect-[4/3] bg-neutral-200 relative">
                      <img
                        src={getImageUrl(scene.panoramaUrl)}
                        alt={scene.name}
                        className="w-full h-full object-cover"
                      />
                      {activeSceneId === scene.id && (
                        <div className="absolute inset-0 bg-primary-500/10" />
                      )}
                    </div>
                    <div className="p-1.5 bg-white">
                      <p className={`text-[11px] font-medium truncate ${
                        activeSceneId === scene.id ? 'text-primary-700' : 'text-neutral-700'
                      }`}>
                        {scene.name}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {scene.hotspots?.length || 0} hotspots
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Desktop: Sidebar ──────────────────────────────────── */}
          <div className="hidden lg:block lg:col-span-1">
            <Card hover={false}>
              <Card.Header className="px-4 py-3 border-b border-neutral-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-neutral-800 flex items-center gap-1.5">
                    <Layers size={15} className="text-neutral-400" />
                    Tour Scenes
                  </h3>
                  <span className="text-[11px] font-medium text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                    {tour?.scenes?.length || 0}
                  </span>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {tour?.scenes?.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 flex items-center justify-center">
                      <ImageIcon size={20} className="text-neutral-400" />
                    </div>
                    <p className="text-neutral-500 text-sm mb-1">No scenes yet</p>
                    <p className="text-neutral-400 text-xs">Add your first scene to get started</p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 max-h-[calc(100vh-280px)] overflow-y-auto overscroll-contain">
                    {tour.scenes.map(scene => (
                      <button
                        key={scene.id}
                        onClick={() => setActiveSceneId(scene.id)}
                        className={`w-full p-3 flex items-center gap-3 text-left transition-all duration-150 ${
                          activeSceneId === scene.id
                            ? 'bg-primary-50/80 border-l-[3px] border-l-primary-500'
                            : 'hover:bg-neutral-50 border-l-[3px] border-l-transparent'
                        }`}
                      >
                        <div className={`w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0 transition-shadow ${
                          activeSceneId === scene.id ? 'ring-2 ring-primary-300 shadow-sm' : ''
                        }`}>
                          <img
                            src={getImageUrl(scene.panoramaUrl)}
                            alt={scene.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="overflow-hidden flex-1 min-w-0">
                          <h4 className={`text-sm font-medium truncate ${
                            activeSceneId === scene.id ? 'text-primary-700' : 'text-neutral-900'
                          }`}>
                            {scene.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                              (scene.hotspots?.length || 0) > 0 ? 'bg-emerald-400' : 'bg-neutral-300'
                            }`} />
                            <span className="text-xs text-neutral-500">
                              {scene.hotspots?.length || 0} hotspot{(scene.hotspots?.length || 0) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={14} className={`flex-shrink-0 transition-colors ${
                          activeSceneId === scene.id ? 'text-primary-400' : 'text-neutral-300'
                        }`} />
                      </button>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>

          {/* ── Main Content ──────────────────────────────────────── */}
          <div className="lg:col-span-3">
            {view === 'scenes' ? (
              <TourSceneManager 
                propertyId={id} 
                scenes={tour?.scenes || []} 
                activeScene={activeScene}
                onSceneAdded={handleSceneAdded}
                onSceneUpdated={handleSceneUpdated}
                onSceneDeleted={handleSceneDeleted}
              />
            ) : activeScene ? (
              <TourHotspotEditor 
                propertyId={id}
                scene={activeScene}
                allScenes={tour?.scenes || []}
                onHotspotUpdated={fetchData}
              />
            ) : (
              <Card hover={false} className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                  <MapPin size={24} className="text-neutral-400" />
                </div>
                <p className="text-neutral-600 font-medium mb-1">No scene selected</p>
                <p className="text-neutral-400 text-sm">Select a scene to start editing hotspots</p>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </AdminLayout>
  );
};

export default TourEditor;
