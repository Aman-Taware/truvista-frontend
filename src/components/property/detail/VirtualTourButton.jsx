import React, { useState, useEffect, Component } from 'react';
import { Compass } from 'lucide-react';
import Button from '../../ui/Button';
import VirtualTourViewer from './VirtualTourViewer';
import tourApi from '../../../api/tourApi';

/**
 * Error boundary that isolates any crash inside the heavy PSV viewer
 * so it doesn't unmount the entire PropertyDetail page.
 */
class TourErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('[VirtualTour] Viewer crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center text-white text-center p-8">
          <div>
            <Compass size={48} className="mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-bold mb-2">Virtual Tour Error</h3>
            <p className="text-neutral-400 mb-6 text-sm">{this.state.message}</p>
            <button
              onClick={this.props.onClose}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Close Tour
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Button that checks tour availability and opens the viewer when clicked.
 */
const VirtualTourButton = ({ propertyId }) => {
  const [hasTour, setHasTour] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [tourData, setTourData] = useState(null);
  const [isLoadingTour, setIsLoadingTour] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    tourApi.hasTour(propertyId)
      .then(res => setHasTour(res === true || res?.data === true || res === 'true'))
      .catch(() => setHasTour(false))
      .finally(() => setLoading(false));
  }, [propertyId]);

  const handleOpenTour = async () => {
    if (tourData) { setIsViewerOpen(true); return; }

    setIsLoadingTour(true);
    try {
      const data = await tourApi.getTour(propertyId);
      // data may already be unwrapped by the interceptor; handle both shapes
      const tour = data?.scenes ? data : data?.data;
      if (tour?.scenes?.length > 0) {
        setTourData(tour);
        setIsViewerOpen(true);
      } else {
        console.warn('[VirtualTourButton] Tour has no scenes', data);
      }
    } catch (err) {
      console.error('[VirtualTourButton] Failed to load tour:', err);
    } finally {
      setIsLoadingTour(false);
    }
  };

  const handleClose = () => setIsViewerOpen(false);

  if (loading || !hasTour) return null;

  return (
    <>
      <Button
        onClick={handleOpenTour}
        disabled={isLoadingTour}
        className="w-full btn-outline border-primary-800 text-primary-800 hover:bg-primary-50 py-3"
      >
        <span className="flex items-center justify-center gap-2">
          <Compass size={20} />
          <span>{isLoadingTour ? 'Loading Tour…' : 'Virtual Tour'}</span>
        </span>
      </Button>

      {isViewerOpen && tourData && (
        <TourErrorBoundary onClose={handleClose}>
          <VirtualTourViewer tourData={tourData} onClose={handleClose} />
        </TourErrorBoundary>
      )}
    </>
  );
};

export default VirtualTourButton;
