import { motion } from "framer-motion";

interface ModeSelectorProps {
  onSelect: (mode: "solo" | "duel_host" | "duel_race" | "interview") => void;
}

const MODES = [
  {
    id: "solo",
    title: "Solo Protocol",
    desc: "Single player experience with secure proctoring.",
    icon: "❖",
    accent: "bg-surface-200 border-white/10 group-hover:border-white/30",
  },
  {
    id: "duel_race",
    title: "Speed Race",
    desc: "Competitive 1v1 on shared hardware.",
    icon: "⏣",
    accent: "bg-surface-200 border-white/10 group-hover:border-white/30",
  },
  {
    id: "duel_host",
    title: "Host Arena",
    desc: "Standard format. One Host, One Contestant.",
    icon: "◈",
    accent: "bg-surface-200 border-white/10 group-hover:border-white/30",
  },
  {
    id: "interview",
    title: "Career Prep",
    desc: "Technical deep dives across selected domains.",
    icon: "⎈",
    accent: "bg-surface-200 border-white/10 group-hover:border-white/30",
  },
];

export default function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl px-4 py-8">
      {MODES.map((mode) => (
        <motion.button
          key={mode.id}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(mode.id as any)}
          className={`relative p-8 rounded-3xl group transition-all duration-300 text-left flex flex-col items-start glass-panel-sleek hover:glass-panel-sleek-hover`}
        >
          <div className="mb-4 text-3xl text-zinc-500 group-hover:text-white transition-colors duration-300">
            {mode.icon}
          </div>
          <h3 className="text-xl font-medium text-zinc-100 mb-2 tracking-tight">
            {mode.title}
          </h3>
          <p className="text-sm text-zinc-500 font-light leading-relaxed">
            {mode.desc}
          </p>
          <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest flex items-center gap-2">
               Initialize Set <span className="text-white">→</span>
             </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
