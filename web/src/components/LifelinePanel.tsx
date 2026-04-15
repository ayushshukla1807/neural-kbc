"use client";
import { motion } from "framer-motion";

interface LifelinePanelProps {
  lifelines: { split: boolean; cluster: boolean; oracle: boolean };
  onUse: (type: 'split' | 'cluster' | 'oracle') => void;
  disabled: boolean;
}

export default function LifelinePanel({ lifelines, onUse, disabled }: LifelinePanelProps) {
  const items = [
    { id: 'split', label: '50:50', icon: '◖◗', active: !lifelines.split },
    { id: 'cluster', label: 'Poll', icon: '📊', active: !lifelines.cluster },
    { id: 'oracle', label: 'Oracle', icon: '👁️', active: !lifelines.oracle },
  ];

  return (
    <div className="flex gap-4 p-3 glass-panel-sleek rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      {items.map((item) => (
        <motion.button
          key={item.id}
          whileHover={item.active && !disabled ? { scale: 1.15, y: -4 } : {}}
          whileTap={item.active && !disabled ? { scale: 0.9 } : {}}
          disabled={!item.active || disabled}
          onClick={() => onUse(item.id as any)}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center border-[2px] transition-all duration-300 ${
            !item.active 
              ? "border-red-500/20 bg-red-950/40 cursor-not-allowed opacity-40 grayscale" 
              : "border-cyan-400 bg-cyan-900/40 hover:bg-cyan-600/30 shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]"
          }`}
        >
          <span className={`text-2xl font-black ${item.active ? "text-cyan-300 glow-text-blue" : "text-zinc-500"}`}>
            {item.icon}
          </span>
          
          <span className={`absolute -bottom-7 text-[9px] font-black tracking-widest uppercase whitespace-nowrap transition-colors ${item.active ? "text-cyan-400 glow-text-blue" : "text-zinc-600"}`}>
            {item.label}
          </span>

          {/* Active sweeping border indicator */}
          {item.active && (
            <div className="absolute inset-0 rounded-full border border-cyan-300 opacity-20 animate-spin" style={{ animationDuration: '4s', clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)' }}></div>
          )}

          {!item.active && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[2px] bg-red-500/60 rotate-45"></div>
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
