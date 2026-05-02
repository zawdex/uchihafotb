import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Match } from "@/src/types";
import { HLSPlayer } from "@/src/components/ui/HLSPlayer";
import { ChevronLeft, Info, Users, Clock, Star, Sparkles } from "lucide-react";
import { cn, formatMatchTime, isMatchLive } from "@/src/lib/utils";
import { motion } from "motion/react";
import { getSecureStreamUrl } from "@/src/lib/api";

export default function MatchDetail() {
  const { url } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(location.state?.match || null);
  const [activeStream, setActiveStream] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    if (match) {
      setActiveStream(match.url);
      const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavorite(favs.some((f: any) => f.view_url === match.view_url));
    }
  }, [match]);

  const fetchInsight = async () => {
    if (!match) return;
    setLoadingInsight(true);
    try {
      const { getMatchInsight } = await import("@/src/lib/gemini");
      const text = await getMatchInsight(match.home_name, match.away_name);
      setInsight(text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsight(false);
    }
  };

  if (!match) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-uchiha-red font-black uppercase tracking-widest text-sm">
          <ChevronLeft /> Return Target
        </button>
      </div>
    );
  }

  const toggleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    let newFavs;
    if (favorite) {
      newFavs = favs.filter((f: any) => f.view_url !== match.view_url);
    } else {
      newFavs = [...favs, match];
    }
    localStorage.setItem("favorites", JSON.stringify(newFavs));
    setFavorite(!favorite);
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Player Section */}
      <section className="bg-zinc-950 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
               <button 
                onClick={toggleFavorite}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 border-2 text-sm font-black transition-all uppercase tracking-widest",
                  favorite ? "bg-uchiha-red border-black text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]" : "bg-white border-black text-black hover:bg-zinc-100"
                )}
              >
                <Star className={cn("w-4 h-4", favorite && "fill-current")} />
                {favorite ? "SEALED" : "SEAL MATCH"}
              </button>
            </div>
          </div>

          <HLSPlayer url={getSecureStreamUrl(activeStream || match.url)} key={activeStream} />
        </div>
      </section>

      {/* Info Section */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="p-8 bg-black border-4 border-uchiha-red text-white shadow-[12px_12px_0px_0px_rgba(204,0,0,0.2)]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <div className="flex-1 flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-zinc-900 border-2 border-uchiha-red rounded-full flex items-center justify-center p-4">
                    <img src={match.home_logo} className="w-full h-full object-contain" alt={match.home_name} />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-center leading-[0.9]">{match.home_name}</h2>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-6xl font-black tabular-nums tracking-tighter italic scale-125 mb-4 text-uchiha-red">
                    {match.score}
                  </span>
                  <div className={cn(
                    "px-4 py-1 font-black uppercase tracking-widest text-xs border-2 border-uchiha-red",
                    isMatchLive(match.score) ? "bg-uchiha-red text-white animate-pulse" : "bg-zinc-900 text-white"
                  )}>
                    {isMatchLive(match.score) ? "LIVE" : "FUTURE"}
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-zinc-900 border-2 border-uchiha-red rounded-full flex items-center justify-center p-4">
                    <img src={match.away_logo} className="w-full h-full object-contain" alt={match.away_name} />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-center leading-[0.9]">{match.away_name}</h2>
                </div>
              </div>

              <div className="flex items-center justify-center gap-8 pt-8 border-t-2 border-uchiha-red/20">
                <div className="flex items-center gap-2 font-black uppercase text-xs text-zinc-400">
                  <Clock className="w-4 h-4 text-uchiha-red" />
                  <span>{match.time}</span>
                </div>
                <div className="flex items-center gap-2 font-black uppercase text-xs text-zinc-400">
                  <Info className="w-4 h-4 text-uchiha-red" />
                  <span>{match.label.replace("\n", "")}</span>
                </div>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="p-8 bg-black border-4 border-uchiha-red text-white shadow-[8px_8px_0px_0px_rgba(204,0,0,0.5)]">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                   <Sparkles className="w-6 h-6 fill-uchiha-red text-uchiha-red" />
                   <h3 className="font-black uppercase tracking-[0.2em] text-sm italic">Mangekyo Insight</h3>
                 </div>
                 {!insight && (
                   <button 
                    onClick={fetchInsight}
                    disabled={loadingInsight}
                    className="px-4 py-2 bg-uchiha-red text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
                   >
                     {loadingInsight ? "CASTING..." : "ACTIVATE SHARINGAN"}
                   </button>
                 )}
               </div>

               {insight ? (
                 <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg font-black leading-tight border-l-4 border-uchiha-red pl-4"
                 >
                   "{insight}"
                 </motion.p>
               ) : (
                 <p className="text-sm font-bold opacity-60">
                   Invoke the Uchiha visual prowess to dissect the tactical flow and predict the final outcome of this encounter.
                 </p>
               )}
            </div>
          </div>

          {/* Sidebar: Streams */}
          <div className="space-y-6">
            <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-4 h-4 text-uchiha-red" />
                <h3 className="text-white font-bold uppercase tracking-widest text-xs">Shadow Streams</h3>
              </div>

              <div className="space-y-4">
                {match.authors.map((author, idx) => {
                  const isActive = activeStream === author.url;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveStream(author.url)}
                      className={cn(
                        "w-full flex items-center justify-between p-5 border-4 transition-all uppercase tracking-widest font-black text-[10px]",
                        isActive 
                        ? "bg-uchiha-red border-black text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -translate-y-1" 
                        : "bg-zinc-900 border-uchiha-red/20 text-zinc-400 hover:border-uchiha-red hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border-2 border-black bg-zinc-100 p-1">
                          <img src={author.logo} alt={author.name} className="w-full h-full object-cover" />
                        </div>
                        <span>{author.name.replace("\n", "")}</span>
                      </div>
                      {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_#fff]" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                  TIP: If the player lags or fails to load, try switching to a different stream author from the list above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
