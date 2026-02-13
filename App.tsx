
import React, { useState, useEffect, useCallback } from 'react';
import { generateMysteryCase } from './services/geminiService';
import { Case, GameState, Suspect, Evidence } from './types';
import TypingEffect from './components/TypingEffect';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [currentSuspectIndex, setCurrentSuspectIndex] = useState(0);
  const [activeEvidence, setActiveEvidence] = useState<Evidence | null>(null);
  const [selectedKillerId, setSelectedKillerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState("");

  const startNewLevel = useCallback(async (level: number) => {
    setGameState(GameState.LOADING);
    setError(null);
    setLoadingStep("Arşivler taranıyor...");
    try {
      const caseData = await generateMysteryCase(level);
      setLoadingStep("Şüpheliler sorgu odasına getiriliyor...");
      setCurrentCase(caseData);
      setGameState(GameState.BRIEFING);
      setCurrentSuspectIndex(0);
      setActiveEvidence(null);
      setSelectedKillerId(null);
    } catch (err) {
      setError("Vaka dosyasına ulaşılamadı. Lütfen tekrar deneyin.");
      setGameState(GameState.START);
    }
  }, []);

  const currentSuspect = currentCase?.suspects[currentSuspectIndex];
  const isCorrect = selectedKillerId && currentCase?.suspects.find(s => s.id === selectedKillerId)?.isKiller;

  const handleNextSuspect = () => {
    if (currentCase && currentSuspectIndex < currentCase.suspects.length - 1) {
      setCurrentSuspectIndex(prev => prev + 1);
    }
  };

  const handlePrevSuspect = () => {
    if (currentSuspectIndex > 0) {
      setCurrentSuspectIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#0a0a0c] text-slate-200 relative">
      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-50 bg-[#0a0a0c]/90 backdrop-blur-md border-b border-white/5">
        <div className="flex flex-col">
          <h1 className="title-font text-xl md:text-2xl font-bold tracking-tighter text-amber-600 uppercase leading-none">Yalan Labirenti</h1>
          <span className="text-[9px] tracking-[0.3em] text-slate-500 font-bold uppercase mt-1">Gölge Mahkemesi</span>
        </div>
        {gameState !== GameState.START && (
          <div className="flex gap-4 items-center">
            <span className="hidden md:inline text-[10px] font-black text-amber-500/80 uppercase border-r border-slate-800 pr-4 mr-2">SEVİYE {currentLevel}</span>
            <button onClick={() => setGameState(GameState.START)} className="text-[10px] text-slate-500 hover:text-red-500 transition-colors uppercase font-bold">Vakayı Kapat</button>
          </div>
        )}
      </header>

      {/* Main Content Area with appropriate padding for Fixed elements */}
      <main className="w-full max-w-6xl flex-1 flex flex-col items-center justify-center p-4 pt-24 pb-24 md:pt-32 md:pb-32 z-10">
        
        {/* START SCREEN */}
        {gameState === GameState.START && (
          <div className="text-center space-y-12 animate-in fade-in zoom-in duration-1000">
            <div className="space-y-4">
              <h2 className="title-font text-6xl md:text-9xl font-black text-white mb-2 tracking-tighter opacity-90 leading-none">SESSİZ MAHKEME</h2>
              <p className="text-slate-400 max-w-lg mx-auto italic text-lg leading-relaxed">
                "Hakikat bazen satır aralarında, bazen de bir otopsi raporunun dipnotunda gizlidir."
              </p>
            </div>
            <button 
              onClick={() => startNewLevel(currentLevel)}
              className="px-16 py-6 bg-amber-700 hover:bg-amber-600 text-white font-black rounded-none border-b-4 border-amber-900 transition-all hover:scale-105 active:scale-95 shadow-2xl uppercase tracking-widest text-xl"
            >
              SORUŞTURMAYI BAŞLAT
            </button>
            {error && <p className="text-red-500 font-medium bg-red-500/10 px-6 py-3 border border-red-500/20">{error}</p>}
          </div>
        )}

        {/* LOADING SCREEN */}
        {gameState === GameState.LOADING && (
          <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
            <div className="w-20 h-20 border-2 border-amber-600/10 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="court-font text-xl text-amber-500 italic tracking-widest uppercase animate-pulse">{loadingStep}</p>
          </div>
        )}

        {/* BRIEFING */}
        {gameState === GameState.BRIEFING && currentCase && (
          <div className="w-full bg-[#0d0d0f] p-8 md:p-12 rounded-none border border-slate-800 shadow-2xl space-y-8 animate-in slide-in-from-bottom-20 duration-1000">
            <div className="space-y-2 border-b border-slate-900 pb-6">
              <span className="text-amber-600 font-bold text-xs uppercase tracking-[0.4em]">Resmi Vaka Dosyası</span>
              <h2 className="title-font text-4xl md:text-5xl text-white font-bold leading-tight">{currentCase.title}</h2>
            </div>
            <div className="max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
               <TypingEffect text={currentCase.description} className="text-xl md:text-2xl text-slate-300 leading-relaxed font-light" speed={15} />
            </div>
            <div className="pt-8 flex justify-end">
              <button onClick={() => setGameState(GameState.INTERROGATION)} className="px-10 py-4 bg-slate-200 text-black font-black uppercase text-sm tracking-widest hover:bg-amber-500 transition-colors">Sorgu Odasına Gir</button>
            </div>
          </div>
        )}

        {/* INTERROGATION */}
        {gameState === GameState.INTERROGATION && currentCase && currentSuspect && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Suspect Selector Tabs */}
            <div className="flex flex-wrap gap-2 bg-slate-900/30 p-2 border border-slate-800/50">
              {currentCase.suspects.map((s, idx) => (
                <button 
                  key={s.id}
                  onClick={() => setCurrentSuspectIndex(idx)}
                  className={`px-4 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${currentSuspectIndex === idx ? 'bg-amber-600 border-amber-500 text-black' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-200'}`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-stretch">
              {/* Suspect Avatar */}
              <div className="md:w-1/3 relative group">
                <div className="relative aspect-[3/4] overflow-hidden border border-slate-800 shadow-2xl">
                  <img src={currentSuspect.avatar} alt={currentSuspect.name} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 w-full p-4 md:p-6">
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">{currentSuspect.name}</h3>
                    <p className="text-amber-500 text-[10px] uppercase font-black tracking-widest mt-1">{currentSuspect.role}</p>
                  </div>
                </div>
              </div>

              {/* Suspect Statement and Navigation */}
              <div className="md:w-2/3 bg-slate-900/40 border border-slate-800 relative flex flex-col min-h-[400px]">
                {/* Statement Header */}
                <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-800">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Resmi İfade Kaydı</span>
                  <span className="text-[10px] font-mono text-slate-700 hidden md:inline">SES KAYDI #1947-{currentSuspectIndex + 1}</span>
                </div>

                {/* Scrollable Statement Body */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto max-h-[350px] custom-scrollbar">
                  <TypingEffect key={currentSuspect.id} text={`"${currentSuspect.statement}"`} className="text-2xl md:text-3xl text-slate-200 italic font-light leading-relaxed" speed={25} />
                </div>

                {/* Fixed Action Bar at the bottom of the card */}
                <div className="mt-auto p-4 md:p-6 bg-black/40 border-t border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      disabled={currentSuspectIndex === 0}
                      onClick={handlePrevSuspect}
                      className={`flex-1 md:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${currentSuspectIndex === 0 ? 'opacity-30 cursor-not-allowed border-slate-800 text-slate-600' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                    >
                      Önceki
                    </button>
                    <button 
                      disabled={currentSuspectIndex === 3}
                      onClick={handleNextSuspect}
                      className={`flex-1 md:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${currentSuspectIndex === 3 ? 'opacity-30 cursor-not-allowed border-slate-800 text-slate-600' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                    >
                      Sonraki
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setGameState(GameState.INVESTIGATION)}
                    className="w-full md:w-auto px-8 py-3 bg-slate-200 text-black font-black uppercase text-[11px] tracking-widest hover:bg-amber-500 transition-colors"
                  >
                    Delilleri İncele
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVESTIGATION */}
        {gameState === GameState.INVESTIGATION && currentCase && (
          <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Evidence List */}
              <div className="space-y-4">
                <h3 className="text-amber-600 font-black uppercase text-xs tracking-widest mb-4 border-b border-slate-800 pb-2">Kanıt Arşivi</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {currentCase.evidence.map(e => (
                    <button 
                      key={e.id}
                      onClick={() => setActiveEvidence(e)}
                      className={`w-full p-5 text-left border transition-all flex flex-col gap-2 ${activeEvidence?.id === e.id ? 'bg-amber-950/20 border-amber-600' : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'}`}
                    >
                      <span className="text-[9px] bg-slate-800 px-2 py-0.5 w-fit rounded text-slate-400 font-bold tracking-widest uppercase">{e.type}</span>
                      <span className="text-sm font-black text-white uppercase leading-tight">{e.title}</span>
                    </button>
                  ))}
                </div>
                
                <div className="mt-8 p-6 bg-blue-950/10 border border-blue-900/30 border-l-4 border-l-blue-500">
                  <span className="text-blue-500 font-black text-[9px] uppercase tracking-widest block mb-2 underline">Müfettişin Notu</span>
                  <p className="court-font text-blue-200/70 italic text-sm leading-relaxed">"{currentCase.clue}"</p>
                </div>
              </div>

              {/* Document Reader */}
              <div className="md:col-span-2 bg-[#f4f1ea] text-slate-900 p-8 md:p-12 shadow-2xl min-h-[500px] relative">
                {activeEvidence ? (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="flex justify-between items-start border-b-2 border-slate-300 pb-4">
                      <div>
                        <h4 className="title-font text-2xl font-bold uppercase tracking-tighter leading-none">{activeEvidence.title}</h4>
                        <p className="text-[9px] font-black uppercase text-slate-500 mt-2">DOSYA DURUMU: GİZLİ</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-mono">ID: {activeEvidence.id.slice(0,8).toUpperCase()}</p>
                        <p className="text-[9px] font-mono">1947-VIII-14</p>
                      </div>
                    </div>
                    <div className="min-h-[300px] max-h-[400px] overflow-y-auto pr-4 font-serif">
                      <TypingEffect text={activeEvidence.content} className="text-lg leading-relaxed text-slate-800" speed={10} />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <svg className="w-12 h-12 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    <p className="uppercase text-[10px] font-black tracking-widest opacity-40 italic">Soldan bir dosya seçin</p>
                  </div>
                )}
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-red-800 font-bold border-2 border-red-800 m-8 -rotate-12 uppercase text-2xl">ARŞİV</div>
              </div>
            </div>

            {/* Evidence Bottom Bar */}
            <div className="flex justify-between items-center pt-8 border-t border-slate-900">
              <button onClick={() => setGameState(GameState.INTERROGATION)} className="text-slate-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Tanıklara Dön
              </button>
              <button onClick={() => setGameState(GameState.ACCUSATION)} className="px-12 py-5 bg-red-700 hover:bg-red-600 text-white font-black uppercase tracking-[0.2em] shadow-xl border-b-4 border-red-900">SUÇLAMAYI YAP</button>
            </div>
          </div>
        )}

        {/* ACCUSATION */}
        {gameState === GameState.ACCUSATION && currentCase && (
          <div className="w-full space-y-12 animate-in fade-in duration-700 text-center">
            <div className="space-y-4">
              <h2 className="title-font text-5xl md:text-8xl text-red-600 font-black uppercase tracking-tighter leading-none">HÜKMÜNÜ VER</h2>
              <p className="text-slate-400 italic">"Geri dönüşü olmayan noktadasın. Kim yalan söylüyor?"</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4">
              {currentCase.suspects.map(suspect => (
                <button 
                  key={suspect.id}
                  onClick={() => { setSelectedKillerId(suspect.id); setGameState(GameState.RESULT); }}
                  className="group relative bg-slate-900 border border-slate-800 hover:border-red-600 overflow-hidden shadow-2xl transition-all duration-500"
                >
                  <img src={suspect.avatar} alt={suspect.name} className="w-full h-48 md:h-72 object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full p-4 text-left transform group-hover:translate-y-[-5px] transition-transform">
                    <p className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight">{suspect.name}</p>
                    <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-1">{suspect.role}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setGameState(GameState.INVESTIGATION)} className="text-slate-500 hover:text-amber-500 text-[10px] font-black uppercase tracking-widest border-b border-transparent hover:border-amber-500 pb-1">Kanıtları Son Kez İncele</button>
          </div>
        )}

        {/* RESULT SCREEN */}
        {gameState === GameState.RESULT && currentCase && (
          <div className="w-full max-w-4xl bg-[#0a0a0a] p-8 md:p-16 border-2 border-slate-800 shadow-2xl text-center space-y-10 animate-in zoom-in duration-500 relative">
             <div className="absolute top-0 left-0 w-2 h-full bg-amber-600/20"></div>
            <div className="space-y-4">
              {isCorrect ? (
                <>
                  <div className="inline-block px-4 py-1 bg-green-950 text-green-500 border border-green-500/30 text-[9px] font-black uppercase tracking-[0.3em] mb-4">ADALET TESİS EDİLDİ</div>
                  <h2 className="title-font text-5xl md:text-7xl text-green-500 font-black tracking-tighter leading-none">DOĞRU KARAR</h2>
                  <p className="text-xl md:text-2xl text-slate-300 font-light italic">Belgelerdeki o ince detayı yakaladınız. Suçlu parmaklıklar ardında.</p>
                </>
              ) : (
                <>
                  <div className="inline-block px-4 py-1 bg-red-950 text-red-500 border border-red-500/30 text-[9px] font-black uppercase tracking-[0.3em] mb-4">TELAFİSİ İMKANSIZ HATA</div>
                  <h2 className="title-font text-5xl md:text-7xl text-red-600 font-black tracking-tighter leading-none">HATALI HÜKÜM</h2>
                  <p className="text-xl md:text-2xl text-slate-300 font-light italic">Masum bir hayatı mahvettiniz. Asıl suçlu karanlıkta gülerek kayboldu.</p>
                </>
              )}
            </div>
            <div className="p-6 md:p-10 bg-slate-900/40 border border-slate-800 text-left border-l-4 border-l-amber-600 relative overflow-hidden">
              <h3 className="text-amber-500 font-black uppercase text-[10px] tracking-widest mb-4">Soruşturma Analizi:</h3>
              <p className="court-font text-slate-300 text-lg md:text-xl leading-relaxed italic">{currentCase.solutionExplanation}</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-center pt-6">
              {isCorrect ? (
                <button onClick={() => { setCurrentLevel(prev => prev + 1); startNewLevel(currentLevel + 1); }} className="px-12 py-5 bg-green-700 hover:bg-green-600 text-white font-black uppercase tracking-widest transition-all">Sonraki Vaka (Seviye {currentLevel + 1})</button>
              ) : (
                <button onClick={() => startNewLevel(currentLevel)} className="px-12 py-5 bg-slate-200 text-black hover:bg-white font-black uppercase tracking-widest transition-all">Vakayı Tekrarla</button>
              )}
              <button onClick={() => setGameState(GameState.START)} className="px-12 py-5 border border-slate-800 hover:bg-slate-900 text-slate-500 font-black uppercase tracking-widest transition-all">Arşive Dön</button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-4 md:p-6 flex justify-between items-center opacity-40 pointer-events-none z-50 bg-gradient-to-t from-[#0a0a0c] to-transparent">
        <p className="text-[9px] uppercase tracking-[0.4em] font-black text-slate-600">GÖLGE MAHKEMESİ &copy; 1947 SORUŞTURMA BÜROSU</p>
        <div className="flex gap-4">
          <div className="w-12 h-[1px] bg-slate-800"></div>
        </div>
      </footer>

      {/* Custom Styles for Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d97706;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default App;
