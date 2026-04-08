"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Constants
const PRIZE_LADDER = [ "0.05 ETH", "0.10 ETH", "0.25 ETH", "0.50 ETH", "1.00 ETH", "2.50 ETH", "5.00 ETH", "10 ETH", "20 ETH", "40 ETH", "100 ETH", "250 ETH", "500 ETH", "1000 ETH", "2500 ETH", "10,000 ETH" ];
const DOMAINS = ["Software Architecture", "Quantum Mechanics", "Algorithmic Trading", "Global Geopolitics", "Neural Biology", "Avant-Garde Cinema", "Cryptography", "Machine Learning", "Micro-Economics"];

// Master-Tier Audio Synth (Procedural Engine)
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
  tick() { this.play(800, 'sine', 0.05, 0.05); },
  hover() { this.play(1200, 'sine', 0.05, 0.02); },
  type() { this.play(5000, 'square', 0.02, 0.01); },
  lock() { this.play(200, 'square', 0.4, 0.2); this.play(150, 'sawtooth', 0.5, 0.3); },
  win() { [400, 500, 600, 800].forEach((f, i) => setTimeout(() => this.play(f, 'sine', 0.5, 0.2), i*100)); },
  lose() { this.play(100, 'sawtooth', 1.5, 0.5); this.play(50, 'square', 2.0, 0.6); },
  violation() { this.play(1000, 'square', 0.1, 0.5); setTimeout(() => this.play(1000, 'square', 0.2, 0.5), 150); }
};

// Web Speech API Interface (Indian Actress Host Style)
const VoiceEngine = {
  speak(text: string, pitch = 1.15, rate = 0.95) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    let activeVoice = voices.find(v => (v.lang === "en-IN" || v.lang === "hi-IN") && (v.name.includes("Female") || v.name.includes("Neerja") || v.name.includes("Lekha")));
    if (!activeVoice) activeVoice = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("hi-IN"));
    if (activeVoice) utterance.voice = activeVoice;
    
    utterance.pitch = pitch; utterance.rate = rate; utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};

const containerVariants: any = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants: any = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "tween" } } };

export default function NeuralArena() {
  const [level, setLevel] = useState(0);
  const [timer, setTimer] = useState(60);
  const [gameState, setGameState] = useState<"lobby"|"onboarding"|"loading_llm"|"decrypting"|"active"|"eliminated"|"victorious"|"extracted">("lobby");
  
  // Game Mode State
  const [playMode, setPlayMode] = useState<"solo" | "duel" | null>(null);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

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

  useEffect(() => {
    if (gameState === "active" && q && selectedOpt === null) {
      setTimeout(() => {
        const script = playMode === "duel" 
          ? `Dono khiladiyan tayyar! Prashna hai, ${q.q}. Aapke options: A, ${q.options[0]}. B, ${q.options[1]}. C, ${q.options[2]}. D, ${q.options[3]}. Apni keys dabayein ab!`
          : `Agla prashna, aapke neural grid par, yeh raha. ${q.q}. Aapke options hain... Option A, ${q.options[0]}. Option B, ${q.options[1]}. Option C, ${q.options[2]}. Aur Option D, ${q.options[3]}. Aapka samay, shuru hota hai ab!`;
        VoiceEngine.speak(script, 1.2, 0.92);
      }, 800);
    }
  }, [level, q, gameState, playMode]);

  useEffect(() => {
    let keys = "";
    const handleKey = (e: KeyboardEvent) => {
      // Secret unlocker
      keys += e.key;
      if (keys.includes("hack")) {
        VoiceEngine.speak("Classified protocol unlocked. Swagat hai.", 0.8, 1.0);
        pushLog("CLASSIFIED DOMAIN ADDED: OMNI-GUARD SYSTEM EXPLOITS");
        setAvailableDomains(p => Array.from(new Set(["OmniGuard Exploits", ...p])));
        keys = "";
      }

      // Offline Multiplayer Duel Logic (Fastest Finger First via Keyboard)
      if (gameState === "active" && playMode === "duel" && selectedOpt === null) {
        const p1Keys = ['q', 'w', 'e', 'r'];
        const p2Keys = ['u', 'i', 'o', 'p'];
        const key = e.key.toLowerCase();
        
        let p1Choice = p1Keys.indexOf(key);
        let p2Choice = p2Keys.indexOf(key);
        
        if (p1Choice !== -1) {
          pushLog(`P1 LOCKED OPTION ${String.fromCharCode(65 + p1Choice)}`);
          executeDuelChoice(p1Choice, 1);
        } else if (p2Choice !== -1) {
          pushLog(`P2 LOCKED OPTION ${String.fromCharCode(65 + p2Choice)}`);
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
    setSelectedOpt(choiceIndex);
    const correct = choiceIndex === q.ans;
    setIsCorrect(correct);
    setTimeout(() => {
       if (correct) {
          if(playerNum===1) setP1Score(p=>p+1); else setP2Score(p=>p+1);
          VoiceEngine.speak(`Player ${playerNum} ne bilkul sahi jawaab diya hai!`, 1.3, 0.95);
       } else {
          VoiceEngine.speak(`Galat jawab! Player ${playerNum} peeche reh gaye.`, 1.0, 0.85);
       }
       executeCryptographicCheck(true, level + 1); // Auto-advance in duel mode regardless to keep party game flow
    }, 2000);
  };

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
    if (gameState === "active" && timer > 0 && selectedOpt === null && !showViolationWarning) {
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
    } else if (timer === 0 && gameState === "active") {
      pushLog("TIMED OUT. EXECUTING LIQUIDATION.");
      AudioEngine.lose(); VoiceEngine.speak("Aapka samay samapt hua. Afsoos, hume khed hai.", 1.0, 0.85); setIsShaking(true); setGameState("eliminated");
    }
  }, [timer, gameState, selectedOpt, showViolationWarning, playMode]);

  useEffect(() => {
    if (gameState !== "active" || playMode === "duel") return; // No strict tab monitoring in couch co-op
    const triggerViolation = () => {
      AudioEngine.violation(); pushLog(`DOM SENSOR TRIGGERED. BREACH DETECTED.`);
      setFocusHistory(prev => [...prev.slice(-19), Math.max(0, prev[prev.length-1] - 40)]);
      setViolationCount(prev => { 
        const n = prev + 1; 
        if(n === 1) VoiceEngine.speak("Kripaya dhyan dein. Apni window leave karna allowed nahi hai.", 1.2, 0.95);
        if(n === 2) VoiceEngine.speak("Aakhiri chetavani. Cheating karne par game turant samapt kar diya jayega.", 1.1, 0.95);
        if(n >= 3) { pushLog("CRITICAL BREACH. PURGING SANDBOX."); AudioEngine.lose(); VoiceEngine.speak("Niyam ullanghan! Aapka khel samapt kiya jata hai.", 1.1, 0.90); setIsShaking(true); setGameState("eliminated"); } 
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

  const verifyProctoring = async (mode: "solo"|"duel") => {
    window.speechSynthesis.getVoices(); 
    setPlayMode(mode);
    AudioEngine.init(); pushLog(`BOOTING AUDIO CONTEXT IN ${mode.toUpperCase()} OVERRIDE...`);
    try { await document.documentElement.requestFullscreen(); pushLog("FULLSCREEN ALLOCATED."); } catch (e) {}
    
    if (mode === "solo") {
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

    VoiceEngine.speak(mode === "duel" ? "Welcome to Offline Versus Mode. Two players. One Matrix. Chaliye khelte hain." : "Namaskaar. Web Three Neural matrix mein aapka swagat hai. Kripaya apne domains select karein.", 1.25, 0.95);
    setGameState("onboarding"); pushLog("STATUS: ONLINE.");
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

    VoiceEngine.speak("Matrix configure ho chukka hai. Chaliye khelte hain, Web3 Play Along!", 1.3, 0.95);
    setGameState("active"); setLevel(0); setTimer(60); setWalletBalance("0.00 ETH"); setViolationCount(0); pushLog("SANDBOX LIVE.");
  };

  const executeCryptographicCheck = (correct: boolean, nextLevel: number) => {
    setGameState("decrypting"); pushLog("BRUTE FORCING LEDGER HASHES...");
    AudioEngine.play(200, 'sawtooth', 2.0, 0.4);
    if(playMode!=="duel") VoiceEngine.speak("Computer mahashay jawab ko lock kar rahe hain.", 1.1, 0.95);
    
    let cycles = 0;
    const interval = setInterval(() => {
      setDecryptionHash("0x" + Math.random().toString(16).substr(2, 12).toUpperCase());
      cycles++;
      if (cycles > 20) {
        clearInterval(interval);
        setDecryptionHash(correct ? "0xVERIFIED_HASH" : "0xCORRUPTED_HASH");
        setGameState("active");
        
        if (correct) {
          AudioEngine.win();
          if(playMode==="solo") {
            VoiceEngine.speak(`Adbhut! Sahi jawaab! Aap jeet chuke hain ${PRIZE_LADDER[nextLevel - 1]}. Kya baat hai!`, 1.3, 0.95);
          }
          setWalletBalance(PRIZE_LADDER[nextLevel - 1]);
          pushLog(`MINTED HASH VAL: ${PRIZE_LADDER[nextLevel - 1]}`);
          if(nextLevel === 5) setUnlockedAsset("🔓 Level 5 Smart Contract Minted");
          if(nextLevel === 10) setUnlockedAsset("🔓 Level 10 Golden DAO NFT Minted");
          setTimeout(() => setUnlockedAsset(""), 3000);
          if (nextLevel > PRIZE_LADDER.length - 1) { 
             pushLog("DAO FOUNDER ATTAINED."); 
             VoiceEngine.speak(playMode==="duel" ? "Duel Exhausted. Excellent Gameplay!" : "Shandaar khel! Aap bane hain Crore-pati! Bahut Bahut Badhaiyan!", 1.4, 0.95); 
             setGameState("victorious"); 
          }
          else { setLevel(nextLevel); setTimer(60); setSelectedOpt(null); setIsCorrect(null); setEliminatedOpts([]); setOracleLog(""); }
        } else {
          pushLog("HASH REJECTED. FATAL ERROR SEVERITY LEVEL 9."); AudioEngine.lose(); 
          if(playMode==="solo") VoiceEngine.speak("Oh ho! Yeh galat jawaab hai. Bada afsos hua.", 1.0, 0.85); 
          setIsShaking(true); 
          if (playMode === "solo") setGameState("eliminated");
        }
      }
    }, 50);
  };

  const execOption = (i: number) => {
    if (!q || selectedOpt !== null || eliminatedOpts.includes(i) || playMode === "duel") return; // Mouse clicks disabled in duel mode!
    AudioEngine.lock();
    setSelectedOpt(i); pushLog(`VECTOR OPTION ${String.fromCharCode(65 + i)} COMMITTED.`);
    setTimeout(() => {
      const correct = i === q.ans;
      setIsCorrect(correct);
      setTimeout(() => executeCryptographicCheck(correct, level + 1), 1000);
    }, 2000);
  };

  return (
    <div onMouseMove={handleMouseMove} className={`min-h-screen flex flex-col items-center justify-center bg-[#030305] text-white font-sans overflow-hidden select-none relative ${isShaking ? 'animate-shake' : ''}`}>
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
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} className="z-10 flex flex-col items-center glass-panel p-16 rounded-[2.5rem] max-w-5xl text-center border-t border-l border-white/20 shadow-[-20px_20px_60px_rgba(0,0,0,0.8)]">
            <h1 className="text-7xl md:text-[8rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-neon-purple to-neon-blue mb-4 leading-none" style={{ transform: 'translateZ(60px)' }}>WEB3 CORE</h1>
            <p className="text-xl text-gray-300 max-w-2xl leading-relaxed mb-10 font-light tracking-wide" style={{ transform: 'translateZ(20px)' }}>
              You have penetrated a Tier-1 Architecture Framework. Select your execution sandbox.
            </p>
            
            <div className="flex gap-6 w-full justify-center mb-10" style={{ transform: 'translateZ(40px)' }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => verifyProctoring('solo')} className="flex-1 max-w-xs p-8 bg-gradient-to-tl from-neon-purple/20 to-black border border-neon-purple/50 rounded-3xl group shadow-[0_0_30px_rgba(138,43,226,0.3)] hover:shadow-[0_0_50px_rgba(138,43,226,0.6)] transition-all">
                 <h3 className="text-2xl font-black text-white mb-2 glow-text-blue group-hover:text-neon-blue transition-colors">SOLO OPS</h3>
                 <p className="text-sm text-gray-400 font-mono">Strict DOM Proctoring. Live Generative AI. ETH Rewards.</p>
              </motion.button>
              
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => verifyProctoring('duel')} className="flex-1 max-w-xs p-8 bg-gradient-to-tr from-gold-500/20 to-black border border-gold-500/50 rounded-3xl group shadow-[0_0_30px_rgba(212,160,23,0.3)] hover:shadow-[0_0_50px_rgba(212,160,23,0.6)] transition-all">
                 <h3 className="text-2xl font-black text-white mb-2 group-hover:text-gold-400 transition-colors drop-shadow-[0_0_10px_gold]">VERSUS DUEL</h3>
                 <p className="text-sm text-gray-400 font-mono">Local Offline 1v1. Split Keyboard Gameplay (QWER vs UIOP).</p>
              </motion.button>
            </div>

            {/* Growth Hook: Referral System */}
            <div className="w-full glass-panel border border-dashed border-neon-blue/50 p-6 rounded-2xl flex items-center justify-between" style={{ transform: 'translateZ(30px)' }}>
              <div className="flex flex-col text-left">
                <span className="text-neon-blue font-black tracking-widest text-sm mb-1 uppercase">Activate 5x Native Yield</span>
                <span className="text-gray-400 font-mono text-xs">Invite 3 peers to the network to multiply your ETH withdrawals automatically.</span>
              </div>
              <button onClick={copyRefLink} className="px-6 py-3 bg-neon-blue/20 hover:bg-neon-blue border border-neon-blue text-white rounded-xl font-bold tracking-widest text-xs uppercase transition-all duration-300">
                {referralCopied ? 'Link Copied!' : 'Copy Matrix Invite'}
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
              {playMode === "duel" ? "MATCH CONCLUDED" : gameState === 'eliminated' ? 'SYSTEM LIQUIDATION' : 'PROTOCOL CLEAR'}
            </h1>
            
            {playMode === "duel" ? (
               <div className="flex w-full gap-8 relative z-10 mb-16 justify-center" style={{ transform: 'translateZ(40px)' }}>
                 <div className="glass-panel p-8 rounded-3xl border border-neon-purple/50 bg-neon-purple/10 flex flex-col items-center w-64">
                    <span className="text-neon-purple font-black tracking-widest mb-2">PLAYER 1</span>
                    <span className="text-6xl font-mono text-white glow-text-blue">{p1Score}</span>
                 </div>
                 <div className="flex flex-col justify-center font-black text-4xl text-gray-600 px-4">VS</div>
                 <div className="glass-panel p-8 rounded-3xl border border-gold-500/50 bg-gold-500/10 flex flex-col items-center w-64">
                    <span className="text-gold-400 font-black tracking-widest mb-2">PLAYER 2</span>
                    <span className="text-6xl font-mono text-white glow-text-gold">{p2Score}</span>
                 </div>
               </div>
            ) : (
               <>
                 <p className="text-2xl text-gray-400 font-light mb-2 relative z-10 uppercase tracking-widest">Final Ledger Balance</p>
                 <p style={{ transform: 'translateZ(40px)' }} className="text-7xl font-mono text-white mb-16 glow-text-blue relative z-10 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">{walletBalance}</p>
               </>
            )}

            <button onClick={() => window.location.reload()} onMouseEnter={()=>AudioEngine.hover()} className="px-10 py-5 border border-white/20 rounded-full text-white font-bold tracking-[0.2em] text-sm uppercase hover:bg-white hover:text-black transition-all relative z-10 shadow-[0_0_30px_rgba(255,255,255,0.2)]">Return to Main Sector</button>
          </motion.div>
        )}

        {q && gameState === "active" && (
          <div className="z-10 flex flex-col w-full h-full max-w-[1400px] mx-auto px-6 py-8 relative">
            
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4 pb-6 relative">
              <div className="flex gap-3">
                <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-4 border border-neon-blue/30 bg-neon-blue/5 shadow-[0_0_30px_rgba(0,240,255,0.15)] backdrop-blur-md">
                  <span className="text-neon-blue font-black tracking-[0.2em] text-sm">SECURE LEDGER:</span>
                  <span className="font-mono text-white text-xl font-bold drop-shadow-[0_0_8px_white]">{walletBalance}</span>
                </div>
              </div>

              {playMode === "duel" && (
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 glass-panel px-8 py-2 rounded-full border border-white/20">
                    <span className="font-mono font-black text-2xl text-neon-purple w-8 text-right">{p1Score}</span>
                    <span className="text-xs text-gray-500 font-black tracking-[0.3em]">SCORE</span>
                    <span className="font-mono font-black text-2xl text-gold-400 w-8 text-left">{p2Score}</span>
                </div>
              )}

              {playMode === "solo" && (
                <div className="flex gap-3">
                  <button onClick={() => { VoiceEngine.speak("Nishkashann. Aapka khel yahi samapt hota hai.", 1.2, 0.95); setGameState("extracted"); }} className="px-8 py-3 border border-red-500/50 bg-red-500/10 hover:bg-red-500/30 rounded-2xl text-xs font-black tracking-[0.2em] uppercase text-red-100 glow-text-red shadow-[0_0_20px_rgba(255,0,85,0.2)] hover:scale-105 transition-all">Withdraw</button>
                </div>
              )}
            </header>

            <div className="flex-1 flex flex-col justify-center items-center py-6 w-full relative">
              {/* Timer */}
              <div className="relative mb-8" style={{ transform: 'translateZ(50px)' }}>
                  <div className={`absolute -inset-8 bg-red-500/30 rounded-full blur-[40px] transition-opacity ${timer<=10?'opacity-100 animate-[pulse_0.4s_infinite]':'opacity-0'}`}></div>
                  <span className={`text-[8rem] leading-none font-black font-mono tracking-tighter ${timer<=10?'text-red-500 glow-text-red':'text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]'}`}>{timer.toString().padStart(2, '0')}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={`block-${level}`} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.95 }} variants={containerVariants} className="w-full flex flex-col items-center">
                  <motion.div variants={itemVariants} style={{ transform: 'translateZ(30px)' }} className="w-full max-w-6xl glass-panel relative p-14 rounded-[3rem] border border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.8)] mb-10 overflow-hidden text-center bg-gradient-to-b from-white/5 to-transparent">
                    <h2 className="text-4xl md:text-[3.2rem] font-medium text-center leading-[1.4] text-white mt-4 tracking-tight drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">{q.q}</h2>
                  </motion.div>

                  {/* Duel Mode Dynamic UI splits into absolute left/right controls */}
                  <div className={`w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-20`}>
                    {q.options.map((opt: string, i: number) => {
                      const isSelected = selectedOpt === i;
                      let styles = "border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] cursor-pointer backdrop-blur-2xl shadow-[0_15px_30px_rgba(0,0,0,0.4)]";
                      
                      if (playMode !== "duel") styles += " hover:bg-white/10 hover:border-white/40";
                      
                      if (isSelected) {
                        if (isCorrect === null) styles += " border-gold-500 bg-gold-500/20";
                        else if (isCorrect === true) styles += " border-[#00ff88] bg-[#00ff88]/20";
                        else styles += " border-[#ff0055] bg-[#ff0055]/30";
                      } else if (isCorrect === false && i === q.ans) {
                          styles += " border-[#00ff88]/80 bg-[#00ff88]/20 text-white";
                      }

                      return (
                        <motion.div variants={itemVariants} key={`opt-${level}-${i}`} onClick={() => execOption(i)} className={`flex items-center px-10 py-8 rounded-[2rem] border transition-all duration-300 relative ${styles} ${playMode==="duel"? 'pointer-events-none' : ''}`}>
                          <span className="w-16 font-mono font-black text-4xl text-white/30 tracking-tighter">{String.fromCharCode(65 + i)}</span>
                          <span className="text-3xl font-medium tracking-tight text-white drop-shadow-md">{opt}</span>
                          
                          {/* Offline Keys Overlay for UX */}
                          {playMode === "duel" && (
                            <div className="absolute top-2 right-4 flex gap-2">
                               <div className="px-3 py-1 bg-neon-purple/20 border border-neon-purple rounded-md text-[10px] font-black text-neon-purple tracking-widest">{['Q','W','E','R'][i]} P1</div>
                               <div className="px-3 py-1 bg-gold-400/20 border border-gold-400 rounded-md text-[10px] font-black text-gold-400 tracking-widest">{['U','I','O','P'][i]} P2</div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
