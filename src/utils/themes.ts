import { TerminalThemeConfig } from '../types';

export const THEMES: Record<string, TerminalThemeConfig> = {
  elegant: {
    id: 'elegant',
    name: 'Elegant Dark (GitHub)',
    bgColor: 'bg-[#0d1117]',
    textColor: 'text-[#c9d1d9]',
    primaryColor: 'text-[#7ee787]',
    secondaryColor: 'text-[#8b949e]',
    cursorColor: 'bg-[#c9d1d9]',
    borderColor: 'border-[#30363d]',
    fontFamily: 'font-mono'
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix Digital (Green)',
    bgColor: 'bg-zinc-950',
    textColor: 'text-emerald-400',
    primaryColor: 'text-emerald-400',
    secondaryColor: 'text-emerald-600',
    cursorColor: 'bg-emerald-400',
    borderColor: 'border-emerald-900/40',
    fontFamily: 'font-mono'
  },
  amber: {
    id: 'amber',
    name: 'Classic Amber Phosphor',
    bgColor: 'bg-amber-950/90',
    textColor: 'text-amber-500',
    primaryColor: 'text-amber-500',
    secondaryColor: 'text-amber-700',
    cursorColor: 'bg-amber-500',
    borderColor: 'border-amber-900/40',
    fontFamily: 'font-mono'
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula Dark',
    bgColor: 'bg-zinc-900',
    textColor: 'text-zinc-100',
    primaryColor: 'text-purple-400',
    secondaryColor: 'text-pink-400',
    cursorColor: 'bg-pink-400',
    borderColor: 'border-purple-900/30',
    fontFamily: 'font-mono'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    bgColor: 'bg-[#0f051d]',
    textColor: 'text-cyan-400',
    primaryColor: 'text-fuchsia-500',
    secondaryColor: 'text-cyan-400',
    cursorColor: 'bg-fuchsia-500',
    borderColor: 'border-fuchsia-500/20',
    fontFamily: 'font-mono'
  },
  nord: {
    id: 'nord',
    name: 'Nordic Frost',
    bgColor: 'bg-[#2e3440]',
    textColor: 'text-[#d8dee9]',
    primaryColor: 'text-[#88c0d0]',
    secondaryColor: 'text-[#81a1c1]',
    cursorColor: 'bg-[#88c0d0]',
    borderColor: 'border-[#4c566a]',
    fontFamily: 'font-mono'
  },
  'retro-light': {
    id: 'retro-light',
    name: 'Vintage Apple II Paper',
    bgColor: 'bg-[#faf6ef]',
    textColor: 'text-[#1c1c1a]',
    primaryColor: 'text-[#4a5840]',
    secondaryColor: 'text-[#a4604d]',
    cursorColor: 'bg-[#1c1c1a]',
    borderColor: 'border-[#d8d3c5]',
    fontFamily: 'font-mono'
  }
};
