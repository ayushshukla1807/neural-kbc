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
      const names = VoiceEngine.allVoices.map(v => v.name);
      setAvailableVoices(names);
      setSelectedVoiceName(VoiceEngine.selectedVoice?.name || "");
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
            VoiceEngine.speak(`Everything is coming up roses. You've earned ${PRIZE_LADDER[nextLevel - 1]}. It's beautiful.`, 0.68, 0.85);
          }
          setWalletBalance(PRIZE_LADDER[nextLevel - 1]);
          if (playMode === "interview") setInterviewXP(prev => prev + (nextLevel * 1000));
          pushLog(`MINTED HASH VAL: ${PRIZE_LADDER[nextLevel - 1]}`);
          if(nextLevel === 5) {
            setUnlockedAsset("🔓 Level 5 Smart Contract Minted");
            setScreenFlash('milestone');
            setMilestoneText("SAFE ZONE");
            VoiceEngine.speak("We've reached the safe zone... nothing can touch us now.", 0.65, 0.78);
            setTimeout(() => { setScreenFlash(null); setMilestoneText(""); }, 2000);
          }
          if(nextLevel === 10) {
            setUnlockedAsset("🔓 Level 10 Golden DAO NFT Minted");
            setScreenFlash('milestone');
            setMilestoneText("GOLDEN MILESTONE");
            launchConfetti();
            VoiceEngine.speak("The golden milestone... you are extraordinary. The light is yours.", 0.65, 0.76);
            setTimeout(() => { setScreenFlash(null); setMilestoneText(""); }, 2500);
          }
          setTimeout(() => setUnlockedAsset(""), 3000);
          if (nextLevel > PRIZE_LADDER.length - 1) { 
             pushLog("DAO FOUNDER ATTAINED."); 
             launchConfetti();
             VoiceEngine.speak(playMode?.startsWith("duel") ? "The race is over. You both lived beautifully through it." : "I knew you were special. You're a founder now. The world is yours.", 0.65, 0.8); 
             setGameState("victorious"); 
          }
          else { setLevel(nextLevel); setTimer(60); setSelectedOpt(null); setIsCorrect(null); setEliminatedOpts([]); setOracleLog(""); setShowPoll(null); }
        } else {
          setStreak(0);
          setScreenFlash('wrong');
          setTimeout(() => setScreenFlash(null), 500);
          pushLog("HASH REJECTED. FATAL ERROR SEVERITY LEVEL 9."); AudioEngine.lose(); 
          if(playMode==="solo" || playMode==="interview") VoiceEngine.speak("It's so tragic... but I still love you. The game is over.", 0.55, 0.75); 
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
    <div onMouseMove={handleMouseMove} className={`min-h-screen flex flex-col items-center justify-center bg-[#030305] text-white font-sans overflow-hidden select-none relative ${isShaking ? 'animate-shake' : ''}`}>

      {/* ── Confetti Canvas ── */}
      <canvas ref={confettiRef} className="fixed inset-0 z-[9998] pointer-events-none" />

      {/* ── Ambient hue radial glow (shifts with level) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 60% 40% at 50% 50%, hsla(${ambientHue},80%,40%,0.07) 0%, transparent 70%)`
      }} />

      {/* ── Hot-streak aura (streak ≥ 5) ── */}
      {streak >= 5 && (
        <div className="fixed inset-0 z-[50] pointer-events-none" style={{
          boxShadow: 'inset 0 0 80px rgba(255,140,0,0.25), inset 0 0 30px rgba(255,200,0,0.15)',
          animation: 'hotseat-pulse 1.5s ease-in-out infinite'
        }} />
      )}

      {/* ── Full-screen flash ── */}
      {screenFlash && (
        <div className={`fixed inset-0 z-[9997] pointer-events-none ${
          screenFlash === 'correct' ? 'bg-green-500/25 flash-green' :
          screenFlash === 'milestone' ? 'bg-yellow-400/30 flash-green' :
          'bg-red-500/25 flash-red'
        }`} />
      )}

      {/* ── Milestone text overlay (Feature 7) ── */}
      <AnimatePresence>
        {milestoneText && (
          <motion.div
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[9996] pointer-events-none flex items-center justify-center"
          >
            <span className="text-[5rem] font-black tracking-tighter text-gold-400 glow-text-gold">{milestoneText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Question splash (Feature 3) ── */}
      <AnimatePresence>
        {showQuestionSplash && (
          <motion.div
            key={`splash-${level}`}
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed inset-0 z-[9995] pointer-events-none flex items-center justify-center"
          >
            <span className="font-black font-mono text-[8rem] text-white/10 tracking-tighter" style={{ textShadow: '0 0 120px rgba(0,240,255,0.5)' }}>
              Q.{String(level + 1).padStart(2, '0')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Final Answer Modal (Feature 1) ── */}
      <AnimatePresence>
        {pendingAnswer !== null && q && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.7, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, y: 40 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="glass-panel border border-gold-500/50 rounded-3xl p-12 text-center max-w-lg w-full shadow-[0_0_60px_rgba(212,160,23,0.4)]"
            >
              <p className="text-gold-400 font-mono text-sm tracking-[0.4em] uppercase mb-4">Your Answer</p>
              <p className="text-3xl font-black text-white mb-2">
                <span className="text-gold-400 mr-3">{['A','B','C','D'][pendingAnswer]}.</span>
                {q.options[pendingAnswer]}
              </p>
              <p className="text-white/40 font-light text-sm mb-8">Is this your final answer?</p>
              <div className="flex gap-4 justify-center mb-8">
                <motion.div
                  key={finalCountdown}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="text-6xl font-black font-mono text-red-400 glow-text-red"
                >{finalCountdown}</motion.div>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setPendingAnswer(null)}
                  className="px-8 py-3 border border-white/20 rounded-2xl text-white/60 hover:text-white hover:border-white/50 transition-all text-sm font-bold tracking-widest"
                >CHANGE</button>
                <button
                  onClick={() => {
                    const idx = pendingAnswer;
                    setPendingAnswer(null);
                    AudioEngine.lock();
                    setSelectedOpt(idx);
                    pushLog(`VECTOR OPTION ${String.fromCharCode(65 + idx)} LOCKED.`);
                    const correct = idx === q.ans;
                    const elapsed = (Date.now() - questionStartTime) / 1000;
                    setConfidenceScore(Math.max(5, Math.round(100 - (elapsed / 60) * 90)));
                    setIsCorrect(correct);
                    if (!correct) { setGlitchCard(idx); setTimeout(() => setGlitchCard(null), 1000); }
                    setTimeout(() => executeCryptographicCheck(correct, level + 1), 1500);
                  }}
                  className="px-8 py-3 bg-gold-500 hover:bg-gold-400 rounded-2xl text-black font-black tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(212,160,23,0.5)]"
                >LOCK IN</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating LDR Petals ── */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <div key={i} className="petal" style={{
          left:`${8+i*12}%`,
          animationDuration:`${9+i*1.7}s`,
          animationDelay:`${i*1.2}s`,
          width:`${5+(i%4)*3}px`, height:`${5+(i%4)*3}px`
        }} />
      ))}

      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-100" />
      <div className="absolute inset-0 bg-mesh-grid z-0 opacity-10 pointer-events-none"></div>

      <div className="absolute bottom-6 left-6 z-50 pointer-events-none opacity-60 flex flex-col justify-end w-96 h-40 overflow-hidden gap-1">
        {hudLogs.map((log, idx) => (
          <motion.span key={idx} initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} className={`font-mono text-[10px] tracking-widest ${log.includes("ERR") || log.includes("BREACH") || log.includes("REJECTED") ? 'text-red-500 font-bold' : 'text-neon-blue'}`}>{log}</motion.span>
        ))}
      </div>

      <AnimatePresence>
        {gameState !== 'lobby' && playMode === "solo" && (
          <motion.div initial={{opacity: 0, x: 50}} animate={{opacity: 1, x: 0}} className="absolute top-6 right-6 z-40 w-64 glass-panel border border-red-500/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,0,0,0.1)]">
            <div className="bg-red-500/10 border-b border-red-500/30 px-3 py-1.5 flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-red-400 tracking-widest uppercase">Live Telemetry CCTV</span>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
            </div>
            <div className="relative w-full h-36 bg-black flex items-center justify-center">
               {!cameraActive && <span className="text-red-500/50 font-mono text-[10px] uppercase">No Video Feed / Blind DOM Overridden</span>}
               <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-cover filter contrast-[1.2] saturate-0 brightness-[1.1] opacity-70 ${isShaking ? 'animate-shake' : ''}`} style={{ mixBlendMode: 'screen' }} />
               <div className="absolute inset-0 pointer-events-none bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEElEQVQIW2NkYGD4z8DAwMgAA0wAMxn8NvgAAAAASUVORK5CYII=')] opacity-30"></div>
            </div>
            <div className="bg-black/80 px-3 py-3 flex flex-col gap-1 text-[8px] font-mono text-gray-400">
               <div className="flex justify-between"><span>CORES:</span> <span className="text-neon-blue">{hwData.cpu}</span></div>
               <div className="flex justify-between"><span>CAPACITY:</span> <span className="text-neon-blue">{hwData.ram}GB</span></div>
               <div className="flex justify-between"><span>BATTERY:</span> <span className={`${hwData.battery === 'N/A' || parseInt(hwData.battery) > 30 ? 'text-neon-blue' : 'text-red-500 animate-pulse'}`}>{hwData.battery}</span></div>
               <div className="flex justify-between"><span>COORD:</span> <span className="text-gold-400">{hwData.lat}, {hwData.lon}</span></div>
            </div>
            <div className="h-16 w-full bg-red-900/5 mt-1 border-t border-red-500/20 relative flex items-end overflow-hidden p-1">
              <span className="absolute top-1 left-2 text-[8px] font-mono text-white/40">AI FOCUS TELEMETRY // LANGCHAIN CO-PROMPT</span>
              <svg viewBox="0 0 100 20" className="w-full h-full preserve-aspect-none pt-4" style={{ overflow: 'visible' }}>
                  <polyline fill="none" stroke="rgba(0, 240, 255, 0.8)" strokeWidth="1.5" points={focusHistory.map((val, i) => `${(i / (Math.max(1, focusHistory.length - 1))) * 100},${20 - (val / 100 * 20)}`).join(' ')} style={{ filter: 'drop-shadow(0px 0px 4px rgba(0,240,255,0.5))' }} />
                  <path fill="rgba(0, 240, 255, 0.1)" d={`M0,20 ${focusHistory.map((val, i) => `L${(i / (Math.max(1, focusHistory.length - 1))) * 100},${20 - (val / 100 * 20)}`).join(' ')} L100,20 Z`} />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div animate={{ rotateX: mousePos.y, rotateY: mousePos.x }} transition={{ type: "spring", stiffness: 100, damping: 30 }} style={{ transformStyle: 'preserve-3d' }} className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {gameState === "lobby" && (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} className="z-10 flex flex-col items-center glass-panel p-10 rounded-[2.5rem] max-w-7xl text-center border-t border-l border-white/20 shadow-[-20px_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Sweeping spotlight beams */}
            <div className="spotlight-beam" />
            <div className="spotlight-beam" />
            <div className="spotlight-beam" />
            <h1 className="shimmer-text text-6xl md:text-[6rem] font-black tracking-tighter mb-2 leading-none relative z-10" style={{ transform: 'translateZ(60px)' }}>NEURAL ARENA</h1>
            <p className="text-sm text-gray-500 tracking-[0.3em] uppercase mb-1 relative z-10">Kaun Banega Crorepati &middot; AI Edition</p>
            <p className="text-sm text-gray-600 mb-6 italic relative z-10">&ldquo;I&apos;ve been waiting for you... in the dark.&rdquo;</p>
            
            <ModeSelector onSelect={verifyProctoring} />

            {/* Voice Picker — clean select dropdown */}
            {availableVoices.length > 0 && (
              <div className="w-full mt-4 flex items-center gap-4 px-5 py-3 glass-panel border border-white/10 rounded-2xl" style={{ transform: 'translateZ(30px)' }}>
                <span className="text-neon-purple font-black tracking-widest text-xs uppercase whitespace-nowrap">🎙️ Host Voice</span>
                <select
                  value={selectedVoiceName}
                  onChange={e => handleVoiceChange(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/10 text-white text-sm rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-neon-purple/60 transition-all"
                >
                  {availableVoices.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <button
                  onClick={() => VoiceEngine.speak("I've been waiting... like a dream you almost remember.")}
                  className="px-4 py-2 bg-neon-purple/20 hover:bg-neon-purple/40 border border-neon-purple/50 text-neon-purple rounded-xl font-bold tracking-widest text-[10px] uppercase transition-all whitespace-nowrap"
                >▶ Test</button>
              </div>
            )}

            {/* Growth Hook: Referral System */}
            <div className="w-full mt-4 glass-panel border border-dashed border-neon-blue/30 p-5 rounded-2xl flex items-center justify-between" style={{ transform: 'translateZ(30px)' }}>
              <div className="flex flex-col text-left">
                <span className="text-neon-blue font-black tracking-widest text-xs mb-1 uppercase">Native Yield Multiplication</span>
                <span className="text-gray-500 font-mono text-[10px]">Invite peers to multiply ETH withdrawals automatically. [AYUSH_0X_ACTIVE]</span>
              </div>
              <button onClick={copyRefLink} className="px-5 py-2.5 bg-neon-blue/20 hover:bg-neon-blue border border-neon-blue text-white rounded-xl font-bold tracking-widest text-[10px] uppercase transition-all duration-300">
                {referralCopied ? 'Link Copied!' : 'Copy Invite'}
              </button>
            </div>
          </motion.div>
        )}

        {gameState === "onboarding" && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="z-10 glass-panel p-12 rounded-[2.5rem] max-w-5xl w-full text-center mx-4 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <motion.h2 variants={itemVariants} className="text-5xl font-black glow-text-blue tracking-tight mb-2 relative z-10">Neural Matrix Configuration</motion.h2>
            <motion.p variants={itemVariants} className="text-gray-400 mb-12 text-xl font-light relative z-10">Select exactly 3 deep-tech vectors for the LLM to process.</motion.p>
            
            <motion.div variants={containerVariants} className="flex flex-wrap justify-center gap-4 mb-12 relative z-10">
              {availableDomains.map(domain => {
                const selected = selectedDomains.includes(domain);
                const isHacked = domain.includes("OmniGuard");
                return ( <motion.button variants={itemVariants} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} key={domain} onClick={() => toggleDomain(domain)} onMouseEnter={() => AudioEngine.hover()} className={`px-6 py-4 rounded-2xl font-bold tracking-wide transition-all duration-300 ${selected ? 'bg-gradient-to-br from-neon-purple/80 to-neon-blue/80 border border-white/40 text-white shadow-[0_10px_30px_rgba(138,43,226,0.5)]' : `bg-black/50 border border-white/10 ${isHacked ? 'text-red-500 border-red-500/50 glow-text-red' : 'text-gray-400'} hover:border-white/30 backdrop-blur-md`}`}> {domain} </motion.button> )
              })}
            </motion.div>
            
            <motion.button variants={itemVariants} onClick={constructGenerativeMatrix} disabled={selectedDomains.length !== 3} className={`px-14 py-5 rounded-full font-black tracking-[0.2em] uppercase transition-all ${selectedDomains.length === 3 ? 'bg-white text-black shadow-[0_0_50px_rgba(255,255,255,0.8)] hover:scale-105' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
              Trigger Async Generator
            </motion.button>
          </motion.div>
        )}

        {gameState === "loading_llm" && (
          <div className="z-10 flex flex-col items-center">
            <div className="w-32 h-32 border-[6px] border-white/10 border-t-neon-blue rounded-full animate-spin mb-10 shadow-[0_0_50px_rgba(0,240,255,0.3)] text-center flex items-center justify-center font-mono font-black text-neon-blue">AI</div>
            <p className="text-2xl animate-pulse glow-text-blue text-center font-mono font-light tracking-wide">
              [SYSTEM_LINK]: Synthesizing infinite permutations...
            </p>
          </div>
        )}

        {gameState === "decrypting" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-3xl">
            <div className="flex flex-col items-center">
              <div className="w-80 h-80 border-4 border-dashed border-red-500 rounded-full animate-[spin_2s_linear_infinite] flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 border-8 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_1s_linear_infinite_reverse]"></div>
                <span className="text-5xl text-white font-black font-mono">HASH</span>
              </div>
              <h2 className="text-4xl font-mono text-gray-400 mb-2 glitch-hover cursor-pointer">VERIFYING BLOCKCHAIN LEDGER</h2>
              <p className="text-[5rem] font-mono font-black text-red-500 drop-shadow-[0_0_30px_red] tracking-widest">{decryptionHash}</p>
            </div>
          </div>
        )}

         {["eliminated", "victorious", "extracted"].includes(gameState) && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 glass-panel p-20 rounded-[3rem] border border-red-500/30 max-w-4xl w-full text-center shadow-[0_0_100px_rgba(255,0,0,0.15)] relative overflow-hidden flex flex-col items-center">
            <div className={`absolute top-0 left-0 w-full h-full ${gameState==='eliminated'? 'bg-red-500/10' : 'bg-gold-500/10'}`}></div>
            <h1 style={{ transform: 'translateZ(30px)' }} className={`text-6xl md:text-7xl font-black mb-6 tracking-tighter relative z-10 ${gameState==='eliminated' ? 'text-red-500 glow-text-red glitch-hover' : 'text-gold-400 glow-text-gold drop-shadow-[0_0_20px_rgba(212,160,23,0.8)]'}`}>
              {playMode?.startsWith("duel") ? (p1Progress > p2Progress || p1Score > p2Score ? "PLAYER 1 WINS" : "PLAYER 2 WINS") : gameState === 'eliminated' ? 'SYSTEM LIQUIDATION' : 'PROTOCOL CLEAR'}
            </h1>
            
            {playMode?.startsWith("duel") ? (
               <div className="flex w-full gap-8 relative z-10 mb-16 justify-center" style={{ transform: 'translateZ(40px)' }}>
                 <div className="glass-panel p-8 rounded-3xl border border-neon-purple/50 bg-neon-purple/10 flex flex-col items-center w-64">
                    <span className="text-neon-purple font-black tracking-widest mb-2">PLAYER 1</span>
                    <span className="text-6xl font-mono text-white glow-text-blue">{playMode === "duel_race" ? p1Progress : p1Score}</span>
                 </div>
                 <div className="flex flex-col justify-center font-black text-4xl text-gray-600 px-4">VS</div>
                 <div className="glass-panel p-8 rounded-3xl border border-gold-500/50 bg-gold-500/10 flex flex-col items-center w-64">
                    <span className="text-gold-400 font-black tracking-widest mb-2">PLAYER 2</span>
                    <span className="text-6xl font-mono text-white glow-text-gold">{playMode === "duel_race" ? p2Progress : p2Score}</span>
                 </div>
               </div>
            ) : (
               <>
                 <p className="text-2xl text-gray-400 font-light mb-2 relative z-10 uppercase tracking-widest">{playMode === 'interview' ? 'Career Readiness Score' : 'Final Ledger Balance'}</p>
                 <p style={{ transform: 'translateZ(40px)' }} className="text-7xl font-mono text-white mb-16 glow-text-blue relative z-10 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">{playMode === 'interview' ? `${interviewXP} XP` : walletBalance}</p>
               </>
            )}

            <button onClick={() => window.location.reload()} onMouseEnter={()=>AudioEngine.hover()} className="px-10 py-5 border border-white/20 rounded-full text-white font-bold tracking-[0.2em] text-sm uppercase hover:bg-white hover:text-black transition-all relative z-10 shadow-[0_0_30px_rgba(255,255,255,0.2)]">Return to Main Sector</button>
          </motion.div>
        )}

        {q && gameState === "active" && (
          <div className="z-10 flex flex-col w-full h-full max-w-[1400px] mx-auto px-6 py-8 relative">
            
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4 pb-6 relative">
              <div className="flex gap-3 items-center">
                <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-4 border border-neon-blue/30 bg-neon-blue/5 shadow-[0_0_30px_rgba(0,240,255,0.15)] backdrop-blur-md">
                  <span className="text-neon-blue font-black tracking-[0.2em] text-sm">{playMode === 'interview' ? 'XP QUOTA:' : 'SECURE LEDGER:'}</span>
                  <span className="font-mono text-white text-xl font-bold drop-shadow-[0_0_8px_white]">{playMode === 'interview' ? `${interviewXP} XP` : walletBalance}</span>
                </div>
                {/* 🔥 Streak Counter */}
                {streak >= 2 && (
                  <motion.div
                    key={streak}
                    initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring",stiffness:400}}
                    className="flex items-center gap-1.5 glass-panel px-4 py-2 rounded-full border border-orange-500/40 bg-orange-500/10"
                  >
                    <span className="streak-fire text-xl">{streak >= 5 ? '🔥🔥🔥' : streak >= 3 ? '🔥🔥' : '🔥'}</span>
                    <span className="font-black text-orange-400 text-sm tracking-widest">{streak} STREAK</span>
                  </motion.div>
                )}
                {/* Level pill */}
                <div className="glass-panel px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                  <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">LVL</span>
                  <span className="text-white font-black font-mono text-sm">{String(level+1).padStart(2,'0')} / 16</span>
                  <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden ml-1">
                    <div className="h-full bg-gradient-to-r from-neon-purple to-neon-blue transition-all duration-500" style={{width:`${((level+1)/16)*100}%`}}/>
                  </div>
                </div>
              </div>

              {playMode === "duel_host" && (
                <div className="flex gap-3 glass-panel px-6 py-3 rounded-full border border-gold-500/30">
                   <span className="text-gold-400 font-mono text-xs font-bold uppercase tracking-widest animate-pulse">{hostRevealed ? `CORRECT: ${String.fromCharCode(65 + q.ans)}` : 'REVEAL: [SPACE]'}</span>
                </div>
              )}

              {playMode === "duel_race" && (
                <div className="flex-1 flex flex-col gap-2 max-w-sm px-8">
                   <div className="flex justify-between items-end"><span className="text-[10px] text-neon-purple font-black">P1: {p1Progress}/16</span> <span className="text-[10px] text-gold-400 font-black">P2: {p2Progress}/16</span></div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-neon-purple transition-all duration-500" style={{ width: `${(p1Progress/16)*100}%` }}></div>
                      <div className="h-full bg-gold-400 opacity-20 transition-all duration-500" style={{ width: `${(p2Progress/16)*100}%` }}></div>
                   </div>
                </div>
              )}

               {playMode === "solo" && gameState === "active" && (
                <div className="absolute right-6 top-24 z-50">
                   <MoneyLadder currentLevel={level} prizeLadder={PRIZE_LADDER} mode={playMode} />
                </div>
              )}

              {playMode === "solo" && (
                <LifelinePanel lifelines={lifelines} onUse={useLifeline} disabled={selectedOpt !== null} />
              )}

              {playMode?.startsWith("duel") && (
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 glass-panel px-8 py-2 rounded-full border border-white/20">
                    <span className="font-mono font-black text-2xl text-neon-purple w-8 text-right">{p1Score}</span>
                    <span className="text-xs text-gray-500 font-black tracking-[0.3em]">SCORE</span>
                    <span className="font-mono font-black text-2xl text-gold-400 w-8 text-left">{p2Score}</span>
                </div>
              )}

              {playMode === "solo" && (
                <div className="flex gap-3">
                  <button onClick={() => { VoiceEngine.speak("Leaving already? I knew you were born to run. Stay safe.", 0.65, 0.82); setGameState("extracted"); }} className="px-8 py-3 border border-red-500/50 bg-red-500/10 hover:bg-red-500/30 rounded-2xl text-xs font-black tracking-[0.2em] uppercase text-red-100 glow-text-red shadow-[0_0_20px_rgba(255,0,85,0.2)] hover:scale-105 transition-all">Withdraw</button>
                </div>
              )}
            </header>

            <div className="flex-1 flex flex-col justify-center items-center py-6 w-full relative">
              {/* Timer — SVG Circular Ring */}
              <div className="relative mb-6 flex items-center justify-center" style={{ transform: 'translateZ(50px)' }}>
                <svg width="180" height="180" className="absolute" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="90" cy="90" r="78" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                  <circle
                    cx="90" cy="90" r="78"
                    stroke={timer <= 10 ? '#ff2255' : timer <= 25 ? '#ffd700' : '#00f0ff'}
                    strokeWidth="6" fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 78}`}
                    strokeDashoffset={`${2 * Math.PI * 78 * (1 - timer / 90)}`}
                    className="timer-ring-progress"
                    style={{ filter: `drop-shadow(0 0 10px ${timer<=10?'#ff2255':timer<=25?'#ffd700':'#00f0ff'})` }}
                  />
                </svg>
                {timer <= 10 && <div className="absolute inset-0 rounded-full bg-red-500/15 animate-[pulse_0.4s_infinite] blur-sm" />}
                <span className={`text-[4.5rem] leading-none font-black font-mono tracking-tighter z-10 ${
                  timer<=10 ? 'text-red-500 glow-text-red' : timer<=25 ? 'text-gold-400 glow-text-gold' : 'text-white'
                }`}>{timer.toString().padStart(2,'0')}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={`block-${level}`} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.95 }} variants={containerVariants} className="w-full flex flex-col items-center">
                  <motion.div variants={itemVariants} style={{ transform: 'translateZ(30px)' }} className={`w-full max-w-6xl glass-panel hot-seat relative p-14 rounded-[3rem] border border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.8)] mb-8 overflow-hidden text-center bg-gradient-to-b from-white/5 to-transparent`}>
                    {playMode === "duel_host" && !hostRevealed ? (
                      <div className="flex flex-col items-center py-10">
                        <span className="text-gray-500 font-mono text-sm mb-4 tracking-[0.5em] animate-pulse">ENCRYPTED FOR PLAYER 2</span>
                        <div className="h-10 w-64 bg-white/5 rounded-full animate-pulse"></div>
                      </div>
                    ) : (
                      <motion.h2
                        key={`q-${level}`}
                        initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.5}}
                        className="text-4xl md:text-[3.2rem] font-medium text-center leading-[1.4] text-white mt-4 tracking-tight drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]"
                      >{displayedQuestion}<span className="animate-[pulse_0.7s_infinite] text-neon-blue">|</span></motion.h2>
                    )}
                    {/* Audience Poll Chart */}
                    {showPoll && (
                      <motion.div key={pollKey} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="mt-8 p-4 bg-neon-blue/5 border border-neon-blue/20 rounded-2xl">
                        <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-3">Audience Poll</p>
                        <div className="flex items-end justify-between gap-3 h-20">
                          {['A','B','C','D'].map((ltr, i) => (
                            <div key={ltr} className="flex flex-col items-center flex-1 gap-1">
                              <span className="text-xs text-white/60 font-mono">{showPoll[i]}%</span>
                              <div className="w-full rounded-t-lg bg-neon-blue/10 relative overflow-hidden" style={{height:`${showPoll[i] * 0.9}%`, minHeight:'4px'}}>
                                <div className="absolute inset-0 bg-gradient-to-t from-neon-blue/60 to-neon-blue/30 poll-bar" style={{'--target-w':'100%'} as any} />
                              </div>
                              <span className="text-[10px] font-black text-neon-blue">{ltr}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    {oracleLog && !showPoll && (
                      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="mt-8 p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-2xl font-mono text-neon-blue text-sm uppercase tracking-widest">
                        {oracleLog}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Options grid with AI hints + glitch */}
                  <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
                    {q.options.map((opt: string, i: number) => (
                      <div
                        key={`opt-${level}-${i}`}
                        className={`relative ${glitchCard === i ? 'glitch-hover' : ''}`}
                        onMouseEnter={() => setHoveredOpt(i)}
                        onMouseLeave={() => setHoveredOpt(null)}
                      >
                        {/* AI Hint % tooltip (Feature 6) */}
                        {hoveredOpt === i && selectedOpt === null && pendingAnswer === null && aiHints.current[i] !== undefined && (
                          <motion.div
                            initial={{opacity:0, y:5}} animate={{opacity:1, y:0}}
                            className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-lg bg-black/80 border border-white/10 text-[10px] font-mono text-white/70 whitespace-nowrap"
                          >
                            🤖 {aiHints.current[i]}% AIs pick this
                          </motion.div>
                        )}
                        <OptionCard
                          index={i}
                          text={opt}
                          selected={selectedOpt === i}
                          correct={selectedOpt === i ? isCorrect : (isCorrect === false && i === q.ans ? true : null)}
                          eliminated={eliminatedOpts.includes(i)}
                          onClick={() => execOption(i)}
                          playMode={playMode}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Confidence Meter (Feature 5) */}
                  {confidenceScore !== null && selectedOpt !== null && (
                    <motion.div
                      initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}
                      className="mt-6 w-full max-w-6xl glass-panel border border-white/10 rounded-2xl p-4 flex items-center gap-6"
                    >
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest whitespace-nowrap">Answer Confidence</span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{width:0}}
                          animate={{width:`${confidenceScore}%`}}
                          transition={{duration:0.8, ease:'easeOut'}}
                          className={`h-full rounded-full ${
                            confidenceScore >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                            confidenceScore >= 40 ? 'bg-gradient-to-r from-gold-500 to-yellow-400' :
                            'bg-gradient-to-r from-red-500 to-orange-400'
                          }`}
                        />
                      </div>
                      <span className={`font-black font-mono text-lg ${
                        confidenceScore >= 70 ? 'text-green-400' : confidenceScore >= 40 ? 'text-gold-400' : 'text-red-400'
                      }`}>{confidenceScore}%</span>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
