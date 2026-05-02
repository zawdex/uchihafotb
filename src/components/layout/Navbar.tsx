import { Link, useLocation } from "react-router-dom";
import { Home, Tv, Star, Search } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { SearchOverlay } from "../ui/SearchOverlay";
import { Sharingan } from "../ui/Sharingan";
import { useState } from "react";

export const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Live", path: "/", icon: Home },
    { name: "TV", path: "/tv", icon: Tv },
    { name: "Saved", path: "/favorites", icon: Star },
  ];

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-black border-b-4 border-uchiha-red">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Sharingan size={40} className="shadow-[0_0_15px_rgba(204,0,0,0.5)]" />
            <span className="text-2xl font-black tracking-tighter text-white hidden sm:inline-block">UCHIHA<span className="text-uchiha-red">STREAMS</span></span>
          </Link>

          <div className="flex-1 flex items-center justify-center max-w-md hidden md:block">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center gap-4 px-4 py-2 bg-zinc-900 border-2 border-uchiha-red/20 text-zinc-500 text-xs font-black uppercase tracking-widest hover:border-uchiha-red hover:text-white transition-all text-left"
            >
              <Search className="w-4 h-4" />
              <span>Shadow Search...</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-6 justify-end">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-3 bg-uchiha-red border-2 border-black rounded-lg text-white hover:bg-white hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:shadow-none translate-y-[-2px] hover:translate-y-0 order-last sm:order-none"
            >
              <Search className="w-5 h-5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" />
            </button>

            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-2 sm:px-3 py-2 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-black transition-all uppercase tracking-widest",
                    isActive ? "text-uchiha-red scale-110" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive && "animate-pulse")} />
                  <span className="hidden xs:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
};

