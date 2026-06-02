import React from 'react';

export default function CRTOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden rounded-xl">
      {/* Curved CRT Bezel Inner Glow */}
      <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)] bg-transparent" />
      
      {/* Moving Scanline Animation */}
      <div 
        className="absolute w-full h-[3px] bg-white opacity-[0.035] animate-[scanline_8s_linear_infinite]"
        style={{
          boxShadow: '0 0 10px rgba(255,255,255,1)'
        }}
      />
      
      {/* CRT Scanline Grating Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.04),_rgba(0,255,0,0.015),_rgba(0,0,255,0.04))]"
        style={{
          backgroundSize: '100% 4px, 3px 100%'
        }}
      />

      {/* Screen Flicker Effect Simulation */}
      <div className="absolute inset-0 bg-transparent pointer-events-none z-30 opacity-15 animate-[flicker_0.15s_infinite]" />

      <style>{`
        @keyframes scanline {
          0% { top: -5%; }
          100% { top: 105%; }
        }
      `}</style>
    </div>
  );
}
