export interface LatLng {
  lat: number;
  lng: number;
}

export interface AnalysisData {
  trafficScore: number;     // 0-100
  accessibilityScore: number; // 0-100
  residentialDensity: number; // 0-100
  commercialValue: number;    // 0-100
  influenceRadius: number;    // meters
  description: string;
}

export interface CommercialPoint {
  id: string;
  position: LatLng;
  name: string;
  type: 'retail' | 'park' | 'office' | 'mixed';
  data?: AnalysisData;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number; // 0 to 1
}

export enum ToolMode {
  SELECT = 'SELECT',
  MARKER = 'MARKER',
  MEASURE = 'MEASURE',
}

export interface MeasureLine {
  start: LatLng;
  end?: LatLng;
  distance: number; // meters
}