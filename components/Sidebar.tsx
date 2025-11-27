import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { Layers, MapPin, MousePointer2, Ruler, Activity, Info } from 'lucide-react';
import { AnalysisData, ToolMode } from '../types';

interface SidebarProps {
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
  showHeatmap: boolean;
  setShowHeatmap: (v: boolean) => void;
  showInfluence: boolean;
  setShowInfluence: (v: boolean) => void;
  selectedAnalysis: AnalysisData | null;
  loading: boolean;
  measureDistance: number | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  toolMode,
  setToolMode,
  showHeatmap,
  setShowHeatmap,
  showInfluence,
  setShowInfluence,
  selectedAnalysis,
  loading,
  measureDistance
}) => {
  
  const chartData = selectedAnalysis ? [
    { subject: '人流量', A: selectedAnalysis.trafficScore, fullMark: 100 },
    { subject: '可达性', A: selectedAnalysis.accessibilityScore, fullMark: 100 },
    { subject: '居住密度', A: selectedAnalysis.residentialDensity, fullMark: 100 },
    { subject: '商业价值', A: selectedAnalysis.commercialValue, fullMark: 100 },
  ] : [];

  return (
    <div className="w-96 h-full bg-slate-900 border-r border-slate-700 flex flex-col text-slate-100 shadow-xl z-[1000] overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
          上海商业洞察系统
        </h1>
        <p className="text-xs text-slate-400 mt-1">Shanghai Commercial Insight GIS</p>
      </div>

      {/* Tools Section */}
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">工具箱 (Tools)</h2>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setToolMode(ToolMode.SELECT)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${toolMode === ToolMode.SELECT ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
          >
            <MousePointer2 size={20} className="mb-1" />
            <span className="text-[10px]">选择</span>
          </button>
          <button
            onClick={() => setToolMode(ToolMode.MARKER)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${toolMode === ToolMode.MARKER ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
          >
            <MapPin size={20} className="mb-1" />
            <span className="text-[10px]">标注点位</span>
          </button>
          <button
            onClick={() => setToolMode(ToolMode.MEASURE)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${toolMode === ToolMode.MEASURE ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
          >
            <Ruler size={20} className="mb-1" />
            <span className="text-[10px]">测距</span>
          </button>
        </div>

        {toolMode === ToolMode.MEASURE && measureDistance !== null && (
          <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-600 text-center">
            <span className="text-xs text-slate-400">测量距离</span>
            <div className="text-xl font-mono font-bold text-teal-400">
              {(measureDistance / 1000).toFixed(2)} km
            </div>
          </div>
        )}
      </div>

      {/* Layers Section */}
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers size={14} /> 图层控制 (Layers)
        </h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-slate-300 group-hover:text-white">人流热力图</span>
            <div 
              className={`w-12 h-6 rounded-full p-1 transition-colors ${showHeatmap ? 'bg-blue-600' : 'bg-slate-700'}`}
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${showHeatmap ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-slate-300 group-hover:text-white">商业影响范围</span>
            <div 
              className={`w-12 h-6 rounded-full p-1 transition-colors ${showInfluence ? 'bg-teal-600' : 'bg-slate-700'}`}
              onClick={() => setShowInfluence(!showInfluence)}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${showInfluence ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </label>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity size={14} /> 分析结果 (Analysis)
        </h2>
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 animate-pulse">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm">Gemini AI is thinking...</p>
          </div>
        ) : selectedAnalysis ? (
          <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-2">
             <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                <Info size={14} className="text-blue-400" /> 
                AI 综合评价
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedAnalysis.description}
              </p>
            </div>

            <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#475569" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Metrics"
                    dataKey="A"
                    stroke="#2dd4bf"
                    strokeWidth={2}
                    fill="#2dd4bf"
                    fillOpacity={0.3}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                    itemStyle={{ color: '#2dd4bf' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 p-3 rounded border border-slate-700">
                <div className="text-xs text-slate-400">核心影响半径</div>
                <div className="text-lg font-bold text-teal-400">{selectedAnalysis.influenceRadius} m</div>
              </div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700">
                <div className="text-xs text-slate-400">综合得分</div>
                <div className="text-lg font-bold text-blue-400">
                  {Math.round((selectedAnalysis.trafficScore + selectedAnalysis.commercialValue + selectedAnalysis.accessibilityScore)/3)}
                </div>
              </div>
            </div>
            
             <div className="h-40 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="subject" type="category" width={60} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <Bar dataKey="A" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                 </BarChart>
               </ResponsiveContainer>
             </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
            <p className="text-sm">在地图上选择或添加点位<br/>以查看分析数据</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;