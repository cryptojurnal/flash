import React, { useState } from 'react';
import { Cpu, Activity, ShieldCheck, HelpCircle } from 'lucide-react';
import { THEMES } from './utils/themes';
import { TerminalThemeConfig } from './types';
import CRTOverlay from './components/CRTOverlay';
import MatrixScreen from './components/MatrixScreen';
import TerminalScreen from './components/TerminalScreen';

export default function App() {
  const [theme, setTheme] = useState<TerminalThemeConfig>(THEMES.elegant);
  const [isMatrixOn, setIsMatrixOn] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(false); // Default CRT filter off for elegant look, users can toggle on side
  const [activeChain, setActiveChain] = useState<'ethereum' | 'arbitrum' | 'base' | 'polygon'>('ethereum');

  const mockCPU = '6.4% load';
  const mockMem = '23 ms latency';

  return (
    <div className="min-h-screen bg-[#090b0d] flex flex-col justify-center items-center p-3 sm:p-6 md:p-8 select-none selection:bg-[#7ee787]/20 antialiased overflow-y-auto">
      {/* Dynamic ambient radial soft color glow behind window cabinet */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0d1117_0%,_transparent_75%)] pointer-events-none" />

      {/* Screen Saver Mode Canvas Overlay */}
      {isMatrixOn && (
        <MatrixScreen 
          onClose={() => setIsMatrixOn(false)} 
          textColor={theme.id === 'elegant' ? '#7ee787' : theme.id === 'amber' ? '#f59e0b' : '#34d399'}
          bgColor={theme.bgColor === 'bg-[#faf6ef]' ? '#faf6ef' : '#09090b'}
        />
      )}

      {/* Main Terminal Cabinet Wrapper Frame */}
      <div className={`w-full max-w-6xl rounded-xl border ${
        theme.id === 'elegant' ? 'border-[#30363d]' : 'border-zinc-800'
      } ${
        theme.id === 'elegant' ? 'bg-[#0d1117]' : theme.bgColor
      } shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden relative backdrop-blur-md z-10`}
      style={{ minHeight: '620px' }}>
        
        {/* CRT glass scanning overlay layer */}
        {crtEnabled && <CRTOverlay />}

        {/* Window System Header Chrome */}
        <header className={`px-4 py-3 ${
          theme.id === 'elegant' ? 'bg-[#161b22] border-b border-[#30363d]' : 'bg-gradient-to-r from-zinc-950 to-zinc-900 border-b border-zinc-800'
        } flex items-center justify-between select-none shrink-0 z-20`}>
          
          <div className="flex items-center gap-3">
            {/* macOS styled window controls */}
            <div className="flex gap-2">
              <span 
                className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block cursor-pointer opacity-90 hover:opacity-100 transition" 
                onClick={() => alert("Exiting node session. Enter 'help' inside terminal for guidelines.")} 
                title="Disconnect virtual network"
              />
              <span 
                className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block cursor-pointer opacity-90 hover:opacity-100 transition" 
                onClick={() => alert("Terminal viewport minimized. Hover in sidebar or click files to interact.")} 
                title="Minimize screen"
              />
              <span 
                className="w-3 h-3 rounded-full bg-[#27c93f] inline-block cursor-pointer opacity-90 hover:opacity-100 transition" 
                onClick={() => setIsMatrixOn(true)} 
                title="Activate matrix terminal code rain screensaver"
              />
            </div>

            {/* Simulated Active Shell Indicator */}
            <div className={`px-2.5 py-0.5 rounded text-[10px] font-mono leading-none ${
              theme.id === 'elegant' ? 'bg-[#21262d] border border-[#30363d] text-[#c9d1d9]' : 'bg-zinc-800/80 text-zinc-300'
            } flex items-center`}
            style={{ fontWeight: 600 }}>
              <span className="opacity-40 mr-1.5 font-bold">bash</span>
              <span>arb-scanner-v2</span>
            </div>

            <span className="text-zinc-500 font-mono text-[10px] hidden md:inline-block tracking-wider font-semibold uppercase">
              {activeChain === 'ethereum' ? 'eth-mainnet-rpc' : activeChain === 'arbitrum' ? 'arbitrum-one-rpc' : activeChain === 'base' ? 'base-mainnet-rpc' : 'polygon-pos-rpc'}
            </span>
          </div>

          {/* Modern Network Segmented Controller (Centered in the layout) */}
          <div className="hidden lg:flex items-center gap-1.5 bg-black/40 border border-zinc-900/60 rounded-lg p-0.5 font-mono text-[9px] font-bold select-none mx-2">
            {(['ethereum', 'arbitrum', 'base', 'polygon'] as const).map((chain) => {
              const isSelected = activeChain === chain;
              let label = '';
              let dotColor = '';
              let activeBgClass = '';
              
              if (chain === 'ethereum') {
                label = 'ethereum (l1)';
                dotColor = 'bg-amber-400';
                activeBgClass = theme.id === 'elegant' 
                  ? 'bg-amber-500/10 text-amber-400 border-[#30363d]' 
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30';
              } else if (chain === 'arbitrum') {
                label = 'arbitrum (l2)';
                dotColor = 'bg-cyan-400';
                activeBgClass = theme.id === 'elegant' 
                  ? 'bg-cyan-500/10 text-cyan-400 border-[#30363d]' 
                  : 'bg-cyan-400/10 text-cyan-400 border-cyan-400/25';
              } else if (chain === 'base') {
                label = 'base (l2)';
                dotColor = 'bg-blue-500/80';
                activeBgClass = theme.id === 'elegant' 
                  ? 'bg-blue-500/10 text-blue-400 border-[#30363d]' 
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/25';
              } else if (chain === 'polygon') {
                label = 'polygon (pos)';
                dotColor = 'bg-purple-400';
                activeBgClass = theme.id === 'elegant' 
                  ? 'bg-purple-500/10 text-purple-400 border-[#30363d]' 
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/25';
              }

              return (
                <button
                  key={chain}
                  onClick={() => setActiveChain(chain)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer border transition-all text-nowrap select-none outline-none ${
                    isSelected 
                      ? `${activeBgClass} font-black shadow-sm`
                      : 'border-transparent text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isSelected ? 'animate-pulse' : 'opacity-30'}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Diagnostic telemetry dashboard block */}
          <div className="flex items-center gap-4 text-[10px] sm:text-xs font-mono text-zinc-500 select-none">
            <span className="hidden md:flex items-center gap-1">
              <Cpu className={`w-3.5 h-3.5 ${theme.id === 'elegant' ? 'text-[#58a6ff]' : 'text-cyan-400'}`} />
              <span>{mockCPU}</span>
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>{mockMem}</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider ${
              theme.id === 'elegant' 
                ? 'bg-emerald-500/10 text-[#7ee787] border border-[#7ee787]/20' 
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              SYSTEM: SECURE
            </span>
          </div>
        </header>

        {/* Primary Interactive Terminal Window Layout segment */}
        <TerminalScreen 
          theme={theme}
          setTheme={setTheme}
          crtEnabled={crtEnabled}
          setCrtEnabled={setCrtEnabled}
          setIsMatrixOn={setIsMatrixOn}
          activeChain={activeChain}
          setActiveChain={setActiveChain}
        />

        {/* Humble and human-friendly bottom edge context bar */}
        <footer className={`px-4 py-2 text-[10px] font-mono ${
          theme.id === 'elegant' ? 'bg-[#161b22] border-t border-[#30363d] text-[#8b949e]' : 'bg-zinc-950/80 border-t border-zinc-900 text-zinc-500'
        } flex justify-between shrink-0 select-none z-20`}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>SSL SECURE PORT</span>
            </span>
            <span className="hidden sm:inline-block">/dev/tty01</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-white transition" onClick={() => alert("Double-click any txt or json file in the explorer sidebar to open the visual editor, or use command 'help' for instructions.")}>
            <HelpCircle className="w-3 h-3" />
            <span>Interactive Guide</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
