import React, { useState, useEffect } from "react";
import { getChannels, getSecureStreamUrl } from "@/src/lib/api";
import { Channel } from "@/src/types";
import { HLSPlayer } from "@/src/components/ui/HLSPlayer";
import { Tv, Play, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

export default function LiveTV() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      const data = await getChannels();
      setChannels(data);
      if (data.length > 0) setActiveChannel(data[0]);
      setLoading(false);
    };
    fetchChannels();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4">
        <Loader2 className="w-10 h-10 text-uchiha-red animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Summoning Broadcast...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Player Section */}
      <section className="bg-zinc-950 border-b border-white/5 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-uchiha-red/10 border border-uchiha-red/20 rounded-xl">
              <Tv className="w-6 h-6 text-uchiha-red" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Shadow Broadcasts</h1>
              <p className="text-zinc-500 text-sm font-medium">Visualizing: <span className="text-uchiha-red font-black">{activeChannel?.name}</span></p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {activeChannel && (
              <HLSPlayer 
                url={getSecureStreamUrl(activeChannel.url)} 
                key={activeChannel.name}
              />
            )}
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {channels.map((channel, idx) => {
            const isActive = activeChannel?.name === channel.name;
            return (
              <motion.button
                key={channel.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setActiveChannel(channel)}
                className={cn(
                  "group relative aspect-square border-4 transition-all duration-300 p-4 flex flex-col items-center justify-center gap-3",
                  isActive 
                  ? "bg-uchiha-red border-black shadow-[8px_8px_0px_0px_white] -translate-y-1" 
                  : "bg-uchiha-dark border-uchiha-red/20 text-zinc-400 hover:border-uchiha-red hover:text-white"
                )}
              >
                <div className="relative w-20 h-20 bg-white border-2 border-black overflow-hidden mb-2 shadow-[0_0_15px_rgba(204,0,0,0.2)]">
                  <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain p-2" />
                  {!isActive && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-8 h-8 text-uchiha-red fill-uchiha-red" />
                    </div>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest text-center line-clamp-1",
                  isActive ? "text-white" : "text-zinc-500 group-hover:text-white"
                )}>
                  {channel.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
