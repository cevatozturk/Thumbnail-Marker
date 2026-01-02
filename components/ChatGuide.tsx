
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { Icons } from '../constants';
import { ChatMessage } from '../types';

const ChatGuide: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi! I'm your AI Growth Assistant. You can ask me anything about YouTube trends, SEO, or thumbnail psychology. I have access to live Google Search data!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const modelMsgIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'model', text: '' }]);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      let accumulatedText = '';
      const accumulatedUrls: { uri: string; title: string }[] = [];

      const stream = geminiService.chatAssistantStream(history, userMsg);
      
      for await (const chunk of stream) {
        setLoading(false); 
        
        if (chunk.text) {
          accumulatedText += chunk.text;
          setMessages(prev => {
            const next = [...prev];
            next[modelMsgIndex].text = accumulatedText;
            return next;
          });
        }

        if (chunk.grounding && chunk.grounding.length > 0) {
          chunk.grounding.forEach((c: any) => {
            if (c.web && !accumulatedUrls.some(u => u.uri === c.web.uri)) {
              accumulatedUrls.push({ uri: c.web.uri, title: c.web.title });
            }
          });
          
          setMessages(prev => {
            const next = [...prev];
            next[modelMsgIndex].urls = [...accumulatedUrls];
            return next;
          });
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => {
        const next = [...prev];
        next[modelMsgIndex].text = "Sorry, I encountered an issue while searching. Please try again.";
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)] bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      <header className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white">
            <Icons.Search />
          </div>
          <div>
            <h3 className="font-bold">Growth Consultant</h3>
            <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live Google Search Support
            </div>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-red-600 text-white rounded-tr-none shadow-md' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-1 duration-300">
                {msg.text || (i === messages.length - 1 && loading ? '...' : '')}
              </p>
              {msg.urls && msg.urls.length > 0 && (
                <div className="mt-4 pt-3 border-t border-black/10 flex flex-col gap-2 animate-in fade-in duration-1000">
                   <p className="text-[10px] font-bold uppercase opacity-60">Found Resources:</p>
                   {msg.urls.map((u, idx) => (
                     <a 
                       key={idx} 
                       href={u.uri} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-xs flex items-center gap-1.5 underline hover:no-underline text-blue-600"
                     >
                       {u.title} <Icons.External />
                     </a>
                   ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
               <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></span>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about viral trends or strategy..."
            className="flex-1 px-5 py-3 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-red-500 focus:bg-white transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center hover:bg-red-700 disabled:bg-gray-200 transition-colors shadow-lg shadow-red-100"
          >
            <Icons.External />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatGuide;
