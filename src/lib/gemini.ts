import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const tacticalFallbacks = [
  "Tactical awareness is key. Expect high-intensity wing play and rapid transitions.",
  "The midfield battle will define the outcome. Watch for decisive interceptions.",
  "Set pieces could be the tie-breaker in this high-stakes encounter.",
  "A clash of philosophies. Will defensive structure hold against creative flair?",
  "Speed on the counter-attack will be the primary threat for both sides.",
  "Expect a disciplined tactical display with narrow defensive lines.",
  "Individual brilliance in the final third might be the only way to break the deadlock.",
  "High pressing could force errors early in the build-up phase.",
  "The physical duel in the penalty area will be intense. Expect a battle for every ball.",
  "Creative vision from the deep-lying playmaker will be crucial for unlocking the defense."
];

const getStaticInsight = (home: string, away: string) => {
  const seed = (home.length + away.length) % tacticalFallbacks.length;
  return tacticalFallbacks[seed];
};

export const getFeaturedMatchInsight = async (homeTeam: string, awayTeam: string) => {
  if (!ai) return getStaticInsight(homeTeam, awayTeam);

  const cacheKey = `featured_insight_${homeTeam}_${awayTeam}`.toLowerCase().replace(/\s+/g, '_');
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      const { text, expiry } = JSON.parse(cached);
      if (Date.now() < expiry) {
        return text;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The featured match is ${homeTeam} vs ${awayTeam}. Give me a one-sentence "Premium AI Insight" for this match. Be bold and exciting.`,
    });
    
    const text = response.text;
    if (text) {
      // Cache for 4 hours
      localStorage.setItem(cacheKey, JSON.stringify({
        text,
        expiry: Date.now() + 4 * 60 * 60 * 1000
      }));
    }
    
    return text || getStaticInsight(homeTeam, awayTeam);
  } catch (e: any) {
    // Suppress console error for rate limits (429) to avoid clutter
    if (e.message?.includes("429") || e.status === 429) {
      return getStaticInsight(homeTeam, awayTeam);
    }
    
    console.error("AI Featured Insight Error:", e);
    return getStaticInsight(homeTeam, awayTeam);
  }
};

export const getMatchInsight = async (homeTeam: string, awayTeam: string) => {
  if (!ai) return "AI Insights unavailable. Set GEMINI_API_KEY in secrets.";

  const cacheKey = `insight_${homeTeam}_${awayTeam}`.toLowerCase().replace(/\s+/g, '_');
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      const { text, expiry } = JSON.parse(cached);
      if (Date.now() < expiry) {
        return text;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a football expert. Give me a one-sentence "Pro Tip" or "Match Insight" for a football match between ${homeTeam} and ${awayTeam}. Keep it exciting and professional.`,
    });
    
    const text = response.text;
    if (text) {
      // Cache for 1 hour
      localStorage.setItem(cacheKey, JSON.stringify({
        text,
        expiry: Date.now() + 60 * 60 * 1000
      }));
    }
    
    return text || getStaticInsight(homeTeam, awayTeam);
  } catch (e: any) {
    // Suppress console error for rate limits (429)
    if (e.message?.includes("429") || e.status === 429) {
      return getStaticInsight(homeTeam, awayTeam);
    }

    console.error("AI Insight Error:", e);
    return getStaticInsight(homeTeam, awayTeam);
  }
};
