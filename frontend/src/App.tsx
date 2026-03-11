import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Send, 
  Loader2, 
  Download, 
  History, 
  Play, 
  X,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { cn } from './services/lib/utils';
import { 
  VideoGenerationResult,
} from './types';
import { generateRunwayVideo } from './services/lib/runway';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<VideoGenerationResult[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/videos');
      if (response.ok) {
        const data = await response.json();
        // Map DB fields to component state
        setHistory(data.map((v: any) => ({
          id: v.id,
          uri: v.uri,
          prompt: v.prompt,
          timestamp: v.timestamp,
          aspectRatio: v.aspect_ratio
        })));
      }
    } catch (e) {
      console.error("Failed to fetch history from server", e);
    }
  };

  const saveToBackend = async (video: VideoGenerationResult & { aspectRatio: string }) => {
    try {
      await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(video)
      });
    } catch (e) {
      console.error("Failed to save to backend", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setHistory(history.filter(v => v.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          data: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedImage) return;

    setIsGenerating(true);
    setError(null);

    try {
      const videoUri = await generateRunwayVideo(prompt, selectedImage || undefined, aspectRatio);
      
      const newVideo: VideoGenerationResult = {
        id: Math.random().toString(36).substr(2, 9),
        uri: videoUri,
        prompt: prompt || "Generated from image",
        timestamp: Date.now()
      };

      await saveToBackend({ ...newVideo, aspectRatio });
      setHistory([newVideo, ...history]);
      setPrompt('');
      setSelectedImage(null);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (video: VideoGenerationResult) => {
    try {
      const response = await fetch(video.uri);
      if (!response.ok) throw new Error("Failed to fetch video");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zora-video-${video.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download video. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-white/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center glass border-b-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Video className="w-5 h-5 text-black" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">ZORA</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium border border-white/10">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            RunwayML Active
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-display font-bold mb-6 tracking-tighter gradient-text"
          >
            Cinematic Motion.<br />Zero Effort.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-light"
          >
            Transform your ideas into high-fidelity videos using state-of-the-art RunwayML technology.
          </motion.p>
        </section>

        {/* Generator Section */}
        <section className="max-w-4xl mx-auto mb-24">
          <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 blur-[100px] rounded-full" />
            
            <div className="relative z-10 space-y-6">
              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-white/40 ml-1">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A cinematic drone shot of a futuristic city at sunset, neon lights reflecting on wet pavement..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-lg font-light resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-4 items-end justify-between">
                <div className="flex gap-4">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-white/40 ml-1">Reference Image</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center border border-dashed transition-all",
                          selectedImage ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/20 hover:border-white/40 bg-white/5"
                        )}
                      >
                        {selectedImage ? (
                          <img src={selectedImage.data} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                        ) : (
                          <Plus className="w-6 h-6 text-white/40" />
                        )}
                      </button>
                      {selectedImage && (
                        <button 
                          onClick={() => setSelectedImage(null)}
                          className="w-14 h-14 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <X className="w-5 h-5 text-white/40" />
                        </button>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-white/40 ml-1">Aspect Ratio</label>
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                      <button 
                        onClick={() => setAspectRatio("16:9")}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                          aspectRatio === "16:9" ? "bg-white text-black" : "text-white/60 hover:text-white"
                        )}
                      >
                        16:9
                      </button>
                      <button 
                        onClick={() => setAspectRatio("9:16")}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                          aspectRatio === "9:16" ? "bg-white text-black" : "text-white/60 hover:text-white"
                        )}
                      >
                        9:16
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || (!prompt.trim() && !selectedImage)}
                  className={cn(
                    "h-14 px-8 rounded-2xl flex items-center gap-3 font-bold text-lg transition-all",
                    isGenerating 
                      ? "bg-white/10 text-white/40 cursor-not-allowed" 
                      : "bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/10"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate
                    </>
                  )}
                </button>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-semibold">{error}</p>
                </motion.div>
              )}
            </div>
          </div>
          
          <p className="mt-4 text-center text-white/30 text-xs">
            Powered by RunwayML Gen-3 Alpha Turbo
          </p>
        </section>

        {/* History Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-white/40" />
              <h2 className="text-2xl font-display font-bold">Recent Generations</h2>
            </div>
            <span className="text-white/40 text-sm font-mono">{history.length} Creations</span>
          </div>

          {history.length === 0 ? (
            <div className="glass rounded-3xl p-20 text-center border-dashed">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/40 font-light">Your generated videos will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {history.map((video) => (
                  <motion.div
                    key={video.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative glass rounded-3xl overflow-hidden video-glow"
                  >
                    <div className="aspect-video bg-white/5 relative">
                      <video 
                        src={video.uri} 
                        className="w-full h-full object-cover"
                        controls
                        poster={`https://picsum.photos/seed/${video.id}/800/450`}
                      />
                    </div>
                    <div className="p-5 space-y-3">
                      <p className="text-sm text-white/80 line-clamp-2 font-light leading-relaxed">
                        {video.prompt}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-tighter">
                          {new Date(video.timestamp).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDownload(video)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                            title="Download Video"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(video.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-white/30 hover:text-red-400"
                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-40">
          <Video className="w-4 h-4" />
          <span className="font-display font-bold tracking-tight text-sm">ZORA</span>
        </div>
        <p className="text-white/20 text-xs font-light">
          Powered by RunwayML • Professional AI Video Generation
        </p>
      </footer>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-white/10 rounded-full" />
              <div className="absolute inset-0 w-24 h-24 border-4 border-t-white rounded-full animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-white animate-pulse" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">Crafting your vision...</h3>
            <p className="text-white/40 max-w-xs font-light">
              Our AI is processing millions of frames to bring your prompt to life. This usually takes 30-60 seconds.
            </p>
            
            <div className="mt-12 space-y-2 w-full max-w-xs">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 45, ease: "linear" }}
                  className="h-full bg-white"
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-white/20 uppercase tracking-widest">
                <span>Initializing</span>
                <span>Rendering</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
