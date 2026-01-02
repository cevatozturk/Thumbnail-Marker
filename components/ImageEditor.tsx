
import React, { useState, useRef } from 'react';
import { geminiService } from '../services/geminiService';
// Import Icons from constants
import { Icons } from '../constants';

const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [instruction, setInstruction] = useState('');
  const [editing, setEditing] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
        setHasEdited(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async (customInstruction?: string) => {
    const activeInstruction = customInstruction || instruction;
    if (!image || !activeInstruction) return;
    setEditing(true);
    try {
      const result = await geminiService.editThumbnail(image, activeInstruction);
      setImage(result);
      setInstruction('');
      setHasEdited(true);
    } catch (e) {
      console.error(e);
      alert("Editing failed. Please try again.");
    } finally {
      setEditing(false);
    }
  };

  const filters = [
    { label: 'Blur Background', prompt: 'Subject stays sharp, blur the background deeply for bokeh effect' },
    { label: 'Vibrant Colors', prompt: 'Make colors vibrant, professional high-saturation look for YouTube' },
    { label: 'Enhance Sharpness', prompt: 'Enhance details and sharpness for a crisp high-res look' },
    { label: 'Brighten Face', prompt: 'Specifically brighten the face and skin for better expression' },
    { label: 'Cinematic Contrast', prompt: 'Apply a cinematic high-contrast grade with deep blacks and rich highlights' }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h2 className="text-2xl font-bold">AI Visual Retouch</h2>
        <p className="text-gray-500">Edit your image using natural language or apply professional presets.</p>
      </header>

      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-64 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group"
          >
            <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <p className="font-bold text-gray-700">Select Image to Edit</p>
            <p className="text-sm text-gray-400 mt-1">PNG or JPG (Max 10MB)</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="relative group">
              <img src={image} alt="To Edit" className="w-full rounded-2xl shadow-lg border border-gray-100" />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setImage(null)}
                  className="p-2 bg-white/80 backdrop-blur rounded-full shadow-md text-red-500 hover:bg-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            </div>

            <div className="space-y-4">
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Quick Pro Filters</label>
               <div className="flex flex-wrap gap-2">
                {filters.map(f => (
                  <button 
                    key={f.label} 
                    disabled={editing}
                    onClick={() => handleEdit(f.prompt)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all disabled:opacity-50"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <input 
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="e.g., 'Make background black and white' or 'Add warm lighting'..."
                className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
              />
              <button 
                onClick={() => handleEdit()}
                disabled={editing || !instruction}
                className="px-8 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2"
              >
                {editing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Editing...
                  </>
                ) : 'Apply Change'}
              </button>
            </div>

            {hasEdited && (
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Visual optimized successfully.
                </p>
                <a 
                  href={image} 
                  download="thumbnail_ai_final.png"
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
                >
                  <Icons.External />
                  Download PNG
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />
    </div>
  );
};

export default ImageEditor;
