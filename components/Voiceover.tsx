
import React, { useState } from 'react';
import { geminiService, decode, decodeAudioData } from '../services/geminiService';

const VOICES = [
  { id: 'Kore', name: 'Kore (Balanced)', gender: 'Male' },
  { id: 'Puck', name: 'Puck (Youthful)', gender: 'Male' },
  { id: 'Charon', name: 'Charon (Deep)', gender: 'Male' },
  { id: 'Zephyr', name: 'Zephyr (Bright)', gender: 'Female' },
  { id: 'Fenrir', name: 'Fenrir (Commanding)', gender: 'Male' },
];

const TONES = [
  { id: 'cheerfully', name: 'Cheerful' },
  { id: 'professionally', name: 'Professional' },
  { id: 'excitedly', name: 'Excited' },
  { id: 'seriously', name: 'Serious' },
  { id: 'calmly', name: 'Calm' },
  { id: 'dramatically', name: 'Dramatic' },
];

const PACES = [
  { id: 'slowly', name: 'Slow' },
  { id: 'at a normal pace', name: 'Normal' },
  { id: 'quickly', name: 'Fast' },
];

const Voiceover: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [selectedTone, setSelectedTone] = useState(TONES[1].id);
  const [selectedPace, setSelectedPace] = useState(PACES[1].id);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text || loading) return;
    setLoading(true);
    try {
      // Build a style instruction like "Say professionally and at a normal pace"
      const styleInstruction = `Say ${selectedTone} and ${selectedPace}`;
      const base64 = await geminiService.textToSpeech(text, selectedVoice, styleInstruction);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const buffer = await decodeAudioData(decode(base64), audioCtx, 24000, 1);
      
      const wav = audioBufferToWav(buffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      
      // Cleanup previous URL if exists
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      
      setAudioUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
      alert("Voice generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArr = new ArrayBuffer(length);
    const view = new DataView(bufferArr);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) { view.setUint16(pos, data, true); pos += 2; }
    function setUint32(data: number) { view.setUint32(pos, data, true); pos += 4; }

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (i = 0; i < numOfChan; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return bufferArr;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <header>
        <h2 className="text-2xl font-bold">Narration Generator</h2>
        <p className="text-gray-500">Create high-quality AI voiceovers for your video scripts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              Voice Settings
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Speaker Model</label>
              <div className="space-y-2">
                {VOICES.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVoice(v.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all border ${
                      selectedVoice === v.id 
                        ? 'bg-red-50 border-red-200 text-red-700 font-bold' 
                        : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="text-[10px] opacity-60 bg-white/50 px-1.5 py-0.5 rounded uppercase">{v.gender}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tone & Style</label>
              <select 
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
              >
                {TONES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Speaking Pace</label>
              <div className="grid grid-cols-3 gap-2">
                {PACES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPace(p.id)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      selectedPace === p.id 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Input/Output Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6 h-full flex flex-col">
            <div className="flex-1 space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider">Narration Script</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your script here... For better results, keep it conversational."
                className="w-full flex-1 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 resize-none text-xl leading-relaxed"
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !text}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 disabled:bg-gray-300 transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-100"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Synthesizing Masterpiece...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M2 10v4"/><path d="M22 10v4"/><path d="M6 7v10"/><path d="M18 7v10"/></svg>
                  Generate Professional Voiceover
                </>
              )}
            </button>

            {audioUrl && (
              <div className="p-6 bg-gray-900 rounded-2xl animate-in zoom-in duration-300 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full">
                   <div className="flex items-center justify-between mb-2 text-white/60 text-xs font-bold uppercase">
                     <span>Playback Preview</span>
                     <span className="text-red-500">Ready</span>
                   </div>
                   <audio controls src={audioUrl} className="w-full brightness-110 invert grayscale" />
                </div>
                <a 
                  href={audioUrl} 
                  download={`voiceover_${selectedVoice.toLowerCase()}.wav`} 
                  className="w-full md:w-auto px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow-sm hover:bg-red-700 transition-all text-center"
                >
                  Download WAV
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '🎯', label: 'Contextual Tone', desc: 'Emotionally aware synthesis.' },
          { icon: '⚡', label: 'Instant Export', desc: 'No-wait high-fidelity WAV.' },
          { icon: '🎧', label: 'Studio Quality', desc: '24kHz sampling for crisp audio.' },
        ].map(feat => (
          <div key={feat.label} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4">
             <div className="text-2xl">{feat.icon}</div>
             <div>
               <p className="font-bold text-sm">{feat.label}</p>
               <p className="text-xs text-gray-500">{feat.desc}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Voiceover;
