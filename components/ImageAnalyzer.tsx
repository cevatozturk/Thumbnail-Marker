
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
// Import Icons from constants
import { Icons } from '../constants';

interface AnalysisData {
  overallScore: number;
  metrics: { label: string; value: number }[];
  colorPsychology?: { color: string; emotion: string }[];
  strengths: string[];
  weaknesses: string[];
  actionPlan: string[];
  eyeTrackingDescription?: string;
}

interface ImageAnalyzerProps {
  initialImage?: string | null;
  onClearImage?: () => void;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ initialImage, onClearImage }) => {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImage) {
      setImage(initialImage);
      handleAnalyze(initialImage);
    }
  }, [initialImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setImage(result);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (imgToAnalyze?: string) => {
    const activeImage = imgToAnalyze || image;
    if (!activeImage) return;
    setAnalyzing(true);
    try {
      const result = await geminiService.analyzeThumbnail(activeImage);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      alert("Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const clear = () => {
    setImage(null);
    setAnalysis(null);
    if (onClearImage) onClearImage();
  };

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-2xl font-bold">CTR Optimization Analysis</h2>
        <p className="text-gray-500">AI-powered visual analytics to predict viewer performance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm h-fit">
            {!image ? (
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="h-96 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group"
               >
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <p className="font-bold text-gray-700">Upload Thumbnail</p>
                  <p className="text-sm text-gray-400 mt-1">Ready for performance testing</p>
               </div>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                  <img src={image} alt="Upload" className="w-full" />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => { clear(); fileInputRef.current?.click(); }}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Replace
                  </button>
                  <button 
                    onClick={() => handleAnalyze()}
                    disabled={analyzing}
                    className="flex-2 py-3 bg-red-600 text-white font-bold rounded-xl disabled:bg-gray-300 shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2 px-6"
                  >
                    {analyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Scanning Pixels...
                      </>
                    ) : 'Run CTR Audit'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {analysis?.colorPsychology && (
             <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm animate-in fade-in duration-500">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Color Psychology</h4>
               <div className="flex flex-wrap gap-4">
                 {analysis.colorPsychology.map((cp, i) => (
                   <div key={i} className="flex items-center gap-2 bg-gray-50 pr-3 rounded-full border border-gray-100">
                     <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{backgroundColor: cp.color}}></div>
                     <span className="text-xs font-semibold text-gray-700">{cp.emotion}</span>
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>

        <div className="lg:col-span-7">
          {analysis ? (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                   <div className="relative w-32 h-32 mb-4">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path className="text-gray-100 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-red-500 stroke-current" strokeWidth="3" strokeDasharray={`${analysis.overallScore * 10}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-gray-900">{analysis.overallScore}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">/ 10 Score</span>
                      </div>
                   </div>
                   <h3 className="font-bold text-gray-800">Estimated CTR</h3>
                   <p className="text-xs text-gray-500 mt-1 leading-tight">Predicted performance compared to niche average.</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Core Metrics</h4>
                  <div className="space-y-4">
                    {analysis.metrics.map((m, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-700">{m.label}</span>
                          <span className="text-red-600">{m.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full transition-all duration-1000 delay-300" style={{ width: `${m.value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {analysis.eyeTrackingDescription && (
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Visual Hierarchy Map</h4>
                   <p className="text-sm text-gray-600 italic leading-relaxed">
                     <span className="text-red-500 font-bold mr-2">Gaze Flow:</span>
                     "{analysis.eyeTrackingDescription}"
                   </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100">
                  <h4 className="text-xs font-bold text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    High Performance Points
                  </h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 bg-green-400 rounded-full shrink-0"></span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100">
                  <h4 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Friction Areas
                  </h4>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 bg-orange-400 rounded-full shrink-0"></span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-gray-900 p-8 rounded-3xl text-white shadow-xl">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                     <Icons.Edit />
                   </div>
                   <h3 className="text-lg font-bold">Optimization Action Plan</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {analysis.actionPlan.map((step, i) => (
                     <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors cursor-default">
                       <span className="text-red-500 font-black text-lg italic leading-none">{i + 1}</span>
                       <p className="text-sm text-gray-300">{step}</p>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/50 border-2 border-dashed border-gray-200 rounded-3xl">
               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 animate-pulse"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
               </div>
               <h4 className="text-xl font-bold text-gray-800">Ready for Analysis?</h4>
               <p className="text-gray-400 max-w-xs mx-auto mt-2">Upload a thumbnail or send one from the generator to discover visual performance and click potential.</p>
            </div>
          )}
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
    </div>
  );
};

export default ImageAnalyzer;
