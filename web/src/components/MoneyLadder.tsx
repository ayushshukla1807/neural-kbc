"use client";
import { motion } from "framer-motion";

interface MoneyLadderProps {
  currentLevel: number;
  prizeLadder: string[];
  mode?: "solo" | "duel_host" | "duel_race" | "interview" | null;
}

export default function MoneyLadder({ currentLevel, prizeLadder, mode }: MoneyLadderProps) {
  const isInterview = mode === "interview";
  
  return (
    <div className="flex flex-col gap-1 p-6 glass-panel-sleek rounded-[2rem] w-full max-w-[280px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <h3 className="text-[10px] font-black tracking-[0.3em] text-cyan-400 mb-6 uppercase text-center drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">{isInterview ? 'Career Track' : 'Reward Trajectory'}</h3>
      <div className="flex flex-col-reverse gap-1.5">
        {prizeLadder.map((prize, idx) => {
          const isActive = idx === currentLevel;
          const isMilestone = idx === 4 || idx === 9 || idx === 15;
          const isPassed = idx < currentLevel;

          return (
            <motion.div
              key={idx}
              animate={isActive ? { scale: [1, 1.05, 1], x: [0, 5, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className={`relative flex items-center justify-between px-4 py-2 rounded-xl transition-all duration-500 overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/30 to-blue-600/10 border border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] z-10"
                  : isPassed
                  ? "opacity-30 grayscale saturate-0"
                  : "opacity-80 hover:bg-white/5"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer-sweep_2s_infinite]" />
              )}
              
              <span className={`font-mono text-[10px] w-6 relative z-10 ${isActive ? "text-cyan-300 font-bold" : isMilestone ? "text-yellow-500 font-bold" : "text-zinc-500"}`}>
                {idx + 1}
              </span>
              <span className={`font-mono text-sm tracking-widest relative z-10 ${
                isActive ? "font-black text-white glow-text-blue" : isMilestone ? "font-bold text-yellow-500" : "font-medium text-zinc-300"
              }`}>
                {isInterview ? `${(idx + 1) * 1000} XP` : prize}
              </span>
              {isMilestone && !isActive && !isPassed && (
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(255,215,0,0.8)] relative z-10"></div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
