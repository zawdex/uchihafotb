import { Match, Channel } from "@/src/types";

export const getMatches = async (): Promise<Match[]> => {
  const response = await fetch("/api/matches");
  if (!response.ok) throw new Error("Failed to fetch matches");
  return response.json();
};

export const getChannels = async (): Promise<Channel[]> => {
  // Provided channels data
  return [
    { name: "မဟာ HD", logo: "https://play-lh.googleusercontent.com/wvOXePMu15onYRUrKL1L_IxYsth0dJLi_qCliblXvM0vfmUL2yFTzFSIBOAhCsrTxQ", url: "https://tv.mahar.live/mahar/website.stream/playlist.m3u8" },
    { name: "ဒီဗွီဘီသတင်း", logo: "https://yt3.googleusercontent.com/8HhfrJBa1OmR9nbubJ16lzuxIR6QiT9mhW2EUDLMnmTibwZF2IIDghzn1g5Qfutx0g6xdx0D=s900-c-k-c0x00ffffff-no-rj", url: "https://live-stream.dvb.no/hls/stream_high/index.m3u8" },
    { name: "Mahar TV", logo: "https://i.imgur.com/ig0QECf.png", url: "https://tv.mahar.live/mahar/website.stream/playlist.m3u8" }
  ];
};

export const getSecureStreamUrl = (url: string) => {
  return `/api/stream?url=${encodeURIComponent(url)}`;
};
