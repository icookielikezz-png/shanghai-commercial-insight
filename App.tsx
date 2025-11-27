import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MapCanvas from './components/MapCanvas';
import { AnalysisData, ToolMode } from './types';

function App() {
  const [toolMode, setToolMode] = useState<ToolMode>(ToolMode.SELECT);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showInfluence, setShowInfluence] = useState(true);
  
  // State lifted up for sharing between Map and Sidebar
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [measureDistance, setMeasureDistance] = useState<number | null>(null);

  return (
    <div className="flex h-screen w-screen bg-slate-900 overflow-hidden font-sans">
      <Sidebar 
        toolMode={toolMode}
        setToolMode={setToolMode}
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
        showInfluence={showInfluence}
        setShowInfluence={setShowInfluence}
        selectedAnalysis={selectedAnalysis}
        loading={loading}
        measureDistance={measureDistance}
      />
      <main className="flex-1 relative z-0">
        <MapCanvas 
          toolMode={toolMode}
          showHeatmap={showHeatmap}
          showInfluence={showInfluence}
          setAnalysisData={setSelectedAnalysis}
          setLoading={setLoading}
          setMeasureDistance={setMeasureDistance}
        />
        
        {/* Helper Badge */}
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-lg z-[400] text-slate-300 text-xs max-w-xs">
          <p className="font-semibold text-white mb-1">使用说明 (Guide)</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>点击 "标注点位" 并在地图上点击任意位置以生成 AI 分析。</li>
            <li>点击 "热力图" 查看模拟人流分布。</li>
            <li>使用 "测距" 工具测量两点间距离。</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;