import re
import sys

with open("src/app/page.tsx", "r") as f:
    code = f.read()

start_idx = code.find("return (\n    <div onMouseMove")
if start_idx == -1:
    print("Could not find start index")
    sys.exit(1)

new_ui = """return (
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
"""

new_code = code[:start_idx] + new_ui + "\n}\n"

with open("src/app/page.tsx", "w") as f:
    f.write(new_code)
