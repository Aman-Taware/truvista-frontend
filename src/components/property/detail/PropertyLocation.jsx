import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Button from '../../ui/Button';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const PropertyLocation = ({ property, onGetDirections }) => {
  const landmarkTypes = useMemo(() => {
    if (!property.landmarks) return [];
    const types = new Set(property.landmarks.map(lm => lm.type));
    return [...Array.from(types)];
  }, [property.landmarks]);

  const [selectedLandmarkType, setSelectedLandmarkType] = useState(landmarkTypes[0] || '');

  const position = [property.latitude, property.longitude];

  const filteredLandmarks = useMemo(() => {
    if (!property.landmarks || !selectedLandmarkType) return [];
    return property.landmarks.filter(lm => lm.type === selectedLandmarkType);
  }, [property.landmarks, selectedLandmarkType]);

  if (!property.latitude || !property.longitude) {
    return null; // Or a placeholder showing location is unavailable
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border border-neutral-200 my-6">
      <h2 className="text-2xl font-bold text-primary-800 mb-5">Location & Nearby</h2>
      
      {/* Map Section */}
      <div className="relative h-80 w-full rounded-lg overflow-hidden mb-6 border-2 border-neutral-300 shadow-inner z-0">
        <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              {property.name}
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Directions Button */}
      <div className="mb-8">
        <Button onClick={onGetDirections} className="w-full" variant="primary" size="lg">Get Directions</Button>
      </div>

      {/* Landmarks Section */}
      {landmarkTypes.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-primary-700 mb-4">Nearby Landmarks</h3>
          {/* Landmark Type Filters */}
          <div className="flex flex-wrap gap-2 mb-5 pb-3 border-b border-neutral-200">
            {landmarkTypes.map(type => (
              <button 
                key={type}
                onClick={() => setSelectedLandmarkType(type)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 border-2 ${ 
                  selectedLandmarkType === type
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                    : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-primary-100 hover:border-primary-200'
                }`}>
                {type}
              </button>
            ))}
          </div>

          {/* Landmark List */}
          <div className="space-y-4">
            {filteredLandmarks.length > 0 ? (
              filteredLandmarks.map(landmark => (
                <div key={landmark.id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center">
                  <div className="flex-grow pr-4">
                    <p className="text-xs font-medium text-neutral-500">Name</p>
                    <p className="font-semibold text-sm text-neutral-800">{landmark.name}</p>
                  </div>
                  <div className="text-right flex items-baseline space-x-4">
                    <div>
                      <p className="text-xs font-medium text-neutral-500">Distance</p>
                      <p className="font-bold text-sm text-primary-700">{landmark.distanceInKm} km</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500">Time</p>
                      <p className="font-bold text-sm text-secondary-600">~{landmark.timeInMinutes} min</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-center py-4">No landmarks of this type found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyLocation;
