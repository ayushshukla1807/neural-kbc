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
    <div className="flex flex-col gap-1 p-5 glass-panel-sleek rounded-3xl w-full max-w-[260px]">
      <h3 className="text-[10px] font-medium tracking-widest text-zinc-500 mb-6 uppercase text-left">{isInterview ? 'Career Track' : 'Reward Trajectory'}</h3>
      <div className="flex flex-col-reverse gap-1.5">
        {prizeLadder.map((prize, idx) => {
          const isActive = idx === currentLevel;
          const isMilestone = idx === 4 || idx === 9 || idx === 15;
          const isPassed = idx < currentLevel;

          return (
            <div
              key={idx}
              className={`flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-white text-zinc-950 shadow-[0_0_24px_rgba(255,255,255,0.4)] z-10 scale-105"
                  : isPassed
                  ? "opacity-20 grayscale"
                  : "opacity-80"
              }`}
            >
              <span className={`font-mono text-[10px] w-6 ${isActive ? "text-zinc-500" : isMilestone ? "text-amber-500/80" : "text-zinc-600"}`}>
                {idx + 1}
              </span>
              <span className={`font-mono text-xs tracking-wider ${
                isActive ? "font-bold text-zinc-950" : isMilestone ? "font-bold text-amber-500" : "font-medium text-zinc-400"
              }`}>
                {isInterview ? `${(idx + 1) * 1000} XP` : prize}
              </span>
              {isMilestone && !isActive && !isPassed && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
