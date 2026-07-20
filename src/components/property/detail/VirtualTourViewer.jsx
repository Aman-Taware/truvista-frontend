import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import { X, Info, Compass, ChevronDown, RotateCcw, AlertTriangle } from 'lucide-react';
import { getImageUrl } from '../../../utils/media';

/**
 * Virtual Tour Viewer Component — Premium Mobile-First Design
 * Renders the 360° panorama walkthrough using Photo Sphere Viewer v5.
 *
 * Architecture:
 * - VirtualTourPlugin handles scene transitions (LINK hotspots → navigation arrows)
 * - MarkersPlugin handles INFO hotspot bubbles (information pop-ups)
 * - Both plugins are registered. The VirtualTourPlugin calls MarkersPlugin internally
 *   for INFO markers via the `markers` array on each node.
 */
const VirtualTourViewer = ({ tourData, onClose }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [activeInfo, setActiveInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [currentSceneName, setCurrentSceneName] = useState('');
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Animate modal in after state change
  useEffect(() => {
    if (activeInfo) {
      requestAnimationFrame(() => setShowInfoModal(true));
    } else {
      setShowInfoModal(false);
    }
  }, [activeInfo]);

  const handleCloseInfo = useCallback(() => {
    setShowInfoModal(false);
    setTimeout(() => setActiveInfo(null), 300);
  }, []);

  useEffect(() => {
    console.log('[PSV] tourData received:', tourData);
    if (!tourData || !tourData.scenes || tourData.scenes.length === 0 || !containerRef.current) {
      console.warn('[PSV] Guard hit — skipping init. scenes:', tourData?.scenes?.length, 'container:', !!containerRef.current);
      return;
    }

    // Destroy any previous viewer instance
    if (viewerRef.current) {
      try { viewerRef.current.destroy(); } catch (_) {}
      viewerRef.current = null;
    }

    setError(null);
    setIsReady(false);

    // ── Build PSV node list ────────────────────────────────────────────
    // IMPORTANT: Append ?v=psv to every panorama URL.
    // Without this, the browser returns a cached version of the image that was
    // previously fetched WITHOUT crossOrigin headers (e.g. by an <img> tag in
    // TourSceneManager). Three.js/WebGL will silently refuse a tainted cached
    // image → PSV stays on the loading screen forever.
    const addCacheBuster = (url) => {
      if (!url || url === '/placeholder.svg') return url;
      return url.includes('?') ? `${url}&v=psv` : `${url}?v=psv`;
    };

    const psvNodes = tourData.scenes.map(scene => {
      const baseUrl = getImageUrl(scene.panoramaUrl);
      const panoramaUrl = addCacheBuster(baseUrl);
      console.log(`[PSV] Scene ${scene.id} "${scene.name}" panorama:`, panoramaUrl);

      const links = (scene.hotspots || [])
        .filter(h => h.type === 'LINK' && h.targetSceneId)
        .map(h => ({
          nodeId: String(h.targetSceneId),
          position: { yaw: Number(h.yaw) || 0, pitch: Number(h.pitch) || 0 },
          ...(h.label ? { name: h.label } : {}),
        }));

      // IMPORTANT: markers go here on each node — NOT in MarkersPlugin config
      const markers = (scene.hotspots || [])
        .filter(h => h.type === 'INFO')
        .map(h => ({
          id: `info-${h.id}`,
          position: { yaw: Number(h.yaw) || 0, pitch: Number(h.pitch) || 0 },
          html: `<div class="vt-marker">
            <div class="vt-marker__pulse"></div>
            <div class="vt-marker__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
            </div>
            ${h.label ? `<div class="vt-marker__label">${h.label}</div>` : ''}
          </div>`,
          tooltip: h.label || 'Information',
          data: { infoText: h.infoText, label: h.label },
        }));

      console.log(`[PSV] Scene ${scene.id}: ${links.length} links, ${markers.length} markers`);

      return {
        id: String(scene.id),
        panorama: panoramaUrl,
        thumbnail: panoramaUrl,
        name: scene.name,
        caption: scene.name,
        links,
        markers,
        defaultYaw: Number(scene.initialYaw) || 0,
        defaultPitch: Number(scene.initialPitch) || 0,
      };
    });

    const startNodeId = String(tourData.startSceneId || tourData.scenes[0].id);
    const startNode = psvNodes.find(n => n.id === startNodeId) || psvNodes[0];
    console.log('[PSV] Starting at node:', startNode.id, 'panorama:', startNode.panorama);

    // Set initial scene info
    setCurrentSceneName(startNode.name);
    const startIdx = psvNodes.findIndex(n => n.id === startNode.id);
    setCurrentSceneIndex(startIdx >= 0 ? startIdx : 0);

    // ── Delay init until browser has painted the overlay ───────────────────
    let rafId;
    rafId = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const { width, height } = containerRef.current.getBoundingClientRect();
      console.log('[PSV] Container dimensions at init:', width, 'x', height);

      try {
        viewerRef.current = new Viewer({
          container: containerRef.current,
          // Do NOT set `panorama` here — VirtualTourPlugin manages panorama
          // loading via its own startNodeId/nodes. Setting both causes a
          // double-load conflict that results in an infinite reload loop.
          navbar: ['zoom', 'move', 'caption', 'fullscreen'],
          loadingImg: null,
          touchmoveTwoFingers: false,
          mousewheelCtrlKey: false,
          plugins: [
            MarkersPlugin,          // NO config — VirtualTourPlugin owns marker state
            [VirtualTourPlugin, {
              positionMode: 'manual',
              renderMode: '3d',
              nodes: psvNodes,
              startNodeId: startNode.id,
            }],
          ],
        });

        console.log('[PSV] Viewer created successfully');

        // Confirm panorama actually loaded
        viewerRef.current.addEventListener('ready', () => {
          console.log('[PSV] ✅ Panorama ready and rendered!');
        });

        viewerRef.current.addEventListener('panorama-loaded', () => {
          console.log('[PSV] ✅ Panorama texture loaded!');
        });

        // Track scene changes for the navigation pill
        const virtualTourPlugin = viewerRef.current.getPlugin(VirtualTourPlugin);
        if (virtualTourPlugin) {
          virtualTourPlugin.addEventListener('node-changed', ({ node }) => {
            setCurrentSceneName(node.name || '');
            const idx = psvNodes.findIndex(n => n.id === node.id);
            setCurrentSceneIndex(idx >= 0 ? idx : 0);
          });
        }

        // Wire up INFO marker clicks
        const markersPlugin = viewerRef.current.getPlugin(MarkersPlugin);
        if (markersPlugin) {
          markersPlugin.addEventListener('select-marker', ({ marker }) => {
            console.log('[PSV] Marker clicked:', marker.id, marker.data);
            if (marker.data?.infoText) {
              setActiveInfo({
                title: marker.data.label || 'Information',
                text: marker.data.infoText,
              });
            }
          });
        }

        // Catch PSV runtime errors
        viewerRef.current.addEventListener('error', (err) => {
          console.error('[PSV] Viewer runtime error:', err);
          setError(String(err?.error?.message || err));
        });

        setIsReady(true);
      } catch (err) {
        console.error('[PSV] Failed to initialise viewer:', err);
        setError(err.message || 'Failed to load virtual tour');
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      console.log('[PSV] Destroying viewer');
      if (viewerRef.current) {
        try { viewerRef.current.destroy(); } catch (_) {}
        viewerRef.current = null;
      }
    };
  }, [tourData]);

  // Escape key handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeInfo) handleCloseInfo();
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeInfo, onClose, handleCloseInfo]);

  const totalScenes = tourData?.scenes?.length || 0;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">

      {/* ── Animated gradient accent line ─────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-30 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 animate-pulse" />

      {/* ── Glassmorphic Header ──────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex justify-between items-start p-3 sm:p-4 md:p-5 bg-gradient-to-b from-black/70 via-black/40 to-transparent">
          <div className="pointer-events-auto min-w-0 flex-1 mr-3">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-serif text-white m-0 flex items-center gap-1.5 sm:gap-2 truncate">
              <Compass size={18} className="text-amber-400 flex-shrink-0 sm:w-5 sm:h-5" />
              <span className="truncate">{tourData?.propertyName || 'Virtual Tour'}</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-white/60 mt-0.5 hidden sm:block">
              360° Walkthrough · drag to look around
            </p>
          </div>
          <button
            onClick={onClose}
            className="pointer-events-auto p-2.5 sm:p-3 bg-white/10 hover:bg-white/25 active:bg-white/30 rounded-full transition-all duration-200 backdrop-blur-md border border-white/10 flex-shrink-0"
            aria-label="Close virtual tour"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <X size={20} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* ── Viewer container ─────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: 0 }}>
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      </div>

      {/* ── Scene Navigation Pill ────────────────────────────────── */}
      {isReady && totalScenes > 0 && (
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-xl border border-white/15 rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 shadow-2xl">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-medium whitespace-nowrap">
              {currentSceneName}
            </span>
            {totalScenes > 1 && (
              <span className="text-white/40 text-[10px] sm:text-xs font-mono">
                {currentSceneIndex + 1}/{totalScenes}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Error state ─────────────────────────────────────────────────── */}
      {error && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle size={28} className="text-red-400 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Could not load tour</h3>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setError(null); }}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/25 rounded-xl transition-colors text-white text-sm font-medium flex items-center gap-2 border border-white/10"
                style={{ minHeight: 44 }}
              >
                <RotateCcw size={15} /> Retry
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-xl transition-colors text-white text-sm font-medium border border-white/10"
                style={{ minHeight: 44 }}
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom marker styles ─────────────────────────────────────────── */}
      <style>{`
        /* ── Marker container ── */
        .vt-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          user-select: none;
          position: relative;
        }

        /* ── Pulse ring animation ── */
        .vt-marker__pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 48px;
          height: 48px;
          margin: -24px 0 0 -24px;
          border-radius: 50%;
          background: rgba(245, 158, 11, 0.25);
          animation: vt-pulse 2.5s ease-out infinite;
          pointer-events: none;
        }

        @keyframes vt-pulse {
          0% {
            transform: scale(0.6);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        /* ── Marker icon ── */
        .vt-marker__icon {
          position: relative;
          z-index: 1;
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 2px solid rgba(245, 158, 11, 0.6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b45309;
          box-shadow:
            0 4px 16px rgba(0, 0, 0, 0.35),
            0 0 0 3px rgba(245, 158, 11, 0.15);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.25s ease,
                      background 0.2s ease;
        }

        .vt-marker:hover .vt-marker__icon {
          transform: scale(1.2);
          background: #fff;
          border-color: #f59e0b;
          box-shadow:
            0 6px 24px rgba(0, 0, 0, 0.45),
            0 0 0 4px rgba(245, 158, 11, 0.25);
        }

        .vt-marker:active .vt-marker__icon {
          transform: scale(1.05);
        }

        /* ── Marker label ── */
        .vt-marker__label {
          position: relative;
          z-index: 1;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #fff;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          margin-top: 6px;
          white-space: nowrap;
          letter-spacing: 0.01em;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* ── PSV navbar polish ── */
        .psv-navbar {
          background: rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        /* ── Mobile-specific: larger touch targets ── */
        @media (max-width: 640px) {
          .vt-marker__icon {
            width: 40px;
            height: 40px;
          }
          .vt-marker__pulse {
            width: 52px;
            height: 52px;
            margin: -26px 0 0 -26px;
          }
          .vt-marker__label {
            font-size: 10px;
            padding: 2px 8px;
          }
        }

        /* ── Info modal animations ── */
        .vt-modal-backdrop {
          transition: opacity 0.3s ease;
        }
        .vt-modal-backdrop--hidden { opacity: 0; }
        .vt-modal-backdrop--visible { opacity: 1; }

        /* Desktop: centered card */
        @media (min-width: 641px) {
          .vt-modal-card {
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
          }
          .vt-modal-backdrop--hidden .vt-modal-card {
            transform: scale(0.92);
            opacity: 0;
          }
          .vt-modal-backdrop--visible .vt-modal-card {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Mobile: bottom-sheet */
        @media (max-width: 640px) {
          .vt-modal-card {
            transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          }
          .vt-modal-backdrop--hidden .vt-modal-card {
            transform: translateY(100%);
          }
          .vt-modal-backdrop--visible .vt-modal-card {
            transform: translateY(0);
          }
        }
      `}</style>

      {/* ── INFO modal — bottom-sheet on mobile, centered card on desktop ── */}
      {activeInfo && (
        <div
          className={`absolute inset-0 z-30 flex sm:items-center sm:justify-center items-end vt-modal-backdrop ${showInfoModal ? 'vt-modal-backdrop--visible' : 'vt-modal-backdrop--hidden'}`}
          onClick={handleCloseInfo}
        >
          {/* Backdrop tint */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          {/* Modal card */}
          <div
            className="vt-modal-card relative w-full sm:max-w-md sm:mx-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Mobile: drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 bg-white rounded-t-2xl">
              <div className="w-10 h-1 rounded-full bg-neutral-300" />
            </div>

            <div className="bg-white text-neutral-900 px-5 pb-5 pt-3 sm:p-6 md:p-8 sm:rounded-2xl rounded-t-none sm:shadow-2xl max-h-[70vh] sm:max-h-[65vh] flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Info size={16} className="text-amber-600 sm:w-[18px] sm:h-[18px]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-neutral-900 m-0 truncate">
                    {activeInfo.title}
                  </h3>
                </div>
                <button
                  onClick={handleCloseInfo}
                  className="ml-3 text-neutral-400 hover:text-neutral-700 active:text-neutral-900 p-2 rounded-full hover:bg-neutral-100 transition-colors flex-shrink-0"
                  aria-label="Close"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-neutral-100 mb-3 sm:mb-4" />

              {/* Content */}
              <div className="text-neutral-600 text-sm leading-relaxed overflow-y-auto flex-1 overscroll-contain">
                {activeInfo.text.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">{line}</p>
                ))}
              </div>

              {/* Mobile: Close button at bottom */}
              <div className="sm:hidden mt-4 pt-3 border-t border-neutral-100">
                <button
                  onClick={handleCloseInfo}
                  className="w-full py-3 text-center text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded-xl transition-colors"
                  style={{ minHeight: 48 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualTourViewer;
