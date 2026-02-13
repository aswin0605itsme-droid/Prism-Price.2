import React, { useState } from 'react';
import { Image as ImageIcon, Wand2, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateConceptImage } from '../services/gemini';
import { AspectRatio } from '../types';

export const ImageGen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    const imgUrl = await generateConceptImage(prompt, ratio);
    setResult(imgUrl);
    setLoading(false);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <ImageIcon className="w-64 h-64" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Wand2 className="text-pink-400" /> Dream Product Generator
        </h2>

        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe a futuristic gadget, e.g., 'Transparent holographic smartphone with neon edges'..."
                    className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:border-pink-500/50 focus:outline-none transition-all resize-none"
                />
                
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm text-gray-400">Aspect Ratio:</span>
                    {Object.values(AspectRatio).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRatio(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                ratio === r 
                                ? 'bg-pink-500/20 text-pink-200 border-pink-500/50' 
                                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt}
                    className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-bold text-white shadow-lg hover:shadow-pink-500/25 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Generating...' : 'Generate Concept'}
                </button>
            </div>

            <div className="flex-1 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center min-h-[300px] relative group">
                {result ? (
                    <>
                        <img src={result} alt="Generated" className="max-h-full max-w-full rounded-lg shadow-2xl" />
                        <a 
                            href={result} 
                            download="concept.png"
                            className="absolute bottom-4 right-4 p-2 bg-black/60 backdrop-blur text-white rounded-lg hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Download className="w-5 h-5" />
                        </a>
                    </>
                ) : (
                    <div className="text-white/20 flex flex-col items-center gap-2">
                        <ImageIcon className="w-12 h-12" />
                        <span className="text-sm">Preview Area</span>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};