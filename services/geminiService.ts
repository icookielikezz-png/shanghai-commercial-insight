import { GoogleGenAI, Type } from "@google/genai";
import { ANALYSIS_SYSTEM_INSTRUCTION } from "../constants";
import { AnalysisData, LatLng } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeLocation = async (position: LatLng): Promise<AnalysisData> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock data.");
    return mockAnalysis(position);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the commercial viability of coordinate: ${position.lat}, ${position.lng} in Shanghai.`,
      config: {
        systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trafficScore: { type: Type.NUMBER, description: "Estimated foot traffic score 0-100" },
            accessibilityScore: { type: Type.NUMBER, description: "Transport accessibility score 0-100" },
            residentialDensity: { type: Type.NUMBER, description: "Surrounding residential density 0-100" },
            commercialValue: { type: Type.NUMBER, description: "Overall commercial potential 0-100" },
            influenceRadius: { type: Type.NUMBER, description: "Estimated primary influence radius in meters (e.g., 500-3000)" },
            description: { type: Type.STRING, description: "Short qualitative analysis (max 2 sentences)" }
          },
          required: ["trafficScore", "accessibilityScore", "residentialDensity", "commercialValue", "influenceRadius", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text) as AnalysisData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return mockAnalysis(position);
  }
};

// Fallback if no API key or error
const mockAnalysis = (position: LatLng): AnalysisData => {
  return {
    trafficScore: Math.floor(Math.random() * 40) + 50,
    accessibilityScore: Math.floor(Math.random() * 30) + 60,
    residentialDensity: Math.floor(Math.random() * 50) + 40,
    commercialValue: Math.floor(Math.random() * 40) + 50,
    influenceRadius: 800 + Math.random() * 1000,
    description: "Simulated Analysis: High density area with potential for retail expansion due to nearby metro access."
  };
};