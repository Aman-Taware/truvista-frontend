import React, { useState, useEffect, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import {
  Crosshair, Plus, Save, Trash2, X, Info, Link2, Eye,
  MousePointerClick, Navigation
} from 'lucide-react';
import tourApi from '../../../api/tourApi';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../../utils/media';

const TourHotspotEditor = ({ propertyId, scene, allScenes, onHotspotUpdated }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const markersPluginRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [editingHotspot, setEditingHotspot] = useState(null);
  
  // Form state
  const [type, setType] = useState('INFO'); // 'INFO' or 'LINK'
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [label, setLabel] = useState('');
  const [infoText, setInfoText] = useState('');
  const [targetSceneId, setTargetSceneId] = useState('');

  // Setup viewer
  useEffect(() => {
    if (!scene || !containerRef.current) return;

    // Wait for the container to have dimensions
    const initViewer = () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }

      viewerRef.current = new Viewer({
        container: containerRef.current,
        panorama: `${getImageUrl(scene.panoramaUrl)}?cb=1`,
        defaultYaw: scene.initialYaw || 0,
        defaultPitch: scene.initialPitch || 0,
        navbar: ['zoom', 'move', 'caption', 'fullscreen'],
        plugins: [
          [MarkersPlugin, {}]
        ]
      });

      markersPluginRef.current = viewerRef.current.getPlugin(MarkersPlugin);

      // Load existing hotspots with premium styled markers
      if (scene.hotspots && scene.hotspots.length > 0) {
        const markers = scene.hotspots.map(h => ({
          id: h.id.toString(),
          position: { yaw: h.yaw, pitch: h.pitch },
          html: buildMarkerHtml(h),
          data: h
        }));
        
        markersPluginRef.current.setMarkers(markers);
      }

      // Handle click events on the panorama
      viewerRef.current.addEventListener('click', ({ data }) => {
        // If we're in placing mode, we want to capture this point for a NEW hotspot
        if (viewerRef.current.isPlacingMode) {
          viewerRef.current.isPlacingMode = false;
          setIsPlacing(false);
          
          setYaw(data.yaw);
          setPitch(data.pitch);
          setType('INFO');
          setLabel('');
          setInfoText('');
          setTargetSceneId('');
          setEditingHotspot('new');

          // Add a temporary marker
          markersPluginRef.current.addMarker({
            id: 'temp-marker',
            position: { yaw: data.yaw, pitch: data.pitch },
            html: `<div style="
              width: 24px; height: 24px; border-radius: 50%;
              background: linear-gradient(135deg, #ef4444, #dc2626);
              border: 3px solid white;
              box-shadow: 0 2px 12px rgba(239,68,68,0.5), 0 0 0 4px rgba(239,68,68,0.2);
              animation: tempPulse 1.5s ease-in-out infinite;
            "></div>
            <style>
              @keyframes tempPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.15); }
              }
            </style>`,
          });
        }
      });

      // Handle marker clicks
      markersPluginRef.current.addEventListener('select-marker', ({ marker }) => {
        if (marker.id === 'temp-marker') return;
        
        const h = marker.data;
        setEditingHotspot(h.id);
        setYaw(h.yaw);
        setPitch(h.pitch);
        setType(h.type);
        setLabel(h.label || '');
        setInfoText(h.infoText || '');
        setTargetSceneId(h.targetSceneId ? h.targetSceneId.toString() : '');
      });
    };

    // Small timeout to ensure DOM is ready
    const timer = setTimeout(initViewer, 100);

    return () => {
      clearTimeout(timer);
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [scene]);

  // Sync isPlacing state with viewer ref
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.isPlacingMode = isPlacing;
      if (isPlacing) {
        viewerRef.current.container.style.cursor = 'crosshair';
      } else {
        viewerRef.current.container.style.cursor = 'default';
      }
    }
  }, [isPlacing]);

  /** Build styled marker HTML matching the type */
  const buildMarkerHtml = (h) => {
    const isLink = h.type === 'LINK';
    const bgColor = isLink ? 'rgba(59, 130, 246, 0.9)' : 'rgba(245, 158, 11, 0.9)';
    const borderColor = isLink ? 'rgba(96, 165, 250, 0.6)' : 'rgba(251, 191, 36, 0.6)';
    const icon = isLink
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
    const displayLabel = h.label || (isLink ? 'Link' : 'Info');

    return `<div style="
      display: flex; flex-direction: column; align-items: center;
      cursor: pointer; user-select: none;
    ">
      <div style="
        width: 32px; height: 32px; border-radius: 50%;
        background: ${bgColor}; backdrop-filter: blur(4px);
        border: 2px solid ${borderColor};
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 12px rgba(0,0,0,0.3), 0 0 0 3px ${borderColor.replace('0.6', '0.15')};
        transition: transform 0.2s ease;
      "
        onmouseover="this.style.transform='scale(1.15)'"
        onmouseout="this.style.transform='scale(1)'"
      >${icon}</div>
      <div style="
        background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
        color: #fff; padding: 2px 8px; border-radius: 5px;
        font-size: 10px; font-weight: 500; margin-top: 4px;
        white-space: nowrap; border: 1px solid rgba(255,255,255,0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">${displayLabel}</div>
    </div>`;
  };

  const handleStartPlacing = () => {
    setEditingHotspot(null);
    setIsPlacing(true);
    if (markersPluginRef.current) {
      try { markersPluginRef.current.removeMarker('temp-marker'); } catch (_) {}
    }
  };

  const handleCancel = () => {
    setEditingHotspot(null);
    if (markersPluginRef.current) {
      try { markersPluginRef.current.removeMarker('temp-marker'); } catch (_) {}
    }
  };

  const handleSaveInitialView = async () => {
    if (!viewerRef.current) return;
    
    const pos = viewerRef.current.getPosition();
    
    try {
      setLoading(true);
      await tourApi.updateScene(scene.id, {
        name: scene.name,
        displayOrder: scene.displayOrder,
        initialYaw: pos.yaw,
        initialPitch: pos.pitch
      });
      toast.success('Initial view saved successfully');
      if (onHotspotUpdated) onHotspotUpdated();
    } catch (error) {
      console.error('Error saving initial view:', error);
      toast.error('Failed to save initial view');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === 'LINK' && !targetSceneId) {
      toast.error('Please select a target scene');
      return;
    }

    try {
      setLoading(true);
      const data = {
        type,
        yaw,
        pitch,
        label,
        infoText: type === 'INFO' ? infoText : null,
        targetSceneId: type === 'LINK' ? parseInt(targetSceneId) : null
      };

      if (editingHotspot === 'new') {
        await tourApi.addHotspot(scene.id, data);
        toast.success('Hotspot added successfully');
      } else {
        await tourApi.updateHotspot(editingHotspot, data);
        toast.success('Hotspot updated successfully');
      }
      
      setEditingHotspot(null);
      if (markersPluginRef.current) {
        try { markersPluginRef.current.removeMarker('temp-marker'); } catch (_) {}
      }
      if (onHotspotUpdated) onHotspotUpdated();
    } catch (error) {
      console.error('Error saving hotspot:', error);
      toast.error('Failed to save hotspot');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (editingHotspot === 'new') {
      handleCancel();
      return;
    }

    if (!window.confirm('Are you sure you want to delete this hotspot?')) return;

    try {
      setLoading(true);
      await tourApi.deleteHotspot(editingHotspot);
      toast.success('Hotspot deleted successfully');
      setEditingHotspot(null);
      if (onHotspotUpdated) onHotspotUpdated();
    } catch (error) {
      console.error('Error deleting hotspot:', error);
      toast.error('Failed to delete hotspot');
    } finally {
      setLoading(false);
    }
  };

  const otherScenes = allScenes.filter(s => s.id !== scene.id);

  return (
    <div className="space-y-4">
      {/* ── Panorama Viewer ──────────────────────────────────────── */}
      <Card hover={false}>
        {/* Header */}
        <Card.Header className="px-4 sm:px-5 py-3 border-b border-neutral-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-neutral-900 truncate">{scene.name}</h3>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                Click & drag to look around · Scroll to zoom
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveInitialView}
                disabled={loading}
                className="!text-xs flex items-center gap-1.5"
              >
                <Eye size={14} />
                <span className="hidden sm:inline">Save Default View</span>
                <span className="sm:hidden">Save View</span>
              </Button>
              <Button 
                size="sm" 
                onClick={handleStartPlacing} 
                disabled={isPlacing || editingHotspot}
                className={`!text-xs flex items-center gap-1.5 ${isPlacing ? '!bg-emerald-600 hover:!bg-emerald-700' : ''}`}
              >
                {isPlacing ? (
                  <>
                    <MousePointerClick size={14} className="animate-pulse" />
                    <span className="hidden sm:inline">Click panorama…</span>
                    <span className="sm:hidden">Click…</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span className="hidden sm:inline">Add Hotspot</span>
                    <span className="sm:hidden">Add</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card.Header>

        {/* Placing mode banner */}
        {isPlacing && (
          <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Crosshair size={13} className="text-emerald-600 animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm text-emerald-700 font-medium">
                Click anywhere on the panorama to place a hotspot
              </p>
            </div>
            <button
              onClick={() => setIsPlacing(false)}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex-shrink-0 px-2 py-1 rounded hover:bg-emerald-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Panorama container */}
        <div className="p-1 sm:p-1.5">
          <div 
            ref={containerRef} 
            className="w-full bg-neutral-200 rounded-lg overflow-hidden" 
            style={{
              cursor: isPlacing ? 'crosshair' : 'default',
              aspectRatio: window.innerWidth < 640 ? '4/3' : '16/9'
            }}
          />
        </div>

        {/* Existing hotspots summary */}
        {scene.hotspots && scene.hotspots.length > 0 && (
          <div className="px-4 sm:px-5 py-2.5 border-t border-neutral-100 bg-neutral-50/50">
            <div className="flex flex-wrap gap-1.5">
              {scene.hotspots.map(h => (
                <button
                  key={h.id}
                  onClick={() => {
                    const hData = h;
                    setEditingHotspot(hData.id);
                    setYaw(hData.yaw);
                    setPitch(hData.pitch);
                    setType(hData.type);
                    setLabel(hData.label || '');
                    setInfoText(hData.infoText || '');
                    setTargetSceneId(hData.targetSceneId ? hData.targetSceneId.toString() : '');
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    editingHotspot === h.id
                      ? h.type === 'LINK'
                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                        : 'bg-amber-100 text-amber-700 ring-2 ring-amber-300'
                      : h.type === 'LINK'
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                  }`}
                >
                  {h.type === 'LINK' ? <Link2 size={11} /> : <Info size={11} />}
                  {h.label || (h.type === 'LINK' ? 'Link' : 'Info')}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ── Hotspot Editor Form ──────────────────────────────────── */}
      {editingHotspot && (
        <Card
          hover={false}
          className={`border-2 ${
            type === 'LINK'
              ? 'border-blue-200 shadow-blue-100/50'
              : 'border-amber-200 shadow-amber-100/50'
          } shadow-lg`}
        >
          <Card.Header className={`px-4 sm:px-5 py-3 border-b flex justify-between items-center ${
            type === 'LINK' ? 'bg-blue-50/50 border-blue-100' : 'bg-amber-50/50 border-amber-100'
          }`}>
            <h3 className={`font-semibold text-sm sm:text-base flex items-center gap-2 ${
              type === 'LINK' ? 'text-blue-900' : 'text-amber-900'
            }`}>
              {type === 'LINK' ? <Link2 size={16} /> : <Info size={16} />}
              {editingHotspot === 'new' ? 'New Hotspot' : 'Edit Hotspot'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-white/80 transition-colors"
              style={{ minWidth: 36, minHeight: 36 }}
            >
              <X size={18} />
            </button>
          </Card.Header>

          <Card.Body className="p-4 sm:p-5">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Type selector — visual toggle cards */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Hotspot Type</label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setType('INFO')}
                    className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      type === 'INFO'
                        ? 'border-amber-400 bg-amber-50 shadow-sm'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      type === 'INFO' ? 'bg-amber-100' : 'bg-neutral-100'
                    }`}>
                      <Info size={16} className={type === 'INFO' ? 'text-amber-600' : 'text-neutral-400'} />
                    </div>
                    <p className={`text-sm font-medium ${type === 'INFO' ? 'text-amber-900' : 'text-neutral-700'}`}>
                      Information
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Show info popup</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('LINK')}
                    className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      type === 'LINK'
                        ? 'border-blue-400 bg-blue-50 shadow-sm'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      type === 'LINK' ? 'bg-blue-100' : 'bg-neutral-100'
                    }`}>
                      <Navigation size={16} className={type === 'LINK' ? 'text-blue-600' : 'text-neutral-400'} />
                    </div>
                    <p className={`text-sm font-medium ${type === 'LINK' ? 'text-blue-900' : 'text-neutral-700'}`}>
                      Scene Link
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Navigate to scene</p>
                  </button>
                </div>
              </div>
              
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Label <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <input 
                  type="text" 
                  value={label} 
                  onChange={e => setLabel(e.target.value)}
                  placeholder={type === 'LINK' ? "e.g. To Kitchen" : "e.g. TV Info"}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  maxLength={30}
                />
              </div>

              {/* INFO: text area */}
              {type === 'INFO' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Information Text</label>
                  <textarea 
                    value={infoText} 
                    onChange={e => setInfoText(e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                    rows="3"
                    placeholder="Enter the information to display when clicked..."
                    required
                  ></textarea>
                </div>
              )}

              {/* LINK: target scene */}
              {type === 'LINK' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Target Scene</label>
                  {otherScenes.length === 0 ? (
                    <p className="text-sm text-neutral-400 italic">No other scenes available. Add more scenes first.</p>
                  ) : (
                    <div className="space-y-2">
                      {otherScenes.map(s => (
                        <label
                          key={s.id}
                          className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            targetSceneId === s.id.toString()
                              ? 'border-blue-400 bg-blue-50/50'
                              : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="targetScene"
                            value={s.id}
                            checked={targetSceneId === s.id.toString()}
                            onChange={e => setTargetSceneId(e.target.value)}
                            className="sr-only"
                          />
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0">
                            <img
                              src={getImageUrl(s.panoramaUrl)}
                              alt={s.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              targetSceneId === s.id.toString() ? 'text-blue-800' : 'text-neutral-800'
                            }`}>{s.name}</p>
                            <p className="text-[11px] text-neutral-400">{s.hotspots?.length || 0} hotspots</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            targetSceneId === s.id.toString()
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-neutral-300'
                          }`}>
                            {targetSceneId === s.id.toString() && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center pt-3 border-t border-neutral-100 gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDelete}
                  className="!text-red-600 !border-red-200 hover:!bg-red-50 flex items-center justify-center gap-1.5 w-full sm:w-auto"
                  disabled={loading}
                  size="sm"
                >
                  <Trash2 size={14} /> Delete
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                    size="sm"
                    className="flex-1 sm:flex-initial"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    size="sm"
                    className="flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                  >
                    <Save size={14} /> {loading ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </div>
            </form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default TourHotspotEditor;
