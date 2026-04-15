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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-hidden transition-all duration-1000" style={{ backgroundColor: `hsl(${ambientHue}, 20%, 4%)` }}>
      
      {/* Cinematic Ambient Glow */}
      <div className="ambient-glow" />
      
      {/* ── Feature 1: Final Answer confirmation modal ── */}
      <AnimatePresence>
        {pendingAnswer !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass-panel-sleek rounded-[2.5rem] p-12 text-center max-w-lg w-full border border-white/5 shadow-2xl">
              <p className="text-zinc-500 font-medium tracking-widest uppercase mb-4 text-xs">Verify Selection</p>
              <p className="text-3xl font-medium text-white mb-3 tracking-tight">
                <span className="text-amber-500 mr-3">{['A','B','C','D'][pendingAnswer]}.</span>
                {q?.options[pendingAnswer]}
              </p>
              <p className="text-zinc-400 font-light text-sm mb-10">Is this your final answer?</p>
              <div className="flex gap-4 justify-center mb-10">
                <motion.div key={finalCountdown} initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl font-mono text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">{finalCountdown}</motion.div>
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={() => setPendingAnswer(null)} className="px-8 py-3 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium tracking-wide">Cancel</button>
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
                    if (!correct) { setGlitchCard(idx); setTimeout(() => setGlitchCard(null), 1000); }
                    setTimeout(() => executeCryptographicCheck(correct, level + 1), 1500);
                  }} className="px-8 py-3 bg-white hover:bg-zinc-200 text-zinc-900 rounded-2xl font-bold tracking-wide text-sm transition-all shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:shadow-[0_0_32px_rgba(255,255,255,0.4)]">Lock In</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti logic preserved underneath although minimal visual */}
      <canvas ref={confettiRef} className="fixed inset-0 z-[9998] pointer-events-none opacity-50" />

      <motion.div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        
        {/* LOBBY */}
        {gameState === "lobby" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="z-10 flex flex-col items-center max-w-6xl text-center relative w-full px-6">
            <h1 className="shimmer-text-clean text-5xl md:text-[5.5rem] font-medium tracking-tight mb-4 relative z-10">Neural Arena</h1>
            <p className="text-sm text-zinc-500 tracking-[0.2em] uppercase mb-12 relative z-10 font-medium">The Next Generation of Competitive Knowledge</p>
            
            <ModeSelector onSelect={verifyProctoring} />

            <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl mt-8">
              {availableVoices.length > 0 && (
                <div className="flex-1 flex items-center gap-4 px-6 py-4 glass-panel-sleek rounded-2xl relative">
                  <span className="text-zinc-400 font-medium tracking-widest text-[10px] uppercase whitespace-nowrap">Voice Agent</span>
                  <select value={selectedVoiceName} onChange={e => handleVoiceChange(e.target.value)} className="flex-1 bg-transparent border-none text-zinc-100 text-sm font-mono focus:outline-none appearance-none cursor-pointer">
                    {availableVoices.map(name => <option key={name} value={name} className="bg-zinc-900 text-white">{name}</option>)}
                  </select>
                </div>
              )}

              <div className="flex-1 flex items-center justify-between px-6 py-4 glass-panel-sleek rounded-2xl">
                <span className="text-zinc-400 font-medium tracking-widest text-[10px] uppercase">Invite Link</span>
                <button onClick={copyRefLink} className="text-zinc-100 hover:text-white text-xs font-mono font-bold uppercase transition-colors">{referralCopied ? 'Copied' : 'Copy'}</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ONBOARDING */}
        {gameState === "onboarding" && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="z-10 w-full max-w-4xl px-6 text-center">
            <motion.h2 variants={itemVariants} className="text-4xl font-medium tracking-tight text-white mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Configure Sandbox</motion.h2>
            <motion.p variants={itemVariants} className="text-zinc-400 mb-12 text-sm font-light uppercase tracking-widest">Select 3 technical domains</motion.p>
            
            <motion.div variants={containerVariants} className="flex flex-wrap justify-center gap-3 mb-10">
              {availableDomains.map(domain => {
                const selected = selectedDomains.includes(domain);
                return ( <motion.button variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={domain} onClick={() => toggleDomain(domain)} className={`px-6 py-3 rounded-2xl font-medium tracking-wide transition-all text-sm border ${selected ? 'bg-white text-zinc-950 border-white shadow-[0_0_24px_rgba(255,255,255,0.4)]' : 'bg-surface-100 border-white/5 text-zinc-400 hover:bg-surface-200 hover:border-white/20'}`}> {domain} </motion.button> )
              })}
            </motion.div>
            
            <motion.button variants={itemVariants} onClick={constructGenerativeMatrix} disabled={selectedDomains.length !== 3} className={`px-10 py-4 rounded-full font-bold tracking-widest text-xs uppercase transition-all shadow-[0_4px_24px_rgba(0,0,0,0.5)] ${selectedDomains.length === 3 ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 hover:shadow-[0_4px_30px_rgba(245,158,11,0.5)]' : 'bg-surface-200 text-zinc-600 cursor-not-allowed border border-white/5'}`}>
              Initialize Matrix
            </motion.button>
          </motion.div>
        )}

        {/* LOADING LLM */}
        {gameState === "loading_llm" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="z-10 flex flex-col items-center">
            <div className="spinner-ring mb-8 animate-spin text-amber-500"></div>
            <p className="text-zinc-400 text-sm font-mono tracking-widest uppercase">Synthesizing Datasets</p>
          </motion.div>
        )}

        {/* DECRYPTING HASH */}
        {gameState === "decrypting" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-2xl">
            <div className="flex flex-col items-center">
              <div className="spinner-ring mb-10 border-t-amber-500"></div>
              <p className="text-zinc-500 text-xs font-medium tracking-[0.3em] uppercase mb-4">Verifying Block</p>
              <p className="text-3xl font-mono text-zinc-200 tracking-widest">{decryptionHash}</p>
            </div>
          </motion.div>
        )}

        {/* ENDGAME STATES */}
         {["eliminated", "victorious", "extracted"].includes(gameState) && (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 glass-panel-sleek border border-white/5 p-16 rounded-[3rem] max-w-3xl w-full text-center relative overflow-hidden flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-medium mb-4 tracking-tight relative z-10 text-white">
              {playMode?.startsWith("duel") ? (p1Progress > p2Progress || p1Score > p2Score ? "Player 1 Wins" : "Player 2 Wins") : gameState === 'eliminated' ? 'Simulation Terminated' : 'Protocol Complete'}
            </h1>
            
            {playMode?.startsWith("duel") ? (
               <div className="flex w-full gap-8 relative z-10 mb-12 justify-center mt-8">
                 <div className="px-10 py-8 rounded-3xl border border-white/5 bg-surface-100 flex flex-col items-center w-56">
                    <span className="text-zinc-500 font-medium tracking-widest text-[10px] uppercase mb-3">Player 1</span>
                    <span className="text-5xl font-mono text-white tracking-widest">{playMode === "duel_race" ? p1Progress : p1Score}</span>
                 </div>
                 <div className="flex flex-col justify-center font-light text-2xl text-zinc-600 px-2">VS</div>
                 <div className="px-10 py-8 rounded-3xl border border-white/5 bg-surface-100 flex flex-col items-center w-56">
                    <span className="text-amber-500/80 font-medium tracking-widest text-[10px] uppercase mb-3">Player 2</span>
                    <span className="text-5xl font-mono text-white tracking-widest">{playMode === "duel_race" ? p2Progress : p2Score}</span>
                 </div>
               </div>
            ) : (
               <div className="my-10">
                 <p className="text-xs text-zinc-500 font-medium uppercase tracking-[0.3em] mb-4">{playMode === 'interview' ? 'Career Score' : 'Final Ledger'}</p>
                 <p className="text-6xl font-mono text-white tracking-tight">{playMode === 'interview' ? `${interviewXP} XP` : walletBalance}</p>
               </div>
            )}

            <button onClick={() => window.location.reload()} className="mt-4 px-10 py-4 rounded-full bg-white text-zinc-900 font-bold tracking-widest text-[10px] uppercase hover:scale-105 transition-transform shadow-[0_4px_24px_rgba(255,255,255,0.2)]">Return Home</button>
          </motion.div>
        )}

        {/* ACTIVE GAME */}
        {q && gameState === "active" && (
          <div className="z-10 flex flex-col w-full h-full max-w-7xl mx-auto px-6 py-8 relative">
            
            {/* Header Area */}
            <header className="flex justify-between items-center w-full pb-8">
              <div className="flex items-center justify-center gap-12">
                  <div className="flex flex-col">
                    <span className="text-zinc-500 tracking-[0.2em] text-[10px] uppercase font-bold mb-1">{playMode === 'interview' ? 'Quota' : 'Ledger'}</span>
                    <span className="font-mono text-white tracking-wider text-xl">{playMode === 'interview' ? `${interviewXP} XP` : walletBalance}</span>
                  </div>

                  <div className="flex flex-col">
                     <span className="text-zinc-500 tracking-[0.2em] text-[10px] uppercase font-bold mb-1">Level</span>
                     <span className="font-mono text-white tracking-widest text-lg">{String(level+1).padStart(2,'0')} <span className="text-zinc-600 font-light">/ 16</span></span>
                  </div>

                  {playMode === "solo" && (
                     <div className="flex gap-2 isolate">
                        <LifelinePanel lifelines={lifelines} onUse={useLifeline} disabled={selectedOpt !== null} />
                     </div>
                  )}

                  {playMode === "solo" && streak >= 2 && (
                    <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring"}} className="px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 flex items-center gap-2">
                      <span className="text-amber-500 text-xs">🔥</span>
                      <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase">{streak} Streak</span>
                    </motion.div>
                  )}
              </div>
              
              <div className="flex items-center gap-4">
                {playMode === "duel_host" && (
                  <div className="px-6 py-2 rounded-full border border-amber-500/30 text-amber-500 text-[10px] tracking-widest font-mono uppercase bg-amber-500/10 backdrop-blur">
                     {hostRevealed ? `CORRECT: ${String.fromCharCode(65 + q.ans)}` : 'REVEAL: [SPACE]'}
                  </div>
                )}
                {(playMode === "solo" || playMode === "interview") && (
                  <button onClick={() => { VoiceEngine.speak("Leaving already? Stay safe."); setGameState("extracted"); }} className="px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase text-zinc-400 hover:text-white border border-white/5 hover:border-white/20 hover:bg-surface-200 transition-colors">Withdraw</button>
                )}
              </div>
            </header>

            {/* Duel Race Progress Bars */}
            {playMode === "duel_race" && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-sm flex items-center justify-between gap-6 opacity-60">
                <div className="flex-1 flex flex-col items-end gap-2">
                   <span className="text-[9px] font-mono font-bold text-zinc-100">P1 {p1Progress}/16</span>
                   <div className="h-1 w-full bg-surface-200 rounded overflow-hidden flex justify-end"><div className="h-full bg-white transition-all" style={{ width: `${(p1Progress/16)*100}%` }}/></div>
                </div>
                <div className="flex-1 flex flex-col items-start gap-2">
                   <span className="text-[9px] font-mono font-bold text-zinc-100">P2 {p2Progress}/16</span>
                   <div className="h-1 w-full bg-surface-200 rounded overflow-hidden flex"><div className="h-full bg-white transition-all" style={{ width: `${(p2Progress/16)*100}%` }}/></div>
                </div>
              </div>
            )}

            <div className="flex-1 flex gap-12 w-full">
              {/* Left Column: Money Ladder */}
              {(playMode === "solo" || playMode === "interview") && (
                 <div className="hidden lg:flex w-[260px] pt-12 items-start drop-shadow">
                    <MoneyLadder currentLevel={level} prizeLadder={PRIZE_LADDER} mode={playMode} />
                 </div>
              )}

              {/* Main Column: Game Area */}
              <div className="flex-1 flex flex-col items-center justify-center">
                
                {/* Minimalist Linear Timer */}
                <div className="w-full max-w-[800px] mb-12 flex flex-col items-center gap-3">
                   <span className={`text-[2.5rem] leading-none font-mono font-medium tracking-tight ${timer <= 15 ? 'text-amber-500 animate-pulse' : 'text-zinc-400'}`}>
                     {timer.toString().padStart(2,'0')}
                   </span>
                   <div className="w-full h-[2px] bg-surface-200 overflow-hidden relative">
                     <div className={`absolute top-0 left-0 h-full ${timer <= 15 ? 'bg-amber-500' : 'bg-zinc-400'} timer-bar-progress`} style={{ width: `${(timer/90)*100}%` }} />
                   </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={`block-${level}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full flex flex-col items-center max-w-[840px]">
                    
                    <div className="w-full min-h-[160px] flex flex-col justify-center items-center text-center px-4 mb-10">
                       <h2 className="text-[2rem] md:text-[2.2rem] font-medium leading-[1.35] text-white tracking-tight max-w-[800px]">
                         {displayedQuestion}<span className="animate-pulse text-zinc-600 ml-1">|</span>
                       </h2>

                       {/* Audience Poll Chart */}
                       {showPoll && (
                         <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="mt-12 p-6 glass-panel-sleek rounded-2xl w-full max-w-[360px] flex items-end justify-between h-32 gap-6">
                           {['A','B','C','D'].map((ltr, i) => (
                             <div key={ltr} className="flex flex-col items-center flex-1 gap-2 h-full justify-end">
                               <span className="text-[10px] text-zinc-500 font-mono font-medium">{showPoll[i]}%</span>
                               <div className="w-full bg-white/5 rounded-t relative overflow-hidden transition-all duration-1000" style={{height:`${showPoll[i]}%`, minHeight:'4px'}}>
                                 <div className="absolute top-0 left-0 w-full bg-white opacity-20" style={{'--target-w':'100%', height:'100%'} as any} />
                               </div>
                               <span className="text-xs font-bold text-zinc-300">{ltr}</span>
                             </div>
                           ))}
                         </motion.div>
                       )}
                       {oracleLog && !showPoll && (
                         <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-10 text-sm font-medium text-zinc-300 glass-panel-sleek px-8 py-4 rounded-xl">
                           {oracleLog}
                         </motion.div>
                       )}
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 relative z-20">
                      {q.options.map((opt: string, i: number) => (
                         <div key={`opt-${level}-${i}`} className="relative pl-0 w-full">
                           {hoveredOpt === i && selectedOpt === null && pendingAnswer === null && aiHints.current[i] !== undefined && (
                             <motion.div initial={{opacity:0, y:2}} animate={{opacity:1, y:0}} className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-white/5 shadow-xl font-medium flex items-center gap-1.5 whitespace-nowrap">
                               <span className="text-amber-500 text-[8px] leading-none">✦</span> {aiHints.current[i]}% Probability
                             </motion.div>
                           )}
                           <OptionCard index={i} text={opt} selected={selectedOpt === i} correct={selectedOpt === i ? isCorrect : (isCorrect === false && i === q.ans ? true : null)} eliminated={eliminatedOpts.includes(i)} onClick={() => execOption(i)} playMode={playMode} />
                         </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

               {/* Right Filler for centering when Solo */}
               {(playMode === "solo" || playMode === "interview") && <div className="hidden lg:block w-[260px]" />}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );

}
