/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import Home from "./pages/Home";
import MatchDetail from "./pages/MatchDetail";
import LiveTV from "./pages/LiveTV";
import Favorites from "./pages/Favorites";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-zinc-100 selection:bg-uchiha-red selection:text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/match/:url" element={<MatchDetail />} />
          <Route path="/tv" element={<LiveTV />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </div>
    </Router>
  );
}
