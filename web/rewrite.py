import re
import sys

with open("src/app/page.tsx", "r") as f:
    code = f.read()

start_idx = code.find("return (\n    <div className={`min-h-screen")
if start_idx == -1:
    print("Could not find start index")
    sys.exit(1)

new_ui = """return (
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

            <div className="flex-1 flex w-full relative z-10 mt-16 pb-12 items-end">
              
              {/* Left Column: Authentic Money Tree */}
              {(playMode === "solo" || playMode === "interview") && (
                 <div className="hidden lg:flex w-[320px] pl-4 justify-start">
                    <MoneyLadder currentLevel={level} prizeLadder={PRIZE_LADDER} mode={playMode} />
                 </div>
              )}

              {/* Center: The KBC Question Plate */}
              <div className="flex-1 flex flex-col items-center absolute bottom-12 w-full left-0 right-0 pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.div key={`block-${level}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", bounce: 0.3 }} className="w-full flex flex-col items-center max-w-[1100px] pointer-events-auto">
                    
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
                    <div className="w-full kbc-lozenge-wrapper p-[2px] mb-6 shadow-[0_0_40px_rgba(0,100,255,0.4)]">
                       <div className="kbc-lozenge-inner py-10 px-12 min-h-[140px] flex items-center justify-center text-center">
                          <h2 className="text-[2rem] md:text-[2.2rem] font-medium leading-[1.4] text-white tracking-wide">
                            {displayedQuestion}<span className="animate-pulse text-yellow-500 font-bold ml-1">_</span>
                          </h2>
                       </div>
                    </div>

                    {/* Options Grid */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-0 relative z-20">
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
"""

new_code = code[:start_idx] + new_ui + "\n}\n"

with open("src/app/page.tsx", "w") as f:
    f.write(new_code)
