import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Play, ArrowRight } from "lucide-react";
import { getMatches, getChannels } from "@/src/lib/api";
import { Match, Channel } from "@/src/types";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { Sharingan } from "./Sharingan";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      loadData();
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, c] = await Promise.all([getMatches(), getChannels()]);
      setMatches(m);
      setChannels(c);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(m => 
    m.home_name.toLowerCase().includes(query.toLowerCase()) || 
    m.away_name.toLowerCase().includes(query.toLowerCase()) ||
    m.label.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-4 sm:p-8"
        >
          {/* Header */}
          <div className="max-w-4xl mx-auto w-full flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <Sharingan size={40} className="shadow-[0_0_20px_#cc0000]" />
              <span className="text-xl font-black text-white tracking-tighter uppercase">SHADOW <span className="text-uchiha-red">OCULUS</span></span>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-uchiha-red border-4 border-black text-white hover:bg-white hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Input */}
          <div className="max-w-4xl mx-auto w-full mb-12">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-uchiha-red z-10" />
              <input
                autoFocus
                type="text"
                placeholder="PROBE THE ARCHIVES..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-black border-8 border-uchiha-red py-8 pl-20 pr-8 text-2xl sm:text-4xl font-black uppercase tracking-tighter text-white placeholder:text-zinc-800 focus:outline-none shadow-[12px_12px_0px_0px_rgba(204,0,0,0.3)]"
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-w-4xl mx-auto w-full flex-1 overflow-y-auto no-scrollbar pb-20">
            {query.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Matches Section */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 border-b-2 border-white/10 pb-2">Matches</h3>
                  <div className="space-y-4">
                    {filteredMatches.map((match) => (
                      <Link 
                        key={match.view_url} 
                        to={`/match/${encodeURIComponent(match.view_url)}`}
                        onClick={onClose}
                        state={{ match }}
                        className="group flex items-center justify-between p-4 bg-zinc-900 border-4 border-transparent hover:border-uchiha-red transition-all"
                      >
                         <div className="flex items-center gap-4">
                           <div className="flex -space-x-3">
                             <img src={match.home_logo} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-100" />
                             <img src={match.away_logo} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-100" />
                           </div>
                           <div>
                             <p className="text-sm font-black text-white uppercase tracking-tight">{match.home_name} <span className="text-zinc-600">vs</span> {match.away_name}</p>
                             <p className="text-[10px] font-bold text-zinc-500 uppercase">{match.label.replace("\n", "")}</p>
                           </div>
                         </div>
                         <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:text-uchiha-red group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                    {filteredMatches.length === 0 && <p className="text-zinc-600 text-sm italic">No matches found.</p>}
                  </div>
                </div>

                {/* Channels Section */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 border-b-2 border-white/10 pb-2">TV Channels</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {filteredChannels.map((channel) => (
                      <Link 
                        key={channel.name} 
                        to="/tv"
                        onClick={onClose}
                        className="flex flex-col items-center gap-3 p-4 bg-zinc-900 border-4 border-transparent hover:border-uchiha-red transition-all group"
                      >
                        <img src={channel.logo} className="w-12 h-12 object-contain" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">{channel.name}</span>
                      </Link>
                    ))}
                    {filteredChannels.length === 0 && <p className="text-zinc-600 text-sm italic col-span-2">No channels found.</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                 <Search className="w-20 h-20 text-white mb-6" />
                 <p className="text-xl font-black text-white uppercase tracking-widest">Start Typing To Find Streams</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
