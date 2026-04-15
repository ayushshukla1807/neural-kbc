import { motion } from "framer-motion";
import { useState, useRef } from "react";

interface ModeSelectorProps {
  onSelect: (mode: "solo" | "duel_host" | "duel_race" | "interview") => void;
}

const MODES = [
  {
    id: "solo",
    title: "SOLO OPS",
    desc: "Strict DOM Proctoring. Live Generative AI. ETH Rewards.",
    icon: "🎯",
    bgClass: "from-cyan-600/20 to-black",
    glowClass: "group-hover:shadow-[0_0_40px_rgba(0,240,255,0.4)]",
    lineClass: "bg-cyan-400"
  },
  {
    id: "duel_race",
    title: "SPEED RACE",
    desc: "Competitive 1v1. Same questions. Fastest finger wins.",
    icon: "⚡",
    bgClass: "from-yellow-500/20 to-black",
    glowClass: "group-hover:shadow-[0_0_40px_rgba(255,215,0,0.4)]",
    lineClass: "bg-yellow-400"
  },
  {
    id: "duel_host",
    title: "HOST ARENA",
    desc: "Standard KBC. One Host, One Player. Manual flow.",
    icon: "🎙️",
    bgClass: "from-purple-600/20 to-black",
    glowClass: "group-hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]",
    lineClass: "bg-purple-400"
  },
  {
    id: "interview",
    title: "INTERVIEW ARENA",
    desc: "Technical Career Prep. AI-driven industry drills.",
    icon: "💼",
    bgClass: "from-emerald-500/20 to-black",
    glowClass: "group-hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]",
    lineClass: "bg-emerald-400"
  },
];

export default function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl px-4 py-8 perspective-[1200px]">
      {MODES.map((mode, i) => (
        <ModeCard key={mode.id} mode={mode} index={i} onSelect={onSelect} />
      ))}
    </div>
  );
}

function ModeCard({ mode, index, onSelect }: any) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  return (
    <motion.button
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, type: "spring", bounce: 0.5 }}
      whileHover={{ y: -10, rotateX: 6, rotateY: -3, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseMove={handleMouseMove}
      onClick={() => onSelect(mode.id)}
      className={`relative p-8 rounded-[2rem] group transition-all duration-300 text-left flex flex-col items-start bg-gradient-to-br ${mode.bgClass} border border-white/10 ${mode.glowClass} overflow-hidden`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Interactive Spotlight */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"
        style={{ background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.4), transparent 50%)` }}
      />
      
      {/* Watermark Icon */}
      <div className="absolute -top-4 -right-4 text-7xl opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 pointer-events-none" style={{ transform: 'translateZ(-10px)' }}>
        {mode.icon}
      </div>

      <div className="mb-6 text-4xl" style={{ transform: 'translateZ(30px)' }}>
        {mode.icon}
      </div>
      
      <h3 className="text-2xl font-black text-white mb-3 tracking-tighter uppercase drop-shadow-md" style={{ transform: 'translateZ(40px)' }}>
        {mode.title}
      </h3>
      
      <p className="text-sm text-zinc-400 font-medium leading-relaxed" style={{ transform: 'translateZ(20px)' }}>
        {mode.desc}
      </p>
      
      <div className="mt-8 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0" style={{ transform: 'translateZ(50px)' }}>
         <span className={`h-[2px] w-8 ${mode.lineClass}`}></span>
         <span className="text-[10px] text-white font-bold uppercase tracking-widest">
           Initialize Sandbox
         </span>
      </div>
    </motion.button>
  );
}
