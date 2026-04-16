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

  const isDuel = playMode?.startsWith("duel");

  // Eliminated — 50:50 lifeline
  if (eliminated) {
    return (
      <div className="relative w-full py-1 opacity-30 pointer-events-none">
        <div className="kbc-lozenge-wrapper w-full h-[70px]">
          <div className="kbc-lozenge-inner w-full h-full">
            <span className="font-serif font-black text-2xl mr-8 text-yellow-500/30 line-through">{letters[index]}:</span>
            <span className="text-xl text-white/20 line-through">{text}</span>
          </div>
        </div>
      </div>
    );
  }

  // State classes for wrapper/inner
  let wrapperExtra = "";
  let innerExtra = "";
  let letterColor = "text-kbc-gold";
  let textColor = "text-white";
  let stateClass = "kbc-hover";

  if (selected) {
    if (correct === null) {
      // Locked — orange suspense
      stateClass = "kbc-locked";
      letterColor = "text-white";
      textColor = "text-white";
      wrapperExtra = "scale-[1.02]";
    } else if (correct === true) {
      stateClass = "kbc-correct";
      letterColor = "text-white";
      textColor = "text-white font-bold";
    } else {
      stateClass = "kbc-wrong";
      letterColor = "text-zinc-400";
      textColor = "text-zinc-400";
    }
  }

  const isLeft = index % 2 === 0;

  return (
    <div className="relative w-full py-1">
      {/* KBC Connector lines */}
      <div className={`absolute top-1/2 -translate-y-1/2 w-8 h-[2px] ${isLeft ? 'right-0 translate-x-full bg-gradient-to-r' : 'left-0 -translate-x-full bg-gradient-to-l'} from-yellow-500/0 via-yellow-500 to-yellow-500 z-0 hidden md:block opacity-60 pointer-events-none`} />

      <motion.button
        initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
        whileHover={!selected && !isDuel ? { scale: 1.02 } : {}}
        onClick={onClick}
        disabled={selected || eliminated || (isDuel ?? false)}
        className={`group relative w-full h-[70px] ${stateClass} ${wrapperExtra} cursor-pointer z-10 block transition-all duration-300`}
      >
        {/* Single outer wrapper with clip-path and gold drop-shadow */}
        <div className="kbc-lozenge-wrapper w-full h-full absolute inset-0 transition-all duration-300">
          {/* Dark inner fill — same clip-path from CSS */}
          <div className="kbc-lozenge-inner transition-all duration-500 w-full h-full">
            <div className="flex items-center w-full relative z-10">
              <span className={`font-serif font-black text-2xl mr-6 md:mr-10 shrink-0 transition-colors ${letterColor}`}>
                {letters[index]}:
              </span>
              <span className={`text-lg md:text-xl tracking-wide font-semibold text-left flex-1 transition-all duration-300 ${textColor}`}>
                {text}
              </span>

              <AnimatePresence>
                {selected && correct === true && (
                  <motion.div
                    initial={{ scale: 3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="ml-4 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_white] shrink-0"
                  >
                    <span className="text-green-600 font-black text-base">✓</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Duel Mode Hotkeys overlay */}
        {isDuel && !selected && (
          <div className="absolute top-1/2 -translate-y-1/2 right-10 flex gap-3 z-20">
            <span className="font-mono text-sm px-2 py-0.5 rounded bg-black/60 text-white border border-white/20">P1: {duelKeysP1[index]}</span>
            <span className="font-mono text-sm px-2 py-0.5 rounded bg-black/60 text-white border border-white/20">P2: {duelKeysP2[index]}</span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
