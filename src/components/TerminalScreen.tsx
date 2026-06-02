import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Layers, 
  Eye, 
  EyeOff, 
  Terminal as TermIcon, 
  Search, 
  Folder, 
  FileText, 
  Play, 
  TrendingUp, 
  Coins, 
  RefreshCw, 
  Bell, 
  Check, 
  Lock, 
  Zap,
  Cpu,
  Activity,
  CornerDownRight
} from 'lucide-react';
import { 
  TerminalThemeConfig, 
  FileSystemItem, 
  DirectoryItem, 
  FileItem, 
  TerminalLine, 
  CryptoToken, 
  ArbitrageOpportunity, 
  SwapLog 
} from '../types';
import { THEMES } from '../utils/themes';
import { INITIAL_FILESYSTEM, writeFileByPath } from '../utils/fileSystem';
import NanoEditor from './NanoEditor';
import DeFiDashboard from './DeFiDashboard';

interface TerminalScreenProps {
  theme: TerminalThemeConfig;
  setTheme: (t: TerminalThemeConfig) => void;
  crtEnabled: boolean;
  setCrtEnabled: (b: boolean) => void;
  setIsMatrixOn: (b: boolean) => void;
  activeChain: 'ethereum' | 'arbitrum' | 'base' | 'polygon';
  setActiveChain: (c: 'ethereum' | 'arbitrum' | 'base' | 'polygon') => void;
}

// Initial Simulated Token Prices & Exchange Rates
const INITIAL_TOKENS: CryptoToken[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    price: 146.50,
    change24h: 3.42,
    volume24h: 1827000000,
    liquidity: 420000000,
    dexRates: { Uniswap: 146.85, Raydium: 145.90, Orca: 146.50, PancakeSwap: 146.75 }
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3420.00,
    change24h: -1.25,
    volume24h: 12450000000,
    liquidity: 2100000000,
    dexRates: { Uniswap: 3422.50, SushiSwap: 3415.80, PancakeSwap: 3420.00, QuickSwap: 3418.00 }
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin (Wrapped)',
    price: 68420.00,
    change24h: 0.85,
    volume24h: 22800000000,
    liquidity: 5200000000,
    dexRates: { Uniswap: 68450.00, SushiSwap: 68390.00, PancakeSwap: 68420.00, Orca: 68410.00 }
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    price: 15.65,
    change24h: 8.92,
    volume24h: 480000000,
    liquidity: 95000000,
    dexRates: { Uniswap: 15.85, SushiSwap: 15.55, PancakeSwap: 15.60, Raydium: 15.65 }
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    price: 1.00,
    change24h: 0.00,
    volume24h: 5400000000,
    liquidity: 10000000000,
    dexRates: { Uniswap: 1.0001, SushiSwap: 0.9998, Orca: 1.0000, Raydium: 0.9995 }
  }
];

export default function TerminalScreen({ 
  theme, 
  setTheme, 
  crtEnabled, 
  setCrtEnabled, 
  setIsMatrixOn,
  activeChain,
  setActiveChain
}: TerminalScreenProps) {
  
  // State management
  const [fs, setFs] = useState<DirectoryItem>(INITIAL_FILESYSTEM);
  const [currentPath, setCurrentPath] = useState<string[]>(['~']);
  const [inputVal, setInputVal] = useState('');
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Active Text Editor state
  const [activeEditor, setActiveEditor] = useState<{
    fileName: string;
    path: string[];
    content: string;
  } | null>(null);

  // DEX & Arbitrage Simulated State Engines
  const [tokens, setTokens] = useState<CryptoToken[]>(INITIAL_TOKENS);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [recentSwaps, setRecentSwaps] = useState<SwapLog[]>([]);
  const [gasPriceGwei, setGasPriceGwei] = useState(25);
  const [totEarningsUsd, setTotEarningsUsd] = useState(0);
  const [earningsHistory, setEarningsHistory] = useState<number[]>([0, 65, 120, 195, 310, 480, 810, 1150, 1540, 1935]);
  const [slippage, setSlippage] = useState<number>(0.5);
  const [tradeSize, setTradeSize] = useState<number>(5000);
  const [gasLimit, setGasLimit] = useState<number>(35);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'console' | 'vps' | 'files'>('dashboard');

  useEffect(() => {
    setEarningsHistory(prev => {
      const last = prev[prev.length - 1];
      if (last !== totEarningsUsd) {
        return [...prev, totEarningsUsd].slice(-15);
      }
      return prev;
    });
  }, [totEarningsUsd]);
  const [activeTrackingToken, setActiveTrackingToken] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mevShieldEnabled, setMevShieldEnabled] = useState(true);
  const [executionMode, setExecutionMode] = useState<'FLASHLOAN' | 'STANDARD' | 'MEV_BACKRUN'>('FLASHLOAN');

  // Simulated Web3 Wallet Configuration States
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('0x4F8b47CC76B9B627346A2eEefb2568600d83Cc76');
  const [walletPrivateKey, setWalletPrivateKey] = useState<string>('0x8fae85971ee6a85f81ae6198f8b030e4cbfa2a9121beedcdfa8e434771e8bfb5');
  const [walletGasBuffer, setWalletGasBuffer] = useState<number>(0.5);
  const [realBalance, setRealBalance] = useState<number | null>(null);

  // VPS Autopilot Dashboard Simulated States
  const [vpsPanelOpen, setVpsPanelOpen] = useState<boolean>(false);
  const [vpsAutopilotOn, setVpsAutopilotOn] = useState<boolean>(false);
  const [vpsLogs, setVpsLogs] = useState<string[]>([]);
  const [vpsStats, setVpsStats] = useState({ cpu: 12, ram: 410, uptime: '00:00:00' });
  const [vpsSetupComplete, setVpsSetupComplete] = useState<boolean>(false);
  const [vpsProvisioning, setVpsProvisioning] = useState<boolean>(false);

  // Sync state helper to write back wallet configs to filesystem
  const updateWalletInConfigFile = (connected: boolean, address: string, privateKey: string, gasBuffer: number) => {
    setFs(prevFs => {
      const freshFs = { ...prevFs };
      const configFile = freshFs.children['config.json'];
      if (configFile && configFile.type === 'file') {
        try {
          const obj = JSON.parse(configFile.content);
          obj.wallet = {
            address,
            privateKey,
            connected,
            gasBufferAllocationEth: gasBuffer
          };
          configFile.content = JSON.stringify(obj, null, 2);
        } catch (e) {
          // Ignore
        }
      }
      return freshFs;
    });
  };

  // Sync state helper to write back MEV protection configs to filesystem
  const updateMevInConfigFile = (enabled: boolean) => {
    setFs(prevFs => {
      const freshFs = { ...prevFs };
      const configFile = freshFs.children['config.json'];
      if (configFile && configFile.type === 'file') {
        try {
          const obj = JSON.parse(configFile.content);
          obj.mevShieldEnabled = enabled;
          configFile.content = JSON.stringify(obj, null, 2);
        } catch (e) {
          configFile.content = `{
  "alertThresholdPercentage": 0.5,
  "defaultTradingAmountUsd": 5000,
  "gasThresholdGwei": 35,
  "slippageTolerance": 0.01,
  "autoArbEnabled": false,
  "mevShieldEnabled": ${enabled},
  "monitoredChains": [
    "Ethereum",
    "Solana",
    "BSC",
    "Arbitrum"
  ]
}`;
        }
      }
      return freshFs;
    });
  };

  const connectMetaMask = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts[0]) {
          const address = accounts[0];
          setWalletConnected(true);
          setWalletAddress(address);
          updateWalletInConfigFile(true, address, walletPrivateKey, walletGasBuffer);
          setTerminalLines(prev => [
            ...prev,
            { id: `meta-conn-s1-${Date.now()}`, type: 'success', text: `✔ MetaMask connection successful!` },
            { id: `meta-conn-s2-${Date.now()}`, type: 'output', text: `Connected Account Address: ${address}` },
            { id: `meta-conn-s3-${Date.now()}`, type: 'system', text: `Active pipeline synced with MetaMask provider.` }
          ]);
          return address;
        } else {
          throw new Error('No accounts returned from MetaMask.');
        }
      } catch (err: any) {
        setTerminalLines(prev => [
          ...prev,
          { id: `meta-conn-e-${Date.now()}`, type: 'error', text: `Failed to connect to MetaMask: ${err.message || err}` }
        ]);
        throw err;
      }
    } else {
      const simulatedAddress = '0x4F8b47CC76B9B627346A2eEefb2568600d83Cc76';
      setWalletConnected(true);
      setWalletAddress(simulatedAddress);
      updateWalletInConfigFile(true, simulatedAddress, walletPrivateKey, walletGasBuffer);
      setTerminalLines(prev => [
        ...prev,
        { id: `meta-sim-ns-${Date.now()}`, type: 'system', text: `⚠️ No MetaMask extension detected. Connected simulated secure wallet: ${simulatedAddress}` }
      ]);
      return simulatedAddress;
    }
  };

  // References
  const lineEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const getDexesForChain = (chain: 'ethereum' | 'arbitrum' | 'base' | 'polygon'): string[] => {
    switch (chain) {
      case 'arbitrum':
        return ['Uniswap', 'Camelot', 'SushiSwap', 'Balancer'];
      case 'base':
        return ['Aerodrome', 'Uniswap', 'Baseswap', 'SushiSwap'];
      case 'polygon':
        return ['QuickSwap', 'Retro', 'Uniswap', 'SushiSwap'];
      case 'ethereum':
      default:
        return ['Uniswap', 'SushiSwap', 'PancakeSwap', 'Balancer'];
    }
  };

  // Helper to fetch real market price indices from Express proxy API
  const fetchRealPrices = async () => {
    try {
      const res = await fetch(`/api/prices?chain=${activeChain}`);
      if (res.ok) {
        const data = await res.json();
        setTokens(prev => prev.map(tok => {
          const fetchedInfo = data[tok.symbol];
          if (fetchedInfo && fetchedInfo.USD) {
            const basePrice = fetchedInfo.USD;
            const dexes = getDexesForChain(activeChain);
            const verifiedDexRates: Record<string, number> = {};
            dexes.forEach(dex => {
              if (fetchedInfo.dexRates && typeof fetchedInfo.dexRates[dex] === 'number') {
                verifiedDexRates[dex] = fetchedInfo.dexRates[dex];
              } else {
                // If a specific DEX pool is not active in GeckoTerminal result, introduce minor natural drift
                const spreadFactor = 1 + (Math.random() - 0.5) * 0.003;
                verifiedDexRates[dex] = Number((basePrice * spreadFactor).toFixed(4));
              }
            });
            return {
              ...tok,
              price: basePrice,
              dexRates: verifiedDexRates
            };
          } else {
            const basePrice = tok.price;
            const dexes = getDexesForChain(activeChain);
            const verifiedDexRates: Record<string, number> = {};
            dexes.forEach(dex => {
              const spreadFactor = 1 + (Math.random() - 0.5) * 0.012;
              verifiedDexRates[dex] = Number((basePrice * spreadFactor).toFixed(4));
            });
            return {
              ...tok,
              dexRates: verifiedDexRates
            };
          }
        }));
      }
    } catch (err) {
      console.error("Error updating prices from real live API feed:", err);
    }
  };

  // Helper to fetch real on-chain transaction trades from Express proxy API
  const fetchRealMempool = async () => {
    try {
      const res = await fetch(`/api/mempool?chain=${activeChain}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRecentSwaps(prev => {
            const existingIds = new Set(prev.map(s => s.id));
            const newSwaps = data.filter(s => s && s.id && !existingIds.has(s.id));
            
            if (activeTrackingToken) {
              const targetToken = activeTrackingToken.toUpperCase();
              newSwaps.forEach(swap => {
                if (swap.inputToken === targetToken || swap.outputToken === targetToken) {
                  setTerminalLines(prevLines => [
                    ...prevLines,
                    {
                      id: `tr-real-${swap.id}`,
                      type: 'system',
                      text: `[REAL-FEED] ${swap.timestamp} | ${swap.dex} | Swap detected: ${swap.inputAmount} ${swap.inputToken} ➜ ${swap.outputAmount} ${swap.outputToken} ($${swap.volumeInUsd} USD)`
                    }
                  ].slice(-100));
                }
              });
            }

            return [...newSwaps, ...prev].slice(0, 40);
          });
        }
      }
    } catch (err) {
      console.error("Error updating mempool transactions from real live API feed:", err);
    }
  };

  // Helper to fetch real on-chain operational wallet balances from Express proxy API
  const fetchRealBalance = async () => {
    try {
      const res = await fetch(`/api/balance?address=${walletAddress}&chain=${activeChain}`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.eth === 'number') {
          setRealBalance(data.eth);
        }
      }
    } catch (err) {
      console.error("Error fetching real-time on-chain balance via API:", err);
    }
  };

  // Automatically refresh balance when walletAddress or activeChain changes
  useEffect(() => {
    fetchRealBalance();
    const interval = setInterval(fetchRealBalance, 8000);
    return () => clearInterval(interval);
  }, [walletAddress, activeChain]);

  // Initial greeting and initial price load
  useEffect(() => {
    setTerminalLines([
      { id: 'g0', type: 'ascii', text: ' ______  _______ _     _ _______ _______  ______' },
      { id: 'g1', type: 'ascii', text: ' |     \\ |______  \\___/  |______ |______ |_____/' },
      { id: 'g2', type: 'ascii', text: ' |_____/ |______ _/   \\_ |______ |______ |    \\_  ' },
      { id: 'g3', type: 'ascii', text: '===================================================' },
      { id: 'g4', type: 'system', text: 'DEX CRYPTO TRACKING & CROSS-CHAIN ARBITRAGE TERMINAL OS v2.1.0' },
      { id: 'g5', type: 'output', text: 'Type \'help\' to output configuration guidelines or explore files in the sidebar.' },
      { id: 'g6', type: 'success', text: 'System status: ONLINE | Arbitrage Listening Contracts: MOUNTED ✔' },
      { id: 'g7', type: 'success', text: 'To configure your simulated Web3 Operator Wallet for flash loans, run: \'setup\'' },
      { id: 'g8', type: 'output', text: 'Recommended action: Execute \'arb\' to scan live cross-DEX spreads' },
      { id: 'g9', type: 'output', text: '---------------------------------------------------' }
    ]);
    
    // Lazy load actual coin prices on load
    fetchRealPrices();
  }, []);

  // Scroll to bottom whenever lines change
  useEffect(() => {
    lineEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  // Focus Input Field when container is clicked
  const handleContainerClick = () => {
    if (!activeEditor) {
      inputRef.current?.focus();
    }
  };

  // VPS Autopilot Live Feed & Log Scripter Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (vpsAutopilotOn) {
      const timeStrInit = new Date().toLocaleTimeString();
      if (vpsLogs.length === 0) {
        setVpsLogs([
          `[${timeStrInit}] 🖥️ VPS Server booted successfully on Ubuntu 22.04 LTS (New York Node-3)`,
          `[${timeStrInit}] 🌐 Establishing high-speed API & RPC connections to Arbitrum & Base...`,
          `[${timeStrInit}] 🔑 Loaded local Web3 keypair signer... Address: ${walletConnected ? walletAddress : '0x4F8b47CC76B9B...Cc76'}`,
          `[${timeStrInit}] 🚫 Private RPC Relays initialized securely. Sandwich defenses: ACTIVE ✔`,
          `[${timeStrInit}] 🔍 Mempool crawler online: Scanning 44 Liquidity Pools on Uniswap, SushiSwap, Camelot & Aerodrome...`
        ]);
      }

      timer = setInterval(() => {
        setVpsStats(prev => ({
          cpu: Math.floor(6 + Math.random() * 12),
          ram: Math.floor(410 + Math.random() * 25),
          uptime: prev.uptime
        }));

        const r = Math.random();
        let logLine = '';
        const timeNow = new Date().toLocaleTimeString();

        if (r < 0.20) {
          // Found spread!
          const symbols = ['ETH', 'SOL', 'BTC', 'LINK'];
          const sym = symbols[Math.floor(Math.random() * symbols.length)];
          const spread = (0.35 + Math.random() * 1.45).toFixed(2);
          logLine = `[${timeNow}] [ALERT] Found profitable ${sym} spread: +${spread}% cross-DEX gap!`;
          
          setTimeout(() => {
            const addedProfit = Number((4 + Math.random() * 35).toFixed(2));
            setVpsLogs(p => [
              ...p,
              `[${new Date().toLocaleTimeString()}] 🚀 PRIVATE BLOCK RECRUITMENT: Sending zero-collateral Aave V3 flash loan for ${sym}.`,
              `[${new Date().toLocaleTimeString()}] ⚡ MEV SHIELD PRIVACY MATCHED! Block successfully included by miners.`,
              `[${new Date().toLocaleTimeString()}] ✔ ARBITRAGE DETECTED SUCCESS! Earned +$${addedProfit} USD! Depositing to ledger...`
            ].slice(-100));
            setTotEarningsUsd(e => e + addedProfit);
          }, 1200);

        } else if (r < 0.55) {
          const venues = ['Uniswap Web3', 'SushiSwap Vault', 'Camelot L2', 'Aerodrome Base Pool'];
          const v1 = venues[Math.floor(Math.random() * venues.length)];
          const v2 = venues[Math.floor(Math.random() * venues.length)];
          if (v1 !== v2) {
            logLine = `[${timeNow}] [SCANNING] Checking arbitrage routes between ${v1} and ${v2}... Spread within margins.`;
          } else {
            logLine = `[${timeNow}] [NETWORK] Listening to WS mempool stream... Latency to block sequencer: 11ms`;
          }
        } else {
          logLine = `[${timeNow}] [HEARTBEAT] Bot running healthy. Thread sync index at 100%. Node synchronized ✔`;
        }

        if (logLine) {
          setVpsLogs(p => [...p, logLine].slice(-100));
        }

      }, 3500);
    }
    return () => {
      clearInterval(timer);
    };
  }, [vpsAutopilotOn, walletAddress, walletConnected]);

  // VPS Autopilot Uptime Counter Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (vpsAutopilotOn) {
      let seconds = 0;
      interval = setInterval(() => {
        seconds++;
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        setVpsStats(prev => ({ ...prev, uptime: `${hrs}:${mins}:${secs}` }));
      }, 1000);
    } else {
      setVpsStats(prev => ({ ...prev, uptime: '00:00:00' }));
    }
    return () => clearInterval(interval);
  }, [vpsAutopilotOn]);

  // Live Token & Spreads Tick Simulator Handler
  useEffect(() => {
    // Instantly update prices when chain is chosen
    fetchRealPrices();
    fetchRealMempool();

    const timer = setInterval(() => {
      // 1. Fetch fresh prices from backend proxy
      fetchRealPrices();
      fetchRealMempool();
 
      // 2. Adjust gas prices
      setGasPriceGwei(prev => Math.max(10, Math.min(250, prev + Math.floor((Math.random() - 0.5) * 4))));
    }, 4000);
 
    return () => clearInterval(timer);
  }, [activeTrackingToken, activeChain]);

  // Real-Time Arbitrage Opportunity Expiry and Lifecycle Engine
  useEffect(() => {
    // Ticker running once per second to manage lifespans
    const interval = setInterval(() => {
      setOpportunities(prev => {
        const now = Date.now();
        
        // 1. Map and transition active opportunities to expired/sold_out if time is up
        let updated = prev.map(opp => {
          const statusVal = opp.status || 'ACTIVE';
          if (statusVal === 'ACTIVE' && opp.expiresAt && now >= opp.expiresAt) {
            const isSoldOut = Math.random() > 0.4;
            const liveCompetitors = ['jaredfromsubway.eth', 'BananaBot-v4', 'sandwich_reaper.eth', 'arbitrage-ninja', 'mempool_shark'];
            const competitor = liveCompetitors[Math.floor(Math.random() * liveCompetitors.length)];
            
            return {
              ...opp,
              status: isSoldOut ? 'SOLD_OUT' : 'EXPIRED',
              filledBy: isSoldOut ? competitor : undefined,
              // Keep showing on dashboard for 4 seconds so user can see what happened
              expiresAt: now + 4000 
            };
          }
          return opp;
        });

        // 2. Filter out opportunities that have finished their grace period
        updated = updated.filter(opp => {
          if ((opp.status === 'SOLD_OUT' || opp.status === 'EXPIRED') && opp.expiresAt && now >= opp.expiresAt) {
            return false;
          }
          return true;
        });

        // 3. If we have fewer than 3 active opportunities, find or forge some new ones
        const activeCount = updated.filter(o => (o.status || 'ACTIVE') === 'ACTIVE').length;
        if (activeCount < 4) {
          // Generate a candidate opportunity from the tokens list
          const candidates: ArbitrageOpportunity[] = [];
          tokens.forEach(tok => {
            if (tok.symbol === 'USDC') return;
            const dexes = Object.keys(tok.dexRates);
            if (dexes.length < 2) return;
            
            for (let i = 0; i < dexes.length; i++) {
              for (let j = 0; j < dexes.length; j++) {
                if (i === j) continue;
                const buyDex = dexes[i];
                const sellDex = dexes[j];
                const buyPrice = tok.dexRates[buyDex];
                const sellPrice = tok.dexRates[sellDex];
                
                if (sellPrice > buyPrice) {
                  const spreadPercent = ((sellPrice - buyPrice) / buyPrice) * 100;
                  if (spreadPercent > 0.15) {
                    const tokensAcquired = tradeSize / buyPrice;
                    const grossSell = tokensAcquired * sellPrice;
                    let gasCost = gasPriceGwei * 0.15;
                    if (activeChain === 'arbitrum') gasCost = 0.045;
                    else if (activeChain === 'base') gasCost = 0.012;
                    else if (activeChain === 'polygon') gasCost = 0.032;
                    
                    const opProfit = grossSell - tradeSize - gasCost;
                    
                    // Assign random duration max (e.g. 8 to 18 seconds)
                    const duration = Math.floor(Math.random() * 8) + 10; // 10-18s
                    candidates.push({
                      id: `arb-${tok.symbol.toLowerCase()}-${buyDex.substring(0,3)}-${sellDex.substring(0,3)}-${Math.random().toString(36).substring(2, 6)}`.toLowerCase(),
                      tokenSymbol: tok.symbol,
                      buyFromDex: buyDex,
                      buyPrice,
                      sellToDex: sellDex,
                      sellPrice,
                      spreadPercentage: Number(spreadPercent.toFixed(2)),
                      expectedProfitUsd: Number(Math.max(1, opProfit).toFixed(2)),
                      riskScore: spreadPercent > 1.2 ? 'High' : spreadPercent > 0.6 ? 'Medium' : 'Low',
                      durationMax: duration,
                      expiresAt: now + duration * 1000,
                      status: 'ACTIVE'
                    });
                  }
                }
              }
            }
          });

          // Filter candidates that aren't already included
          const filteredCandidates = candidates.filter(cand => {
            return !updated.some(u => 
              u.tokenSymbol === cand.tokenSymbol && 
              u.buyFromDex === cand.buyFromDex && 
              u.sellToDex === cand.sellToDex &&
              (u.status || 'ACTIVE') === 'ACTIVE'
            );
          });

          // Sort, pick up to (4 - activeCount) new items
          const sorted = filteredCandidates.sort((a,b) => b.spreadPercentage - a.spreadPercentage);
          const needed = 4 - activeCount;
          const toAdd = sorted.slice(0, needed);
          
          updated = [...updated, ...toAdd];
        }

        return updated.sort((a,b) => {
          const aStat = a.status || 'ACTIVE';
          const bStat = b.status || 'ACTIVE';
          // Keep active ones at top, then expired
          if (aStat === 'ACTIVE' && bStat !== 'ACTIVE') return -1;
          if (aStat !== 'ACTIVE' && bStat === 'ACTIVE') return 1;
          return b.spreadPercentage - a.spreadPercentage;
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tokens, gasPriceGwei, activeChain, tradeSize]);

  // Directory helpers
  const getCurrentDir = (): DirectoryItem => {
    let current: DirectoryItem = fs;
    for (const part of currentPath) {
      if (part === '~' || part === '') continue;
      const nextDir = current.children[part];
      if (nextDir && nextDir.type === 'dir') {
        current = nextDir as DirectoryItem;
      }
    }
    return current;
  };

  const traverseNodes = (nodes: Record<string, FileSystemItem>, pathParts: string[]): DirectoryItem => {
    let current: DirectoryItem = { type: 'dir', name: 'root', children: nodes };
    for (const part of pathParts) {
      if (part === '~' || part === '') continue;
      const nextDir = current.children[part];
      if (nextDir && nextDir.type === 'dir') {
        current = nextDir as DirectoryItem;
      }
    }
    return current;
  };

  const getRelativePathStr = () => {
    return currentPath.join('/').replace('~/', '') || '~';
  };

  // COMMAND EXECUTER
  const executeCommand = async (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    // Add to history list
    setHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);

    // Save inputs inside lines
    setTerminalLines(prev => [...prev, {
      id: `in-${Date.now()}`,
      type: 'input',
      text: trimmed,
      dir: getRelativePathStr()
    }]);

    const args = trimmed.split(/\s+/);
    const command = args[0].toLowerCase();

    switch (command) {
      case 'clear':
        setTerminalLines([]);
        break;

      case 'help':
        setTerminalLines(prev => [
          ...prev,
          { id: `out-${Date.now()}-1`, type: 'system', text: '--- CROSS-DEX TERMINAL HELP DIRECTORY ---' },
          { id: `out-${Date.now()}-2`, type: 'output', text: 'arb                   - Scan cross-exchange spreads for active arbitrage routes.' },
          { id: `out-${Date.now()}-3`, type: 'output', text: 'execute-arb <id>      - Trigger smart contracts to execute arbitrage buy/sell routing cycle.' },
          { id: `out-${Date.now()}-3b`, type: 'output', text: 'backtest <tok> <amt>  - Audit flash loan scenarios against historical liquidity data curves.' },
          { id: `out-${Date.now()}-3c`, type: 'output', text: 'network [chain]       - View/switch active RPC network environment (ethereum, arbitrum, base, polygon).' },
          { id: `out-${Date.now()}-3d`, type: 'output', text: 'mev-shield [on/off]   - Enable/disable Block Shield Private RPC Bundler protection.' },
          { id: `out-${Date.now()}-3e`, type: 'output', text: 'wallet                  - Connect, fund, generate and view Web3 / smart wallet signing credentials.' },
          { id: `out-${Date.now()}-3f`, type: 'success', text: 'setup                   - Display the interactive Step-by-Step flash loan wallet configuration guide.' },
          { id: `out-${Date.now()}-3ff`, type: 'success', text: 'meridian                - Run continuous automated Meridian DeFi AI Agent + Aave V3 simulation.' },
          { id: `out-${Date.now()}-3g`, type: 'success', text: 'vps                   - Open the visual, amateur-friendly Automatic VPS Autopilot Hub.' },
          { id: `out-${Date.now()}-4`, type: 'output', text: 'tokens                - Display token metrics, liquidities, and prices across platforms.' },
          { id: `out-${Date.now()}-5`, type: 'output', text: 'track <symbol>        - Live stream pending blockchain mempool transaction swaps for a token (e.g. track ETH).' },
          { id: `out-${Date.now()}-6`, type: 'output', text: 'track stop            - Stop currently running live transaction streams.' },
          { id: `out-${Date.now()}-7`, type: 'output', text: 'swap <dex> <t1> <t2> <amt>  - Simulate a direct token swap transaction on specific DEX.' },
          { id: `out-${Date.now()}-8`, type: 'output', text: 'feed                  - Validate Price Oracle live data stream origin (shows raw endpoint metadata & live JSON).' },
          { id: `out-${Date.now()}-9`, type: 'output', text: 'ls                    - List present folder directories and files.' },
          { id: `out-${Date.now()}-10`, type: 'output', text: 'cat <filename>        - Display output text for specified file.' },
          { id: `out-${Date.now()}-11`, type: 'output', text: 'nano <filename>       - Open terminal code/txt files inside the visual Nano Editor.' },
          { id: `out-${Date.now()}-12`, type: 'output', text: 'config                - Display bot trade parameters.' },
          { id: `out-${Date.now()}-13`, type: 'output', text: 'theme <theme-id>      - Select core terminal UI preset theme.' },
          { id: `out-${Date.now()}-14`, type: 'system', text: 'Themes available: elegant, matrix, amber, dracula, cyberpunk, nord, retro-light' }
        ]);
        break;

      case 'vps':
      case 'vps-pilot':
      case 'autopilot':
        setVpsPanelOpen(true);
        setTerminalLines(prev => [
          ...prev,
          { id: `vps-cmd-${Date.now()}`, type: 'system', text: '🤖 VPS Autopilot Hub activated! Explore the interactive control board and automatic logs.' }
        ]);
        break;

      case 'meridian':
      case 'meridian-agent':
        setTerminalLines(prev => [
          ...prev,
          { id: `m-init-${Date.now()}`, type: 'system', text: '🧠 INITIALIZING MERIDIAN DEFI AUTONOMOUS AGENT PIPELINE' },
          { id: `m-note-${Date.now()}`, type: 'output', text: 'Connecting Agent Harness to offline webhooks, Discord feeds, and Telegram alpha groups...' }
        ]);

        await new Promise(r => setTimeout(r, 800));
        setTerminalLines(prev => [
          ...prev,
          { id: `m-tg-${Date.now()}`, type: 'success', text: '💬 [TG NOTIFICATION BOT] 🟢 Meridian Agent is now online!' },
          { id: `m-listen-${Date.now()}`, type: 'output', text: '📡 Scanning active chats for liquidity gaps, token deployments, and DEX pool differences...' }
        ]);

        await new Promise(r => setTimeout(r, 1200));
        setTerminalLines(prev => [
          ...prev,
          { id: `m-alert-${Date.now()}`, type: 'system', text: '🚨 [TELEGRAM ALERT MATCHED] GURU/WETH difference detected!' },
          { id: `m-signal-${Date.now()}`, type: 'output', text: '   ├─ Signal Source: TG Alpha Lounge\n   ├─ Target Chain: Base Layer-2 (Super cheap gas)\n   ├─ Asset Pool: GURU Token (0x8920bc281...)\n   └─ Arbitrage Path: Swap USDC ➔ GURU on Uniswap V3, swap GURU ➔ USDC on Aerodrome' }
        ]);

        await new Promise(r => setTimeout(r, 1200));
        setTerminalLines(prev => [
          ...prev,
          { id: `m-screen-${Date.now()}`, type: 'output', text: '🔍 Screen safety tests loaded via Meridian Cognition Engine...' },
          { id: `m-honeypot-${Date.now()}`, type: 'success', text: '   ├─ [✔] HONEYPOT CHECK: Safe (Sells verified successfully)' },
          { id: `m-rug-${Date.now()}`, type: 'success', text: '   ├─ [✔] CONTRACT SECURITY: No proxy backdoor, owner renounced' },
          { id: `m-liquidity-${Date.now()}`, type: 'success', text: '   └─ [✔] LIQUIDITY POOL DEPTH: Adequate (> $25,000)' }
        ]);

        await new Promise(r => setTimeout(r, 1200));
        setTerminalLines(prev => [
          ...prev,
          { id: `m-sim-${Date.now()}`, type: 'system', text: '⚡ SIMULATING TRANSACTION ON AAVE V3 FLASH LOAN CORE...' },
          { id: `m-sim-1-${Date.now()}`, type: 'output', text: '   ├─ Requesting: 50,000 USDC uncollateralized loan' },
          { id: `m-sim-2-${Date.now()}`, type: 'output', text: '   ├─ Aave repayment premium (0.09%): 45 USDC' },
          { id: `m-sim-3-${Date.now()}`, type: 'output', text: '   ├─ Expected gas (Base L2): $0.015' },
          { id: `m-sim-4-${Date.now()}`, type: 'success', text: '   └─ Calculated Net Profit: +1,935.41 USDC' }
        ]);

        await new Promise(r => setTimeout(r, 1200));
        setTerminalLines(prev => [
          ...prev,
          { id: `m-exec-${Date.now()}`, type: 'system', text: '🚀 PREflight simulation returns +1,935.41 USDC! Triggering FlashLoanArbitrage.sol...' },
          { id: `m-exec-2-${Date.now()}`, type: 'output', text: '   ├─ Deployed on Base: 0xDBC34ae8eCaDF3132e...' },
          { id: `m-exec-3-${Date.now()}`, type: 'output', text: '   ├─ Invoking flashLoanSimple() callback trigger with private RPC routing' },
          { id: `m-exec-4-${Date.now()}`, type: 'output', text: '   └─ Swaps completed atomically. Aave principal repaid.' }
        ]);

        await new Promise(r => setTimeout(r, 1500));
        {
          const finalTxHash = "0x" + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
          setTerminalLines(prev => [
            ...prev,
            { id: `m-finish-title-${Date.now()}`, type: 'success', text: '===================================================' },
            { id: `m-finish-val-${Date.now()}`, type: 'success', text: '💰 [COMPLETE] ARBITRAGE BLOCK FINALIZED SUCCESSFULLY!' },
            { id: `m-finish-tx-${Date.now()}`, type: 'output', text: `   └─ Tx Hash: ${finalTxHash}` },
            { id: `m-finish-profit-${Date.now()}`, type: 'success', text: '   └─ NET YIELD DEPOSITED TO OPERATOR WALLET: +1,935.41 USDC' },
            { id: `m-finish-tg-${Date.now()}`, type: 'success', text: '💬 [TG NOTIFICATION BOT] 🚨 💰 Win alert: Pocketed +1,935.41 USDC on Base Layer-2!' },
            { id: `m-finish-end-${Date.now()}`, type: 'system', text: '===================================================' },
            { id: `m-finish-info-${Date.now()}`, type: 'output', text: 'Perfect execution! I have generated real blueprint code templates detailing this pipeline on the left sidebar: meridian_pipeline.md and meridian_agent_flash.js. Double-click them to inspect and download!' }
          ]);
        }
        break;

      case 'real-world':
      case 'realworld':
        setTerminalLines(prev => [
          ...prev,
          { id: `rw-0-${Date.now()}`, type: 'system', text: '===================================================' },
          { id: `rw-1-${Date.now()}`, type: 'system', text: '      REAL-WORLD FLASH LOAN ARBITRAGE BLUEPRINT      ' },
          { id: `rw-2-${Date.now()}`, type: 'system', text: '===================================================' },
          { id: `rw-3-${Date.now()}`, type: 'success', text: 'Yes, I have deployed the blueprint directly on your terminal!' },
          { id: `rw-4-${Date.now()}`, type: 'output', text: 'I have generated 2 real files in your virtual File Explorer on the left:' },
          { id: `rw-5-${Date.now()}`, type: 'success', text: '  1. real_world_setup.md - Full step-by-step Hardhat project and .env setup guide.' },
          { id: `rw-5b-${Date.now()}`, type: 'success', text: '  2. deploy_execute.js   - Production-ready deploy & execution script using Ethers.js.' },
          { id: `rw-6-${Date.now()}`, type: 'output', text: '\nTo view these files directly inside this terminal viewport, run:' },
          { id: `rw-7-${Date.now()}`, type: 'success', text: '  👉 cat real_world_setup.md' },
          { id: `rw-8-${Date.now()}`, type: 'success', text: '  👉 cat deploy_execute.js' },
          { id: `rw-9-${Date.now()}`, type: 'output', text: '\nOr double-click them in the file explorer sidebar to inspect and download using the Nano visual editor!' },
          { id: `rw-10-${Date.now()}`, type: 'system', text: '---------------------------------------------------' },
          { id: `rw-11-${Date.now()}`, type: 'output', text: 'Pro-Tip: When doing a real test, run on a Layer 2 network like Arbitrum or Base. Flash loans cost $0 in collateral, but Ethereum Mainnet gas can be $100+. Arbitrum gas is only $0.01!' }
        ]);
        break;

      case 'wallet-setup':
      case 'setup-wallet':
      case 'setup':
      case 'guide':
        setTerminalLines(prev => [
          ...prev,
          { id: `w-setup-h-${Date.now()}`, type: 'system', text: '--- FLASH LOAN ARBITRAGE WALLET SETUP WALKTHROUGH ---' },
          { id: `w-setup-info-${Date.now()}`, type: 'output', text: 'Flash loans require ZERO start-up capital because you borrow millions in pool liquidity (from Aave V3 or Balancer V2), trigger multi-hops on DEXs, and repay the lender in a single transaction block. Your wallet only pays the gas to sequence and seal the transaction on-chain.' },
          { id: `w-step1-t-${Date.now()}`, type: 'system', text: '\n[STEP 1] Generating Secure Signer Credentials' },
          { id: `w-step1-d-${Date.now()}`, type: 'output', text: 'To coordinate smart contracts asynchronously without browser popup latency, you must generate a secure, simulated local cryptographic keypair.' },
          { id: `w-step1-c-${Date.now()}`, type: 'success', text: '  👉 Running command: wallet generate' },
          { id: `w-step2-t-${Date.now()}`, type: 'system', text: '\n[STEP 2] Funding Your Gas Reserve Buffer' },
          { id: `w-step2-d-${Date.now()}`, type: 'output', text: 'To guarantee immediate inclusion in block builders, allocate a small ETH gas reserve from which validators and relayer nodes deduct priority fees.' },
          { id: `w-step2-c-${Date.now()}`, type: 'success', text: '  👉 Running command: wallet fund 0.50' },
          { id: `w-step3-t-${Date.now()}`, type: 'system', text: '\n[STEP 3] Activating Anti-MEV Block Shield' },
          { id: `w-step3-d-${Date.now()}`, type: 'output', text: 'Standard public mempools are scanned by predatory sandwich searchers that frontrun profitable trades. Enabling the shield ensures your bundle is routed privately via Flashbots Protect RPC nodes directly to the block builders.' },
          { id: `w-step3-c-${Date.now()}`, type: 'success', text: '  👉 Running command: mev-shield on' },
          { id: `w-step4-t-${Date.now()}`, type: 'system', text: '\n[STEP 4] Scanning for Route Spreads and Executing' },
          { id: `w-step4-d-${Date.now()}`, type: 'output', text: 'Run the oracle spread analyzer to list active high-yield paths, then execute arbitrage immediately, reaping the profit clean into your ledger balance!' },
          { id: `w-step4-c-${Date.now()}`, type: 'success', text: '  👉 Running command: arb' },
          { id: `w-step4-c2-${Date.now()}`, type: 'success', text: '  👉 Running command: execute-arb <opportunity_id>' },
          { id: `w-setup-f-${Date.now()}`, type: 'system', text: '\nTry typing "wallet generate" now to perform Step 1!' }
        ]);
        break;

      case 'ls':
        const dir = getCurrentDir();
        const items = Object.keys(dir.children);
        if (items.length === 0) {
          setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'output', text: '(directory empty)' }]);
        } else {
          const joinedItems = items.map(itemName => {
            const isDir = dir.children[itemName].type === 'dir';
            return isDir ? `${itemName}/` : itemName;
          }).join('    ');
          setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'success', text: joinedItems }]);
        }
        break;

      case 'cat':
        if (args.length < 2) {
          setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'error', text: 'Error: Specify file path to output (e.g., cat notes.txt)' }]);
        } else {
          const targetName = args[1];
          const currDir = getCurrentDir();
          const targetFile = currDir.children[targetName];
          if (targetFile && targetFile.type === 'file') {
            setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'output', text: targetFile.content }]);
          } else {
            setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'error', text: `Error: No such file named '${targetName}'` }]);
          }
        }
        break;

      case 'nano':
        if (args.length < 2) {
          setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'error', text: 'Error: Provide file name to edit (e.g. nano config.json)' }]);
        } else {
          const fileName = args[1];
          const currDir = getCurrentDir();
          const existingFile = currDir.children[fileName];
          const content = (existingFile && existingFile.type === 'file') ? existingFile.content : '';
          
          setActiveEditor({
            fileName,
            path: [...currentPath],
            content
          });
          setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'system', text: `Launching Nano interface for /${fileName}...` }]);
        }
        break;

      case 'arb':
        {
          let gasText = `Net gas: ${gasPriceGwei} Gwei`;
          if (activeChain === 'arbitrum') {
            gasText = `L2 gas: ~$0.045 USD (Nitro compressed)`;
          } else if (activeChain === 'base') {
            gasText = `L2 gas: ~$0.012 USD (OP stack sequenced)`;
          } else if (activeChain === 'polygon') {
            gasText = `Gas: ~$0.032 USD (Polygon checkpoint)`;
          }

          setTerminalLines(prev => [
            ...prev,
            { id: `arb-${Date.now()}-1`, type: 'system', text: `Scanning decentralized exchanges on ${activeChain.toUpperCase()} | ${gasText}...` },
            ...opportunities.length === 0 
              ? [{ id: `arb-no`, type: 'output' as const, text: 'No active arbitrage opportunities found exceeding current 0.25% spread thresholds.' }]
              : opportunities.map((opp, idx) => ({
                  id: `arb-${idx}-${Date.now()}`,
                  type: opp.spreadPercentage > 0.8 ? 'success' as const : 'output' as const,
                  text: `[ID: ${opp.id}] Buy ${opp.tokenSymbol} on ${opp.buyFromDex} ($${opp.buyPrice}) ➜ Sell on ${opp.sellToDex} ($${opp.sellPrice}) | Spread: +${opp.spreadPercentage}% | Profit: ~$${opp.expectedProfitUsd} USD (Gas factored)`
                }))
          ]);
        }
        break;

      case 'execute-arb':
        if (args.length < 2) {
          setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'error', text: 'Error: Usage is \'execute-arb <id>\' (e.g., execute-arb arb-sol-ray-orc)' }]);
        } else {
          const arbId = args[1].toLowerCase();
          const targetOpp = opportunities.find(o => o.id === arbId);
          if (targetOpp) {
            const oppStatus = targetOpp.status || 'ACTIVE';
            if (oppStatus !== 'ACTIVE') {
              const filler = targetOpp.filledBy ? ` (Frontrunned and exhausted by rival MEV bot '${targetOpp.filledBy}')` : ' (Slippage spread collapsed naturally before block sealed)';
              setTerminalLines(prev => [
                ...prev,
                { id: `ex-fail-exp-${Date.now()}`, type: 'error', text: `\n[ON-CHAIN ERROR] ❌ Transaction Reverted: ARB_OPPORTUNITY_CLOSED` },
                { id: `ex-fail-exp2-${Date.now()}`, type: 'output', text: `  ├─ Status Code    : SLIPPAGE_TOLERANCE_EXCEEDED` },
                { id: `ex-fail-exp3-${Date.now()}`, type: 'output', text: `  ├─ Opportunity    : ${targetOpp.tokenSymbol} spread on ${targetOpp.buyFromDex}➔${targetOpp.sellToDex}` },
                { id: `ex-fail-exp4-${Date.now()}`, type: 'error', text: `  └─ Error Reason   : The targeted price discrepancy closed${filler}. Try executing active opportunities within their remaining block seconds!` }
              ]);
              break;
            }

            const ethPrice = tokens.find(t => t.symbol === 'ETH')?.price || 3420.00;
            let finalEarnings = targetOpp.expectedProfitUsd;

            // Gas message calculations
            let successGasText = `Gas price: ${gasPriceGwei} Gwei ($${(gasPriceGwei * 0.12).toFixed(2)})`;
            if (activeChain === 'arbitrum') {
              successGasText = `L2 Gas price: ~$0.045 USD (Arbitrum Nitro Bundling)`;
            } else if (activeChain === 'base') {
              successGasText = `L2 Gas price: ~$0.012 USD (Base OP Sequencer)`;
            } else if (activeChain === 'polygon') {
              successGasText = `POS Gas price: ~$0.032 USD (Polygon checkpoint)`;
            }

            // Mode-specific routing handlers
            if (executionMode === 'STANDARD') {
              // Standard Hot Wallet transaction uses real balance
              const currentBal = realBalance !== null ? realBalance : 0;
              if (currentBal < 0.005) {
                setTerminalLines(prev => [
                  ...prev,
                  { id: `ex-st-fail-${Date.now()}`, type: 'error', text: `\n[ON-CHAIN ERROR] ❌ transaction reverted: INSUFFICIENT_GAS_CAPITAL` },
                  { id: `ex-st-fail2-${Date.now()}`, type: 'output', text: `  ├─ Active Chain   : ${activeChain.toUpperCase()}` },
                  { id: `ex-st-fail3-${Date.now()}`, type: 'output', text: `  ├─ Wallet Address : ${walletAddress}` },
                  { id: `ex-st-fail4-${Date.now()}`, type: 'output', text: `  ├─ Current Balance: ${currentBal.toFixed(5)} ETH (~$${(currentBal * ethPrice).toFixed(2)} USD)` },
                  { id: `ex-st-fail5-${Date.now()}`, type: 'error', text: `  └─ Error: Standard Hot-Wallet mode executes trades directly using your address balance.` },
                  { id: `ex-st-fail6-${Date.now()}`, type: 'system', text: `💡 Pro-Tip: Connect a live funded wallet with MetaMask via "Sync Provider" / terminal command "wallet connect", OR click "Flash Loan Simple" in the dashboard to execute uncollateralized pool leverage with zero initial deposits!` }
                ]);
                break;
              }

              // If has balance, simulate direct swap
              setTotEarningsUsd(prev => prev + finalEarnings);
              const hotSwap: SwapLog = {
                id: `sw-arb-std-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                dex: `${targetOpp.buyFromDex}➔${targetOpp.sellToDex}`,
                type: 'ARBITRAGE',
                inputAmount: tradeSize.toString(),
                inputToken: 'USDC',
                outputAmount: (tradeSize + finalEarnings).toFixed(2),
                outputToken: 'USDC',
                profitUsd: finalEarnings,
                chain: activeChain
              };
              setRecentSwaps(prev => [hotSwap, ...prev]);

              setTerminalLines(prev => [
                ...prev,
                { id: `ex-st-s-1-${Date.now()}`, type: 'system', text: `[HOT-WALLET] 💼 Direct wallet spot swap initiated using balance on ${activeChain.toUpperCase()}...` },
                { id: `ex-st-s-2-${Date.now()}`, type: 'output', text: `Signing standard hash with operator key: ${walletAddress}` },
                { id: `ex-st-s-3-${Date.now()}`, type: 'output', text: `Swapping ${tradeSize} USDC ➔ ${targetOpp.tokenSymbol} on ${targetOpp.buyFromDex} at $${targetOpp.buyPrice}` },
                { id: `ex-st-s-4-${Date.now()}`, type: 'output', text: `Selling ${targetOpp.tokenSymbol} ➔ ${tradeSize + finalEarnings} USDC on ${targetOpp.sellToDex} at $${targetOpp.sellPrice}` },
                { id: `ex-st-s-5-${Date.now()}`, type: 'success', text: `✔ STANDARD SWAP COMPLETED ON-CHAIN! Gas cost: 0.0035 ETH deducted.` },
                { id: `ex-st-s-6-${Date.now()}`, type: 'success', text: `✔ Gained profit: +$${finalEarnings.toFixed(2)} USDC routed safely to ${walletAddress.slice(0, 8)}...` }
              ]);

            } else if (executionMode === 'MEV_BACKRUN') {
              // Private MEV Searcher Bundle Execution
              setTotEarningsUsd(prev => prev + finalEarnings);
              const mevSwap: SwapLog = {
                id: `sw-arb-mev-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                dex: `${targetOpp.buyFromDex}➔${targetOpp.sellToDex}`,
                type: 'ARBITRAGE',
                inputAmount: '12500.00',
                inputToken: 'USDC',
                outputAmount: (12500 + finalEarnings * 1.4).toFixed(2),
                outputToken: 'USDC',
                profitUsd: finalEarnings * 1.4,
                chain: activeChain
              };
              setRecentSwaps(prev => [mevSwap, ...prev]);

              setTerminalLines(prev => [
                ...prev,
                { id: `ex-mb-s-1-${Date.now()}`, type: 'system', text: `[MEV-BACKRUN] 🛡️ Fabricating private RPC transaction bundle...` },
                { id: `ex-mb-s-2-${Date.now()}`, type: 'output', text: `Simulated state backrun target block #${Math.floor(Math.random() * 50) + 19680320}` },
                { id: `ex-mb-s-3-${Date.now()}`, type: 'output', text: `Bundle includes: [1] Predatory Target Trade swapping 120,400 USDC ➜ [2] Atomic Swap tracking ${targetOpp.tokenSymbol}` },
                { id: `ex-mb-s-4-${Date.now()}`, type: 'success', text: `✔ MEV bundle sealed privately with Flashbots block builders!` },
                { id: `ex-mb-s-5-${Date.now()}`, type: 'success', text: `✔ Redeemed profit: +$${(finalEarnings * 1.4).toFixed(2)} USDC. No sandwich slippage was suffered.` }
              ]);

            } else {
              // FLASHLOAN mode
              const loanProviders = ['Aave V3 Portal', 'Balancer V2 Vault', 'Maker DssFlash'];
              const chosenProvider = loanProviders[Math.floor(Math.random() * loanProviders.length)];
              const borrowedToken = chosenProvider === 'Maker DssFlash' ? 'DAI' : 'USDC';

              if (mevShieldEnabled) {
                setTotEarningsUsd(prev => prev + finalEarnings);

                const auditSwap: SwapLog = {
                  id: `sw-arb-${Date.now()}`,
                  timestamp: new Date().toLocaleTimeString(),
                  dex: `${targetOpp.buyFromDex}➔${targetOpp.sellToDex}`,
                  type: 'ARBITRAGE',
                  inputAmount: '5000.00',
                  inputToken: borrowedToken,
                  outputAmount: (5000 + finalEarnings).toFixed(2),
                  outputToken: borrowedToken,
                  profitUsd: finalEarnings,
                  chain: activeChain
                };
                setRecentSwaps(prev => [auditSwap, ...prev]);

                setTerminalLines(prev => [
                  ...prev,
                  { id: `ex-mev-s-${Date.now()}`, type: 'success', text: `[MEV-SHIELD] 🛡️ Secure RPC Relay activated. Routing transaction bundle privately via Flashbots Protect.` },
                  { id: `ex-signer-${Date.now()}`, type: 'output', text: `✍️ Bundle Signed: ${walletConnected ? walletAddress : 'Default App Operator (0x4F8b...Cc76)'}` },
                  { id: `ex-1-${Date.now()}`, type: 'system', text: `[BLOCKCHAIN] Broad-routing arbitrage contract call through ERC-4337 Account Abstraction...` },
                  { id: `ex-2-${Date.now()}`, type: 'output', text: `Step 1/2: flash-loaning 5,000 ${borrowedToken} from [${chosenProvider}] ➜ Swapping to ${targetOpp.tokenSymbol} on ${targetOpp.buyFromDex} (Acquired ${(5000/targetOpp.buyPrice).toFixed(4)} ${targetOpp.tokenSymbol}).` },
                  { id: `ex-3-${Date.now()}`, type: 'output', text: `Step 2/2: routing items to ${targetOpp.sellToDex} ➜ Exchanging token metrics back to ${borrowedToken} & repaying flash-loan.` },
                  { id: `ex-4-${Date.now()}`, type: 'success', text: `✔ TRANSACTION COMPLETED SAFELY via Block Builder Relayer! ${successGasText}` },
                  { id: `ex-5-${Date.now()}`, type: 'success', text: `✔ Redeemed full targeted profit: +$${finalEarnings.toFixed(2)} ${borrowedToken} deposited in workspace ledger.` }
                ]);
              } else {
                const stolenAmount = Number((finalEarnings * 0.45).toFixed(2));
                const remainingAmount = Number((finalEarnings - stolenAmount).toFixed(2));
                setTotEarningsUsd(prev => prev + remainingAmount);

                const auditSwap: SwapLog = {
                  id: `sw-arb-${Date.now()}`,
                  timestamp: new Date().toLocaleTimeString(),
                  dex: `${targetOpp.buyFromDex}➔${targetOpp.sellToDex}`,
                  type: 'ARBITRAGE',
                  inputAmount: '5000.00',
                  inputToken: borrowedToken,
                  outputAmount: (5000 + remainingAmount).toFixed(2),
                  outputToken: borrowedToken,
                  profitUsd: remainingAmount,
                  chain: activeChain
                };
                setRecentSwaps(prev => [auditSwap, ...prev]);

                setTerminalLines(prev => [
                  ...prev,
                  { id: `ex-mev-w-${Date.now()}`, type: 'error', text: `[PUBLIC-MEMPOOL-WARN] ⚠️ WARNING: Broad-routing to open standard RPC mempool. No Flashbots coverage!` },
                  { id: `ex-mev-w2-${Date.now()}`, type: 'error', text: `[PUBLIC-MEMPOOL-WARN] Sandwich bot 'jaredfromsubway.eth' frontran your open bundle with higher gas premium (${gasPriceGwei + 45} Gwei).` },
                  { id: `ex-signer-${Date.now()}`, type: 'output', text: `✍️ Standard Signed: ${walletConnected ? walletAddress : 'Default App Operator (0x4F8b...Cc76)'}` },
                  { id: `ex-1-${Date.now()}`, type: 'system', text: `[BLOCKCHAIN] Broad-routing arbitrage contract call through ERC-4337 Account Abstraction...` },
                  { id: `ex-2-${Date.now()}`, type: 'output', text: `Step 1/2: flash-loaning 5,000 ${borrowedToken} from [${chosenProvider}] ➜ Swapping to ${targetOpp.tokenSymbol} on ${targetOpp.buyFromDex} (Acquired ${(5000/targetOpp.buyPrice).toFixed(4)} ${targetOpp.tokenSymbol}).` },
                  { id: `ex-3-${Date.now()}`, type: 'output', text: `Step 2/2: routing items to ${targetOpp.sellToDex} ➜ Exchanging token metrics back to ${borrowedToken} & repaying flash-loan.` },
                  { id: `ex-4-${Date.now()}`, type: 'error', text: `⚠️ WARNING: Slippage bounds forced open by sandwich pressure. Gas gashed +$${(stolenAmount * 0.15).toFixed(2)} extra.` },
                  { id: `ex-5-${Date.now()}`, type: 'success', text: `✔ TRANSACTION COMPLETED BUT SLIPPED: Captured only +$${remainingAmount.toFixed(2)} ${borrowedToken} ($${stolenAmount.toFixed(2)} USD extracted by MEV frontrunner).` },
                  { id: `ex-6-${Date.now()}`, type: 'system', text: `💡 Action Required: Toggle on the 'Secure MEV Shield' widgets in the sidebar or execute terminal command 'mev-shield on' to deploy private Flashbots RPC relays.` }
                ]);
              }
            }
          } else {
            setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'error', text: `Error: Arbitrage route '${arbId}' has expired or is invalid. Run 'arb' again.` }]);
          }
        }
        break;

      case 'tokens':
        setTerminalLines(prev => [
          ...prev,
          { id: `out-tok-h`, type: 'system', text: '--- ACTIVE TOKENS & LP QUOTE MATRIX ---' },
          ...tokens.map(t => ({
            id: `tok-${t.symbol}-${Date.now()}`,
            type: 'output' as const,
            text: `${t.symbol.padEnd(5)} | Price: $${t.price.toLocaleString(undefined, {minimumFractionDigits: 2})} (${t.change24h >= 0 ? '+' : ''}${t.change24h}%) | LP Liquidity: $${(t.liquidity/1000000).toFixed(1)}M | 24h Vol: $${(t.volume24h/1000000).toFixed(1)}M`
          }))
        ]);
        break;

      case 'track':
        if (args.length < 2) {
          setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'error', text: 'Error: Provide token symbol (e.g. track ETH) or track stop' }]);
        } else {
          const symStr = args[1].toUpperCase();
          if (symStr === 'STOP') {
            setActiveTrackingToken(null);
            setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'success', text: 'Mempool swap transaction feed tracking PAUSED.' }]);
          } else {
            setActiveTrackingToken(symStr);
            setTerminalLines(prev => [
              ...prev, 
              { id: `tr-${Date.now()}-s`, type: 'success', text: `Subscribed to WebSocket swap stream for [${symStr}]. Real-time blockchain mempool feed now piping to stdout...` },
              { id: `tr-${Date.now()}-h`, type: 'system', text: 'To pause feed tracking logs, write: track stop' }
            ]);
          }
        }
        break;

      case 'swap':
        // swap <dex> <from> <to> <amount>
        if (args.length < 5) {
          setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'error', text: 'Error: Usage is \'swap <dex_name> <from_token> <to_token> <amount>\' (e.g. swap Uniswap ETH USDC 1.5)' }]);
        } else {
          const [_, dexRaw, fromToken, toToken, rawAmount] = args;
          const dexName = dexRaw.charAt(0).toUpperCase() + dexRaw.slice(1).toLowerCase();
          const fromSym = fromToken.toUpperCase();
          const toSym = toToken.toUpperCase();
          const amount = parseFloat(rawAmount);

          if (isNaN(amount) || amount <= 0) {
            setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'error', text: 'Error: Invalid swap amount, must be positive.' }]);
            break;
          }

          const fromTokenConfig = tokens.find(t => t.symbol === fromSym);
          const toTokenConfig = tokens.find(t => t.symbol === toSym);

          if (!fromTokenConfig && fromSym !== 'USDC') {
            setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'error', text: `Error: Token ${fromSym} not index-registered.` }]);
            break;
          }
          if (!toTokenConfig && toSym !== 'USDC') {
            setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'error', text: `Error: Token ${toSym} not index-registered.` }]);
            break;
          }

          // Evaluate conversion ratios
          const fromPriceInUsd = fromSym === 'USDC' ? 1.00 : (fromTokenConfig?.dexRates[dexName] || fromTokenConfig?.price || 1.00);
          const toPriceInUsd = toSym === 'USDC' ? 1.00 : (toTokenConfig?.dexRates[dexName] || toTokenConfig?.price || 1.00);

          const valueInUsd = amount * fromPriceInUsd;
          const outputAmount = valueInUsd / toPriceInUsd;

          const isHighValue = valueInUsd >= 1000;
          let slippagePercentage = 0;
          let extraMevLogs: any[] = [];

          if (isHighValue) {
            if (mevShieldEnabled) {
              extraMevLogs = [
                { id: `sw-mev-1-${Date.now()}`, type: 'success' as const, text: `[MEV-SHIELD] 🛡️ Secure RPC Bundle matched! Multi-hop routed privately via block builders.` },
                { id: `sw-mev-2-${Date.now()}`, type: 'output' as const, text: `[MEV-SHIELD] Transaction shielded from frontrunning searchers. Frontrun status: SECURED.` }
              ];
            } else {
              slippagePercentage = 0.0065; // 0.65% slippage extracted due to sandwich frontrun
              extraMevLogs = [
                { id: `sw-mev-warn-${Date.now()}`, type: 'error' as const, text: `[PUBLIC-MEMPOOL-WARN] ⚠️ Broadcasted high-volume swap ($${valueInUsd.toFixed(2)}) to open mempool!` },
                { id: `sw-mev-warn2-${Date.now()}`, type: 'error' as const, text: `[PUBLIC-MEMPOOL-WARN] Mempool sandwich bot detected! Frontran with higher gas priority, extracting 0.65% slippage ($${(valueInUsd * 0.0065).toFixed(2)} USD).` },
                { id: `sw-mev-warn3-${Date.now()}`, type: 'system' as const, text: `💡 Hint: Enable 'Secure MEV Shield' in the sidebar or via text command 'mev-shield on' to completely shield transactions.` }
              ];
            }
          }

          const adjustedOutputAmount = outputAmount * (1 - slippagePercentage);

          const transactionSwap: SwapLog = {
            id: `sw-usr-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            dex: dexName,
            type: 'SWAP',
            inputAmount: amount.toFixed(4),
            inputToken: fromSym,
            outputAmount: adjustedOutputAmount.toFixed(4),
            outputToken: toSym,
            chain: activeChain
          };

          setRecentSwaps(prev => [transactionSwap, ...prev]);

          setTerminalLines(prev => [
            ...prev,
            { id: `sw-1-${Date.now()}`, type: 'system', text: `[SWAP PROTOCOL] Resolving conversion paths on ${dexName}...` },
            ...extraMevLogs,
            { id: `sw-2-${Date.now()}`, type: 'output', text: `Routing path: ${fromSym} ➜ Base Liquidity ➜ ${toSym}` },
            { id: `sw-3-${Date.now()}`, type: 'output', text: `Price Impact: <0.02% (Liquidity is healthy)` },
            { id: `sw-4-${Date.now()}`, type: 'success', text: `✔ SWAP SUCCESS! Deducted ${amount} ${fromSym}, Received ${adjustedOutputAmount.toFixed(5)} ${toSym} (USD value equivalent: $${(valueInUsd * (1 - slippagePercentage)).toFixed(2)})` }
          ]);
        }
        break;

      case 'mev-shield':
        if (args.length < 2) {
          setTerminalLines(prev => [
            ...prev,
            { id: `out-mev-status-${Date.now()}`, type: 'system', text: `🛡️ MEV BLOCK SHIELD STATUS: ${mevShieldEnabled ? 'ENABLED (🛡️ Private RPC Relayer Active)' : 'DISABLED (⚠️ Public Mempool Exposure)'}` },
            { id: `out-mev-help-${Date.now()}`, type: 'output', text: `Usage: mev-shield on | mev-shield off` }
          ]);
        } else {
          const modeVal = args[1].toLowerCase();
          if (modeVal === 'on' || modeVal === 'enable') {
            setMevShieldEnabled(true);
            updateMevInConfigFile(true);
            setTerminalLines(prev => [...prev, { id: `out-mev-success-${Date.now()}`, type: 'success', text: `✔ MEV Block Shield successfully ENABLED! Simulated transactions will now route privately bypass native mempools.` }]);
          } else if (modeVal === 'off' || modeVal === 'disable') {
            setMevShieldEnabled(false);
            updateMevInConfigFile(false);
            setTerminalLines(prev => [...prev, { id: `out-mev-disabled-${Date.now()}`, type: 'error', text: `⚠️ MEV Block Shield DISABLED! Simulated swaps are now exposed to standard public mempools.` }]);
          } else {
            setTerminalLines(prev => [...prev, { id: `out-mev-err-${Date.now()}`, type: 'error', text: `Invalid parameter. Usage: mev-shield on | mev-shield off` }]);
          }
        }
        break;

      case 'strategy':
      case 'mode':
        if (args.length < 2) {
          setTerminalLines(prev => [
            ...prev,
            { id: `out-strat-h-${Date.now()}`, type: 'system', text: '--- ROUTE ARBITRAGE STRATEGY EXECUTIVE ---' },
            { id: `out-strat-curr-${Date.now()}`, type: 'success', text: `ACTIVE PROTOCOL DIRECTION: ${executionMode}` },
            { id: `out-strat-opts-${Date.now()}`, type: 'output', text: '  strategy flashloan      - Borrow millions from Aave V3. Operational with zero initial balance.' },
            { id: `out-strat-opts2-${Date.now()}`, type: 'output', text: '  strategy standard       - Direct swap on DEXs using loaded on-chain wallet balance.' },
            { id: `out-strat-opts3-${Date.now()}`, type: 'output', text: '  strategy mev-backrun    - private Flashbots bundles that backrun target sequences.' },
          ]);
        } else {
          const targetStrategy = args[1].toLowerCase();
          if (['flashloan', 'flash', 'f'].includes(targetStrategy)) {
            setExecutionMode('FLASHLOAN');
            setTerminalLines(prev => [...prev, { id: `out-strat-fc-${Date.now()}`, type: 'success', text: `✔ STRATEGY TUNED: uncollateralized pool leverage Arbitrage activated.` }]);
          } else if (['standard', 'spot', 's'].includes(targetStrategy)) {
            setExecutionMode('STANDARD');
            setTerminalLines(prev => [...prev, { id: `out-strat-std-${Date.now()}`, type: 'success', text: `✔ STRATEGY TUNED: standard wallet spot execute activated on ${activeChain.toUpperCase()}. Ready for connected RPC signatures.` }]);
          } else if (['mev-backrun', 'mev', 'backrun', 'm'].includes(targetStrategy)) {
            setExecutionMode('MEV_BACKRUN');
            setTerminalLines(prev => [...prev, { id: `out-strat-mb-${Date.now()}`, type: 'success', text: `✔ STRATEGY TUNED: Flashbots Private Block builder Relayer routing activated.` }]);
          } else {
            setTerminalLines(prev => [...prev, { id: `out-strat-err-${Date.now()}`, type: 'error', text: `Strategy mode '${targetStrategy}' unrecognised. Choose from: flashloan, standard, mev-backrun` }]);
          }
        }
        break;

      case 'wallet':
        if (args.length < 2) {
          const ethPrice = tokens.find(t => t.symbol === 'ETH')?.price || 3420.00;
          setTerminalLines(prev => [
            ...prev,
            { id: `w-h-${Date.now()}`, type: 'system', text: '=== OPERATOR WEB3 WALLET MANAGER ===' },
            { id: `w-status-${Date.now()}`, type: 'output', text: `Connection status:      ${walletConnected ? 'CONNECTED ✔' : 'DISCONNECTED ❌ (Simulated Default Active)'}` },
            { id: `w-addr-${Date.now()}`, type: 'output', text: `Wallet Account Address: ${walletAddress || 'None'}` },
            { id: `w-gas-${Date.now()}`, type: 'output', text: `Live On-Chain Balance:  ${realBalance !== null ? `${realBalance.toFixed(5)} ETH (~$${(realBalance * ethPrice).toFixed(2)} USD)` : '0.00000 ETH (Querying RPC Node...)'}` },
            { id: `w-pks-${Date.now()}`, type: 'output', text: `Signing Key Bound:      ${walletConnected ? 'Custom Private Key / MetaMask RPC Provider' : 'App default simulated generic sandboxed pool'}` },
            { id: `w-help-title-${Date.now()}`, type: 'system', text: '--- Available Subcommands ---' },
            { id: `w-help-1-${Date.now()}`, type: 'output', text: '  wallet connect [address]        - Connect with MetaMask or inspect any custom on-chain address' },
            { id: `w-help-2-${Date.now()}`, type: 'output', text: '  wallet disconnect               - Disconnect the operational wallet identity' },
            { id: `w-help-3-${Date.now()}`, type: 'output', text: '  wallet balance                  - Query the latest real block balance of the connected address' },
            { id: `w-help-4-${Date.now()}`, type: 'output', text: '  wallet import-key <private_key> - Import operational hot wallet via private key' },
            { id: `w-help-5-${Date.now()}`, type: 'output', text: '  wallet generate                 - Generate secure operational keypair coordinates' },
            { id: `w-help-6-${Date.now()}`, type: 'success', text: '  wallet setup                    - Run the Step-by-Step interactive setup guide ✔' }
          ]);
        } else {
          const subType = args[1].toLowerCase();
          if (subType === 'setup' || subType === 'guide') {
            setTerminalLines(prev => [
              ...prev,
              { id: `w-setup-h-${Date.now()}`, type: 'system', text: '--- FLASH LOAN ARBITRAGE WALLET SETUP WALKTHROUGH ---' },
              { id: `w-setup-info-${Date.now()}`, type: 'output', text: 'Flash loans require ZERO start-up capital because you borrow millions in pool liquidity (from Aave V3 or Balancer V2), trigger multi-hops on DEXs, and repay the lender in a single transaction block. Your wallet only pays the gas to sequence and seal the transaction on-chain.' },
              { id: `w-step1-t-${Date.now()}`, type: 'system', text: '\n[STEP 1] Generating Secure Signer Credentials' },
              { id: `w-step1-d-${Date.now()}`, type: 'output', text: 'To coordinate smart contracts asynchronously without browser popup latency, you must generate a secure, simulated local cryptographic keypair.' },
              { id: `w-step1-c-${Date.now()}`, type: 'success', text: '  👉 Running command: wallet generate' },
              { id: `w-step2-t-${Date.now()}`, type: 'system', text: '\n[STEP 2] Funding Your Gas Reserve Buffer' },
              { id: `w-step2-d-${Date.now()}`, type: 'output', text: 'To guarantee immediate inclusion in block builders, allocate a small ETH gas reserve from which validators and relayer nodes deduct priority fees.' },
              { id: `w-step2-c-${Date.now()}`, type: 'success', text: '  👉 Running command: wallet fund 0.50' },
              { id: `w-step3-t-${Date.now()}`, type: 'system', text: '\n[STEP 3] Activating Anti-MEV Block Shield' },
              { id: `w-step3-d-${Date.now()}`, type: 'output', text: 'Standard public mempools are scanned by predatory sandwich searchers that frontrun profitable trades. Enabling the shield ensures your bundle is routed privately via Flashbots Protect RPC nodes directly to the block builders.' },
              { id: `w-step3-c-${Date.now()}`, type: 'success', text: '  👉 Running command: mev-shield on' },
              { id: `w-step4-t-${Date.now()}`, type: 'system', text: '\n[STEP 4] Scanning for Route Spreads and Executing' },
              { id: `w-step4-d-${Date.now()}`, type: 'output', text: 'Run the oracle spread analyzer to list active high-yield paths, then execute arbitrage immediately, reaping the profit clean into your ledger balance!' },
              { id: `w-step4-c-${Date.now()}`, type: 'success', text: '  👉 Running command: arb' },
              { id: `w-step4-c2-${Date.now()}`, type: 'success', text: '  👉 Running command: execute-arb <opportunity_id>' },
              { id: `w-setup-f-${Date.now()}`, type: 'system', text: '\nTry typing "wallet generate" now to perform Step 1!' }
            ]);
          } else if (subType === 'connect') {
            const desiredAddress = args[2];
            if (desiredAddress) {
              if (!desiredAddress.startsWith('0x') || desiredAddress.length < 40) {
                setTerminalLines(prev => [...prev, { id: `w-err-${Date.now()}`, type: 'error', text: 'Error: Invalid Ethereum address format. Must begin with \'0x\' and contain 40 hexadecimal characters.' }]);
              } else {
                setWalletConnected(true);
                setWalletAddress(desiredAddress);
                updateWalletInConfigFile(true, desiredAddress, walletPrivateKey, walletGasBuffer);
                setTerminalLines(prev => [
                  ...prev,
                  { id: `w-conn-s1-${Date.now()}`, type: 'success', text: `✔ Wallet connection successful!` },
                  { id: `w-conn-s2-${Date.now()}`, type: 'output', text: `Signed contract call address: ${desiredAddress}` },
                  { id: `w-conn-s3-${Date.now()}`, type: 'system', text: `All flash-loan payloads and arbitrage bundles will now sign with this identity.` }
                ]);
              }
            } else {
              setTerminalLines(prev => [...prev, { id: `w-conn-meta-${Date.now()}`, type: 'system', text: 'Initiating MetaMask secure RPC account handshake...' }]);
              connectMetaMask().catch(() => {});
            }
          } else if (subType === 'balance') {
            setTerminalLines(prev => [...prev, { id: `w-bal-q-${Date.now()}`, type: 'system', text: `Querying live node on chain [${activeChain.toUpperCase()}] for account ${walletAddress}...` }]);
            try {
              const res = await fetch(`/api/balance?address=${walletAddress}&chain=${activeChain}`);
              if (res.ok) {
                const data = await res.json();
                const ethPrice = tokens.find(t => t.symbol === 'ETH')?.price || 3420.00;
                if (data && typeof data.eth === 'number') {
                  setRealBalance(data.eth);
                  setTerminalLines(prev => [...prev, { id: `w-bal-s-${Date.now()}`, type: 'success', text: `✔ On-Chain Balance: ${data.eth.toFixed(5)} ETH (~$${(data.eth * ethPrice).toFixed(2)} USD)` }]);
                } else {
                  setTerminalLines(prev => [...prev, { id: `w-bal-f-${Date.now()}`, type: 'error', text: `Error: RPC node returned empty payload.` }]);
                }
              } else {
                setTerminalLines(prev => [...prev, { id: `w-bal-f-${Date.now()}`, type: 'error', text: `Error: Wallet proxy API returned HTTP ${res.status}` }]);
              }
            } catch (err: any) {
              setTerminalLines(prev => [...prev, { id: `w-bal-err-${Date.now()}`, type: 'error', text: `Error: Failed to fetch RPC balance: ${err.message || err}` }]);
            }
          } else if (subType === 'disconnect') {
            setWalletConnected(false);
            updateWalletInConfigFile(false, walletAddress, walletPrivateKey, walletGasBuffer);
            setTerminalLines(prev => [...prev, { id: `w-disc-${Date.now()}`, type: 'system', text: '✔ Wallet disconnected. Swapped back to Default Admin Simulator Profile.' }]);
          } else if (subType === 'fund') {
            if (args.length < 3) {
              setTerminalLines(prev => [...prev, { id: `w-fund-err-${Date.now()}`, type: 'error', text: 'Error: Provide an eth funding amount. E.g. \'wallet fund 0.75\'' }]);
            } else {
              const amt = parseFloat(args[2]);
              if (isNaN(amt) || amt <= 0) {
                setTerminalLines(prev => [...prev, { id: `w-fund-err2-${Date.now()}`, type: 'error', text: 'Error: Funding value must be a positive number.' }]);
              } else {
                setWalletGasBuffer(amt);
                updateWalletInConfigFile(walletConnected, walletAddress, walletPrivateKey, amt);
                setTerminalLines(prev => [...prev, { id: `w-fund-success-${Date.now()}`, type: 'success', text: `✔ Gas buffer allocated successfully: ${amt.toFixed(3)} ETH (~$${(amt * 3200).toFixed(2)} USD)` }]);
              }
            }
          } else if (subType === 'import-key') {
            if (args.length < 3) {
              setTerminalLines(prev => [...prev, { id: `w-pk-err-${Date.now()}`, type: 'error', text: 'Error: Provide hexadecimal private key.' }]);
            } else {
              let pk = args[2];
              if (!pk.startsWith('0x')) pk = '0x' + pk;
              if (pk.length < 64) {
                setTerminalLines(prev => [...prev, { id: `w-pk-err2-${Date.now()}`, type: 'error', text: 'Error: Invalid private key format. Must represent 256-bit entropy.' }]);
              } else {
                setWalletConnected(true);
                setWalletPrivateKey(pk);
                // Derive a fake clean address from the PK with some chars
                const derivedAddr = '0x' + pk.slice(2, 12) + 'dFe57fc6' + pk.slice(-8);
                setWalletAddress(derivedAddr);
                updateWalletInConfigFile(true, derivedAddr, pk, walletGasBuffer);
                setTerminalLines(prev => [
                  ...prev,
                  { id: `w-pk-s1-${Date.now()}`, type: 'success', text: `✔ Key imported successfully.` },
                  { id: `w-pk-s2-${Date.now()}`, type: 'output', text: `Derived Wallet Identity: ${derivedAddr}` }
                ]);
              }
            }
          } else if (subType === 'generate') {
            const hexChars = '0123456789abcdef';
            let randomPk = '0x';
            let randomAddr = '0x';
            for (let i = 0; i < 64; i++) randomPk += hexChars[Math.floor(Math.random() * 16)];
            for (let i = 0; i < 40; i++) randomAddr += hexChars[Math.floor(Math.random() * 16)];
            
            setWalletConnected(true);
            setWalletAddress(randomAddr);
            setWalletPrivateKey(randomPk);
            updateWalletInConfigFile(true, randomAddr, randomPk, walletGasBuffer);

            setTerminalLines(prev => [
              ...prev,
              { id: `w-gen-1-${Date.now()}`, type: 'system', text: '--- GENERATING SIMULATED KEYPAIR ---' },
              { id: `w-gen-2-${Date.now()}`, type: 'success', text: `✔ Generated Address:    ${randomAddr}` },
              { id: `w-gen-3-${Date.now()}`, type: 'success', text: `✔ Cryptographic Secret: ${randomPk}` },
              { id: `w-gen-4-${Date.now()}`, type: 'output', text: 'These credentials have been written to the local configuration state. Private Relays initialized.' }
            ]);
          } else {
            setTerminalLines(prev => [...prev, { id: `w-invalid-${Date.now()}`, type: 'error', text: `Unknown wallet subcommand '${subType}'. Type 'wallet' for detailed usage.` }]);
          }
        }
        break;

      case 'config':
        const fileSysConfig = fs.children['config.json'];
        if (fileSysConfig && fileSysConfig.type === 'file') {
          setTerminalLines(prev => [
            ...prev,
            { id: `out-conf-h`, type: 'system', text: '--- BOT CORE ROUTING CONFIGURATION ---' },
            { id: `out-conf-d`, type: 'output', text: fileSysConfig.content }
          ]);
        } else {
          setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'error', text: 'Error: config.json file deleted or corrupted!' }]);
        }
        break;

      case 'theme':
        if (args.length < 2) {
          setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'error', text: 'Usage: theme <theme-id>. Values: elegant, matrix, amber, dracula, cyberpunk, nord, retro-light' }]);
        } else {
          const selectedId = args[1].toLowerCase();
          const targetTheme = THEMES[selectedId];
          if (targetTheme) {
            setTheme(targetTheme);
            setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'success', text: `Theme successfully updated to [${targetTheme.name}].` }]);
          } else {
            setTerminalLines(prev => [...prev, { id: `out-${Date.now()}`, type: 'error', text: `Unknown theme preset '${selectedId}'` }]);
          }
        }
        break;

      case 'feed':
      case 'oracle':
        setTerminalLines(prev => [...prev, { id: `feed-start-${Date.now()}`, type: 'system', text: `Connecting to local secure Price Oracle /api/prices...` }]);
        try {
          const startTime = Date.now();
          const res = await fetch('/api/prices');
          const latency = Date.now() - startTime;
          if (res.ok) {
            const data = await res.json();
            setTerminalLines(prev => [
              ...prev,
              { id: `feed-1-${Date.now()}`, type: 'success', text: `✔ Live Oracle Connection Established.` },
              { id: `feed-2-${Date.now()}`, type: 'output', text: `Target Proxy Host : ${window.location.origin}/api/prices` },
              { id: `feed-3-${Date.now()}`, type: 'output', text: `Global Oracle     : CryptoCompare Index Services` },
              { id: `feed-4-${Date.now()}`, type: 'output', text: `Server HTTP Code  : ${res.status} (${res.statusText || 'OK'})` },
              { id: `feed-5-${Date.now()}`, type: 'output', text: `Network Latency   : ${latency} ms` },
              { id: `feed-6-${Date.now()}`, type: 'output', text: `Active Local Time : ${new Date().toLocaleTimeString()} (UTC ${new Date().toISOString()})` },
              { id: `feed-7-${Date.now()}`, type: 'system', text: `\nRAW LIVE JSON PAYLOAD DETECTED:` },
              { id: `feed-8-${Date.now()}`, type: 'success', text: JSON.stringify(data, null, 2) },
              { id: `feed-9-${Date.now()}`, type: 'output', text: `\nSuccessfully loaded real-time prices. All terminal indices updated.` }
            ]);
            // Update token prices instantly
            setTokens(prev => prev.map(tok => {
              const fetchedInfo = data[tok.symbol];
              if (fetchedInfo && fetchedInfo.USD) {
                const basePrice = fetchedInfo.USD;
                const dexRates: Record<string, number> = {};
                Object.keys(tok.dexRates).forEach(dex => {
                  const spreadFactor = 1 + (Math.random() - 0.5) * 0.012;
                  dexRates[dex] = Number((basePrice * spreadFactor).toFixed(4));
                });
                return {
                  ...tok,
                  price: basePrice,
                  dexRates
                };
              }
              return tok;
            }));
          } else {
            setTerminalLines(prev => [...prev, { id: `feed-err-${Date.now()}`, type: 'error', text: `Error: Oracle returned status ${res.status}. Fallback simulation active.` }]);
          }
        } catch (err: any) {
          setTerminalLines(prev => [...prev, { id: `feed-err-${Date.now()}`, type: 'error', text: `Error: Unable to verify network connection. Details: ${err.message}` }]);
        }
        break;

      case 'network':
        {
          const targetNet = args[1]?.toLowerCase();
          if (!targetNet) {
            setTerminalLines(prev => [
              ...prev,
              { id: `net-info-${Date.now()}`, type: 'system', text: '\n🌐 ACTIVE NETWORK ENVIRONMENT DIRECTORY' },
              { id: `net-l1-${Date.now()}`, type: 'output', text: `• ethereum (Ethereum L1 Mainnet)   ${activeChain === 'ethereum' ? '● [ACTIVE]' : '○ [AVAILABLE]'}\n  Gas Price: ~25 Gwei | Cost per Swap: $1.50 - $15.00 | Safe Capital Level: >$5,000` },
              { id: `net-arb-${Date.now()}`, type: 'output', text: `• arbitrum (Arbitrum One Rollup)   ${activeChain === 'arbitrum' ? '● [ACTIVE]' : '○ [AVAILABLE]'}\n  Gas Price: ~0.1 Gwei | Cost per Swap: $0.02 - $0.15 | Safe Capital Level: >$10 (Perfect for $50!)` },
              { id: `net-base-${Date.now()}`, type: 'output', text: `• base (Coinbase Base OP Stack)    ${activeChain === 'base' ? '● [ACTIVE]' : '○ [AVAILABLE]'}\n  Gas Price: ~0.05 Gwei | Cost per Swap: $0.005 - $0.05 | Safe Capital Level: >$5 (Ultra high yield)` },
              { id: `net-poly-${Date.now()}`, type: 'output', text: `• polygon (Polygon PoS EVM)       ${activeChain === 'polygon' ? '● [ACTIVE]' : '○ [AVAILABLE]'}\n  Gas Price: ~40 Gwei | Cost per Swap: $0.01 - $0.08 | Safe Capital Level: >$10` },
              { id: `net-instr-${Date.now()}`, type: 'success', text: '\nTo switch networks, issue command: network <name> (e.g., network arbitrum)' }
            ]);
            break;
          }

          if (['ethereum', 'arbitrum', 'base', 'polygon'].includes(targetNet)) {
            const prettyNames: Record<string, string> = {
              ethereum: 'Ethereum L1 Mainnet Network',
              arbitrum: 'Arbitrum One Nitro Engine (L2 Rollup)',
              base: 'Coinbase Base Chain OP Stack (L2 Rollup)',
              polygon: 'Polygon Proof of Stake EVM'
            };
            
            setTerminalLines(prev => [
              ...prev,
              { id: `net-sw-1-${Date.now()}`, type: 'system', text: `\n[RPC-SERVICE] Dismantling previous transaction pipes... [DONE]` },
              { id: `net-sw-2-${Date.now()}`, type: 'output', text: `Connecting securely to ${prettyNames[targetNet]} endpoints...` }
            ]);

            const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
            await sleep(400);

            setActiveChain(targetNet as any);
            
            const gasText: Record<string, string> = {
              ethereum: 'Recalibrating fee weight equations around Mainnet base limits. Gas fees will be highly variable ($2.00 - $140.00).',
              arbitrum: 'L2 Nitro optimistic transaction bundling confirmed. L1DataFee gas compression ACTIVE. Swap cost is heavily scaled down.',
              base: 'Sequencer connection achieved. Transaction processing latency: 150ms. Zero-gas slippage routing configured.',
              polygon: 'Validator checkpoint frequency synchronized. Transaction costs stabilized.'
            };

            setTerminalLines(prev => [
              ...prev,
              { id: `net-sw-3-${Date.now()}`, type: 'success', text: `✔ RPC link verified. Active chain updated to ${targetNet.toUpperCase()}.` },
              { id: `net-sw-4-${Date.now()}`, type: 'output', text: `[FEES] ${gasText[targetNet]}` }
            ]);
          } else {
            setTerminalLines(prev => [
              ...prev,
              { id: `net-err-${Date.now()}`, type: 'error', text: `Error: Chain symbol or tag '${targetNet}' unrecognized. Choose from: ethereum, arbitrum, base, polygon` }
            ]);
          }
        }
        break;

      case 'backtest':
        {
          const backtestToken = (args[1] || 'SOL').toUpperCase();
          const rawAmountVal = parseFloat(args[2]);
          const backtestAmount = isNaN(rawAmountVal) || rawAmountVal <= 0 ? 10000 : rawAmountVal;

          const supportedBacktestTokens = ['SOL', 'ETH', 'BTC', 'LINK'];
          if (!supportedBacktestTokens.includes(backtestToken)) {
            setTerminalLines(prev => [
              ...prev,
              { id: `bt-err-${Date.now()}`, type: 'error', text: `Error: Token symbol '${backtestToken}' not supported for backtesting. Available assets: SOL, ETH, BTC, LINK` }
            ]);
            break;
          }

          // Output initialization
          setTerminalLines(prev => [
            ...prev,
            { id: `bt-start-${Date.now()}`, type: 'system', text: `\n[BACKTEST-ENGINE] INITIALIZING UNCOLLATERALIZED MULTI-SCENARIO SCANNERS...` },
            { id: `bt-info-${Date.now()}`, type: 'output', text: `Scanned Asset       : ${backtestToken}\nPrincipal Size      : $${backtestAmount.toLocaleString()} USD Equivalent\nTimeframe Period    : Last 100 blocks (Simulated sub-graphs)` }
          ]);

          // Pacing effect helper
          const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

          await sleep(400);

          setTerminalLines(prev => [
            ...prev,
            { id: `bt-step1-${Date.now()}`, type: 'output', text: `Step 1/4: Scraped historical pool states... Completed. Registered 34 transaction spreads.` }
          ]);

          await sleep(450);

          setTerminalLines(prev => [
            ...prev,
            { id: `bt-step2-${Date.now()}`, type: 'output', text: `Step 2/4: Simulating slippage on Aave V3 Flash Loan pathways vs Balancer V2...` }
          ]);

          await sleep(500);

          // Calculate hypothetical statistics
          // Fees:
          // Aave: 0.09% of amount
          // Balancer: 0%
          // Maker: 0% (but only DAI)
          const aaveFee = backtestAmount * 0.0009;
          const balancerFee = 0;

          // Spread outcomes
          const avgSpreadPercent = 0.35 + Math.random() * 0.55; // average spread percentage
          const grossReturnUsd = backtestAmount * (avgSpreadPercent / 100);
          
          const tokenLiquidity = tokens.find(t => t.symbol === backtestToken)?.liquidity || 100000000;
          const avgSlippagePercent = (backtestAmount / tokenLiquidity) * 100 * 4.5 + 0.02; // relative slippage (capped or scaled)
          const slippageLossUsd = grossReturnUsd * (avgSlippagePercent / 100);

          // Gas estimations based on activeChain
          let gasCostLow = 14 * 0.12 * 8; 
          let gasCostMed = 45 * 0.12 * 8;
          let gasCostHigh = 150 * 0.12 * 8;
          let gasPriceLabel = "Est. Gas Price (Gwei)      ";
          let gasValLow = "12 Gwei            ";
          let gasValMed = "45 Gwei            ";
          let gasValHigh = "150 Gwei";

          if (activeChain === 'arbitrum') {
            gasCostLow = 0.015;
            gasCostMed = 0.045;
            gasCostHigh = 0.12;
            gasPriceLabel = "Est. L2 Gas Cost (USD)      ";
            gasValLow = "$0.015             ";
            gasValMed = "$0.045             ";
            gasValHigh = "$0.120";
          } else if (activeChain === 'base') {
            gasCostLow = 0.004;
            gasCostMed = 0.012;
            gasCostHigh = 0.035;
            gasPriceLabel = "Est. L2 Gas Cost (USD)      ";
            gasValLow = "$0.004             ";
            gasValMed = "$0.012             ";
            gasValHigh = "$0.035";
          } else if (activeChain === 'polygon') {
            gasCostLow = 0.012;
            gasCostMed = 0.032;
            gasCostHigh = 0.088;
            gasPriceLabel = "Est. POL Gas Cost (USD)     ";
            gasValLow = "$0.012             ";
            gasValMed = "$0.032             ";
            gasValHigh = "$0.088";
          }

          // Profitable routes count, calculated realistically
          const successfulTxs = Math.floor(65 + Math.random() * 25); // 65-90% success rate
          const failedTxs = 100 - successfulTxs;

          const activeChainPrettyName = activeChain.toUpperCase() + (activeChain !== 'ethereum' ? ' (Layer 2 Rollup)' : ' (L1 Mainnet)');

          setTerminalLines(prev => [
            ...prev,
            { id: `bt-step3-${Date.now()}`, type: 'output', text: `Step 3/4: Correlating historical gas metrics over the active ${activeChain.toUpperCase()} scanning period...` }
          ]);

          await sleep(400);

          setTerminalLines(prev => [
            ...prev,
            { id: `bt-step4-${Date.now()}`, type: 'success', text: `✔ Step 4/4: Multi-variable simulation model compiled. Displaying historical results...` }
          ]);

          await sleep(350);

          const divider = "==========================================================================";
          const formattedDate = new Date().toISOString().substring(0, 10);

          // Build verdict lines based on budget and chain
          let verdictBlocks: { id: string; type: 'success' | 'output' | 'system' | 'error'; text: string }[] = [];
          if (activeChain === 'ethereum' && backtestAmount <= 500) {
            verdictBlocks = [
              { id: `v1-${Date.now()}`, type: 'error', text: `  • 🚨 CRITICAL GAS DRAG DETECTED: Small capital size is deeply unprofitable on L1.` },
              { id: `v2-${Date.now()}`, type: 'output', text: `    Gas fees ($13.44 - $144.00) completely eat up gross yields (~$${grossReturnUsd.toFixed(2)}).` },
              { id: `v3-${Date.now()}`, type: 'output', text: `    Action: Switch to a Layer 2 network using the command: network arbitrum` },
              { id: `v4-${Date.now()}`, type: 'error', text: `    Your $50 wallet budget would be incinerated on the very first contract spin.` }
            ];
          } else if (backtestAmount <= 500) {
            verdictBlocks = [
              { id: `v1-${Date.now()}`, type: 'success', text: `  • 💎 SHIELDED L2 SANDBOX: Highly viable for micro budgets!` },
              { id: `v2-${Date.now()}`, type: 'output', text: `    With L2 Gas costs averaging ~$${gasCostLow.toFixed(3)}, your $50 budget is massive!` },
              { id: `v3-${Date.now()}`, type: 'output', text: `    Cushion Capacity: Your $50 buffer is enough to execute over ${Math.floor(50 / gasCostMed)} trades.` },
              { id: `v4-${Date.now()}`, type: 'success', text: `    Since flash loans require no collateral, this space lets you pocket safe yields of +$${(grossReturnUsd - gasCostMed).toFixed(2)} per execution.` }
            ];
          } else {
            verdictBlocks = [
              { id: `v1-${Date.now()}`, type: 'output', text: `  • Optimal Flash Loan Broker : Balancer V2 Vault (Zero-fee arbitrage routing increases ROI).` },
              { id: `v2-${Date.now()}`, type: 'output', text: `  • Pool Depth Viability      : Liquidity is healthy. Size allows max uncollateralized depth of $${(tokenLiquidity * 0.05).toLocaleString()} USD without cascading slippage.` },
              { id: `v3-${Date.now()}`, type: 'output', text: `  • Multi-block win-rate      : Scanned 100 historical intervals: ${successfulTxs} transactions were profitable. ${failedTxs} failed to cover gas thresholds.` }
            ];
          }

          setTerminalLines(prev => [
            ...prev,
            { id: `bt-div-1-${Date.now()}`, type: 'ascii', text: divider },
            { id: `bt-res-title-${Date.now()}`, type: 'success', text: `📊 FLASH LOAN HISTORICAL BACKTEST REPORT: ${backtestToken} / ${backtestAmount.toLocaleString()} USD` },
            { id: `bt-res-time-${Date.now()}`, type: 'output', text: `Execution Date : ${formattedDate} | Simulation Network: ${activeChainPrettyName} | Engine: v2.1-Sim-Core` },
            { id: `bt-div-2-${Date.now()}`, type: 'ascii', text: divider },
            { id: `bt-res-header-${Date.now()}`, type: 'system', text: `[METRIC]                         [LOW GAS TRAFFIC]  [MED GAS TRAFFIC]  [HIGH CONGESTION]` },
            { id: `bt-res-gas-${Date.now()}`, type: 'output', text: `${gasPriceLabel}${gasValLow}${gasValMed}${gasValHigh}` },
            { id: `bt-res-raw-prof-${Date.now()}`, type: 'output', text: `Gross Arb Spread Yield           $${grossReturnUsd.toFixed(4)}            $${grossReturnUsd.toFixed(4)}            $${grossReturnUsd.toFixed(4)}` },
            { id: `bt-res-slip-${Date.now()}`, type: 'output', text: `Avg Route Price Slippage (${avgSlippagePercent.toFixed(3)}%)  -$${slippageLossUsd.toFixed(4)}            -$${slippageLossUsd.toFixed(4)}            -$${slippageLossUsd.toFixed(4)}` },
            { id: `bt-res-loan-fee-${Date.now()}`, type: 'output', text: `Aave V3 Flash Loan Fee (0.09%)   -$${aaveFee.toFixed(4)}             -$${aaveFee.toFixed(4)}             -$${aaveFee.toFixed(4)}` },
            { id: `bt-res-gas-cost-${Date.now()}`, type: 'output', text: `Simulated Gas Cost (USD)        -$${gasCostLow.toFixed(4)}              -$${gasCostMed.toFixed(4)}              -$${gasCostHigh.toFixed(4)}` },
            { id: `bt-div-3-${Date.now()}`, type: 'ascii', text: `--------------------------------------------------------------------------` },
            { 
              id: `bt-res-net-prof-${Date.now()}`, 
              type: 'success', 
              text: `NET PROFITS USING AAVE V3        $${(grossReturnUsd - slippageLossUsd - aaveFee - gasCostLow).toFixed(4)}            $${(grossReturnUsd - slippageLossUsd - aaveFee - gasCostMed).toFixed(4)}            $${(grossReturnUsd - slippageLossUsd - aaveFee - gasCostHigh).toFixed(4)}` 
            },
            { 
              id: `bt-res-net-bal-${Date.now()}`, 
              type: 'success', 
              text: `NET PROFITS USING BALANCER (0%)  $${(grossReturnUsd - slippageLossUsd - gasCostLow).toFixed(4)}            $${(grossReturnUsd - slippageLossUsd - gasCostMed).toFixed(4)}            $${(grossReturnUsd - slippageLossUsd - gasCostHigh).toFixed(4)}` 
            },
            { id: `bt-div-4-${Date.now()}`, type: 'ascii', text: divider },
            { id: `bt-res-verdict-title-${Date.now()}`, type: 'system', text: `🤖 SIMULATED PORT LEVEL OPTIMIZATION VERDICT:` },
            ...verdictBlocks,
            { id: `bt-res-v4-${Date.now()}`, type: 'success', text: `✔ Backtest audit finalized. Operational efficiency is excellent.` }
          ]);
        }
        break;

      default:
        setTerminalLines(prev => [
          ...prev, 
          { id: `err-${Date.now()}`, type: 'error', text: `bash: command not found: ${command}. Type 'help' to review guidance instructions.` }
        ]);
        break;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      executeCommand(inputVal);
      setInputVal('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < history.length) {
          setHistoryIndex(nextIdx);
          setInputVal(history[nextIdx]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = historyIndex - 1;
      if (nextIdx >= 0) {
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      } else {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  const handleSidebarFileClick = (item: FileSystemItem, relativePath: string[]) => {
    if (item.type === 'file') {
      setActiveEditor({
        fileName: item.name,
        path: relativePath,
        content: item.content
      });
      setTerminalLines(prev => [
        ...prev,
        { id: `sidebar-${Date.now()}`, type: 'system', text: `Launching Nano interface for file click: /${item.name}...` }
      ]);
    }
  };

  const renderVisualTreeNodes = (dirItem: DirectoryItem, currentPathAccumulator: string[] = ['~']): React.ReactNode => {
    return Object.values(dirItem.children).map((item) => {
      const p = [...currentPathAccumulator, item.name];
      if (item.type === 'dir') {
        return (
          <div key={item.name} className="pl-2.5">
            <div className="flex items-center gap-1 py-1 text-yellow-500/80 hover:text-yellow-400 select-none cursor-pointer text-xs font-bold font-mono">
              <Folder className="w-3.5 h-3.5" />
              <span>{item.name}/</span>
            </div>
            <div className="border-l border-zinc-700/40 pl-1.5 ml-2">
              {renderVisualTreeNodes(item as DirectoryItem, [...currentPathAccumulator, item.name])}
            </div>
          </div>
        );
      } else {
        return (
          <div 
            key={item.name}
            onClick={() => handleSidebarFileClick(item, currentPathAccumulator)}
            className={`flex items-center gap-1.5 py-0.5 px-1.5 rounded select-none cursor-pointer text-xs font-mono transition duration-200 ${
              activeEditor?.fileName === item.name 
                ? theme.id === 'elegant' 
                  ? 'bg-emerald-500/10 text-[#7ee787] border border-[#7ee787]/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0 text-cyan-400/80" />
            <span className="truncate">{item.name}</span>
          </div>
        );
      }
    });
  };

  return (
    <div 
      className={`flex-1 flex flex-col md:flex-row relative overflow-hidden transition-colors duration-500 border-t ${theme.id === 'elegant' ? 'border-[#30363d]' : theme.borderColor} ${theme.id === 'elegant' ? 'bg-[#0d1117]' : theme.bgColor}`}
      onClick={handleContainerClick}
    >
      
      {/* Side collapsible menu dashboard providing files and thematic quick configuration controls */}
      {isSidebarOpen && (
        <aside className={`w-full md:w-64 border-b md:border-b-0 md:border-r ${theme.id === 'elegant' ? 'border-[#30363d]' : 'border-emerald-500/20'} ${theme.id === 'elegant' ? 'bg-[#0d1117]' : theme.bgColor} flex flex-col shrink-0 select-none z-10 overflow-y-auto`}>
          
          {/* File Explorer root panel */}
          <div 
            onClick={() => {
              if (activeEditor) {
                setActiveEditor(null);
                setTerminalLines(prev => [
                  ...prev,
                  { id: `fs-root-back-${Date.now()}`, type: 'system', text: '↩ Closed file editor. Returned to main terminal console.' }
                ]);
              }
            }}
            title={activeEditor ? "Click to exit editor and return to Terminal" : "Workspace Local Filesystem Root"}
            className={`p-3 border-b ${theme.id === 'elegant' ? 'border-[#30363d] hover:bg-[#161b22]' : 'border-zinc-800/60 hover:bg-zinc-900/40'} flex items-center justify-between cursor-pointer transition`}
          >
            <span className={`font-mono text-xs font-bold tracking-wider flex items-center gap-1.5 ${theme.id === 'elegant' ? 'text-[#8b949e]' : 'text-zinc-400'}`}>
              <Layers className={`w-3.5 h-3.5 ${theme.id === 'elegant' ? 'text-[#58a6ff]' : 'text-emerald-400'}`} />
              FILESYSTEM ROOT
            </span>
            {activeEditor && (
              <span className="text-[8px] font-mono font-bold text-sky-400 px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 uppercase transition animate-pulse">
                exit edit ↩
              </span>
            )}
          </div>

          <div className={`p-3 font-mono space-y-1 terminal-scrollbar ${theme.id === 'elegant' ? 'text-[#c9d1d9]' : 'text-zinc-300'}`}>
            {renderVisualTreeNodes(fs)}
          </div>

          {/* Core DEX Ledger Widget Dashboard */}
          <div className={`p-3.5 border-t border-b ${theme.id === 'elegant' ? 'border-[#30363d] bg-[#161b22]' : 'border-zinc-800 bg-black/40'} space-y-4`}>
            
            <div className="space-y-1">
              <span className={`text-[10px] uppercase tracking-wider font-bold block ${theme.id === 'elegant' ? 'text-[#8b949e]' : 'text-zinc-400'}`}>
                💰 LEDGER EARNINGS
              </span>
              <div className="flex items-baseline justify-between">
                <span className={`text-lg font-mono font-black ${theme.id === 'elegant' ? 'text-[#58a6ff]' : 'text-[#88c0d0]'}`}>
                  ${totEarningsUsd.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
                <span className="text-[10px] text-[#7ee787] font-mono font-bold uppercase animate-pulse">
                  Ledger active
                </span>
              </div>
            </div>

            {/* Slider Parameters matrix panel */}
            <div className="space-y-3 pt-1.5 border-t border-zinc-800/40">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-400">
                  <span>Target Principal</span>
                  <span className="font-mono text-cyan-400 font-extrabold">${tradeSize}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="50000"
                  step="50"
                  value={tradeSize}
                  onChange={(e) => setTradeSize(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-400">
                  <span>Slippage Limit</span>
                  <span className="font-mono text-emerald-400 font-extrabold">{slippage}%</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[0.1, 0.5, 1.0, 2.0].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSlippage(v)}
                      className={`text-[8.5px] py-1 rounded font-mono font-bold cursor-pointer transition text-center ${
                        slippage === v
                          ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                          : 'bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-zinc-350'
                      }`}
                    >
                      {v}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-400">
                  <span>Gas priority limit</span>
                  <span className="font-mono text-amber-500 font-extrabold">{gasLimit} Gwei</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="250"
                  step="5"
                  value={gasLimit}
                  onChange={(e) => {
                    const nextVal = Number(e.target.value);
                    setGasLimit(nextVal);
                    setGasPriceGwei(nextVal);
                  }}
                  className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded bg-zinc-950/20 border border-zinc-800/40">
                <div className="flex flex-col">
                  <span className={`text-[10px] uppercase font-bold ${theme.id === 'elegant' ? 'text-[#8c959f]' : 'text-zinc-400'}`}>
                    ⚡ ARBITRAGE SCANNER
                  </span>
                  <span className="text-[8px] font-mono text-zinc-500">
                    Scanning {activeChain.toUpperCase()} DEXs
                  </span>
                </div>
                <div className="text-right flex items-center gap-1.5">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase select-none ${
                    activeChain === 'ethereum'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      : activeChain === 'arbitrum'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                        : activeChain === 'base'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  }`}>
                    ● {activeChain}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-mono">
                    ({opportunities.length})
                  </span>
                </div>
              </div>

              {opportunities.length === 0 ? (
                <div className="p-2 border border-dashed border-zinc-800/80 text-center rounded text-[10px] text-zinc-500 font-mono">
                  Scanning DEX pools...
                </div>
              ) : (
                <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5 terminal-scrollbar pb-1">
                  {opportunities.map(opp => (
                    <div 
                      key={opp.id} 
                      onClick={() => executeCommand(`execute-arb ${opp.id}`)}
                      title={`Click directly to execute arbitrage trade ${opp.id}`}
                      className={`p-1.5 rounded border text-[10px] font-mono flex flex-col leading-tight cursor-pointer transition ${
                        theme.id === 'elegant' 
                          ? 'bg-[#21262d] border-[#30363d] text-[#c9d1d9] hover:border-[#58a6ff] hover:bg-[#30363d]' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-emerald-500 hover:text-white'
                      }`}
                    >
                      <div className="flex justify-between font-bold">
                        <span className={theme.id === 'elegant' ? 'text-[#7ee787]' : 'text-emerald-400'}>
                          +{opp.spreadPercentage}% spread
                        </span>
                        <span>{opp.tokenSymbol}</span>
                      </div>
                      <div className="text-[9px] text-zinc-500 flex justify-between mt-0.5">
                        <span className="truncate">Buy: {opp.buyFromDex} ➜ Sell: {opp.sellToDex}</span>
                        <span className={`font-bold ${opp.riskScore === 'High' ? 'text-rose-500' : 'text-emerald-500'}`}>
                          ${opp.expectedProfitUsd} exp.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className={`text-[10px] uppercase tracking-wider font-bold block ${theme.id === 'elegant' ? 'text-[#8b949e]' : 'text-zinc-400'}`}>
                LIVE MEMPOOL SWAPS
              </span>
              <div className={`p-2 rounded max-h-24 overflow-y-auto text-[9px] font-mono leading-relaxed space-y-1 ${
                theme.id === 'elegant' ? 'bg-[#0d1117] border border-[#30363d]' : 'bg-black/90'
              }`}>
                {recentSwaps.slice(0, 10).map((swap) => {
                  const chainTag = swap.chain || 'ethereum';
                  return (
                    <div key={swap.id} className="flex justify-between text-zinc-400 items-center gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`text-[8px] px-1 rounded scale-90 font-mono font-bold select-none ${
                          chainTag === 'ethereum'
                            ? 'bg-blue-500/10 text-blue-400/80 border border-blue-500/20'
                            : chainTag === 'arbitrum'
                              ? 'bg-indigo-500/10 text-indigo-400/80 border border-indigo-500/20'
                              : chainTag === 'base'
                                ? 'bg-amber-500/10 text-amber-400/80 border border-amber-500/20'
                                : 'bg-purple-500/10 text-purple-400/80 border border-purple-500/20'
                        }`}>
                          {chainTag.substring(0, 3).toUpperCase()}
                        </span>
                        <span className="truncate text-zinc-500 text-[8px]">{swap.timestamp}</span>
                        <span className="truncate text-[10px] font-medium max-w-[50px]">{swap.dex}</span>
                      </div>
                      <span className={`truncate text-right ${swap.type === 'ARBITRAGE' ? 'text-[#7ee787] font-bold' : 'text-zinc-400'}`}>
                        {swap.type === 'ARBITRAGE' ? `+${swap.profitUsd} USD!` : `${swap.inputToken}➔${swap.outputToken}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MEV Block Shield widget */}
          <div className={`p-3 border-t border-b ${theme.id === 'elegant' ? 'border-[#30363d] bg-[#161b22]/20' : 'border-zinc-800 bg-black/10'} space-y-2`}>
            <div className="flex justify-between items-center">
              <span className={`text-[10px] uppercase tracking-wider font-bold ${theme.id === 'elegant' ? 'text-[#8b949e]' : 'text-zinc-500'}`}>
                🛡️ MEV BLOCK SHIELD
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextState = !mevShieldEnabled;
                  setMevShieldEnabled(nextState);
                  updateMevInConfigFile(nextState);
                  setTerminalLines(prev => [
                    ...prev,
                    { 
                      id: `toggle-mev-${Date.now()}`, 
                      type: nextState ? 'success' : 'error', 
                      text: nextState 
                        ? '🛡️ MEV Block Shield activated. Core RPC routing changed to private relays.' 
                        : '⚠️ MEV Block Shield deactivated. Transaction broadcasted to standard open mempools.' 
                    }
                  ]);
                }}
                className={`text-[8px] font-mono px-2 py-0.5 rounded-full border cursor-pointer select-none transition ${
                  mevShieldEnabled
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 font-bold'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/40 font-bold'
                }`}
              >
                {mevShieldEnabled ? 'ACTIVE (SECURE)' : 'INACTIVE (VULN)'}
              </button>
            </div>
            <div className={`p-2 rounded font-mono text-[9px] space-y-1 ${theme.id === 'elegant' ? 'bg-[#0d1117] border border-[#30363d]' : 'bg-black/45'}`}>
              <div className="flex justify-between text-zinc-400">
                <span>Relay Path:</span>
                <span className={mevShieldEnabled ? 'text-teal-400 font-bold' : 'text-rose-400'}>
                  {mevShieldEnabled ? '⚡ Private RPC (Flashbots)' : '⚠️ Open Mempool'}
                </span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Frontrun Threat:</span>
                <span>
                  {mevShieldEnabled ? '0.00% (Shielded)' : 'High (Sandwich Alert)'}
                </span>
              </div>
            </div>
          </div>

          {/* Web3 Simulated Wallet Widget */}
          <div className={`p-3 border-b ${theme.id === 'elegant' ? 'border-[#30363d] bg-[#161b22]/20' : 'border-zinc-800 bg-black/10'} space-y-2`}>
            <div className="flex justify-between items-center">
              <span className={`text-[10px] uppercase tracking-wider font-bold ${theme.id === 'elegant' ? 'text-[#8b949e]' : 'text-zinc-500'}`}>
                🔑 OPERATOR WALLET
              </span>
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (walletConnected) {
                    setWalletConnected(false);
                    updateWalletInConfigFile(false, walletAddress, walletPrivateKey, walletGasBuffer);
                    setTerminalLines(prev => [...prev, { id: `toggle-w-disc-${Date.now()}`, type: 'system', text: '✔ Wallet disconnected via widget.' }]);
                  } else {
                    try {
                      await connectMetaMask();
                    } catch (err) {
                      // Handled inside connectMetaMask
                    }
                  }
                }}
                className={`text-[8px] font-mono px-2 py-0.5 rounded cursor-pointer select-none transition ${
                  walletConnected
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/40 font-bold'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-750/60'
                }`}
              >
                {walletConnected ? 'DISCONNECT' : 'CONNECT'}
              </button>
            </div>
            
            <div className={`p-2 rounded font-mono text-[9px] space-y-1 ${theme.id === 'elegant' ? 'bg-[#0d1117] border border-[#30363d]' : 'bg-black/45'}`}>
              <div className="flex justify-between text-zinc-400">
                <span>Account:</span>
                <span className="text-[9px] text-zinc-300 truncate max-w-[120px] select-all" title={walletAddress}>
                  {walletConnected ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Simulated Default'}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Real Balance:</span>
                <span className="text-teal-400 font-medium">
                  {realBalance !== null ? `${realBalance.toFixed(5)} ETH` : '0.00000 ETH'}
                </span>
              </div>
              <div className="flex justify-between text-zinc-500 text-[8px] leading-tight">
                <span>Quick Actions:</span>
                <div className="flex gap-2">
                  <span 
                    onClick={() => {
                      fetchRealBalance();
                      setTerminalLines(prev => [...prev, { id: `quick-bal-chk-${Date.now()}`, type: 'system', text: `[ON-CHAIN] Polling RPC node for address ${walletAddress} balance on ${activeChain.toUpperCase()}...` }]);
                    }}
                    className="text-amber-500/85 hover:text-amber-400 underline cursor-pointer"
                  >
                    Refresh Balance
                  </span>
                  <span>•</span>
                  <span 
                    onClick={() => {
                      if (!walletConnected) {
                        connectMetaMask().catch(() => {});
                      } else {
                        setWalletConnected(false);
                      }
                    }}
                    className="text-sky-400 hover:text-sky-300 underline cursor-pointer"
                  >
                    Sync Provider
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* VPS Autopilot Sidebar Widget */}
          <div className={`p-3 border-b ${theme.id === 'elegant' ? 'border-[#30363d] bg-[#161b22]/20' : 'border-zinc-800 bg-black/10'} space-y-2`}>
            <div className="flex justify-between items-center">
              <span className={`text-[10px] uppercase tracking-wider font-bold ${theme.id === 'elegant' ? 'text-[#8b949e]' : 'text-zinc-500'}`}>
                🤖 VPS AUTOPILOT ENGINE
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setVpsPanelOpen(!vpsPanelOpen);
                  if (!vpsPanelOpen) {
                    setTerminalLines(prev => [...prev, { id: `vps-open-${Date.now()}`, type: 'system', text: '🤖 Launched VPS Autopilot Monitor interface.' }]);
                  }
                }}
                className={`text-[8px] font-mono px-2 py-0.5 rounded cursor-pointer select-none transition ${
                  vpsPanelOpen
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/40 font-bold font-mono'
                    : 'bg-zinc-805 text-zinc-400 border border-zinc-750/60 font-mono'
                }`}
              >
                {vpsPanelOpen ? 'OPEN' : 'TUTORIAL'}
              </button>
            </div>
            
            <div className={`p-2 rounded font-mono text-[9px] space-y-1 ${theme.id === 'elegant' ? 'bg-[#0d1117] border border-[#30363d]' : 'bg-black/45'}`}>
              <div className="flex justify-between text-zinc-400">
                <span>Bot Autopilot:</span>
                <span className={vpsAutopilotOn ? 'text-teal-400 font-bold' : 'text-zinc-500'}>
                  {vpsAutopilotOn ? '● ACTIVE (24/7)' : '○ INACTIVE'}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>VPS Server:</span>
                <span className="text-zinc-500">
                  {vpsAutopilotOn ? '🇺🇸 NY-Node03' : 'READY/IDLE'}
                </span>
              </div>
              <div className="flex justify-between text-zinc-500 text-[8px] leading-tight pt-1">
                <span>Control Mode:</span>
                <span 
                  onClick={() => {
                    if (!vpsPanelOpen) {
                      setVpsPanelOpen(true);
                    }
                    setVpsAutopilotOn(!vpsAutopilotOn);
                  }}
                  className="text-emerald-500 hover:text-emerald-400 underline cursor-pointer font-bold"
                >
                  {vpsAutopilotOn ? 'Stop Bot' : 'Start Autopilot'}
                </span>
              </div>
            </div>
          </div>

          {/* Theme selection panel */}
          <div className="p-3 bg-zinc-950/20 space-y-3">
            <div className="space-y-1">
              <span className={`text-[10px] uppercase tracking-wider font-bold ${theme.id === 'elegant' ? 'text-[#484f58]' : 'text-zinc-500'}`}>Theme Presets</span>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(THEMES).map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheme(t);
                    }}
                    title={t.name}
                    className={`text-[9px] px-1.5 py-1 rounded border capitalize cursor-pointer text-center transition ${
                      theme.id === t.id 
                        ? theme.id === 'elegant'
                          ? 'bg-[#1f2428] border-[#58a6ff] text-[#58a6ff] font-bold'
                          : 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' 
                        : theme.id === 'elegant'
                          ? 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:border-[#8b949e] hover:text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {t.id.replace('-',' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className={`text-[10px] uppercase font-bold ${theme.id === 'elegant' ? 'text-[#484f58]' : 'text-zinc-500'}`}>CRT Filter</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCrtEnabled(!crtEnabled);
                }}
                className={`text-[9px] px-2 py-0.5 rounded cursor-pointer transition ${
                  crtEnabled 
                    ? theme.id === 'elegant'
                      ? 'bg-[#1f2428] border border-[#58a6ff]/40 text-[#55aaff] font-bold'
                      : 'bg-zinc-800 border border-emerald-500/40 text-emerald-400 font-bold' 
                    : theme.id === 'elegant'
                      ? 'bg-zinc-950 border border-[#30363d] text-[#484f58]'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-500'
                }`}
              >
                {crtEnabled ? 'ACTIVE SCANLINES' : 'OFF'}
              </button>
            </div>
          </div>

        </aside>
      )}

      {/* Main interactive dynamic segment displaying terminal outputs or NanoEditor window */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-h-[350px]">
        {!activeEditor && (
          /* SEGMENTED COCKPIT NAVIGATION DECK BAR */
          <div className={`flex flex-wrap items-center px-4 py-2 border-b gap-1.5 select-none shrink-0 ${
            theme.id === 'elegant' ? 'bg-[#161b22] border-[#30363d]' : 'bg-[#03060a] border-zinc-900/80'
          }`}>
            {[
              { id: 'dashboard', label: '📊 Copilot Dashboard' },
              { id: 'console', label: '📟 Interactive Shell' },
              { id: 'vps', label: '🤖 Autopilot VPS' },
              { id: 'files', label: '📁 Code blueprints' }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTab(t.id as any);
                  if (t.id === 'vps') {
                    setVpsPanelOpen(true);
                  } else {
                    setVpsPanelOpen(false);
                  }
                }}
                className={`px-3 py-1 text-[9.5px] uppercase font-mono font-black tracking-wider rounded border transition duration-150 cursor-pointer ${
                  activeTab === t.id
                    ? theme.id === 'elegant'
                      ? 'bg-[#1f2428] border-[#58a6ff] text-[#58a6ff]'
                      : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-bold shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                    : theme.id === 'elegant'
                      ? 'bg-transparent border-transparent text-[#8b949e] hover:text-white'
                      : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        {activeEditor ? (
          <NanoEditor
            fileName={activeEditor.fileName}
            initialContent={activeEditor.content}
            theme={theme}
            onSave={(newContent) => {
              // 1. Write back content to our local state filesystem
              const updatedFs = { ...fs };
              const successSaved = writeFileByPath(updatedFs, activeEditor.path, activeEditor.fileName, newContent);
              
              if (successSaved) {
                setFs(updatedFs);
                // Also update active editor content state
                setActiveEditor(prev => prev ? { ...prev, content: newContent } : null);

                // Intercept and sync config.json parameters if edited manually
                if (activeEditor.fileName === 'config.json') {
                  try {
                    const parsed = JSON.parse(newContent);
                    if (parsed && typeof parsed.mevShieldEnabled !== 'undefined') {
                      setMevShieldEnabled(!!parsed.mevShieldEnabled);
                    }
                    if (parsed && parsed.wallet) {
                      setWalletConnected(!!parsed.wallet.connected);
                      if (parsed.wallet.address) setWalletAddress(parsed.wallet.address);
                      if (parsed.wallet.privateKey) setWalletPrivateKey(parsed.wallet.privateKey);
                      if (typeof parsed.wallet.gasBufferAllocationEth !== 'undefined') {
                        setWalletGasBuffer(Number(parsed.wallet.gasBufferAllocationEth));
                      }
                    }
                  } catch (e) {
                    // Ignore parse errors on malformed configurations
                  }
                }
              }
            }}
            onClose={() => setActiveEditor(null)}
          />
        ) : activeTab === 'dashboard' ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#030507]">
            {/* Glowing informational banner matching real-world defi-bot updates */}
            <div className="bg-emerald-500/5 border-b border-emerald-500/10 px-4 py-1.5 text-[8.5px] font-mono text-emerald-400 font-bold flex justify-between items-center shrink-0">
              <span className="flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                COGNITIVE PILOT PIPELINE RUNNING: DETECTING AND RE-ROUTING ARBITRAGE PATHWAYS ON {activeChain.toUpperCase()}
              </span>
              <span className="text-zinc-[400] font-sans text-[9px] text-zinc-500">SYSTEM-STATUS: UNPROTECTED_BLOCK_SAFE</span>
            </div>
            
            <DeFiDashboard
              theme={theme}
              activeChain={activeChain}
              tokens={tokens}
              opportunities={opportunities}
              recentSwaps={recentSwaps}
              totEarningsUsd={totEarningsUsd}
              earningsHistory={earningsHistory}
              gasPriceGwei={gasPriceGwei}
              mevShieldEnabled={mevShieldEnabled}
              walletConnected={walletConnected}
              walletAddress={walletAddress}
              executeCommand={executeCommand}
              slippage={slippage}
              tradeSize={tradeSize}
              gasLimit={gasLimit}
              executionMode={executionMode}
              setExecutionMode={setExecutionMode}
            />

            {/* Outflow Console log block inside Dashboard viewpoint */}
            <div className={`h-[180px] border-t flex flex-col overflow-hidden shrink-0 ${
              theme.id === 'elegant' ? 'border-[#30363d] bg-[#0c0f13]' : 'border-zinc-900 bg-[#020405]'
            }`}>
              <div className="flex justify-between items-center px-4 py-1 text-[8.5px] font-mono text-zinc-500 border-b border-zinc-950 bg-black/40">
                <span className="font-extrabold text-[#7ce382] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  COCKPIT LOG FLOW
                </span>
                <span>Type &#39;help&#39; below for automated command injection manual</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-[9px] terminal-scrollbar select-text leading-tight bg-black/30">
                {terminalLines.slice(-15).map(line => (
                  <div key={line.id} className={`leading-normal ${
                    line.type === 'error' ? 'text-rose-400 font-bold' :
                    line.type === 'success' ? 'text-emerald-400 font-bold' :
                    line.type === 'system' ? 'text-cyan-400 font-bold' :
                    line.type === 'ascii' ? 'text-zinc-600 font-light text-[8px] whitespace-pre-wrap leading-none text-zinc-500' :
                    theme.id === 'elegant' ? 'text-[#c9d1d9]' : theme.textColor
                  }`}>
                    {line.type === 'input' ? `guest@node-03:~# ${line.text}` : line.text}
                  </div>
                ))}
                <div ref={lineEndRef} />
              </div>
              <form onSubmit={handleFormSubmit} className="flex items-center gap-1.5 p-2 px-3 border-t border-zinc-950 bg-black/30 font-mono">
                <span className="text-zinc-500 text-[9px] font-bold">guest@node-03:~#</span>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`flex-1 bg-transparent border-none outline-none p-0 focus:ring-0 font-mono text-xs caret-transparent ${theme.id === 'elegant' ? 'text-[#c9d1d9]' : 'text-zinc-100'}`}
                  spellCheck="false"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  placeholder="Inject arbitrage triggers here or run backtests (e.g. help, tokens, backtest)..."
                />
                <span className={`w-1.5 h-3.5 shrink-0 animate-[pulse-fast_1s_infinite] ${theme.id === 'elegant' ? 'bg-[#c9d1d9]' : theme.cursorColor}`} />
              </form>
            </div>
          </div>
        ) : activeTab === 'files' ? (
          <div className="flex-1 p-5 overflow-y-auto bg-[#030507] select-text font-sans space-y-5 terminal-scrollbar">
            <div>
              <h2 className="text-base font-black font-mono text-cyan-400 flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400 animate-pulse" />
                SECURE SMART CONTRACT TEMPLATE BLUEPRINTS
              </h2>
              <p className="text-xs text-zinc-450 leading-relaxed mt-1 max-w-2xl font-mono">
                We generated working Solidity contract schemas and secure NodeJS/JavaScript flash loan pipeline triggers directly in your explorer. Toggle to view or double click on the left filesystem tree to edit!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: 'meridian_pipeline.md',
                  title: 'Meridian Loan Pipeline Manual',
                  desc: 'Advanced instruction guide combining uncollateralized Aave borrow pools, multi-hop routes, and Flashbots Private RPC integrations.',
                  fileKey: 'meridian_pipeline.md',
                  badge: 'Markdown Manual'
                },
                {
                  name: 'meridian_agent_flash.js',
                  title: 'Meridian Secure Execution Script',
                  desc: 'JavaScript client triggering Web3 smart contract calls, matching gas feeds, and executing Flash loans securely.',
                  fileKey: 'meridian_agent_flash.js',
                  badge: 'Web3 Javascript'
                },
                {
                  name: 'real_world_setup.md',
                  title: 'Real-World Production Setup',
                  desc: 'Checklist manual detailing step-by-step how to deploy Aave flash loan code to actual Ethereum Layer-2 networks.',
                  fileKey: 'real_world_setup.md',
                  badge: 'Setup Manual'
                },
                {
                  name: 'deploy_execute.js',
                  title: 'Solidity Smart Contract Deployer',
                  desc: 'JavaScript logic interacting with HardHat/Foundry to deploy fully atomic uncollateralized trade code to live contract nodes.',
                  fileKey: 'deploy_execute.js',
                  badge: 'Deployment script'
                }
              ].map((col, i) => (
                <div key={i} className="p-4 bg-zinc-950/40 border border-zinc-900 hover:border-zinc-805 rounded-xl relative overflow-hidden group flex flex-col justify-between">
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between items-start font-mono">
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-950 border border-zinc-900 text-zinc-500">
                        {col.badge}
                      </span>
                      <span className="text-[10px] text-zinc-500 italic">/{col.name}</span>
                    </div>
                    <h4 className="text-xs font-mono font-bold text-zinc-100 group-hover:text-cyan-400 transition-colors uppercase">
                      {col.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                      {col.desc}
                    </p>
                  </div>
                  <div className="pt-3.5 flex justify-end font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        const targetItem = fs.children[col.fileKey];
                        if (targetItem && targetItem.type === 'file') {
                          handleSidebarFileClick(targetItem, ['~']);
                        }
                      }}
                      className="text-[10px] bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-cyan-400 font-bold px-3 py-1 rounded transition flex items-center gap-1 cursor-pointer font-mono"
                    >
                      Open Blueprint Editor <CornerDownRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : vpsPanelOpen ? (
          /* Interactive visual No-Code Amateur VPS Hub overlay */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden font-mono bg-zinc-950/45 text-zinc-300">
            {/* Left side: Animated simulator console & VPS metrics */}
            <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-900 p-4 overflow-y-auto terminal-scrollbar space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${vpsAutopilotOn ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${vpsAutopilotOn ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                      VIRTUAL AUTOMATOR-NODE-3 <span className="text-[10px] text-zinc-500 font-normal">NY-EAST</span>
                    </h3>
                    <p className="text-[8px] text-zinc-500">OS: Ubuntu Server 22.04 LTS (HVM)</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded border ${
                    vpsAutopilotOn 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700/50'
                  }`}>
                    {vpsAutopilotOn ? 'AUTOPILOT BOT RUNNING' : 'BOT POWERED OFF'}
                  </span>
                </div>
              </div>

              {/* Server hardware animation meters */}
              <div className="grid grid-cols-3 gap-2.5 bg-black/30 p-2.5 rounded border border-zinc-900">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 text-nowrap">
                    <span>CPU LOAD</span>
                    <span className={vpsAutopilotOn ? 'text-cyan-400' : 'text-zinc-500'}>
                      {vpsAutopilotOn ? `${vpsStats.cpu}%` : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1 rounded overflow-hidden">
                    <div 
                      className="bg-cyan-400 h-full rounded transition-all duration-1000" 
                      style={{ width: vpsAutopilotOn ? `${vpsStats.cpu}%` : '0%' }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 text-nowrap">
                    <span>RAM USED</span>
                    <span className={vpsAutopilotOn ? 'text-purple-400' : 'text-zinc-500'}>
                      {vpsAutopilotOn ? `${vpsStats.ram}MB` : '42MB'}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1 rounded overflow-hidden">
                    <div 
                      className="bg-purple-400 h-full rounded transition-all duration-1000" 
                      style={{ width: vpsAutopilotOn ? `${(vpsStats.ram/1024)*100}%` : '4%' }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 text-nowrap">
                    <span>UPTIME</span>
                    <span className={vpsAutopilotOn ? 'text-teal-400' : 'text-zinc-500'}>
                      {vpsStats.uptime}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1 rounded overflow-hidden">
                    <div 
                      className={`h-full rounded ${vpsAutopilotOn ? 'bg-teal-400 animate-pulse' : 'bg-zinc-700'}`} 
                      style={{ width: vpsAutopilotOn ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Simulated terminal logging scrolling feed */}
              <div className="flex-1 min-h-[160px] bg-black/80 rounded border border-zinc-900 p-2.5 flex flex-col space-y-1.5 h-64 overflow-y-auto terminal-scrollbar select-text leading-relaxed">
                {vpsLogs.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-zinc-500 text-xs text-wrap leading-normal font-sans">
                      Autopilot client server is booted. Start the bot below to begin automated 24/7 scanning!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setVpsSetupComplete(true);
                        setVpsAutopilotOn(true);
                      }}
                      className="mt-3 text-[10px] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded cursor-pointer transition flex items-center gap-1.5 uppercase font-bold text-nowrap"
                    >
                      <Play className="w-3 h-3" /> Boot Bot Autopilot
                    </button>
                  </div>
                ) : (
                  vpsLogs.map((log, i) => {
                    let logColor = 'text-zinc-400';
                    if (log.includes('SUCCESS') || log.includes('COMPLETE')) logColor = 'text-emerald-400 font-bold';
                    if (log.includes('WARNING') || log.includes('ALERT')) logColor = 'text-amber-400 font-medium';
                    if (log.includes('EXECUTION')) logColor = 'text-sky-400';
                    return (
                      <div key={i} className={`text-[10px] font-mono leading-relaxed tracking-wide ${logColor}`}>
                        {log}
                      </div>
                    );
                  })
                )}
                <div ref={lineEndRef} />
              </div>

              {/* Bot Control Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    const next = !vpsAutopilotOn;
                    setVpsAutopilotOn(next);
                    if (next) {
                      setVpsSetupComplete(true);
                    }
                  }}
                  className={`flex-1 text-[10px] p-2.5 rounded font-mono font-bold uppercase transition cursor-pointer text-center border flex items-center justify-center gap-1.5 ${
                    vpsAutopilotOn
                      ? 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 text-rose-400'
                      : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${vpsAutopilotOn ? 'rotate-90 text-rose-455' : 'text-emerald-400'}`} />
                  {vpsAutopilotOn ? "Turn Bot Autopilot OFF" : "Turn Bot Autopilot ON"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVpsLogs([]);
                    setVpsStats({ cpu: 12, ram: 410, uptime: '00:00:00' });
                    setVpsAutopilotOn(false);
                  }}
                  className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] px-3.5 py-2.5 rounded font-mono font-bold uppercase transition text-zinc-400 cursor-pointer text-center text-nowrap"
                >
                  Clear Screen
                </button>
                <button
                  type="button"
                  onClick={() => setVpsPanelOpen(false)}
                  className="bg-[#24292e] hover:bg-[#2f363d] border border-zinc-800 text-[10px] px-3.5 py-2.5 rounded font-mono font-bold uppercase transition text-teal-400 cursor-pointer text-center text-nowrap"
                >
                  ↩ Exit Guide
                </button>
              </div>
            </div>

            {/* Right side: No-Code Beginner Friendly Explainer and Guided Setup */}
            <div className="w-full lg:w-80 p-4 overflow-y-auto terminal-scrollbar flex flex-col space-y-4 bg-zinc-950/25 border-t lg:border-t-0 border-zinc-900 select-text font-sans">
              <div>
                <h4 className="text-xs font-mono uppercase font-black tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  NO-CODE AUTOMATION GURU
                </h4>
                <p className="text-[11px] text-zinc-405 leading-relaxed mt-1.5">
                  How does automated flash loan execution work in the real world? Learn the three basic concepts you need to duplicate this on your own server!
                </p>
              </div>

              {/* Three simple concept cards */}
              <div className="space-y-3 font-sans">
                <div className="p-3 bg-zinc-950/40 rounded border border-zinc-900/60 border-l-2 border-l-cyan-400 space-y-1">
                  <h5 className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-wide">
                    1. The VPS server computer
                  </h5>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    You do not need to keep your home laptop running 24/7. Instead, you rent a small cloud server computer (VPS) from <strong>DigitalOcean</strong> or <strong>Vultr</strong> for only <strong>$3.50/month</strong>. It stays awake constantly scanning.
                  </p>
                </div>

                <div className="p-3 bg-zinc-950/40 rounded border border-zinc-900/60 border-l-2 border-l-emerald-400 space-y-1">
                  <h5 className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-wide">
                    2. Uncollateralized free loans
                  </h5>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Flash loans do not require security deposits! If a bot finds a price gap on <strong>Arbitrum</strong> or <strong>Base</strong>, it borrows $100,000, buys and sells instantly, takes the profit, and repays the lender. No deposit needed.
                  </p>
                </div>

                <div className="p-3 bg-zinc-950/40 rounded border border-zinc-900/60 border-l-2 border-l-purple-400 space-y-1">
                  <h5 className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-wide">
                    3. Tiny gas setup on Layer-2s
                  </h5>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    The flash loan itself costs you $0 in collateral, but you pay about <strong>$0.01 to $0.03</strong> in L2 gas to record details on the blockchain. Put $5 of Ethereum in your gas wallet, and you can test loops securely!
                  </p>
                </div>
              </div>

              <div className="p-3 bg-teal-500/5 rounded border border-teal-500/25 text-[10px] text-teal-300 flex flex-col gap-1.5 leading-relaxed font-sans">
                <span className="font-extrabold uppercase font-mono tracking-wider text-[9px] text-teal-400 block border-b border-teal-500/20 pb-0.5">
                  ⭐ NO-CODE SIDEBAR WALKTHROUGH
                </span>
                We generated real template scripts in the left file explorer! Explore <strong>real_world_setup.md</strong> and <strong>deploy_execute.js</strong>, as well as our brand-new <strong>meridian_pipeline.md</strong> and <strong>meridian_agent_flash.js</strong> files! Double-click them on the left sidebar to read, edit, and download!
              </div>
            </div>
          </div>
        ) : (
          /* Standard terminal display stdout lines */
          <div className="flex-1 flex flex-col p-4 overflow-y-auto terminal-scrollbar select-text">
            
            {/* Terminal Outputs */}
            <div className={`flex-1 flex flex-col space-y-1.5 font-mono ${theme.textColor}`}>
              {terminalLines.map((line) => {
                if (line.type === 'input') {
                  const chainRef = activeChain;
                  return (
                    <div key={line.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1 mt-1 font-bold">
                      {theme.id === 'elegant' ? (
                        <div className="flex items-center gap-1 select-none text-[11px] sm:text-xs">
                          <span className="text-[#7ee787]">➜</span>
                          <span className="text-[#58a6ff]">{line.dir?.replace('~', `operator@${chainRef}`)}</span>
                          <span className="text-[#d29922]">network:({chainRef})</span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs">[{`operator@${chainRef}:${line.dir}`}]</span>
                      )}
                      <span className={`ml-1 text-[11px] sm:text-xs ${theme.textColor}`}>{line.text}</span>
                    </div>
                  );
                }

                // Color selectors
                let textClass = 'text-current';
                if (line.type === 'error') textClass = 'text-rose-400';
                if (line.type === 'success') textClass = 'text-teal-400';
                if (line.type === 'system') textClass = 'text-cyan-400/90 font-semibold';
                if (line.type === 'ascii') textClass = 'text-zinc-500 tracking-wider whitespace-pre leading-none';

                // Elegant theme specific color tuning overrides
                if (theme.id === 'elegant') {
                  if (line.type === 'success') textClass = 'text-[#7ee787]';
                  if (line.type === 'error') textClass = 'text-[#f85149]';
                  if (line.type === 'system') textClass = 'text-[#58a6ff] font-semibold';
                }

                return (
                  <div key={line.id} className={`leading-normal text-[11px] sm:text-xs ${textClass}`}>
                    {line.text}
                  </div>
                );
              })}
              <div ref={lineEndRef} />
            </div>

            {/* Quick action badges for fast testing */}
            <div className="flex flex-wrap gap-1.5 py-2 mt-4 border-t border-zinc-800/20">
              <button 
                onClick={() => {
                  setVpsPanelOpen(!vpsPanelOpen);
                  if (!vpsPanelOpen) {
                    setTerminalLines(prev => [...prev, { id: `vps-open-${Date.now()}`, type: 'system', text: '🤖 Launched VPS Autopilot Monitor interface.' }]);
                  }
                }}
                className={`text-[9.5px] px-2.5 py-1 rounded cursor-pointer font-bold flex items-center gap-1 transition ${
                  vpsPanelOpen
                    ? 'bg-sky-500/20 border border-sky-450 text-sky-400 animate-pulse'
                    : theme.id === 'elegant' 
                      ? 'bg-[#21262d] border border-[#30363d] text-[#58a6ff] hover:bg-[#30363d]' 
                      : 'bg-zinc-900 border border-zinc-805 text-emerald-400 hover:text-white hover:border-emerald-500/50'
                }`}
              >
                <span>🤖 VPS Autopilot Hub</span>
                {vpsAutopilotOn && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block shrink-0" />}
              </button>
              <button 
                onClick={() => executeCommand('arb')}
                className={`text-[9px] px-2 py-1 rounded cursor-pointer font-bold ${
                  theme.id === 'elegant' 
                    ? 'bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-white' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Scan Spreads
              </button>
              <button 
                onClick={() => executeCommand('tokens')}
                className={`text-[9px] px-2 py-1 rounded cursor-pointer font-bold ${
                  theme.id === 'elegant' 
                    ? 'bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-white' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Token Prices
              </button>
              <div 
                className="relative inline-flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-950/40 border border-zinc-900 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const chains: ('ethereum' | 'arbitrum' | 'base' | 'polygon')[] = ['ethereum', 'arbitrum', 'base', 'polygon'];
                  const nextIdx = (chains.indexOf(activeChain) + 1) % chains.length;
                  executeCommand(`network ${chains[nextIdx]}`);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                title="Active scan network. Click to cycle network."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className={`text-[9px] font-bold ${theme.id === 'elegant' ? 'text-zinc-500' : 'text-zinc-400'}`}>🌐 NETWORK:</span>
                <span className="text-[9px] font-black text-amber-400 font-mono tracking-wide uppercase select-none hover:text-white transition">
                  {activeChain}
                </span>
              </div>
              <button 
                onClick={() => executeCommand('backtest SOL 50')}
                className={`text-[9px] px-2 py-1 rounded cursor-pointer font-bold ${
                  theme.id === 'elegant' 
                    ? 'bg-[#7ee787]/10 border border-[#7ee787]/30 text-[#7ee787] hover:bg-[#7ee787]/20 hover:text-white' 
                    : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 hover:text-white font-mono'
                }`}
              >
                ⚡ Backtest SOL ($50 Micro)
              </button>
              <button 
                onClick={() => executeCommand('backtest ETH 50000')}
                className={`text-[9px] px-2 py-1 rounded cursor-pointer font-bold ${
                  theme.id === 'elegant' 
                    ? 'bg-[#58a6ff]/10 border border-[#58a6ff]/40 text-[#58a6ff] hover:bg-[#30363d] hover:text-white' 
                    : 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:text-white font-mono'
                }`}
              >
                ⚡ Backtest ETH ($50k)
              </button>
              <button 
                onClick={() => executeCommand('track stop')}
                className={`text-[9px] px-2 py-1 rounded cursor-pointer font-bold ${
                  theme.id === 'elegant' 
                    ? 'bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-white' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Unsubscribe Logs
              </button>
            </div>

            {/* Terminal interactive formulation cursor input line */}
            <form onSubmit={handleFormSubmit} className={`flex items-center gap-1.5 select-none pt-2 border-t ${theme.id === 'elegant' ? 'border-[#30363d]' : 'border-zinc-800/20'}`}>
              {theme.id === 'elegant' ? (
                <span className="font-extrabold shrink-0 text-xs flex items-center gap-1.5">
                  <span className="text-[#7ee787]">➜</span>
                  <span className="text-[#58a6ff]">{getRelativePathStr().replace('~', `operator@${activeChain}`)}</span>
                  <span className="text-[#d29922]">network:({activeChain})</span>
                  <span className="text-[#f85149]">✗</span>
                </span>
              ) : (
                <span className={`font-extrabold shrink-0 text-xs ${theme.primaryColor} flex items-center`}>
                  operator@${activeChain}:{getRelativePathStr()}
                  <ChevronRight className="w-4 h-4 inline-block animate-pulse text-emerald-400" />
                </span>
              )}
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`flex-1 bg-transparent border-none outline-none p-0 m-0 focus:ring-0 font-mono text-xs sm:text-sm auto-focus caret-transparent ${theme.id === 'elegant' ? 'text-[#c9d1d9]' : 'text-zinc-100'}`}
                spellCheck="false"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
              <span className={`w-1.5 h-3.5 shrink-0 animate-[pulse-fast_1s_infinite] ${theme.id === 'elegant' ? 'bg-[#c9d1d9]' : theme.cursorColor}`} />
            </form>

          </div>
        )}
      </div>

      {/* Button to toggle navigation collapsible panel representation bar */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsSidebarOpen(!isSidebarOpen);
        }}
        className={`absolute top-4 right-4 z-20 p-1.5 ${
          theme.id === 'elegant'
            ? 'bg-[#161b22] border border-[#30363d] text-[#8b949e]'
            : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400'
        } hover:text-white rounded shadow-lg cursor-pointer transition`}
      >
        {isSidebarOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>

    </div>
  );
}
