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
    { id: 'cluster', label: 'Poll', icon: '⑊', active: !lifelines.cluster },
    { id: 'oracle', label: 'Expert', icon: '❂', active: !lifelines.oracle },
  ];

  return (
    <div className="flex gap-3 p-2 glass-panel-sleek rounded-full border border-white/5 bg-white/5">
      {items.map((item) => (
        <motion.button
          key={item.id}
          whileHover={item.active && !disabled ? { scale: 1.05 } : {}}
          whileTap={item.active && !disabled ? { scale: 0.95 } : {}}
          disabled={!item.active || disabled}
          onClick={() => onUse(item.id as any)}
          className={`relative px-6 py-2 rounded-full flex items-center justify-center gap-2 transition-all duration-300 ${
            !item.active 
              ? "bg-black/20 border border-transparent shadow-inner text-zinc-600 cursor-not-allowed opacity-50" 
              : "bg-surface-200 border border-white/10 hover:border-white/20 hover:bg-white/10 text-zinc-300 hover:text-white"
          }`}
        >
          <span className="text-sm">
            {item.icon}
          </span>
          <span className="text-xs font-medium tracking-wide">
            {item.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
