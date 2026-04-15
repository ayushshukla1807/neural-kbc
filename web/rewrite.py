import re
import sys

with open("src/app/page.tsx", "r") as f:
    code = f.read()

start_idx = code.find("return (\n    <div className=\"min-h-screen bg-zinc-950 font-sans") # This won't match my previous replacement.
if start_idx == -1:
    start_idx = code.find("return (\n    <div className=\"min-h-screen bg-zinc-950 text-zinc-100") 

if start_idx == -1:
    print("Could not find start index")
    sys.exit(1)

new_ui = """return (
    <div className={`min-h-screen flex flex-col font-sans relative overflow-hidden transition-all duration-1000 ${isShaking ? 'animate-shake' : ''}`} style={{ backgroundColor: `hsl(${ambientHue}, 20%, 4%)` }}>
      
      {/* Cinematic Ambient Glow & Fluid Mesh */}
      <div className="fluid-mesh-bg" />

      {/* Confetti & Screen Flashes */}
      <canvas ref={confettiRef} className="fixed inset-0 z-[9998] pointer-events-none" />
      {screenFlash && (
        <div className={`fixed inset-0 z-[9997] pointer-events-none ${
          screenFlash === 'correct' ? 'bg-green-500/20 flash-green' :
          screenFlash === 'milestone' ? 'bg-yellow-400/20 flash-green' :
          'bg-red-500/30 flash-red backdrop-saturate-200'
        }`} />
      )}
      
      {/* ── Feature 1: Final Answer confirmation modal ── */}
      <AnimatePresence>
        {pendingAnswer !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} transition={{ type: "spring", bounce: 0.5 }} className="glass-panel-sleek border border-cyan-500/50 rounded-[3rem] p-16 text-center max-w-xl w-full shadow-[0_0_80px_rgba(0,240,255,0.2)]">
              <p className="text-cyan-400 font-bold tracking-[0.3em] uppercase mb-6 text-xs">Verify Selection</p>
              <p className="text-4xl font-medium text-white mb-4 tracking-tight">
                <span className="text-yellow-500 mr-4 font-black">{['A','B','C','D'][pendingAnswer]}.</span>
                {q?.options[pendingAnswer]}
              </p>
              <p className="text-zinc-400 font-medium tracking-wide text-sm mb-12">Is this your final answer?</p>
              
              <div className="flex gap-4 justify-center mb-12">
                <motion.div key={finalCountdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="text-7xl font-black font-mono text-yellow-500 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">{finalCountdown}</motion.div>
              </div>

              <div className="flex gap-6 justify-center w-full">
                <button onClick={() => setPendingAnswer(null)} className="flex-1 py-4 rounded-2xl text-zinc-300 border border-white/10 hover:bg-white/5 transition-all font-bold tracking-widest uppercase text-xs">Cancel</button>
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
                  }} className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl font-black tracking-widest uppercase text-xs transition-all shadow-[0_0_30px_rgba(0,240,255,0.5)]">Lock In</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        
        {/* LOBBY */}
        {gameState === "lobby" && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, type: "spring" }} className="z-10 flex flex-col items-center max-w-7xl text-center relative w-full px-6">
            <h1 className="text-glow-blue text-6xl md:text-[7rem] font-black tracking-tighter mb-4 text-white drop-shadow-2xl">Neural Arena</h1>
            <p className="text-sm text-cyan-400 tracking-[0.4em] uppercase mb-16 relative z-10 font-bold">The Next Generation of Competitive Knowledge</p>
            
            <ModeSelector onSelect={verifyProctoring} />

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mt-10">
              {availableVoices.length > 0 && (
                <div className="flex-1 flex items-center gap-4 px-8 py-5 glass-panel-sleek rounded-[2rem] relative border-cyan-500/30">
                  <span className="text-cyan-400 font-bold tracking-widest text-[10px] uppercase whitespace-nowrap">Voice Agent</span>
                  <select value={selectedVoiceName} onChange={e => handleVoiceChange(e.target.value)} className="flex-1 bg-transparent border-none text-white font-bold text-sm font-mono focus:outline-none appearance-none cursor-pointer">
                    {availableVoices.map(name => <option key={name} value={name} className="bg-zinc-900 text-white">{name}</option>)}
                  </select>
                </div>
              )}

              <div className="flex-1 flex items-center justify-between px-8 py-5 glass-panel-sleek rounded-[2rem] border-cyan-500/30">
                <span className="text-cyan-400 font-bold tracking-widest text-[10px] uppercase">Invite Link</span>
                <button onClick={copyRefLink} className="text-white hover:text-cyan-300 text-sm font-mono font-black uppercase transition-colors">{referralCopied ? 'Copied' : 'Copy'}</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ONBOARDING */}
        {gameState === "onboarding" && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="z-10 w-full max-w-5xl px-6 text-center">
            <motion.h2 variants={itemVariants} className="text-5xl font-black tracking-tighter text-white mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">Configure Sandbox</motion.h2>
            <motion.p variants={itemVariants} className="text-cyan-400 mb-14 text-sm font-bold uppercase tracking-[0.3em]">Select 3 technical domains</motion.p>
            
            <motion.div variants={containerVariants} className="flex flex-wrap justify-center gap-4 mb-12">
              {availableDomains.map(domain => {
                const selected = selectedDomains.includes(domain);
                return ( <motion.button variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={domain} onClick={() => toggleDomain(domain)} className={`px-8 py-4 rounded-[2rem] font-bold tracking-wide transition-all text-sm border-2 ${selected ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.6)] scale-105' : 'glass-panel-sleek text-zinc-300 hover:text-white border-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]'}`}> {domain} </motion.button> )
              })}
            </motion.div>
            
            <motion.button variants={itemVariants} onClick={constructGenerativeMatrix} disabled={selectedDomains.length !== 3} className={`px-12 py-5 rounded-full font-black tracking-[0.2em] text-sm uppercase transition-all ${selectedDomains.length === 3 ? 'bg-yellow-500 text-black shadow-[0_0_40px_rgba(255,215,0,0.6)] hover:bg-yellow-400 hover:scale-105' : 'glass-panel-sleek text-zinc-600 cursor-not-allowed opacity-50'}`}>
              Initialize Matrix
            </motion.button>
          </motion.div>
        )}

        {/* LOADING LLM */}
        {gameState === "loading_llm" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="z-10 flex flex-col items-center">
            <div className="w-24 h-24 border-[4px] border-white/5 border-t-cyan-400 rounded-full animate-spin mb-10 shadow-[0_0_50px_rgba(0,240,255,0.5)]"></div>
            <p className="text-cyan-400 text-sm font-mono tracking-[0.3em] font-bold uppercase animate-pulse">Synthesizing Datasets</p>
          </motion.div>
        )}

        {/* DECRYPTING HASH */}
        {gameState === "decrypting" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-3xl">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 border-4 border-dashed border-yellow-500 rounded-full animate-[spin_2s_linear_infinite] flex items-center justify-center mb-10 relative shadow-[0_0_50px_rgba(255,215,0,0.3)]">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping"></div>
              </div>
              <p className="text-yellow-500 text-sm font-bold tracking-[0.4em] uppercase mb-6 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">Verifying Block</p>
              <p className="text-5xl font-mono text-white tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">{decryptionHash}</p>
            </div>
          </motion.div>
        )}

        {/* ENDGAME STATES */}
         {["eliminated", "victorious", "extracted"].includes(gameState) && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.6 }} className="z-10 glass-panel-sleek border-2 border-white/10 p-20 rounded-[4rem] max-w-4xl w-full text-center relative overflow-hidden flex flex-col items-center shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <h1 className={`text-6xl md:text-7xl font-black mb-6 tracking-tighter relative z-10 ${gameState==='eliminated'? 'text-red-500 text-glow-red' : 'text-yellow-400 text-glow-gold'}`}>
              {playMode?.startsWith("duel") ? (p1Progress > p2Progress || p1Score > p2Score ? "PLAYER 1 WINS" : "PLAYER 2 WINS") : gameState === 'eliminated' ? 'SYSTEM FAILURE' : 'PROTOCOL COMPLETE'}
            </h1>
            
            {playMode?.startsWith("duel") ? (
               <div className="flex w-full gap-8 relative z-10 mb-16 justify-center mt-8">
                 <div className="px-12 py-10 rounded-[2rem] border border-cyan-500/50 bg-cyan-500/10 flex flex-col items-center w-64 shadow-[0_0_40px_rgba(0,240,255,0.2)]">
                    <span className="text-cyan-400 font-black tracking-widest text-sm uppercase mb-4">Player 1</span>
                    <span className="text-6xl font-mono text-white tracking-widest glow-text-blue">{playMode === "duel_race" ? p1Progress : p1Score}</span>
                 </div>
                 <div className="flex flex-col justify-center font-black text-4xl text-zinc-600 px-4">VS</div>
                 <div className="px-12 py-10 rounded-[2rem] border border-yellow-500/50 bg-yellow-500/10 flex flex-col items-center w-64 shadow-[0_0_40px_rgba(255,215,0,0.2)]">
                    <span className="text-yellow-500 font-black tracking-widest text-sm uppercase mb-4">Player 2</span>
                    <span className="text-6xl font-mono text-white tracking-widest glow-text-gold">{playMode === "duel_race" ? p2Progress : p2Score}</span>
                 </div>
               </div>
            ) : (
               <div className="my-12">
                 <p className="text-sm text-zinc-400 font-bold uppercase tracking-[0.4em] mb-4">{playMode === 'interview' ? 'Final Career Score' : 'Final Ledger Balance'}</p>
                 <p className="text-[5rem] font-mono font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">{playMode === 'interview' ? `${interviewXP} XP` : walletBalance}</p>
               </div>
            )}

            <button onClick={() => window.location.reload()} className="mt-4 px-12 py-5 rounded-full bg-white text-zinc-950 font-black tracking-[0.2em] text-xs uppercase hover:scale-110 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.6)]">Return Home</button>
          </motion.div>
        )}

        {/* ACTIVE GAME */}
        {q && gameState === "active" && (
          <div className="z-10 flex flex-col w-full h-full max-w-[1400px] mx-auto px-6 py-8 relative">
            
            {/* Header Area */}
            <header className="flex justify-between items-center w-full pb-8">
              <div className="flex items-center justify-center gap-10">
                  <div className="glass-panel-sleek px-8 py-3 rounded-full flex items-center gap-4">
                    <span className="text-cyan-400 tracking-[0.3em] text-[10px] uppercase font-black">{playMode === 'interview' ? 'Quota:' : 'Ledger:'}</span>
                    <span className="font-mono text-white tracking-widest text-xl font-bold">{playMode === 'interview' ? `${interviewXP} XP` : walletBalance}</span>
                  </div>

                  <div className="glass-panel-sleek px-6 py-3 rounded-full flex items-center gap-3">
                     <span className="text-zinc-500 tracking-[0.2em] text-[10px] uppercase font-black">Level</span>
                     <span className="font-mono text-white tracking-widest text-xl font-bold">{String(level+1).padStart(2,'0')} <span className="text-zinc-500">/ 16</span></span>
                  </div>

                  {playMode === "solo" && (
                     <div className="flex gap-2 isolate">
                        <LifelinePanel lifelines={lifelines} onUse={useLifeline} disabled={selectedOpt !== null} />
                     </div>
                  )}

                  {playMode === "solo" && streak >= 2 && (
                    <motion.div initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring", bounce:0.6}} className="px-6 py-3 rounded-full border border-yellow-500/30 bg-yellow-500/20 flex items-center gap-3 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                      <span className="text-yellow-500 text-lg">🔥</span>
                      <span className="text-xs font-black text-yellow-500 tracking-widest uppercase">{streak} Streak</span>
                    </motion.div>
                  )}
              </div>
              
              <div className="flex items-center gap-4">
                {playMode === "duel_host" && (
                  <div className="px-6 py-3 rounded-full border border-yellow-500/50 text-yellow-500 text-[10px] tracking-widest font-black uppercase bg-yellow-500/10 backdrop-blur shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                     {hostRevealed ? `CORRECT: ${String.fromCharCode(65 + q.ans)}` : 'REVEAL: [SPACE]'}
                  </div>
                )}
                {(playMode === "solo" || playMode === "interview") && (
                  <button onClick={() => { VoiceEngine.speak("Leaving already? Stay safe."); setGameState("extracted"); }} className="px-8 py-3 rounded-full text-xs font-black tracking-widest uppercase text-red-400 bg-red-500/10 hover:text-white border border-red-500/30 hover:bg-red-500/40 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all">Withdraw</button>
                )}
              </div>
            </header>

            {/* Duel Race Progress Bars */}
            {playMode === "duel_race" && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-lg flex items-center justify-between gap-8 z-50">
                <div className="flex-1 flex flex-col items-end gap-2">
                   <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest">P1 {p1Progress}/16</span>
                   <div className="h-2 w-full bg-cyan-950/50 rounded-full overflow-hidden flex justify-end border border-cyan-500/30"><div className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,1)] transition-all" style={{ width: `${(p1Progress/16)*100}%` }}/></div>
                </div>
                <div className="flex-1 flex flex-col items-start gap-2">
                   <span className="text-xs font-mono font-black text-yellow-500 uppercase tracking-widest">P2 {p2Progress}/16</span>
                   <div className="h-2 w-full bg-yellow-950/50 rounded-full overflow-hidden flex border border-yellow-500/30"><div className="h-full bg-yellow-400 shadow-[0_0_10px_rgba(255,215,0,1)] transition-all" style={{ width: `${(p2Progress/16)*100}%` }}/></div>
                </div>
              </div>
            )}

            <div className="flex-1 flex gap-12 w-full pt-4">
              {/* Left Column: Money Ladder */}
              {(playMode === "solo" || playMode === "interview") && (
                 <div className="hidden lg:flex w-[280px] pt-8 items-start relative z-20">
                    <MoneyLadder currentLevel={level} prizeLadder={PRIZE_LADDER} mode={playMode} />
                 </div>
              )}

              {/* Main Column: Game Area */}
              <div className="flex-1 flex flex-col items-center justify-center relative">
                
                {/* Heartbeat Circular Timer (High Tension) */}
                <div className={`relative mb-12 flex items-center justify-center ${timer <= 15 ? 'heartbeat-rapid' : ''}`}>
                  <svg width="140" height="140" className="absolute" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="70" cy="70" r="62" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                    <circle
                      cx="70" cy="70" r="62"
                      stroke={timer <= 10 ? '#ef4444' : timer <= 25 ? '#eab308' : '#22d3ee'}
                      strokeWidth="6" fill="none" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 62}`}
                      strokeDashoffset={`${2 * Math.PI * 62 * (1 - timer / 90)}`}
                      className="tension-bar"
                      style={{ filter: `drop-shadow(0 0 12px ${timer<=10?'#ef4444':timer<=25?'#eab308':'#22d3ee'})` }}
                    />
                  </svg>
                  <span className={`text-5xl font-black font-mono tracking-tighter relative z-10 ${
                    timer <= 10 ? 'text-red-500 glow-text-red' : timer <= 25 ? 'text-yellow-500 text-glow-gold' : 'text-cyan-400 text-glow-blue'
                  }`}>{timer.toString().padStart(2,'0')}</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={`block-${level}`} initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ type: "spring", bounce: 0.4 }} className="w-full flex flex-col items-center max-w-[900px]">
                    
                    <div className="w-full min-h-[180px] flex flex-col justify-center items-center text-center px-4 mb-12 glass-panel-sleek rounded-[3rem] py-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                       <h2 className="text-[2.2rem] md:text-[3rem] font-medium leading-[1.3] text-white tracking-tight px-10">
                         {displayedQuestion}<span className="animate-pulse text-cyan-500 ml-2">|</span>
                       </h2>

                       {/* Audience Poll Chart */}
                       {showPoll && (
                         <motion.div initial={{opacity:0, scale:0.9, y: 20}} animate={{opacity:1, scale:1, y: 0}} transition={{ type: "spring" }} className="mt-14 p-8 glass-panel-sleek rounded-[2rem] w-full max-w-[420px] flex items-end justify-between h-40 gap-8 border-cyan-500/30">
                           {['A','B','C','D'].map((ltr, i) => (
                             <div key={ltr} className="flex flex-col items-center flex-1 gap-3 h-full justify-end">
                               <span className="text-xs text-cyan-300 font-mono font-bold">{showPoll[i]}%</span>
                               <div className="w-full bg-cyan-950/50 rounded-t-xl relative overflow-hidden transition-all duration-[1500ms] border border-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.2)]" style={{height:`${showPoll[i]}%`, minHeight:'6px'}}>
                                 <div className="absolute top-0 left-0 w-full bg-gradient-to-t from-cyan-600 to-cyan-300" style={{height:'100%'} as any} />
                               </div>
                               <span className="text-sm font-black text-white">{ltr}</span>
                             </div>
                           ))}
                         </motion.div>
                       )}
                       {oracleLog && !showPoll && (
                         <motion.div initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} className="mt-10 text-sm font-bold tracking-widest text-yellow-400 glass-panel-gold px-10 py-5 rounded-2xl uppercase">
                           {oracleLog}
                         </motion.div>
                       )}
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
                      {q.options.map((opt: string, i: number) => (
                         <div key={`opt-${level}-${i}`} className="relative pl-0 w-full">
                           {hoveredOpt === i && selectedOpt === null && pendingAnswer === null && aiHints.current[i] !== undefined && (
                             <motion.div initial={{opacity:0, y:10, scale: 0.8}} animate={{opacity:1, y:0, scale: 1}} className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-black border border-yellow-500/50 shadow-[0_0_20px_rgba(255,215,0,0.5)] text-xs text-yellow-400 font-bold flex items-center gap-2 whitespace-nowrap">
                               <span className="text-yellow-500 animate-pulse text-lg">♦</span> {aiHints.current[i]}% Oracle Confidence
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
               {(playMode === "solo" || playMode === "interview") && <div className="hidden lg:block w-[280px]" />}
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
