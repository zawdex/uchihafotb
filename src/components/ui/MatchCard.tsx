import React from "react";
import { Link } from "react-router-dom";
import { Match } from "@/src/types";
import { cn, formatMatchTime, isMatchLive, isStartingSoon } from "@/src/lib/utils";
import { motion } from "motion/react";
import { Play, Bell, Flame } from "lucide-react";

interface MatchCardProps {
  match: Match;
  index: number;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, index }) => {
  const live = isMatchLive(match.score);
  const startingSoon = isStartingSoon(match.time);

  return (
    <motion.div
      variants={{
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        hover: { scale: 1.02, y: -5 }
      }}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 15,
        delay: index * 0.05 
      }}
    >
      <Link 
        to={`/match/${encodeURIComponent(match.view_url)}`}
        state={{ match }}
        className={cn(
          "group relative block bg-uchiha-dark border-4 p-6 transition-all duration-300 -rotate-1 hover:rotate-0",
          live ? "border-uchiha-red shadow-[12px_12px_0px_0px_#cc0000]" : "border-uchiha-red/20 text-zinc-400 hover:border-uchiha-red hover:shadow-[12px_12px_0px_0px_#1a0000]"
        )}
      >
        {/* League Label */}
        <div className="absolute top-0 right-0 bg-uchiha-red text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest translate-x-2 -translate-y-2">
          {match.label.replace("\n", "").trim()}
        </div>

        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 flex items-center gap-2",
              live ? "bg-red-600 text-white animate-pulse" : 
              startingSoon ? "bg-black text-uchiha-red border-2 border-uchiha-red shadow-[0_0_10px_#cc0000]" :
              "bg-black text-white"
            )}>
              {live && <div className="w-2 h-2 bg-white rounded-full animate-ping" />}
              {startingSoon && <Bell className="w-3 h-3 animate-bounce" />}
              {live ? "LIVE NOW" : startingSoon ? "STARTING SOON" : formatMatchTime(match.time)}
            </div>
            
            {live && (
              <div className="flex items-center gap-1 text-[10px] font-black text-uchiha-red animate-bounce">
                <Flame className="w-3 h-3 fill-current" />
                <span>HOT</span>
              </div>
            )}
          </div>

          {/* Teams */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full p-2 border-2 border-uchiha-red group-hover:scale-110 transition-transform shadow-[0_0_15px_#cc000044]">
                <img src={match.home_logo} alt={match.home_name} className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-black text-white uppercase tracking-tight line-clamp-2">{match.home_name}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl font-black text-uchiha-red tabular-nums tracking-tighter italic shadow-uchiha-red">
                {match.score}
              </div>
              <div className="w-8 h-8 bg-uchiha-red text-white flex items-center justify-center text-[10px] font-black rounded-full shadow-[0_0_10px_#cc0000]">VS</div>
            </div>

            <div className="flex-1 flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full p-2 border-2 border-uchiha-red group-hover:scale-110 transition-transform shadow-[0_0_15px_#cc000044]">
                <img src={match.away_logo} alt={match.away_name} className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-black text-white uppercase tracking-tight line-clamp-2">{match.away_name}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
            <motion.div 
              variants={{
                hover: {
                  scale: [1, 1.1, 1],
                  transition: {
                    repeat: Infinity,
                    duration: 1,
                    ease: "easeInOut"
                  }
                }
              }}
              className="bg-black text-white px-6 py-2 text-xs font-black uppercase tracking-widest group-hover:bg-uchiha-red group-hover:text-white transition-colors"
            >
              WATCH STREAM
            </motion.div>
        </div>
      </Link>
    </motion.div>
  );
};
