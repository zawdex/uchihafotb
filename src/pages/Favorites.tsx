import React, { useState, useEffect, useCallback } from "react";
import { Match } from "@/src/types";
import { MatchCard } from "@/src/components/ui/MatchCard";
import { Star, Inbox, Bell, BellOff, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { isMatchLive } from "@/src/lib/utils";

export default function Favorites() {
  const [favorites, setFavorites] = useState<Match[]>([]);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [notifiedMatches, setNotifiedMatches] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFavorites = () => {
      const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavorites(favs);
    };
    fetchFavorites();
    
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }

    window.addEventListener('storage', fetchFavorites);
    return () => window.removeEventListener('storage', fetchFavorites);
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  };

  const notifyMatchLive = useCallback((match: Match) => {
    if (notifiedMatches.has(match.view_url)) return;

    // Browser Notification
    if (notifPermission === "granted") {
      new Notification("UCHIHA STREAMS: MATCH LIVE!", {
        body: `${match.home_name} vs ${match.away_name} is now LIVE!`,
        icon: match.home_logo
      });
    }

    setNotifiedMatches(prev => {
      const next = new Set(prev);
      next.add(match.view_url);
      return next;
    });
  }, [notifPermission, notifiedMatches]);

  useEffect(() => {
    const interval = setInterval(() => {
      favorites.forEach(match => {
        if (isMatchLive(match.score)) {
          notifyMatchLive(match);
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [favorites, notifyMatchLive]);

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-8">
      {/* Header */}
      <header className="relative py-16 px-4 bg-black border-b-4 border-uchiha-red mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-uchiha-red border-2 border-white rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(204,0,0,0.5)]">
                  <Star className="w-6 h-6 fill-current" />
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">Shadow <span className="text-uchiha-red">Archive</span></h1>
            </div>
            <p className="text-zinc-500 max-w-xl font-bold uppercase tracking-widest text-[10px]">
              Your personal treasury of sealed match encounters.
            </p>
          </div>

          <div className="flex flex-col items-end gap-4">
            {notifPermission !== "granted" ? (
              <button 
                onClick={requestPermission}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black font-black uppercase text-[10px] tracking-widest hover:bg-uchiha-red hover:text-white transition-all shadow-[4px_4px_0px_0px_#cc0000]"
              >
                <Bell className="w-4 h-4" />
                Enable Alerts
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-uchiha-red/10 border border-uchiha-red/20 rounded-lg text-uchiha-red text-[10px] font-black uppercase tracking-widest">
                <Bell className="w-4 h-4 animate-pulse" />
                Alerts Active
              </div>
            )}
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase">
              <Info className="w-3 h-3" />
              <span>Auto-refreshing every 30s</span>
            </div>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
               <Inbox className="w-8 h-8 text-zinc-700" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Archive Empty</h2>
            <p className="text-zinc-500 max-w-xs mx-auto mb-8">
              No souls have been sealed in the archive yet.
            </p>
            <Link 
              to="/"
              className="px-8 py-3 bg-uchiha-red text-white font-black uppercase tracking-widest border-2 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-none translate-y-[-4px] hover:translate-y-0 transition-all"
            >
              Consult the Index
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {favorites.map((match, idx) => (
                <MatchCard key={match.view_url} match={match} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
