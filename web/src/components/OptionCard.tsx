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

  // Dramatic 50:50 slicing animation class
  if (eliminated) {
    return (
       <div className="relative w-full h-[70px] pointer-events-none animate-slice-out flex items-center px-8 bg-[#0a0a2a]/50 text-white/20 border border-white/5 kbc-lozenge">
          <span className="font-mono text-xl mr-6 text-yellow-500/20">{letters[index]}:</span>
          <span className="text-xl line-through">{text}</span>
       </div>
    );
  }

  // Determine KBC state classes
  let kbcState = "kbc-hover";
  let letterColor = "text-kbc-gold";
  let textColor = "text-white";

  if (selected) {
    kbcState = ""; // remove hover
    if (correct === null) {
      kbcState = "kbc-locked"; // Orange / Amber flashing
      letterColor = "text-white";
      textColor = "text-white";
    } else if (correct === true) {
      kbcState = "kbc-correct"; // Green
      letterColor = "text-white";
      textColor = "text-white font-bold text-glow-white";
    } else {
      kbcState = "kbc-wrong"; // Dim grey
      letterColor = "text-zinc-500";
      textColor = "text-zinc-500";
    }
  }

  // Connect left/right lines (the KBC line tracing to the central diamond)
  const isLeft = index % 2 === 0;

  return (
    <div className="relative w-full py-1">
      
      {/* ── KBC Connector lines behind the button ── */}
      <div className={`absolute top-1/2 -translate-y-1/2 w-8 h-[2px] bg-gradient-to-${isLeft ? 'r' : 'l'} from-yellow-500/0 via-yellow-500 to-yellow-500 z-0 ${isLeft ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'} hidden md:block opacity-60 pointer-events-none`} />

      <motion.button
        initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
        whileHover={!selected && !isDuel ? { scale: 1.02 } : {}}
        onClick={onClick}
        disabled={selected || eliminated || (isDuel ?? false)}
        className={`group relative w-full h-[70px] ${kbcState} cursor-pointer z-10 block`}
      >        
        <div className="kbc-lozenge-wrapper w-full h-full absolute inset-0 transition-all duration-300">
           <div className="kbc-lozenge-inner transition-all duration-500 px-6 md:px-10 flex items-center">
              
              <div className="flex items-center w-full relative z-10">
                <span className={`font-serif font-black text-2xl mr-4 md:mr-8 transition-colors ${letterColor}`}>
                  {letters[index]}:
                </span>
                
                <span className={`text-xl md:text-2xl tracking-wide font-medium text-left flex-1 transition-all duration-300 ${textColor}`}>
                  {text}
                </span>

                <AnimatePresence>
                  {selected && correct === true && (
                     <motion.div initial={{scale: 3, opacity: 0}} animate={{scale: 1, opacity: 1}} className="ml-4 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_white]">
                        <span className="text-green-600 font-bold text-lg">✓</span>
                     </motion.div>
                  )}
                </AnimatePresence>
              </div>

           </div>
        </div>

        {/* Duel Mode Hotkeys */}
        {isDuel && !selected && (
           <div className="absolute top-1/2 -translate-y-1/2 right-8 flex gap-3 z-20">
             <span className="font-mono text-sm px-2 py-0.5 rounded bg-black/60 text-white border border-white/20">P1: {duelKeysP1[index]}</span>
             <span className="font-mono text-sm px-2 py-0.5 rounded bg-black/60 text-white border border-white/20">P2: {duelKeysP2[index]}</span>
           </div>
        )}

      </motion.button>
    </div>
  );
}
