import { LatLng } from './types';

// Shanghai Center
export const SHANGHAI_CENTER: LatLng = {
  lat: 31.2304,
  lng: 121.4737,
};

// Map Tiles (CartoDB Voyager - good for commercial visualization)
export const MAP_TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
export const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Default Gemini Analysis Prompt
export const ANALYSIS_SYSTEM_INSTRUCTION = `
You are an expert urban planner and commercial analyst specializing in Shanghai geography.
Analyze the given coordinates. 
Return a JSON response evaluating the location for a new commercial park or retail center.
Estimate foot traffic, accessibility based on nearby metro/roads, and residential density.
Return strict JSON format.
`;