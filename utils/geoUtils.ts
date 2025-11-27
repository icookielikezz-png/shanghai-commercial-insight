import { LatLng } from "../types";

// Haversine formula for distance in meters
export const calculateDistance = (point1: LatLng, point2: LatLng): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

// Generate a somewhat irregular polygon to simulate real-world travel zones (isochrone-ish)
export const generateInfluencePolygon = (center: LatLng, radiusMeters: number): LatLng[] => {
  const points: LatLng[] = [];
  const numPoints = 12; // 12 points for a rough circle/blob
  const angleStep = 360 / numPoints;
  
  // Earth radius approximation adjustment for degrees
  const metersPerLat = 111320;
  
  for (let i = 0; i < numPoints; i++) {
    const angle = i * angleStep;
    const rad = (angle * Math.PI) / 180;
    
    // Add some "noise" to radius to make it look organic (like road networks)
    const noise = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    const currentRadius = radiusMeters * noise;
    
    const latOffset = (currentRadius * Math.cos(rad)) / metersPerLat;
    const lngOffset = (currentRadius * Math.sin(rad)) / (metersPerLat * Math.cos((center.lat * Math.PI) / 180));
    
    points.push({
      lat: center.lat + latOffset,
      lng: center.lng + lngOffset
    });
  }
  
  return points;
};

// Generate dummy heatmap data around Shanghai center
export const generateMockHeatmapData = (center: LatLng, count: number): Array<{lat: number, lng: number, intensity: number}> => {
  const data = [];
  for (let i = 0; i < count; i++) {
    // Random spread within ~5km
    const lat = center.lat + (Math.random() - 0.5) * 0.1;
    const lng = center.lng + (Math.random() - 0.5) * 0.12;
    data.push({
      lat,
      lng,
      intensity: Math.random()
    });
  }
  return data;
};