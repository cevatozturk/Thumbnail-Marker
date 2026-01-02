
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { ThumbnailSEO, AspectRatio } from '../types';
import { Icons } from '../constants';

interface ThumbnailGeneratorProps {
  onAnalyze?: (image: string) => void;
}

const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({ onAnalyze }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [seo, setSeo] = useState<ThumbnailSEO & { imagePrompt: string } | null>(null);
  const [selectedHook, setSelectedHook] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [ratio, setRatio] = useState<AspectRatio>('16:9');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);

  useEffect(() => {
    if (seo?.hooks?.length) {
      setSelectedHook(seo.hooks[0]);
    }
  }, [seo]);

  const handleGenerateSEO = async () => {
    if (!title) return;
    setLoading(true);
    try {
      const data = await geminiService.generateSEOAndPrompt(title, description);
      setSeo(data);
    } catch (e) {
      console.error(e);
      alert("Could not generate SEO strategy.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!seo || !selectedHook) return;
    setGeneratingImage(true);
    try {
      const targetTitle = seo.suggestedTitle || title;
      const img = await geminiService.generateThumbnailImage(
        seo.imagePrompt, 
        selectedHook, 
        targetTitle,
        ratio
      );
      setGeneratedImage(img);
    } catch (e) {
      console.error(e);
      alert("Image generation failed. Please try again.");
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Studio Thumbnail Generator</h2>
          <p className="text-gray-500">High-speed, SEO-driven production powered by Gemini 2.5 Flash.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           1080p Optimized Output
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-700">Video Details</h3>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Video Title</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., How to Grow on YouTube in 2025"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Brief Summary / Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly explain what happens in the video..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none resize-none"
              />
            </div>
            <button 
              onClick={handleGenerateSEO}
              disabled={loading || !title}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:bg-gray-300 transition-colors flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Analyzing Content...
                </>
              ) : 'Generate SEO Strategy'}
            </button>
          </div>

          {seo && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="font-semibold text-gray-700">Visual Configuration</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-2">
                   <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Main Heading to Add</p>
                   <p className="text-sm font-bold text-blue-900 leading-tight">"{seo.suggestedTitle || title}"</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Secondary Text (Select a Hook)</label>
                  <div className="space-y-2">
                    {seo.hooks.map((hook, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedHook(hook)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-between ${
                          selectedHook === hook 
                          ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-500/20' 
                          : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span>"{hook}"</span>
                        {selectedHook === hook && (
                          <div className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '16:9', label: 'YouTube (16:9)' },
                      { id: '9:16', label: 'Shorts (9:16)' },
                      { id: '1:1', label: 'Square (1:1)' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setRatio(opt.id as AspectRatio)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          ratio === opt.id 
                          ? 'bg-black border-black text-white' 
                          : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleGenerateImage}
                disabled={generatingImage || !selectedHook}
                className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:bg-gray-300 transition-all flex justify-center items-center gap-2 shadow-xl shadow-red-200"
              >
                {generatingImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Processing Layout...
                  </>
                ) : (
                  <>
                    <Icons.Image />
                    Generate Thumbnail with Text
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {!seo && !generatedImage && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-gray-400">
                <Icons.Image />
              </div>
              <h4 className="font-bold text-gray-700">Studio Preview</h4>
              <p className="text-gray-500 text-sm max-w-[200px] mt-2">Enter details to generate SEO-focused hooks and visuals.</p>
            </div>
          )}

          {seo && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5 animate-in fade-in duration-500">
               <div className="flex items-center justify-between">
                 <h3 className="font-bold text-lg text-red-600">Growth Roadmap</h3>
                 <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded">STRATEGY READY</span>
               </div>
               <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Optimized Title</span>
                    <p className="font-semibold text-gray-800 leading-snug">{seo.suggestedTitle}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Strategic Keywords</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {seo.keywords.map(kw => (
                        <span key={kw} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md border border-gray-200">#{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Visual Concept</span>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{seo.strategy}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {seo.colors.map(c => (
                      <div key={c} className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" style={{backgroundColor: c}} title={c}></div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {generatedImage && (
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xl animate-in zoom-in duration-300">
               <div className="relative rounded-xl overflow-hidden shadow-inner bg-gray-100">
                 <img src={generatedImage} alt="Generated Thumbnail" className="w-full" />
                 <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-lg">
                   Final Output
                 </div>
               </div>
               <div className="mt-4 flex flex-col gap-3">
                 <div className="flex gap-4">
                   <a 
                     href={generatedImage} 
                     download={`${title.slice(0, 20)}_thumbnail.png`}
                     className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl text-center hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                   >
                     <Icons.External />
                     Download PNG
                   </a>
                   <button 
                    onClick={() => onAnalyze && onAnalyze(generatedImage)}
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl text-center hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                   >
                     <Icons.Scan />
                     Run CTR Analysis
                   </button>
                 </div>
                 <button 
                  onClick={() => setGeneratedImage(null)}
                  className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                 >
                   Design New Visual
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThumbnailGenerator;
