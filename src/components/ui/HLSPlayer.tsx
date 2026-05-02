import React, { useEffect, useRef, useState } from "react";
import Hls, { type Level } from "hls.js";
import { Loader2, AlertCircle, Settings, Maximize, Play, Pause, Volume2, VolumeX, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface HLSPlayerProps {
  url: string;
  poster?: string;
  className?: string;
}

interface ErrorDetail {
  title: string;
  message: string;
  suggestions: string[];
}

export const HLSPlayer: React.FC<HLSPlayerProps> = ({ url, poster, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<ErrorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (!isSettingsOpen) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (!isSettingsOpen) {
      setShowControls(false);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
      videoRef.current.muted = newVolume === 0;
    }
  };

  useEffect(() => {
    let hls: Hls | null = null;
    const video = videoRef.current;
    if (!video) return;

    setLoading(true);
    setError(null);

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setLoading(false);
        setLevels(data.levels);
        video.play().catch(() => {
          setIsPlaying(false);
        });
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        // Only update currentLevel if we are in Auto mode (-1)
        // to show which level the ABR currently chose
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError({
                title: "CHAKRA SEVERED",
                message: "Network disturbance detected. The connection to the broadcast was lost.",
                suggestions: [
                  "Verify your network strength",
                  "Try another stream line from the list",
                  "Ensure no firewall is blocking the signal"
                ]
              });
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError({
                title: "GENJUTSU FAILURE",
                message: "Playback synchronization error. The visual stream is unstable.",
                suggestions: [
                  "Wait for auto-recovery (10s)",
                  "Refresh the visual field (F5)",
                  "Switch to an alternative broadcast"
                ]
              });
              hls?.recoverMediaError();
              break;
            default:
              setError({
                title: "FORBIDDEN SEAL",
                message: "A fatal error occurred that even the Sharingan cannot decipher.",
                suggestions: [
                  "Select a different stream author",
                  "Check if the content is restricted in your region",
                  "Re-open the app in a new tab"
                ]
              });
              setLoading(false);
              hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        setLoading(false);
        video.play();
      });
      video.addEventListener("error", () => {
        setError({
          title: "VISUAL BLINDNESS",
          message: "Your browser failed to render this broadcast technique.",
          suggestions: [
            "Use a modern Browser (Chrome/Edge)",
            "Enable JavaScript and HLS support",
            "Try another stream author"
          ]
        });
        setLoading(false);
      });
    }

    return () => {
      hls?.destroy();
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [url]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const changeLevel = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
      setIsSettingsOpen(false);
    }
  };

  return (
    <div 
      className={cn("relative group aspect-video bg-black rounded-xl overflow-hidden shadow-2xl", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-contain"
        playsInline
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-10">
          <div className="text-center">
            <div className="relative mb-4">
              <Loader2 className="w-16 h-16 text-uchiha-red animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-uchiha-red rounded-full animate-pulse" />
              </div>
            </div>
            <p className="text-white text-xs font-black uppercase tracking-[0.3em]">Gathering Chakra...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20 border-4 border-uchiha-red p-8">
          <div className="max-w-md w-full text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-uchiha-red/10 border-2 border-uchiha-red rounded-full">
                <AlertCircle className="w-12 h-12 text-uchiha-red" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{error.title}</h3>
            <p className="text-zinc-400 text-sm mb-8 font-bold leading-relaxed">{error.message}</p>
            
            <div className="bg-zinc-900/50 border-l-4 border-uchiha-red p-4 mb-8 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-uchiha-red mb-2">Tactical Suggestions:</p>
              <ul className="space-y-2">
                {error.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-zinc-500 font-bold flex items-center gap-2">
                    <div className="w-1 h-1 bg-uchiha-red rounded-full" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-uchiha-red text-white font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              Rebind Jutsu
            </button>
          </div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div className={cn(
        "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-transparent to-transparent transition-opacity duration-300 p-6",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-white hover:text-uchiha-red transition-colors">
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
            <div 
              className="flex items-center gap-3 group/volume"
              onMouseEnter={() => setIsVolumeHovered(true)}
              onMouseLeave={() => setIsVolumeHovered(false)}
            >
              <button onClick={toggleMute} className="text-white hover:text-uchiha-red transition-colors">
                {(isMuted || volume === 0) ? <VolumeX className="w-6 h-6 text-uchiha-red" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ 
                  width: isVolumeHovered ? 80 : 0, 
                  opacity: isVolumeHovered ? 1 : 0 
                }}
                className="overflow-hidden flex items-center"
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-zinc-700 appearance-none cursor-pointer rounded-full accent-uchiha-red"
                />
              </motion.div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-4 w-48 bg-black border-2 border-uchiha-red overflow-hidden shadow-[0_0_20px_rgba(204,0,0,0.3)] z-50"
                  >
                    <div className="p-3 bg-uchiha-red/10 border-b border-uchiha-red/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-uchiha-red">Visual Resolution</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => changeLevel(-1)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2 hover:bg-uchiha-red/20 transition-colors text-left",
                          currentLevel === -1 ? "text-uchiha-red" : "text-zinc-400"
                        )}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest">Auto (ABR)</span>
                        {currentLevel === -1 && <Check className="w-3 h-3" />}
                      </button>
                      
                      {levels.map((level, idx) => (
                        <button
                          key={idx}
                          onClick={() => changeLevel(idx)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-2 hover:bg-uchiha-red/20 transition-colors text-left",
                            currentLevel === idx ? "text-uchiha-red" : "text-zinc-400"
                          )}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {level.height}P {level.name || ''}
                          </span>
                          {currentLevel === idx && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={cn(
                  "text-white hover:text-uchiha-red transition-all duration-300",
                  isSettingsOpen && "rotate-90 text-uchiha-red"
                )}
              >
                <Settings className="w-5 h-5 shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
              </button>
            </div>
            
            <button onClick={toggleFullscreen} className="text-white hover:text-uchiha-red transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
