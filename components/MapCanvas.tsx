import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, Polygon, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { AnalysisData, CommercialPoint, LatLng, ToolMode, MeasureLine, HeatmapPoint } from '../types';
import { SHANGHAI_CENTER, MAP_TILE_URL, MAP_ATTRIBUTION } from '../constants';
import { calculateDistance, generateInfluencePolygon, generateMockHeatmapData } from '../utils/geoUtils';
import { analyzeLocation } from '../services/geminiService';

// Fix Leaflet Default Icon issue in React
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const SelectedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapCanvasProps {
  toolMode: ToolMode;
  showHeatmap: boolean;
  showInfluence: boolean;
  setAnalysisData: (data: AnalysisData | null) => void;
  setLoading: (loading: boolean) => void;
  setMeasureDistance: (dist: number | null) => void;
}

const MapEvents = ({ 
  onClick 
}: { 
  onClick: (e: L.LeafletMouseEvent) => void 
}) => {
  useMapEvents({
    click: onClick,
  });
  return null;
};

const MapCanvas: React.FC<MapCanvasProps> = ({ 
  toolMode, 
  showHeatmap, 
  showInfluence, 
  setAnalysisData, 
  setLoading,
  setMeasureDistance 
}) => {
  const [points, setPoints] = useState<CommercialPoint[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [measureLine, setMeasureLine] = useState<MeasureLine | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);

  // Initialize Heatmap Data
  useEffect(() => {
    setHeatmapData(generateMockHeatmapData(SHANGHAI_CENTER, 300));
  }, []);

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    const clickedPos: LatLng = { lat, lng };

    if (toolMode === ToolMode.MARKER) {
      setLoading(true);
      
      // Create temp point
      const newId = Date.now().toString();
      const newPoint: CommercialPoint = {
        id: newId,
        position: clickedPos,
        name: `Location ${points.length + 1}`,
        type: 'mixed',
      };
      
      // Optimistic update
      setPoints(prev => [...prev, newPoint]);
      setSelectedPointId(newId);

      // Fetch AI Analysis
      const data = await analyzeLocation(clickedPos);
      
      // Update point with real data
      setPoints(prev => prev.map(p => 
        p.id === newId ? { ...p, data } : p
      ));
      setAnalysisData(data);
      setLoading(false);
    } 
    else if (toolMode === ToolMode.MEASURE) {
      if (!measureLine || (measureLine.start && measureLine.end)) {
        // Start new line
        setMeasureLine({ start: clickedPos, distance: 0 });
        setMeasureDistance(null);
      } else {
        // Finish line
        const dist = calculateDistance(measureLine.start, clickedPos);
        setMeasureLine({ ...measureLine, end: clickedPos, distance: dist });
        setMeasureDistance(dist);
      }
    }
    else if (toolMode === ToolMode.SELECT) {
      // Deselect if clicking empty space
      setSelectedPointId(null);
      setAnalysisData(null);
    }
  };

  const handleMarkerClick = (point: CommercialPoint) => {
    if (toolMode === ToolMode.SELECT || toolMode === ToolMode.MARKER) {
      setSelectedPointId(point.id);
      if (point.data) {
        setAnalysisData(point.data);
      }
    }
  };

  return (
    <div className="flex-1 h-full relative">
      <MapContainer
        center={SHANGHAI_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution={MAP_ATTRIBUTION}
          url={MAP_TILE_URL}
        />
        
        <MapEvents onClick={handleMapClick} />

        {/* Heatmap Layer (Simulated with CircleMarkers) */}
        {showHeatmap && heatmapData.map((hp, idx) => (
          <CircleMarker
            key={`hm-${idx}`}
            center={[hp.lat, hp.lng]}
            radius={8 + hp.intensity * 10}
            pathOptions={{
              fillColor: hp.intensity > 0.7 ? '#ef4444' : hp.intensity > 0.4 ? '#eab308' : '#3b82f6',
              fillOpacity: 0.3 * hp.intensity,
              stroke: false
            }}
          />
        ))}

        {/* Commercial Points & Influence Polygons */}
        {points.map((point) => {
          const isSelected = point.id === selectedPointId;
          const influencePoly = (isSelected && point.data && showInfluence) 
            ? generateInfluencePolygon(point.position, point.data.influenceRadius) 
            : null;

          return (
            <React.Fragment key={point.id}>
              {/* Influence Polygon */}
              {influencePoly && (
                <Polygon
                  positions={influencePoly.map(p => [p.lat, p.lng])}
                  pathOptions={{
                    color: '#2dd4bf',
                    fillColor: '#2dd4bf',
                    fillOpacity: 0.2,
                    weight: 2,
                    dashArray: '5, 5'
                  }}
                />
              )}

              {/* Core Marker */}
              <Marker
                position={[point.position.lat, point.position.lng]}
                icon={isSelected ? SelectedIcon : DefaultIcon}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e); // Prevent map click
                    handleMarkerClick(point);
                  }
                }}
              >
                <Popup className="custom-popup">
                  <div className="font-sans">
                    <h3 className="font-bold text-gray-800">{point.name}</h3>
                    {point.data ? (
                      <div className="text-xs text-gray-600 mt-1">
                        <p>流量: <span className="font-semibold text-blue-600">{point.data.trafficScore}</span></p>
                        <p>商业: <span className="font-semibold text-teal-600">{point.data.commercialValue}</span></p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Loading analysis...</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Measurement Line */}
        {measureLine && measureLine.start && (
          <>
             <CircleMarker 
              center={[measureLine.start.lat, measureLine.start.lng]} 
              radius={4} 
              pathOptions={{color: 'white', fillColor: '#3b82f6', fillOpacity: 1}} 
            />
            {measureLine.end && (
              <>
                <Polyline 
                  positions={[
                    [measureLine.start.lat, measureLine.start.lng],
                    [measureLine.end.lat, measureLine.end.lng]
                  ]}
                  pathOptions={{ color: '#f59e0b', weight: 3, dashArray: '10, 10' }}
                />
                 <CircleMarker 
                  center={[measureLine.end.lat, measureLine.end.lng]} 
                  radius={4} 
                  pathOptions={{color: 'white', fillColor: '#3b82f6', fillOpacity: 1}} 
                />
                <Marker position={[ (measureLine.start.lat + measureLine.end.lat)/2, (measureLine.start.lng + measureLine.end.lng)/2 ]} opacity={0}>
                   <Popup autoClose={false} closeOnClick={false} className="font-mono font-bold">
                     {(measureLine.distance / 1000).toFixed(2)} km
                   </Popup>
                </Marker>
              </>
            )}
          </>
        )}

      </MapContainer>
    </div>
  );
};

export default MapCanvas;