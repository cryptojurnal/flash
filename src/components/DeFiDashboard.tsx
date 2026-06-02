import React from 'react';
import { TrendingUp, Cpu, Shield, Zap, ExternalLink, Activity, ArrowRight, CornerDownRight } from 'lucide-react';
import { TerminalThemeConfig, ArbitrageOpportunity, CryptoToken, SwapLog } from '../types';

interface DeFiDashboardProps {
  theme: TerminalThemeConfig;
  activeChain: 'ethereum' | 'arbitrum' | 'base' | 'polygon';
  tokens: CryptoToken[];
  opportunities: ArbitrageOpportunity[];
  recentSwaps: SwapLog[];
  totEarningsUsd: number;
  earningsHistory: number[];
  gasPriceGwei: number;
  mevShieldEnabled: boolean;
  walletConnected: boolean;
  walletAddress: string;
  executeCommand: (cmd: string) => void;
  slippage: number;
  tradeSize: number;
  gasLimit: number;
  executionMode?: 'FLASHLOAN' | 'STANDARD' | 'MEV_BACKRUN';
  setExecutionMode?: (mode: 'FLASHLOAN' | 'STANDARD' | 'MEV_BACKRUN') => void;
}

export default function DeFiDashboard({
  theme,
  activeChain,
  tokens,
  opportunities,
  recentSwaps,
  totEarningsUsd,
  earningsHistory,
  gasPriceGwei,
  mevShieldEnabled,
  walletConnected,
  walletAddress,
  executeCommand,
  slippage,
  tradeSize,
  gasLimit,
  executionMode = 'FLASHLOAN',
  setExecutionMode,
}: DeFiDashboardProps) {

  // Synchronized countdown tickers for local visual rendering
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Generate smooth glowing coordinates for custom lightweight SVG chart
  const drawChartPath = (width: number, height: number, fill: boolean) => {
    if (earningsHistory.length <= 1) return '';
    const maxVal = Math.max(...earningsHistory, 100);
    const minVal = Math.min(...earningsHistory, 0);
    const range = maxVal - minVal;

    const points = earningsHistory.map((val, i) => {
      const x = (i / (earningsHistory.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height * 0.7) - 10;
      return { x, y };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

    if (fill) {
      return `${pathData} L ${width} ${height} L 0 ${height} Z`;
    }
    return pathData;
  };

  const currentChainName = () => {
    switch (activeChain) {
      case 'arbitrum': return 'Arbitrum Nitro (L2)';
      case 'base': return 'Coinbase Base L2 (OP)';
      case 'polygon': return 'Polygon PoS EVM';
      case 'ethereum':
      default:
        return 'Ethereum L1 Mainnet';
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3 md:p-4 overflow-y-auto terminal-scrollbar space-y-4 select-text bg-[#030507]">
      
      {/* Real-time Telemetry Hud */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        
        {/* Node Status */}
        <div className="p-3 bg-zinc-950/70 border border-zinc-900 rounded-lg flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Autopilot Node</span>
            <span className="text-xs font-mono font-black text-zinc-200 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              NODE-3 // NY
            </span>
          </div>
          <Cpu className="w-5 h-5 text-emerald-500/40" />
        </div>

        {/* RPC Latency */}
        <div className="p-3 bg-zinc-950/70 border border-zinc-900 rounded-lg flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-transparent pointer-events-none" />
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">RPC Latency</span>
            <span className="text-xs font-mono font-black text-sky-400">
              12ms <span className="text-[9px] text-zinc-500 font-normal">({activeChain.substring(0, 3).toUpperCase()})</span>
            </span>
          </div>
          <Activity className="w-5 h-5 text-sky-500/40" />
        </div>

        {/* Live Block / Gas */}
        <div className="p-3 bg-zinc-950/70 border border-zinc-900 rounded-lg flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Gas / Block Fee</span>
            <span className="text-xs font-mono font-black text-amber-500 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              {gasPriceGwei} Gwei
            </span>
          </div>
          <span className="text-[8px] font-mono text-zinc-600 font-bold">#6420</span>
        </div>

        {/* Private RPC Relay Path */}
        <div className="p-3 bg-zinc-950/70 border border-zinc-900 rounded-lg flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none" />
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Mev Shield</span>
            <span className={`text-xs font-mono font-black uppercase ${mevShieldEnabled ? 'text-[#7ee787]' : 'text-rose-500'}`}>
              {mevShieldEnabled ? '🛡️ Flashbots Secure' : '⚠️ Open Mempool'}
            </span>
          </div>
          <Shield className={`w-5 h-5 ${mevShieldEnabled ? 'text-emerald-500/40' : 'text-rose-500/30'}`} />
        </div>
      </div>

      {/* Execution Modality State Controller */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3 md:p-4 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="space-y-1 relative">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider block">ROUTE ARBITRAGE MODE ROUTER</span>
          </div>
          <span className="text-xs font-mono font-black text-zinc-100 block">
            {executionMode === 'FLASHLOAN' && '⚡ Flash Loan Simple Scenario (Aave V3 Uncollateralized Limit)'}
            {executionMode === 'STANDARD' && '👜 Standard Hot-Wallet Scenario (Direct On-Chain RPC Handshake)'}
            {executionMode === 'MEV_BACKRUN' && '🛡️ MEV Private Backrun Scenario (Atomic Flashbots Blocks Relayer)'}
          </span>
          <p className="text-[9px] text-zinc-400 max-w-xl font-mono leading-relaxed select-none">
            {executionMode === 'FLASHLOAN' && 'TAP UNCOLLATERALIZED BLOCK LOANS: Borrow millions in pool liquidity instantly, execute atomic pricing hops on decentralized venues, and reimburse the lender. 0 collateral operational.'}
            {executionMode === 'STANDARD' && 'REALSPOT CONVENIENCE WALLET: Executes on-chain transactions directly using your loaded signer key balance. Reverts if gas fee eth is insufficient.'}
            {executionMode === 'MEV_BACKRUN' && 'FRONT-RUN PROTECTION: Bundles frontrun logs and schedules multi-hop swaps privately through direct Flashbots blocks. Fully sandwich proof.'}
          </p>
        </div>
        <div className="flex bg-zinc-950 p-1 border border-zinc-900 rounded-lg gap-1 md:shrink-0 max-w-md w-full md:w-auto">
          {(['FLASHLOAN', 'STANDARD', 'MEV_BACKRUN'] as const).map((mode) => {
            const isSelected = executionMode === mode;
            return (
              <button
                key={mode}
                onClick={() => {
                  if (setExecutionMode) setExecutionMode(mode);
                }}
                className={`flex-1 md:flex-initial text-[9px] font-bold font-mono tracking-tighter px-3 py-2 rounded transition cursor-pointer text-center outline-none ${
                  isSelected
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/35 shadow-sm shadow-amber-500/5'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border border-transparent'
                }`}
              >
                {mode === 'FLASHLOAN' ? '⚡ FLASH LOAN' : mode === 'STANDARD' ? '👜 STANDARD HOT' : '🛡️ MEV BUNDLE'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Side: Real-Time Arbitrage Scanner Monitor */}
        <div className="lg:col-span-7 bg-[#0b0e11] border border-zinc-900 rounded-xl p-3.5 shadow-md flex flex-col space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-xs font-mono uppercase tracking-widest font-black text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Live Arbitrage Monitor
              </h3>
              <p className="text-[9px] text-zinc-500 font-mono">
                Cross-DEX pricing gap indices compiled synchronously
              </p>
            </div>
            <span className="text-[9px] font-mono font-extrabold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded uppercase select-none animate-pulse">
              Active scan
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {opportunities.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-zinc-900 rounded-lg">
                <div className="relative">
                  <Activity className="w-7 h-7 text-zinc-700 animate-spin" />
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Scanning DEX pools. Listening to active smart Oracles...
                </p>
              </div>
            ) : (
              <table className="w-full text-left font-mono text-[10px] select-all border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 text-[9px] pb-1.5">
                    <th className="py-2.5 font-bold uppercase">Asset</th>
                    <th className="py-2.5 font-bold uppercase">Buy Venue</th>
                    <th className="py-2.5 font-bold uppercase">Sell Venue</th>
                    <th className="py-2.5 font-bold uppercase text-right">Spread (%)</th>
                    <th className="py-2.5 font-bold uppercase text-right">Net Profit</th>
                    <th className="py-2.5 font-bold uppercase text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-950/20">
                  {opportunities.map((opp, idx) => {
                    const isHigh = opp.spreadPercentage >= 0.8;
                    const oppStatus = opp.status || 'ACTIVE';
                    const isActive = oppStatus === 'ACTIVE';
                    
                    // Expiry timer computations
                    const timeLeftMs = opp.expiresAt ? opp.expiresAt - now : 0;
                    const timeLeftSecs = Math.max(0, Math.ceil(timeLeftMs / 1000));
                    const percentRemaining = opp.durationMax 
                      ? Math.min(100, Math.max(0, (timeLeftMs / (opp.durationMax * 1000)) * 100)) 
                      : 100;

                    return (
                      <tr 
                        key={opp.id || idx} 
                        className={`group hover:bg-zinc-950/50 transition-all duration-300 border-l-2 ${
                          isActive 
                            ? 'border-l-transparent' 
                            : oppStatus === 'SOLD_OUT' 
                              ? 'border-l-rose-500/40 bg-rose-950/5 opacity-50 select-none' 
                              : 'border-l-zinc-500/20 bg-zinc-950/10 opacity-30 select-none'
                        }`}
                      >
                        <td className="py-2.5 font-black text-zinc-200">
                          <div className="flex flex-col">
                            <span>{opp.tokenSymbol}</span>
                            {isActive ? (
                              <div className="w-16 bg-zinc-900 border border-zinc-800 h-1.5 rounded-full overflow-hidden mt-1 relative">
                                <div 
                                  className={`h-full transition-all duration-300 ${
                                    percentRemaining > 50 
                                      ? 'bg-emerald-400' 
                                      : percentRemaining > 20 
                                        ? 'bg-amber-400' 
                                        : 'bg-rose-500 animate-pulse'
                                  }`}
                                  style={{ width: `${percentRemaining}%` }}
                                />
                              </div>
                            ) : (
                              <span className="text-[7.5px] font-mono text-zinc-500 leading-none mt-0.5 uppercase">
                                {oppStatus === 'SOLD_OUT' ? 'SOLD OUT' : 'LAPSED'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`py-2.5 text-zinc-400 text-nowrap ${!isActive && 'line-through text-zinc-600'}`}>
                          {opp.buyFromDex} <span className="text-zinc-600 text-[9px] block">${opp.buyPrice.toFixed(2)}</span>
                        </td>
                        <td className={`py-2.5 text-zinc-400 text-nowrap ${!isActive && 'line-through text-zinc-600'}`}>
                          {opp.sellToDex} <span className="text-zinc-600 text-[9px] block">${opp.sellPrice.toFixed(2)}</span>
                        </td>
                        <td className={`py-2.5 text-right font-bold font-mono text-nowrap ${
                          !isActive 
                            ? 'text-zinc-650 line-through' 
                            : isHigh 
                              ? 'text-emerald-400' 
                              : 'text-teal-400'
                        }`}>
                          +{opp.spreadPercentage}%
                        </td>
                        <td className={`py-2.5 text-right font-extrabold text-nowrap ${
                          !isActive ? 'text-zinc-600 line-through' : 'text-[#7ce382]'
                        }`}>
                          +${opp.expectedProfitUsd.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right pl-2">
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => executeCommand(`execute-arb ${opp.id}`)}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] px-2 py-1 rounded font-bold font-mono tracking-tighter cursor-pointer transition uppercase text-nowrap scale-95 group-hover:scale-100 duration-150 inline-flex items-center gap-1 active:bg-emerald-500/30 shadow-sm shadow-emerald-500/5 relative overflow-hidden"
                            >
                              <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                              Arb ({timeLeftSecs}s)
                            </button>
                          ) : oppStatus === 'SOLD_OUT' ? (
                            <span className="text-[7.5px] font-mono font-bold text-rose-400 bg-rose-950/20 border border-rose-900/40 px-1.5 py-0.5 rounded text-nowrap inline-block max-w-[90px] overflow-hidden text-ellipsis uppercase" title={`Captured by rival MEV searcher: ${opp.filledBy}`}>
                              MEV Bots
                            </span>
                          ) : (
                            <span className="text-[7.5px] font-mono font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-nowrap inline-block uppercase">
                              Lapsed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="text-[8.5px] text-zinc-600 font-mono py-1 border-t border-zinc-950 flex justify-between">
            <span>Scan range: 44 Pools</span>
            <span>Target Principal: ${tradeSize} USD</span>
          </div>
        </div>

        {/* Right Side: MEV Mempool Scanner & Earnings Trend */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Real-time Earnings Area Chart */}
          <div className="bg-[#0b0e11] border border-zinc-900 rounded-xl p-3.5 shadow-md flex flex-col space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-baseline">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 block">Autonomous Performance Ledger</span>
                <span id="gui-balance-val" className="text-xl font-mono font-black text-cyan-400">
                  ${totEarningsUsd.toLocaleString(undefined, {minimumFractionDigits: 2})} <span className="text-[10px] text-zinc-500">USDC</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-[#7ee787] font-bold block">+640% Yield</span>
                <span className="text-[8px] text-zinc-650 font-mono">Streak: Active</span>
              </div>
            </div>

            {/* Glowing Custom Area Graph */}
            <div className="relative h-[110px] bg-zinc-950/40 rounded-lg border border-zinc-900/40 overflow-hidden flex items-end">
              <svg className="w-full h-full absolute inset-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* SVG Area Fills */}
                <path
                  d={drawChartPath(360, 110, true)}
                  fill="url(#chartGlow)"
                  className="transition-all duration-1000"
                />
                {/* SVG Glowing Stroke */}
                <path
                  d={drawChartPath(360, 110, false)}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  className="transition-all duration-1000"
                  filter="drop-shadow(0px 2px 4px rgba(6, 182, 212, 0.5))"
                />
              </svg>
              <div className="absolute inset-x-2 bottom-1 flex justify-between text-[8px] font-mono text-zinc-600">
                <span>Start</span>
                <span>Active Ledger Balance Delta</span>
                <span>Sync Tick</span>
              </div>
            </div>
          </div>

          {/* MEV Mempool Scanner Live Stream Queue */}
          <div className="bg-[#0b0e11] border border-zinc-900 rounded-xl p-3.5 shadow-md flex flex-col space-y-2.5 relative overflow-hidden flex-1 min-h-[180px]">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-xs font-mono uppercase tracking-widest font-black text-amber-500 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-550" />
                  Mempool Scanner Queue
                </h3>
                <p className="text-[9px] text-zinc-500 font-mono">
                  Pending mempool transactions before block finalization
                </p>
              </div>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </div>

            <div className="flex-1 overflow-y-auto max-h-[140px] terminal-scrollbar pr-0.5 space-y-1.5 font-mono text-[9px]">
              {recentSwaps.slice(0, 10).map((swap, idx) => {
                const chainTag = swap.chain || activeChain;
                const isArbResult = swap.type === 'ARBITRAGE';
                return (
                  <div key={swap.id || idx} className="p-1 px-1.5 bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-900/50 rounded flex items-center justify-between transition-colors gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`text-[8px] px-1 rounded scale-90 font-mono font-bold select-none ${
                        chainTag === 'ethereum'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : chainTag === 'arbitrum'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : chainTag === 'base'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {chainTag.substring(0, 3).toUpperCase()}
                      </span>
                      <span className="text-zinc-650 text-[8px]">{swap.timestamp}</span>
                      <span className="text-zinc-400 truncate max-w-[60px] font-bold">{swap.dex}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isArbResult ? (
                        <span className="text-emerald-400 font-bold">
                          Arb Deposit: +${swap.profitUsd} USDC
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[8.5px] truncate max-w-[90px]">
                          {swap.inputAmount} {swap.inputToken} ➔ {swap.outputToken}
                        </span>
                      )}
                      
                      {!isArbResult && (
                        <button
                          type="button"
                          onClick={() => executeCommand(`swap ${swap.dex} ${swap.inputToken} ${swap.outputToken} ${parseFloat(swap.inputAmount) || 1}`)}
                          className="text-[8px] font-bold font-mono px-1 rounded bg-zinc-900 hover:bg-amber-500/10 hover:text-amber-400 border border-zinc-800 hover:border-amber-500/30 text-zinc-505 cursor-pointer py-0.5 select-none transition ml-1 shrink-0"
                          title="Sandwich attack mock swap simulation"
                        >
                          Frontrun
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-[8px] text-zinc-600 flex justify-between pt-1 border-t border-zinc-950 font-mono">
              <span>Sequencer: L2 sequencenet_03</span>
              <span>Protector active: {mevShieldEnabled ? 'TRUE' : 'FALSE'}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
