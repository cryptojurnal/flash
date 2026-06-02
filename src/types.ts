export type TerminalTheme = 'matrix' | 'amber' | 'dracula' | 'cyberpunk' | 'retro-light' | 'nord' | 'elegant';

export interface TerminalThemeConfig {
  id: TerminalTheme;
  name: string;
  bgColor: string;
  textColor: string;
  primaryColor: string;
  secondaryColor: string;
  cursorColor: string;
  borderColor: string;
  fontFamily: string;
}

export interface FileItem {
  type: 'file';
  name: string;
  content: string;
}

export interface DirectoryItem {
  type: 'dir';
  name: string;
  children: Record<string, FileItem | DirectoryItem>;
}

export type FileSystemItem = FileItem | DirectoryItem;

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system' | 'ascii';
  text: string;
  dir?: string;
}

// Dex Ticker Interfaces
export interface CryptoToken {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  dexRates: Record<string, number>; // Dex Name -> Token Price
  volume24h: number;
  liquidity: number;
}

export interface ArbitrageOpportunity {
  id: string;
  tokenSymbol: string;
  buyFromDex: string;
  buyPrice: number;
  sellToDex: string;
  sellPrice: number;
  spreadPercentage: number;
  expectedProfitUsd: number;
  riskScore: 'Low' | 'Medium' | 'High';
  expiresAt?: number;
  durationMax?: number;
  status?: 'ACTIVE' | 'SOLD_OUT' | 'EXPIRED' | 'EXECUTING' | 'EXECUTED';
  filledBy?: string;
}

export interface SwapLog {
  id: string;
  timestamp: string;
  dex: string;
  type: 'SWAP' | 'ARBITRAGE';
  inputAmount: string;
  inputToken: string;
  outputAmount: string;
  outputToken: string;
  profitUsd?: number;
  chain?: string;
}
