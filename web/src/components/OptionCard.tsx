"use client";
import { motion, AnimatePresence } from "framer-motion";

interface OptionCardProps {
  index: number;
  text: string;
  selected: boolean;
  correct: boolean | null;
  eliminated: boolean;
  onClick: () => void;
  playMode: "solo" | "duel_host" | "duel_race" | "interview" | null;
}

export default function OptionCard({ index, text, selected, correct, eliminated, onClick, playMode }: OptionCardProps) {
  const letters = ["A", "B", "C", "D"];
  const duelKeysP1 = ["Q", "W", "E", "R"];
  const duelKeysP2 = ["U", "I", "O", "P"];

  if (eliminated) {
    return <div className="h-[72px] opacity-0 pointer-events-none" />;
  }

  let borderClass = "border-white/10 glass-panel-sleek";
  let letterClass = "text-zinc-400";
  let textClass = "text-zinc-200";

  if (selected) {
    if (correct === null) {
      // Suspense state — glowing amber
      borderClass = "border-amber-500/50 bg-amber-500/10 shadow-[0_4px_30px_rgba(245,158,11,0.2)]";
      letterClass = "text-amber-500";
      textClass = "text-amber-50 text-glow";
    } else if (correct === true) {
      borderClass = "border-zinc-300 bg-white/10 shadow-[0_4px_30px_rgba(255,255,255,0.15)]";
      letterClass = "text-zinc-200";
      textClass = "text-white font-medium";
    } else {
      borderClass = "border-zinc-800 bg-black/60 shadow-none";
      letterClass = "text-zinc-600";
      textClass = "text-zinc-500";
    }
  }

  const isDuel = playMode?.startsWith("duel");

  return (
    <div className="relative w-full">
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        whileHover={!selected && !isDuel ? { scale: 1.01 } : {}}
        whileTap={!selected && !isDuel ? { scale: 0.99 } : {}}
        onClick={onClick}
        disabled={selected || eliminated || (isDuel ?? false)}
        className={`group relative w-full h-[72px] flex items-center px-6 rounded-2xl transition-all duration-500 ${borderClass} overflow-hidden`}
      >        
        <div className="flex items-center gap-6 w-full relative z-10">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-200 border border-white/5">
            <span className={`font-mono font-bold text-sm ${letterClass}`}>
              {letters[index]}
            </span>
          </div>
          
          <span className={`text-[17px] tracking-tight text-left flex-1 transition-colors duration-300 ${textClass}`}>
            {text}
          </span>
        </div>

        {/* Duel Mode Hotkeys */}
        {isDuel && !selected && (
          <div className="absolute top-1/2 -translate-y-1/2 right-4 flex gap-2">
            <span className="font-mono text-[9px] px-2 py-1 object-cover rounded bg-white/5 text-zinc-400 border border-zinc-700">
              P1 {duelKeysP1[index]}
            </span>
            <span className="font-mono text-[9px] px-2 py-1 object-cover rounded bg-white/5 text-zinc-400 border border-zinc-700">
              P2 {duelKeysP2[index]}
            </span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
