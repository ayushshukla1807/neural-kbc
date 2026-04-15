"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";

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

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || selected) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  if (eliminated) {
    return <div className="h-[80px] opacity-0 pointer-events-none" />;
  }

  let borderClass = "glass-panel-sleek";
  let letterClass = "text-white glow-text-blue";
  let textClass = "text-zinc-200";
  let letterBg = "bg-white/5 border border-white/20";
  let wrapperClass = "spotlight-border";

  if (selected) {
    wrapperClass = ""; // remove spotlight when selected
    if (correct === null) {
      // Suspense lock-in
      borderClass = "glass-panel-gold animate-pulse";
      letterClass = "text-yellow-400 glow-text-gold";
      textClass = "text-yellow-100 placeholder-wave";
      letterBg = "bg-yellow-500/20 border border-yellow-400";
    } else if (correct === true) {
      // Correct!
      borderClass = "glass-panel-green scale-105";
      letterClass = "text-green-400 glow-text-green";
      textClass = "text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,1)]";
      letterBg = "bg-green-500/30 border border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.6)]";
    } else {
      // Incorrect :(
      borderClass = "glass-panel-red saturate-50 grayscale";
      letterClass = "text-red-400";
      textClass = "text-red-200";
      letterBg = "bg-red-500/10 border border-red-500/30";
    }
  }

  const isDuel = playMode?.startsWith("duel");

  return (
    <div className="relative w-full perspective-[1000px]">
      <AnimatePresence>
        {selected && correct === true && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="absolute top-0 right-10 z-[100] pointer-events-none"
          >
            <span className="text-4xl font-black text-green-400 glow-text-green">✓</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={cardRef}
        initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
        whileHover={!selected && !isDuel ? { scale: 1.03, y: -4, rotateX: 5 } : {}}
        whileTap={!selected && !isDuel ? { scale: 0.96 } : {}}
        onMouseMove={handleMouseMove}
        onClick={onClick}
        disabled={selected || eliminated || (isDuel ?? false)}
        className={`group relative w-full h-[80px] flex items-center px-6 rounded-2xl transition-all duration-300 ${wrapperClass} ${borderClass} overflow-hidden`}
        style={{ transformStyle: 'preserve-3d' }}
      >        
        {/* Interactive Mouse Gradient Spotlight */}
        {!selected && (
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"
            style={{
              background: `radial-gradient(150px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 240, 255, 0.4), transparent 40%)`
            }}
          />
        )}

        <div className="flex items-center gap-6 w-full relative z-10" style={{ transform: 'translateZ(20px)' }}>
          {/* 3D Floating Letter Hexagon equivalent */}
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${letterBg}`}>
            <span className={`font-mono font-black text-lg ${letterClass}`}>
              {letters[index]}
            </span>
          </div>
          
          <span className={`text-[19px] tracking-tight font-medium text-left flex-1 transition-colors duration-300 ${textClass}`}>
            {text}
          </span>
        </div>

        {/* Duel Mode Hotkeys */}
        {isDuel && !selected && (
           <div className="absolute top-1/2 -translate-y-1/2 right-4 flex gap-3 opacity-60">
             <div className="flex flex-col items-center">
                <span className="text-[8px] uppercase tracking-widest text-neon-purple font-black">P1</span>
                <span className="font-mono text-sm px-2 py-0.5 rounded bg-neon-purple/20 text-neon-purple border border-neon-purple/50 shadow-[0_0_10px_rgba(138,43,226,0.3)]">{duelKeysP1[index]}</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-[8px] uppercase tracking-widest text-yellow-500 font-black">P2</span>
                <span className="font-mono text-sm px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 shadow-[0_0_10px_rgba(255,215,0,0.3)]">{duelKeysP2[index]}</span>
             </div>
           </div>
        )}

        {/* Thick side-bar color highlight */}
        <div className={`absolute left-0 top-0 w-1.5 h-full rounded-l-2xl transition-all duration-300 ${
          selected && correct === true ? 'bg-green-400 shadow-[0_0_15px_rgba(34,197,94,1)]' :
          selected && correct === null ? 'bg-yellow-500 shadow-[0_0_15px_rgba(255,215,0,1)] animate-pulse' :
          selected && correct === false ? 'bg-red-500 shadow-[0_0_15px_rgba(220,38,38,1)]' :
          'bg-gradient-to-b from-cyan-400 to-blue-600 opacity-50 group-hover:opacity-100'
        }`} />

      </motion.button>
    </div>
  );
}
