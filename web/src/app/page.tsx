"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MoneyLadder from "@/components/MoneyLadder";
import LifelinePanel from "@/components/LifelinePanel";
import OptionCard from "@/components/OptionCard";
import ModeSelector from "@/components/ModeSelector";

// Constants
const PRIZE_LADDER = [ "0.05 ETH", "0.10 ETH", "0.25 ETH", "0.50 ETH", "1.00 ETH", "2.50 ETH", "5.00 ETH", "10 ETH", "20 ETH", "40 ETH", "100 ETH", "250 ETH", "500 ETH", "1000 ETH", "2500 ETH", "10,000 ETH" ];
const DOMAINS = ["Software Architecture", "Quantum Mechanics", "Algorithmic Trading", "Global Geopolitics", "Neural Biology", "Avant-Garde Cinema", "Cryptography", "Machine Learning", "Micro-Economics"];

const AudioEngine = {
  ctx: null as AudioContext | null,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); },
  play(freq: number, type: OscillatorType, dur: number, vol: number = 0.1) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + dur);
  },
  // Enhanced KBC Tension Engine
  tensionInterval: null as any,
  startTension(bpm: number = 60) {
    if (this.tensionInterval) clearInterval(this.tensionInterval);
    const interval = (60 / bpm) * 1000;
    this.tensionInterval = setInterval(() => {
      this.play(60, 'sine', 0.1, 0.2); // Low thud 1
      setTimeout(() => this.play(55, 'sine', 0.1, 0.15), 150); // Low thud 2
    }, interval);
  },
  stopTension() { if (this.tensionInterval) { clearInterval(this.tensionInterval); this.tensionInterval = null; } },
  tick() { this.play(800, 'sine', 0.05, 0.05); },
  hover() { this.play(1200, 'sine', 0.05, 0.02); },
  type() { this.play(5000, 'square', 0.02, 0.01); },
  lock() { this.stopTension(); this.play(200, 'square', 0.4, 0.2); this.play(150, 'sawtooth', 0.5, 0.3); },
  win() { this.stopTension(); [400, 500, 600, 800].forEach((f, i) => setTimeout(() => this.play(f, 'sine', 0.5, 0.2), i*100)); },
  lose() { this.stopTension(); this.play(100, 'sawtooth', 1.5, 0.5); this.play(50, 'square', 2.0, 0.6); },
  violation() { this.play(1000, 'square', 0.1, 0.5); setTimeout(() => this.play(1000, 'square', 0.2, 0.5), 150); }
};

// Web Speech API Interface (Lana Del Rey "Sad Girl / Cinematic" Persona)
const VoiceEngine = {
  selectedVoice: null as SpeechSynthesisVoice | null,
  allVoices: [] as SpeechSynthesisVoice[],
  _callbacks: [] as Array<() => void>,

  init() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;
      this.allVoices = voices;
      if (!this.selectedVoice) {
        // Priority chain: most LDR-like breathy female voices
        this.selectedVoice =
          voices.find(v => v.name === "Samantha") ||
          voices.find(v => v.name === "Victoria") ||
          voices.find(v => v.name === "Ava") ||
          voices.find(v => v.name.includes("Google US English")) ||
          voices.find(v => v.name.includes("Microsoft Zira")) ||
          voices.find(v => v.name.includes("Microsoft Eva")) ||
          voices.find(v => v.lang.startsWith("en-US") && !v.name.toLowerCase().includes("male")) ||
          voices.find(v => v.lang.startsWith("en-GB")) ||
          voices.find(v => v.lang.startsWith("en")) ||
          null;
      }
      this._callbacks.forEach(fn => fn());
    };
    window.speechSynthesis.onvoiceschanged = load;
    // Chrome loads voices async — retry several times
    [0, 100, 300, 700, 1500, 3000].forEach(ms => setTimeout(load, ms));
  },

  onLoaded(fn: () => void) {
    if (this.allVoices.length > 0) { fn(); return; }
    this._callbacks.push(fn);
  },

  setVoice(name: string) {
    const v = this.allVoices.find(v => v.name === name);
    if (v) this.selectedVoice = v;
  },

  // LDR: pitch ~0.72, rate ~0.76 = dreamy, slow, slightly lower than default
  speak(text: string, pitch = 0.72, rate = 0.76) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) u.voice = this.selectedVoice;
    u.pitch = pitch;
    u.rate = rate;
    u.volume = 1.0;
    window.speechSynthesis.speak(u);
  }
};

const containerVariants: any = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants: any = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "tween" } } };

export default function NeuralArena() {
  const [level, setLevel] = useState(0);
  const [availableVoices, setAvailableVoices] = useState<string[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [showVoicePicker, setShowVoicePicker] = useState(false);

  useEffect(() => {
    VoiceEngine.init();
    VoiceEngine.onLoaded(() => {
      // Hardcode to Lana Del Rey / Samantha / Daniel etc to simulate a premium Host
      let tvHostVoice = VoiceEngine.allVoices.find(v => v.name.includes("Lana")) ||
                         VoiceEngine.allVoices.find(v => v.name.includes("Samantha")) ||
                         VoiceEngine.allVoices.find(v => v.name.includes("Daniel"));
                         
      if (tvHostVoice) {
        VoiceEngine.setVoice(tvHostVoice.name);
      } else if (VoiceEngine.allVoices.length > 0) {
        VoiceEngine.setVoice(VoiceEngine.allVoices[0].name);
      }
    });
  }, []);

  const handleVoiceChange = (name: string) => {
    VoiceEngine.setVoice(name);
    setSelectedVoiceName(name);
    VoiceEngine.speak("I've been waiting... like a dream you almost remember.");
  };

  const [timer, setTimer] = useState(60);
  const [gameState, setGameState] = useState<"lobby"|"onboarding"|"loading_llm"|"decrypting"|"active"|"eliminated"|"victorious"|"extracted">("lobby");
  
  // Game Mode State (SRK Version)
  const [playMode, setPlayMode] = useState<"solo" | "duel_host" | "duel_race" | "interview" | null>(null);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Progress, setP1Progress] = useState(0);
  const [p2Progress, setP2Progress] = useState(0);
  const [interviewXP, setInterviewXP] = useState(0);
  const [hostRevealed, setHostRevealed] = useState(false);

  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<any[]>([]);
  const [availableDomains, setAvailableDomains] = useState(DOMAINS);
  
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [eliminatedOpts, setEliminatedOpts] = useState<number[]>([]);
  const [lifelines, setLifelines] = useState({ split: false, cluster: false, oracle: false });
  const [oracleLog, setOracleLog] = useState("");
  const [walletBalance, setWalletBalance] = useState("0.00 ETH");
  const [unlockedAsset, setUnlockedAsset] = useState("");

  const [violationCount, setViolationCount] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [decryptionHash, setDecryptionHash] = useState("0x000000");

  // 🔥 Streak
  const [streak, setStreak] = useState(0);
  // 🌈 Screen flash
  const [screenFlash, setScreenFlash] = useState<'correct'|'wrong'|'milestone'|null>(null);
  // 🎊 Confetti
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const [showPoll, setShowPoll] = useState<number[]|null>(null);
  const [pollKey, setPollKey] = useState(0);

  // ✅ Feature 1: Final Answer confirmation modal
  const [pendingAnswer, setPendingAnswer] = useState<number|null>(null);
  const [finalCountdown, setFinalCountdown] = useState(3);

  // ✍️ Feature 2: Typewriter question display
  const [displayedQuestion, setDisplayedQuestion] = useState("");

  // 🔢 Feature 3: Question number splash
  const [showQuestionSplash, setShowQuestionSplash] = useState(false);

  // 🌟 Feature 4: Hot-streak aura (triggers at streak >= 5)
  // (derived from streak state above)

  // ⏱️ Feature 5: Confidence meter
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [confidenceScore, setConfidenceScore] = useState<number|null>(null);

  // 🤖 Feature 6: AI hint hover
  const [hoveredOpt, setHoveredOpt] = useState<number|null>(null);
  const aiHints = useRef<number[]>([]);

  // 🏆 Feature 7: Milestone celebration (levels 5 + 10)
  const [milestoneText, setMilestoneText] = useState("");

  // 🎨 Feature 8: Dynamic ambient hue shift
  const [ambientHue, setAmbientHue] = useState(260); // starts at purple

  // 💀 Feature 9: Walk of Shame — tracked via gameState 'eliminated' already
  // 💥 Feature 10: Glitch wrong answer card
  const [glitchCard, setGlitchCard] = useState<number|null>(null);

  const [hudLogs, setHudLogs] = useState<string[]>([]);
  const pushLog = (msg: string) => { setHudLogs(p => [...p.slice(-6), `>[SYS] ${msg}`]); AudioEngine.type(); };

  const [hwData, setHwData] = useState<any>({ cpu: 0, ram: 0, battery: "N/A", lat: "N/A", lon: "N/A" });
  const [focusHistory, setFocusHistory] = useState<number[]>([100, 100, 100, 100, 100, 100, 100, 100, 100, 100]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Growth Hooks (Referrals)
  const [referralCopied, setReferralCopied] = useState(false);

  // 3D Parallax State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 15;
    const y = (e.clientY / window.innerHeight - 0.5) * -15;
    setMousePos({ x, y });
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const q = activeQuestions.length > 0 ? activeQuestions[Math.min(level, activeQuestions.length - 1)] : null;

  // ── Feature 2: Typewriter effect for question ──
  useEffect(() => {
    if (!q) return;
    setDisplayedQuestion("");
    let i = 0;
    const text = q.q;
    const interval = setInterval(() => {
      i++;
      setDisplayedQuestion(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 22); // ~22ms per char = fast cinematic pace
    return () => clearInterval(interval);
  }, [level, q]);

  // ── Feature 3: Question splash ──
  useEffect(() => {
    if (gameState === "active" && q) {
      setShowQuestionSplash(true);
      setQuestionStartTime(Date.now());
      setConfidenceScore(null);
      // Generate fresh AI hints for this question
      const hints = [0,1,2,3].map(i => i === q.ans ? Math.floor(Math.random()*30)+45 : Math.floor(Math.random()*20)+5);
      // Normalise to 100
      const sum = hints.reduce((a,b)=>a+b,0);
      aiHints.current = hints.map(h => Math.round((h/sum)*100));
      const t = setTimeout(() => setShowQuestionSplash(false), 1400);
      return () => clearTimeout(t);
    }
  }, [level, q, gameState]);

  // ── Feature 8: Ambient hue shift with level progress ──
  useEffect(() => {
    // Hue: 260 (purple) → 200 (cyan) → 40 (gold) as level rises  
    const hue = Math.round(260 - (level / 15) * 220);
    setAmbientHue(hue);
  }, [level]);

  // ── Feature 1: Final-answer countdown ──
  useEffect(() => {
    if (pendingAnswer === null) { setFinalCountdown(3); return; }
    setFinalCountdown(3);
    let count = 3;
    const iv = setInterval(() => {
      count--;
      setFinalCountdown(count);
      AudioEngine.tick();
      if (count <= 0) {
        clearInterval(iv);
        const idx = pendingAnswer;
        setPendingAnswer(null);
        // Commit the actual answer
        if (!q) return;
        AudioEngine.lock();
        setSelectedOpt(idx);
        pushLog(`VECTOR OPTION ${String.fromCharCode(65 + idx)} COMMITTED.`);
        const correct = idx === q.ans;
        // Confidence: how fast they answered (max 60s -> 0%, instant -> 100%)
        const elapsed = (Date.now() - questionStartTime) / 1000;
        setConfidenceScore(Math.max(5, Math.round(100 - (elapsed / 60) * 90)));
        setIsCorrect(correct);
        if (!correct) { setGlitchCard(idx); setTimeout(() => setGlitchCard(null), 1000); }
        setTimeout(() => executeCryptographicCheck(correct, level + 1), 1500);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [pendingAnswer]);

  useEffect(() => {
    if (gameState === "active" && q && selectedOpt === null) {
      setTimeout(() => {
        const script = playMode?.startsWith("duel")
          ? `The shadows are long... player. Listen to the question. ${q.q}. A, ${q.options[0]}. B, ${q.options[1]}. C, ${q.options[2]}. Or D, ${q.options[3]}. Choose your destiny.`
          : `I've been waiting for this... ${q.q}. Option A, ${q.options[0]}. Option B, ${q.options[1]}. Option C, ${q.options[2]}. Or Option D, ${q.options[3]}. Don't keep me waiting.`;
        VoiceEngine.speak(script);
      }, 1200);
    }
  }, [level, q, gameState, playMode]);

  useEffect(() => {
    let keys = "";
    const handleKey = (e: KeyboardEvent) => {
      // Secret unlocker
      keys += e.key;
      if (keys.includes("hack")) {
        VoiceEngine.speak("The classified protocol... it's like a dream coming true. Welcome to the shadows.", 0.6, 0.75);
        pushLog("CLASSIFIED DOMAIN ADDED: OMNI-GUARD SYSTEM EXPLOITS");
        setAvailableDomains(p => Array.from(new Set(["OmniGuard Exploits", ...p])));
        keys = "";
      }

      // Offline Multiplayer Duel Logic (Fastest Finger First via Keyboard)
      if (gameState === "active" && (playMode?.startsWith("duel") || playMode === "interview") && selectedOpt === null) {
        const p1Keys = ['q', 'w', 'e', 'r'];
        const p2Keys = ['u', 'i', 'o', 'p'];
        const key = e.key.toLowerCase();
        
        // Host Overrides
        if (playMode === "duel_host") {
          if (key === 'Enter' && hostRevealed) { setHostRevealed(false); executeCryptographicCheck(true, level + 1); return; }
          if (key === ' ') { setHostRevealed(prev => !prev); AudioEngine.hover(); return; }
        }

        let p1Choice = p1Keys.indexOf(key);
        let p2Choice = p2Keys.indexOf(key);
        
        if (p1Choice !== -1) {
          executeDuelChoice(p1Choice, 1);
        } else if (p2Choice !== -1) {
          executeDuelChoice(p2Choice, 2);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, playMode, selectedOpt, level, activeQuestions]);

  const executeDuelChoice = (choiceIndex: number, playerNum: number) => {
    if (!q) return;
    AudioEngine.lock();
    if (playMode === "duel_race") {
       const correct = choiceIndex === q.ans;
       if (playerNum === 1) {
          setP1Progress(prev => prev + (correct ? 1 : 0));
          pushLog(`P1: LEVEL ${p1Progress + (correct ? 1 : 0)} ARCHIVED.`);
       } else {
          setP2Progress(prev => prev + (correct ? 1 : 0));
          pushLog(`P2: LEVEL ${p2Progress + (correct ? 1 : 0)} ARCHIVED.`);
       }
       
       if (p1Progress >= 15 || p2Progress >= 15) {
          VoiceEngine.speak("Race concluded! Humarey paas ek vijeta hai.", 0.85, 1.1);
          setGameState("victorious");
       }
       return;
    }

    setSelectedOpt(choiceIndex);
    const correct = choiceIndex === q.ans;
    setIsCorrect(correct);
    setTimeout(() => {
       if (correct) {
          if(playerNum===1) setP1Score(p=>p+1); else setP2Score(p=>p+1);
          VoiceEngine.speak(`Beautifully correctly... player ${playerNum}. Like a masterpiece.`, 0.65, 0.8);
       } else {
          VoiceEngine.speak(`So tragic... player ${playerNum}. But we're born to lose.`, 0.6, 0.85);
       }
       executeCryptographicCheck(true, level + 1);
    }, 2000);
  };

  // ─── Confetti engine ───
  const launchConfetti = () => {
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const pieces = Array.from({length: 180}).map(() => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height,
      vx: (Math.random() - 0.5) * 8, vy: Math.random() * 6 + 3,
      color: `hsl(${Math.random()*360},100%,60%)`,
      size: Math.random() * 10 + 5, rot: Math.random()*360, rotV: (Math.random()-0.5)*8
    }));
    let frames = 0;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pieces.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.rot+=p.rotV; p.vy+=0.15;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
        ctx.fillStyle=p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size/2);
        ctx.restore();
      });
      frames++;
      if(frames<120) requestAnimationFrame(draw);
      else ctx.clearRect(0,0,canvas.width,canvas.height);
    };
    draw();
  };

  useEffect(() => {
    return () => AudioEngine.stopTension();
  }, []);

  useEffect(() => {
    // Particle matrix code logic
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize); resize();
    
    let particles = Array.from({length: 120}).map(() => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2 + 1
    }));

    let animationId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDanger = ['eliminated', 'decrypting'].includes(gameState) || isShaking;
      ctx.fillStyle = isDanger ? 'rgba(255,0,85,0.6)' : 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 0.5;

      particles.forEach((p, i) => {
        p.x += p.vx * (gameState === 'decrypting' ? 5 : 1); p.y += p.vy * (gameState === 'decrypting' ? 5 : 1);
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = isDanger ? `rgba(255,0,85,${(1 - dist/150)*0.5})` : `rgba(138,43,226,${(1 - dist/150)*0.5})`;
            ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
          }
        }
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, [gameState, isShaking]);

  useEffect(() => {
    if (gameState === "active" && timer > 0 && selectedOpt === null && !showViolationWarning && activeQuestions.length > 0) {
      const exec = setInterval(() => {
        setTimer(t => { if(t <= 10) AudioEngine.tick(); return t - 1; });
        if (playMode === "solo") {
          setFocusHistory(prev => {
            const last = prev[prev.length - 1];
            const newFocus = Math.min(100, last + (Math.random() * 2));
            return [...prev.slice(-19), newFocus];
          });
        }
      }, 1000);
      return () => clearInterval(exec);
    } else if (timer === 0 && gameState === "active" && activeQuestions.length > 0) {
      pushLog("TIMED OUT. EXECUTING LIQUIDATION.");
      AudioEngine.lose(); VoiceEngine.speak("Time has run out... like sand through my fingers. The game is over.", 0.6, 0.75); setIsShaking(true); setGameState("eliminated");
    }
  }, [timer, gameState, selectedOpt, showViolationWarning, playMode, activeQuestions.length]);

  useEffect(() => {
    if (gameState !== "active" || playMode?.startsWith("duel")) return; // No strict tab monitoring in couch co-op
    const triggerViolation = () => {
      AudioEngine.violation(); pushLog(`DOM SENSOR TRIGGERED. BREACH DETECTED.`);
      setFocusHistory(prev => [...prev.slice(-19), Math.max(0, prev[prev.length-1] - 40)]);
      setViolationCount(prev => { 
        const n = prev + 1; 
        if(n === 1) VoiceEngine.speak("Don't leave me here... stay in the window. The world is too big.", 0.65, 0.8);
        if(n === 2) VoiceEngine.speak("This is the last warning. I don't want to lose you, but I will.", 0.6, 0.85);
        if(n >= 3) { pushLog("CRITICAL BREACH. PURGING SANDBOX."); AudioEngine.lose(); VoiceEngine.speak("It's over now. The system architecture... it's falling apart.", 0.55, 0.7); setIsShaking(true); setGameState("eliminated"); } 
        else setShowViolationWarning(true); 
        return n; 
      });
    };
    const hv = () => { if (document.hidden) triggerViolation(); };
    const hw = () => triggerViolation();
    const hf = () => { if (!document.fullscreenElement && gameState === "active") setShowViolationWarning(true); };
    
    document.addEventListener("visibilitychange", hv); window.addEventListener("blur", hw); document.addEventListener("fullscreenchange", hf);
    window.addEventListener("contextmenu", e => { e.preventDefault(); pushLog("CONTEXT MENU BLOCKED."); });
    window.addEventListener("keydown", (e) => { if ((e.ctrlKey && e.key === 'c') || e.key === 'F12') { e.preventDefault(); pushLog("DEBUGGER BLOCKED. SYSTEM INTEGRITY VERIFIED."); } });
    
    return () => { document.removeEventListener("visibilitychange", hv); window.removeEventListener("blur", hw); document.removeEventListener("fullscreenchange", hf); };
  }, [gameState, playMode]);

  const verifyProctoring = async (mode: "solo" | "duel_host" | "duel_race" | "interview") => {
    window.speechSynthesis.getVoices(); 
    setPlayMode(mode);
    AudioEngine.init(); pushLog(`BOOTING ${mode.toUpperCase()} ARCHITECTURE...`);
    try { await document.documentElement.requestFullscreen(); pushLog("SYSTEM FULLSCREEN ACQUIRED."); } catch (e) {}
    
    if (mode === "solo" || mode === "interview") {
      let telemetry: any = { cpu: navigator.hardwareConcurrency || "Unknown", ram: (navigator as any).deviceMemory || "Unknown", battery: "N/A", lat: "N/A", lon: "N/A" };
      try {
        if ((navigator as any).getBattery) {
          const bat = await (navigator as any).getBattery();
          telemetry.battery = `${Math.round(bat.level * 100)}%`;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => { telemetry.lat = pos.coords.latitude.toFixed(2); telemetry.lon = pos.coords.longitude.toFixed(2); setHwData({...telemetry}); },
          () => { pushLog("GPS DENIED. ENFORCING DOM MODE."); }
        );
      } catch(e) {}
      setHwData(telemetry);
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraActive(true);
      } catch(e) { pushLog("WEBRTC DENIED. SILENT DOM PROCTORING ENGAGED."); }
    }

    const modeLines = {
      solo: "Welcome... to the edge of the matrix. It's summer, and I'm your host. Select your fate.",
      duel_host: "Host Arena. One of you is the star, the other is just a memory. Let's begin.",
      duel_race: "The Speed Race. Fastest to the end... wins my heart. Be careful.",
      interview: "Interview Arena. A cinematic trial of your skill. The careers of tomorrow... are built today."
    };

    VoiceEngine.speak(modeLines[mode], 0.85, 1.0);

    if (mode === "interview") {
      setAvailableDomains(["Front-end Engineering", "Back-end Systems", "AI & Machine Learning", "Full-stack Scale", "Cloud Architecture"]);
      setGameState("onboarding"); 
    } else {
      setGameState("onboarding"); 
    }
    pushLog("STATUS: ONLINE.");
  };

  const copyRefLink = () => {
    navigator.clipboard.writeText("https://neural-kbc.app/play?ref=AYUSH_0X");
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
    VoiceEngine.speak("Referral link copied. Invite friends to multiply your crypto yield.", 1.0, 1.0);
  };

  const toggleDomain = (domain: string) => {
    if (selectedDomains.includes(domain)) { setSelectedDomains(p => p.filter(d => d !== domain)); pushLog(`DETACHING: ${domain.toUpperCase()}`); }
    else if (selectedDomains.length < 3) { setSelectedDomains(p => [...p, domain]); pushLog(`MAPPING: ${domain.toUpperCase()}`); }
    AudioEngine.play(800, 'sine', 0.1, 0.05);
  };

  const constructGenerativeMatrix = async () => {
    if (selectedDomains.length === 0) return;
    setGameState("loading_llm"); pushLog("REQUESTING LANGCHAIN PIPELINE...");
    AudioEngine.play(400, 'sawtooth', 1, 0.1);
    VoiceEngine.speak("Generative engine lock kiya jaa raha hai. Kripaya prateeksha karein.", 1.2, 0.95);
    
    try {
      const promises = Array.from({length: 16}).map((_, i) => axios.post('/api/generate-question', { domain: selectedDomains[i % selectedDomains.length], diff: "Master" }));
      const results = await Promise.all(promises);
      setActiveQuestions(results.map(r => r.data));
      pushLog("LANGCHAIN CO-T SUCCESS 200 OK");
    } catch(e) {
      pushLog("ERR: API RATE LIMIT. INJECTING HEURISTIC FALLBACK.");
      const r = Math.random().toString(36).substring(2, 9);
      setActiveQuestions(Array.from({length: 16}).map((_, i) => ({
        q: `[NODE ISOLATION ${r.toUpperCase()}]: Analyze system anomaly vector at coordinate ${Math.random().toFixed(4)} inside sector '${selectedDomains[i%3]}'.`,
        options: [`Variant Vector-Alpha`, `Variant Vector-Beta`, `Encrypted Gamma Hash`, `Null Pointer Reference`],
        ans: Math.floor(Math.random() * 4), diff: "PROCEDURAL-GEN"
      })));
    }

    VoiceEngine.speak("The Neural Matrix is set! Chaliye khelte hain... Best of luck!", 0.85, 1.05);
    // Small delay before the timer starts so first question renders cleanly
    setTimeout(() => {
      setGameState("active"); setLevel(0); setTimer(90); setWalletBalance("0.00 ETH"); setViolationCount(0); pushLog("SANDBOX LIVE.");
      AudioEngine.startTension(60);
    }, 800);
  };

  const useLifeline = async (type: 'split' | 'cluster' | 'oracle') => {
    if (!q || lifelines[type]) return;
    setLifelines(prev => ({ ...prev, [type]: true }));
    pushLog(`EXECUTING LIFELINE: ${type.toUpperCase()}`);
    
    if (type === 'split') {
      VoiceEngine.speak("Machine... erase the lies. Leave only the truth.", 0.7, 0.8);
      const wrong = [0, 1, 2, 3].filter(i => i !== q.ans);
      const toElim = wrong.sort(() => Math.random() - 0.5).slice(0, 2);
      setEliminatedOpts(toElim);
    } else if (type === 'oracle') {
      VoiceEngine.speak("Let's ask the expert... they know the way through the fog.", 0.65, 0.85);
      try {
        const res = await axios.post('http://localhost:8000/api/ai/ask-expert', { questionText: q.q, options: q.options, correctAnswer: q.options[q.ans] });
        setOracleLog(res.data.expert_advice);
      } catch(e) {
        setOracleLog(`Expert believes the answer is definitely Option ${String.fromCharCode(65 + q.ans)}`);
      }
    } else if (type === 'cluster') {
      VoiceEngine.speak("Listen to the crowd... their voices are a distant choir.", 0.6, 0.75);
      const poll = [5, 5, 5, 5];
      poll[q.ans] = 75;
      poll[(q.ans + 1) % 4] += 15;
      setShowPoll(poll);
      setPollKey(k => k+1);
      setOracleLog(`POLL: A:${poll[0]}% B:${poll[1]}% C:${poll[2]}% D:${poll[3]}%`);
    }
  };

  const executeCryptographicCheck = (correct: boolean, nextLevel: number) => {
    setGameState("decrypting"); pushLog("BRUTE FORCING LEDGER HASHES...");
    AudioEngine.play(200, 'sawtooth', 2.0, 0.4);
    if(playMode!=="duel_host" && playMode!=="duel_race") VoiceEngine.speak("Machine... lock it in. Reveal the hidden truth.", 0.6, 0.75);
    
    let cycles = 0;
    const interval = setInterval(() => {
      setDecryptionHash("0x" + Math.random().toString(16).substr(2, 12).toUpperCase());
      cycles++;
      if (cycles > 20) {
        clearInterval(interval);
        setDecryptionHash(correct ? "0xVERIFIED_HASH" : "0xCORRUPTED_HASH");
        setGameState("active");
        
        if (correct) {
          const newStreak = streak + 1;
          setStreak(newStreak);
          // Extra audio punch on streak milestones
          if (newStreak >= 3) AudioEngine.play(900,'sine',0.2,0.15);
          setScreenFlash('correct');
          setTimeout(() => setScreenFlash(null), 600);
          AudioEngine.win();
          if(playMode==="solo" || playMode==="interview") {
            VoiceEngine.speak(`Absolutely brilliant. You've won ${PRIZE_LADDER[nextLevel - 1]}. But the stakes are getting incredibly high. Are you ready?`, 0.8, 1);
          }
          setWalletBalance(PRIZE_LADDER[nextLevel - 1]);
          if (playMode === "interview") setInterviewXP(prev => prev + (nextLevel * 1000));
          pushLog(`MINTED HASH VAL: ${PRIZE_LADDER[nextLevel - 1]}`);
          if(nextLevel === 5) {
            setUnlockedAsset("🔓 Level 5 Smart Contract Minted");
            setScreenFlash('milestone');
            setMilestoneText("SAFE ZONE");
            VoiceEngine.speak("You've cleared the first milestone. The safe zone is locked. You can breathe now... but only for a moment.", 0.8, 1);
            setTimeout(() => { setScreenFlash(null); setMilestoneText(""); }, 2000);
          }
          if(nextLevel === 10) {
            setUnlockedAsset("🔓 Level 10 Golden DAO NFT Minted");
            setScreenFlash('milestone');
            setMilestoneText("GOLDEN MILESTONE");
            launchConfetti();
            VoiceEngine.speak("The second milestone. Absolutely incredible performance. But the ultimate prize awaits you.", 0.85, 1);
            setTimeout(() => { setScreenFlash(null); setMilestoneText(""); }, 2500);
          }
          setTimeout(() => setUnlockedAsset(""), 3000);
          if (nextLevel > PRIZE_LADDER.length - 1) { 
             pushLog("DAO FOUNDER ATTAINED."); 
             launchConfetti();
             VoiceEngine.speak(playMode?.startsWith("duel") ? "The race is over. One of you was simply faster." : "Unbelievable! You've done it! You are a Crorepati... the ultimate champion!", 0.9, 1); 
             setGameState("victorious"); 
          }
          else { setLevel(nextLevel); setTimer(60); setSelectedOpt(null); setIsCorrect(null); setEliminatedOpts([]); setOracleLog(""); setShowPoll(null); }
        } else {
          setStreak(0);
          setScreenFlash('wrong');
          setTimeout(() => setScreenFlash(null), 500);
          pushLog("HASH REJECTED. FATAL ERROR SEVERITY LEVEL 9."); AudioEngine.lose(); 
          if(playMode==="solo" || playMode==="interview") VoiceEngine.speak("Oh no. That is the wrong answer. You've lost. The game is over.", 0.7, 1); 
          setIsShaking(true); 
          if (playMode === "solo") setGameState("eliminated");
        }
      }
    }, 50);
  };

  const execOption = (i: number) => {
    if (!q || selectedOpt !== null || pendingAnswer !== null || eliminatedOpts.includes(i) || playMode?.startsWith("duel")) return;
    AudioEngine.hover();
    setPendingAnswer(i); // triggers the 3-second countdown modal
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans relative overflow-hidden transition-all duration-1000 bg-[#020210] ${isShaking ? 'animate-shake' : ''}`}>
      
      {/* Authentic KBC Studio Lighting Background */}
      <div className="studio-rings" />
      <div className="studio-spotlight" />

      {/* Explosive Gold Flash & Confetti Layer */}
      <canvas ref={confettiRef} className="fixed inset-0 z-[9998] pointer-events-none" />
      {screenFlash && (
        <div className={`fixed inset-0 z-[9997] pointer-events-none ${
          screenFlash === 'correct' ? 'flash-gold' :
          screenFlash === 'milestone' ? 'flash-gold bg-[rgba(255,215,0,0.4)]' :
          'bg-black/80 backdrop-blur opacity-90'
        }`} />
      )}
      
      {/* ── Feature 6: "Lock Kiya Jaye?" Suspense Modal ── */}
      <AnimatePresence>
        {pendingAnswer !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#010115]/90 backdrop-blur-md">
            
            <motion.div initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.6 }} className="kbc-lozenge-wrapper max-w-4xl w-full p-2 animate-pulse mb-10 shadow-[0_0_80px_rgba(249,115,22,0.8)]">
               <div className="kbc-lozenge-inner py-16 flex flex-col items-center bg-orange-600 text-center">
                  <p className="text-white font-black tracking-widest text-3xl uppercase mb-6 drop-shadow-md border-b border-white/30 pb-4 px-10">LOCK KIYA JAYE?</p>
                  
                  <p className="text-5xl font-medium text-white tracking-widest mb-4">
                    <span className="text-yellow-300 font-serif font-black mr-6">{['A','B','C','D'][pendingAnswer]}:</span>
                    <span className="font-sans">{q?.options[pendingAnswer]}</span>
                  </p>
               </div>
            </motion.div>

            <div className="flex gap-4 justify-center items-center">
              <motion.div key={finalCountdown} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="text-[8rem] leading-none font-black font-mono text-orange-400 drop-shadow-[0_0_30px_rgba(249,115,22,1)] mr-16">{finalCountdown}</motion.div>
              
              <div className="flex flex-col gap-6">
                 <button onClick={() => {
                      const idx = pendingAnswer;
                      setPendingAnswer(null);
                      AudioEngine.lock();
                      setSelectedOpt(idx);
                      pushLog(`VECTOR OPTION ${String.fromCharCode(65 + idx)} LOCKED.`);
                      const correct = idx === q?.ans;
                      const elapsed = (Date.now() - questionStartTime) / 1000;
                      setConfidenceScore(Math.max(5, Math.round(100 - (elapsed / 60) * 90)));
                      setIsCorrect(correct);
                      setTimeout(() => executeCryptographicCheck(correct, level + 1), 2500); // KBC Dramatic Pauses
                    }} className="px-16 py-6 bg-gradient-to-b from-yellow-400 to-yellow-600 text-black rounded-full font-black tracking-widest uppercase text-xl transition-all shadow-[0_0_40px_rgba(255,215,0,0.8)] border border-yellow-200">Yes, Lock It</button>
                 <button onClick={() => setPendingAnswer(null)} className="px-16 py-4 rounded-full text-white border border-white/30 hover:bg-white/10 transition-all font-bold tracking-widest uppercase text-sm">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        
        {/* LOBBY / ONBOARDING */}
        {(gameState === "lobby" || gameState === "onboarding") && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: "spring" }} className="z-10 flex flex-col items-center max-w-7xl text-center relative w-full px-6 py-20">
            
            <div className="w-[300px] h-[300px] rounded-full border-[10px] border-[#01011A] shadow-[0_0_50px_rgba(0,100,255,0.8)] flex items-center justify-center mb-10 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(50,100,255,0.4)_0%,transparent_70%)]">
               <div className="absolute inset-0 border-4 border-yellow-500 rounded-full scale-[0.8] animate-[spin_10s_linear_infinite] border-dashed opacity-50" />
               <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] bg-gradient-to-b from-yellow-300 to-yellow-600 text-transparent bg-clip-text">NEURAL KBC</h1>
            </div>

            {gameState === "lobby" ? (
               <>
                 <p className="text-xl text-yellow-500 tracking-[0.5em] font-serif uppercase mb-16 relative z-10 font-bold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">Who Wants To Play</p>
                 <ModeSelector onSelect={verifyProctoring} />
               </>
            ) : (
               <div className="w-full max-w-4xl text-center pb-20">
                 <h2 className="text-4xl font-black tracking-widest text-white mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">SELECT YOUR DOMAINS</h2>
                 <p className="text-yellow-500 mb-14 text-sm font-bold uppercase tracking-[0.4em]">Choose 3 technical subjects to begin</p>
                 
                 <div className="flex flex-wrap justify-center gap-6 mb-16">
                   {availableDomains.map(domain => {
                     const selected = selectedDomains.includes(domain);
                     return ( <button key={domain} onClick={() => toggleDomain(domain)} className={`px-8 py-5 rounded-full font-bold tracking-widest transition-all text-sm border-2 ${selected ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-black border-yellow-300 shadow-[0_0_30px_rgba(255,215,0,0.8)] scale-110' : 'bg-[#05051a] text-white border-white/20 hover:border-yellow-500 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]'}`}> {domain} </button> )
                   })}
                 </div>
                 
                 <button onClick={constructGenerativeMatrix} disabled={selectedDomains.length !== 3} className={`px-16 py-6 rounded-full font-black tracking-[0.3em] text-xl uppercase transition-all ${selectedDomains.length === 3 ? 'bg-white text-black shadow-[0_0_50px_rgba(255,255,255,0.8)] hover:scale-105 border-4 border-[#01011A]' : 'bg-[#05051a] text-zinc-600 cursor-not-allowed border-2 border-white/5'}`}>
                   Let's Play
                 </button>
               </div>
            )}
          </motion.div>
        )}

        {/* LOADING LLM (KBC TENSION) */}
        {gameState === "loading_llm" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="z-10 flex flex-col items-center">
            <div className="w-32 h-32 border-[6px] border-yellow-500/20 border-t-yellow-500 rounded-full animate-[spin_3s_cubic-bezier(0.5,0,0.5,1)_infinite] mb-12 shadow-[0_0_80px_rgba(255,215,0,0.4)] relative">
               <div className="absolute inset-4 border-[4px] border-blue-500/30 border-b-blue-400 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
            </div>
            <p className="text-yellow-500 text-2xl font-sans tracking-[0.4em] font-black uppercase animate-pulse">Generating Questions...</p>
          </motion.div>
        )}

        {/* DECRYPTING HASH (KBC COMMERCIAL BREAK SUSPENSE) */}
        {gameState === "decrypting" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center bg-[#010115]/90 backdrop-blur-md">
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 border-8 border-dashed border-red-600 rounded-full animate-[spin_4s_linear_infinite] flex items-center justify-center mb-12 relative shadow-[0_0_80px_rgba(220,38,38,0.5)]">
                <div className="absolute inset-0 bg-red-600/20 rounded-full animate-ping"></div>
              </div>
              <p className="text-red-500 text-3xl font-black tracking-[0.5em] uppercase mb-8 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]">VERIFYING</p>
            </div>
          </motion.div>
        )}

        {/* ENDGAME STATES */}
         {["eliminated", "victorious", "extracted"].includes(gameState) && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.6 }} className="z-10 bg-[#05051a] border-[4px] border-yellow-500 p-24 rounded-[3rem] max-w-5xl w-full text-center relative overflow-hidden flex flex-col items-center shadow-[0_0_150px_rgba(255,215,0,0.5)]">
            <h1 className={`text-6xl md:text-[5.5rem] leading-tight font-black mb-10 tracking-tighter relative z-10 ${gameState==='eliminated'? 'text-white' : 'text-yellow-400 text-glow-gold'}`}>
              {playMode?.startsWith("duel") ? (p1Progress > p2Progress || p1Score > p2Score ? "PLAYER 1 WINS" : "PLAYER 2 WINS") : gameState === 'eliminated' ? 'GAME OVER' : 'YOU ARE A MILLIONAIRE'}
            </h1>
            
            <div className="my-10 w-full kbc-lozenge-wrapper p-2 animate-pulse shadow-[0_0_50px_rgba(255,215,0,0.6)]">
               <div className="kbc-lozenge-inner py-16 bg-[#010115] flex flex-col items-center justify-center">
                 <p className="text-xl text-yellow-500 font-bold uppercase tracking-[0.5em] mb-6">{playMode === 'interview' ? 'Final Career XP' : 'You go home with'}</p>
                 <p className="text-[6rem] font-sans font-black text-white tracking-widest drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">{playMode === 'interview' ? `${interviewXP} XP` : walletBalance}</p>
               </div>
            </div>

            <button onClick={() => window.location.reload()} className="mt-8 px-16 py-6 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 text-black font-black tracking-[0.3em] text-xl uppercase hover:scale-110 transition-transform shadow-[0_0_60px_rgba(255,215,0,0.8)] border-2 border-white">Play Again</button>
          </motion.div>
        )}

        {/* ACTIVE GAME (KBC TV SET LAYOUT) */}
        {q && gameState === "active" && (
          <div className="z-10 flex flex-col w-full h-full max-w-[1600px] mx-auto px-8 relative pt-20">
            
            {/* Top HUD: Logo, Timer & Lifelines */}
            <header className="flex justify-between items-center w-full px-12 z-50">
               {/* Left: Current Level Box */}
               <div className="flex flex-col items-start bg-[#05051a] border border-white/20 p-6 rounded-2xl shadow-[0_0_30px_rgba(0,100,255,0.2)]">
                  <span className="text-yellow-500 tracking-[0.4em] text-xs uppercase font-black mb-2">Question</span>
                  <span className="font-mono text-white tracking-widest text-4xl font-bold">{String(level+1)}<span className="text-zinc-600 text-xl font-light">/16</span></span>
               </div>

               {/* Center: The KBC Massive Circular Clock */}
               <div className={`relative flex items-center justify-center transform scale-[1.3] ${timer <= 15 ? 'heartbeat-rapid' : ''}`}>
                  <div className="absolute inset-0 bg-blue-900/40 rounded-full blur-xl animate-pulse"></div>
                  <svg width="180" height="180" className="absolute" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="90" cy="90" r="82" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="#01011A" />
                    {/* Ring notches tracking time */}
                    <circle cx="90" cy="90" r="82" stroke={timer <= 10 ? '#dc2626' : timer <= 30 ? '#eab308' : '#3b82f6'} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 82}`} strokeDashoffset={`${2 * Math.PI * 82 * (1 - timer / 90)}`} className="transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(0,100,255,0.8)]" />
                  </svg>
                  <span className={`text-[4.5rem] font-black font-sans tracking-tighter relative z-10 ${
                    timer <= 10 ? 'text-red-500 drop-shadow-[0_0_20px_rgba(220,38,38,1)]' : timer <= 30 ? 'text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,1)]' : 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]'
                  }`}>{timer.toString().padStart(2,'0')}</span>
               </div>

               {/* Right: Lifelines */}
               <div className="flex gap-4 isolate scale-110">
                  <LifelinePanel lifelines={lifelines} onUse={useLifeline} disabled={selectedOpt !== null} />
               </div>
            </header>

            <div className="flex-1 flex w-full relative z-10 mt-12 pb-12">
              
              {/* Left Column: Authentic Money Tree */}
              {(playMode === "solo" || playMode === "interview") && (
                 <div className="hidden lg:flex w-[320px] pl-4 justify-start shrink-0">
                    <MoneyLadder currentLevel={level} prizeLadder={PRIZE_LADDER} mode={playMode} />
                 </div>
              )}

              {/* Center: The KBC Question Plate */}
              <div className="flex-1 flex flex-col items-center justify-end w-full px-4 md:px-12 mt-12 lg:mt-0">
                <AnimatePresence mode="wait">
                  <motion.div key={`block-${level}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", bounce: 0.3 }} className="w-full flex flex-col items-center max-w-[1100px] gap-8">
                    
                    {/* Audience Poll Graph (Feature 5) */}
                    {showPoll && (
                      <motion.div initial={{opacity:0, scale:0.5, y: 100}} animate={{opacity:1, scale:1, y: -20}} transition={{ type: "spring", stiffness: 200 }} className="absolute bottom-[400px] z-[200] p-10 bg-[#01011A] border-4 border-yellow-500 rounded-[3rem] w-[500px] flex items-end justify-between h-[300px] shadow-[0_0_80px_rgba(255,215,0,0.4)]">
                        {['A','B','C','D'].map((ltr, i) => (
                          <div key={ltr} className="flex flex-col items-center flex-1 gap-4 h-full justify-end">
                            <span className="text-xl text-yellow-400 font-sans font-black drop-shadow-md">{showPoll[i]}%</span>
                            <div className="w-16 bg-[#0a1236] rounded-t-lg relative overflow-hidden transition-all duration-[2000ms] shadow-inner" style={{height:`${showPoll[i]}%`, minHeight:'20px'}}>
                              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-yellow-600 to-yellow-300 shadow-[0_0_20px_rgba(255,215,0,0.8)]" style={{height:'100%'} as any} />
                            </div>
                            <span className="text-2xl font-black text-white">{ltr}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Question Box - Authentic KBC Strip */}
                    <div className="w-full kbc-lozenge-wrapper p-[2px] shadow-[0_0_40px_rgba(0,100,255,0.4)] relative">
                       <div className="kbc-lozenge-inner py-10 px-12 md:px-20 min-h-[140px] flex items-center justify-center text-center">
                          <h2 className="text-xl md:text-[2.2rem] font-medium leading-[1.4] text-white tracking-wide">
                            {displayedQuestion}<span className="animate-pulse text-yellow-500 font-bold ml-1">_</span>
                          </h2>
                       </div>
                    </div>

                    {/* Options Grid */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 relative z-20 mt-4">
                      {q.options.map((opt: string, i: number) => (
                         <div key={`opt-${level}-${i}`} className="w-full relative px-2">
                           <OptionCard index={i} text={opt} selected={selectedOpt === i} correct={selectedOpt === i ? isCorrect : (isCorrect === false && i === q.ans ? true : null)} eliminated={eliminatedOpts.includes(i)} onClick={() => execOption(i)} playMode={playMode} />
                         </div>
                      ))}
                    </div>

                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>
        )}
      </motion.div>
    </div>
  );

}
