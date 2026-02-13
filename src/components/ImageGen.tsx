
import React, { useState } from 'react';
import { Image as ImageIcon, Wand2, Download, Loader2 } from 'lucide-react';
import { generateConceptImage } from '../services/gemini';
import { AspectRatio } from '../types';

export const ImageGen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null); // Clear previous
    try {
      const imgUrl = await generateConceptImage(prompt, ratio);
      setResult(imgUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12 relative overflow-hidden group/gen">
        <div className="absolute -top-12 -right-12 p-4 opacity-5 group-hover/gen:opacity-10 transition-opacity pointer-events-none">
            <ImageIcon className="w-64 h-64 rotate-12" />
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <Wand2 className="text-pink-400 animate-pulse" /> Dream Product Generator
          </h2>
          <p className="text-white/40 text-sm mb-6">Visualize futuristic gear using Gemini 2.5 Image</p>

          <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-6">
                  <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'A transparent gaming laptop with floating holographic keys and liquid cooling tubes visible'..."
                        className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:border-pink-500/50 focus:outline-none transition-all resize-none shadow-inner"
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] text-white/20 uppercase tracking-widest font-bold">Concept Engine v2.5</div>
                  </div>
                  
                  <div className="space-y-3">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Aspect Ratio</span>
                      <div className="flex items-center gap-2 flex-wrap">
                          {Object.values(AspectRatio).map((r) => (
                              <button
                                  key={r}
                                  onClick={() => setRatio(r)}
                                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                      ratio === r 
                                      ? 'bg-pink-500 text-white border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)]' 
                                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                  }`}
                              >
                                  {r}
                              </button>
                          ))}
                      </div>
                  </div>

                  <button
                      onClick={handleGenerate}
                      disabled={loading || !prompt.trim()}
                      className="w-full py-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-2xl font-black text-white shadow-xl hover:shadow-pink-500/40 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-tighter"
                  >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> 
                          Synthesizing Concept...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" />
                          Generate Concept
                        </>
                      )}
                  </button>
              </div>

              <div className="lg:w-1/2 bg-black/60 rounded-2xl border border-white/10 flex items-center justify-center min-h-[400px] relative group overflow-hidden shadow-2xl">
                  {result ? (
                      <>
                          <img src={result} alt="Generated Concept" className="w-full h-full object-cover animate-in fade-in zoom-in duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <a 
                                href={result} 
                                download="prism-concept.png"
                                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                            >
                                <Download className="w-4 h-4" /> Download Design
                            </a>
                          </div>
                      </>
                  ) : (
                      <div className="text-white/10 flex flex-col items-center gap-4 text-center p-8">
                          {loading ? (
                            <div className="relative">
                              <div className="w-20 h-20 border-t-2 border-pink-500 rounded-full animate-spin"></div>
                              <ImageIcon className="w-10 h-10 absolute inset-0 m-auto animate-pulse" />
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="w-20 h-20" />
                              <div className="space-y-1">
                                <span className="text-lg font-bold block text-white/20">Design Manifestation Area</span>
                                <span className="text-xs">Your AI product concept will appear here</span>
                              </div>
                            </>
                          )}
                      </div>
                  )}
              </div>
          </div>
        </div>
    </div>
  );
};
