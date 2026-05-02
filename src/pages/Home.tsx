import React, { useEffect, useState } from "react";
import { getMatches } from "@/src/lib/api";
import { Match } from "@/src/types";
import { MatchCard } from "@/src/components/ui/MatchCard";
import { Loader2, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { ai } from "@/src/lib/gemini";

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("All");
  const [aiTip, setAiTip] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getMatches();
        setMatches(data);
        
        // Match of the day AI tip
        if (ai && data.length > 0) {
          const liveMatch = data.find(m => m.score !== "vs") || data[0];
          const { getFeaturedMatchInsight } = await import("@/src/lib/gemini");
          const text = await getFeaturedMatchInsight(liveMatch.home_name, liveMatch.away_name);
          if (text) setAiTip(text);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const leagues = ["All", ...new Set(matches.map(m => m.label.replace("\n", "").trim()))];

  const filteredMatches = matches.filter(m => {
    const matchesSearch = m.home_name.toLowerCase().includes(search.toLowerCase()) || 
                         m.away_name.toLowerCase().includes(search.toLowerCase());
    const matchesLeague = selectedLeague === "All" || m.label.includes(selectedLeague);
    return matchesSearch && matchesLeague;
  });

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-8">
      {/* Search & Filters Section */}
      <section className="sticky top-20 z-30 bg-uchiha-dark/95 backdrop-blur-md py-4 px-4 border-b-2 border-uchiha-red/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="relative flex-1 w-full group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-uchiha-red mb-1 ml-1">
                Shadow Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black z-10" />
                <input 
                  type="text" 
                  placeholder="FIND A TEAM..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border-2 border-uchiha-red rounded-none py-2 pl-10 pr-4 text-sm text-black font-black uppercase tracking-wider placeholder:text-zinc-400 focus:outline-none focus:bg-uchiha-red focus:text-white transition-all focus:shadow-[4px_4px_0px_0px_#800000]"
                />
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-uchiha-red mb-1 ml-1">
                Battlefields
              </label>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {leagues.map((league) => (
                  <button
                    key={league}
                    onClick={() => setSelectedLeague(league)}
                    className={cn(
                      "whitespace-nowrap px-4 py-2 border-2 transition-all font-black uppercase text-[10px] tracking-widest", 
                      selectedLeague === league 
                      ? "bg-uchiha-red border-black text-white shadow-[2px_2px_0px_0px_white] -translate-y-0.5" 
                      : "bg-uchiha-dark border-uchiha-red text-uchiha-red hover:bg-uchiha-blood hover:text-white"
                    )}
                  >
                    {league}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Header */}
      <header className="relative py-16 px-4 overflow-hidden bg-black text-white border-b-8 border-uchiha-red">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-uchiha-red/20 -skew-x-12 translate-x-20" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8] mb-4">
              SHADOW<span className="text-uchiha-red">STRIKE</span><br />UCHIHA
            </h1>
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.3em] text-uchiha-red">
              <span className="bg-uchiha-red text-white px-2 py-0.5">EST. 2026</span>
              <span className="w-8 h-px bg-uchiha-red" />
              <span>Divine Visual Prowess</span>
            </div>
          </motion.div>

          <AnimatePresence>
            {aiTip && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 p-4 bg-uchiha-red border-2 border-white rounded-lg max-w-2xl group shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]"
              >
                <div className="p-2 bg-black rounded-lg text-uchiha-red">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/50">Mangekyo Insight</h3>
                  <p className="text-sm font-bold leading-tight text-white">{aiTip}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Match Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-uchiha-red animate-spin" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Casting Genjutsu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredMatches.map((match, idx) => (
                <MatchCard key={match.view_url} match={match} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredMatches.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 font-bold">No matches found for your search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
