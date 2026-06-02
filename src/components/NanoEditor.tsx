import React, { useState, useEffect } from 'react';
import { Save, X, Info } from 'lucide-react';
import { TerminalThemeConfig } from '../types';

interface NanoEditorProps {
  fileName: string;
  initialContent: string;
  theme: TerminalThemeConfig;
  onSave: (content: string) => void;
  onClose: () => void;
}

export default function NanoEditor({ fileName, initialContent, theme, onSave, onClose }: NanoEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showStatusMsg, setShowStatusMsg] = useState('');

  useEffect(() => {
    setContent(initialContent);
    setHasUnsavedChanges(false);
  }, [initialContent]);

  const handleSave = () => {
    onSave(content);
    setHasUnsavedChanges(false);
    setShowStatusMsg('✔ File successfully synchronized to virtual disk.');
    setTimeout(() => setShowStatusMsg(''), 3000);
  };

  return (
    <div className={`flex-1 flex flex-col font-mono text-xs h-full relative ${theme.id === 'elegant' ? 'bg-[#0d1117] text-[#c9d1d9]' : 'bg-black text-emerald-300'}`}>
      {/* Editor Header Navigation bar */}
      <div className={`px-4 py-2 flex items-center justify-between border-b ${theme.id === 'elegant' ? 'bg-[#161b22] border-[#30363d]' : 'bg-zinc-950 border-zinc-800'}`}>
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-[#8b949e]">NANO PRO:</span>
          <span>/{fileName}</span>
          {hasUnsavedChanges && <span className="text-amber-500 ml-1 font-bold animate-pulse">[modified]</span>}
        </div>
        <div className="flex items-center gap-2">
          {showStatusMsg && (
            <span className={`text-[11px] font-bold mr-2 ${theme.id === 'elegant' ? 'text-[#7ee787]' : 'text-emerald-400 animate-pulse'}`}>
              {showStatusMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            title="Save changes (Ctrl+S)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded cursor-pointer transition text-[11px] ${
              theme.id === 'elegant'
                ? 'bg-[#21262d] border border-[#30363d] text-[#c9d1d9] hover:bg-[#30363d]'
                : 'bg-zinc-900 border border-zinc-800 text-emerald-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Save className="w-3 h-3" />
            <span>SAVE</span>
          </button>
          
          <button
            onClick={onClose}
            title="Close editor"
            className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition text-[11px] ${
              theme.id === 'elegant'
                ? 'text-[#8b949e] hover:text-[#f85149]'
                : 'text-zinc-400 hover:text-rose-400'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Text Content area */}
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setHasUnsavedChanges(true);
        }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
          }
        }}
        className={`flex-1 p-4 resize-none outline-none border-none overflow-y-auto leading-relaxed select-text font-mono text-xs sm:text-sm bg-transparent w-full ${
          theme.id === 'elegant' ? 'text-[#c9d1d9] caret-[#c9d1d9]' : 'text-emerald-300/90'
        }`}
        spellCheck="false"
        placeholder="Type text or JSON properties in here..."
      />

      {/* Editor footer info drawer */}
      <div className={`px-4 py-1.5 flex items-center justify-between border-t text-[10px] uppercase font-bold select-none ${
        theme.id === 'elegant' ? 'bg-[#161b22] border-[#30363d] text-[#8b949e]' : 'bg-zinc-950 border-zinc-900 text-zinc-500'
      }`}>
        <div className="flex items-center gap-1.5">
          <Info className="w-3 h-3 text-[#58a6ff]" />
          <span>Ctrl+S to save changes</span>
        </div>
        <div className="flex items-center gap-3">
          <span>LINES: {content.split('\n').length}</span>
          <span>CHARS: {content.length}</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}
