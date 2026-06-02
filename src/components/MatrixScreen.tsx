import React, { useEffect, useRef } from 'react';

interface MatrixScreenProps {
  onClose: () => void;
  textColor?: string;
  bgColor?: string;
}

export default function MatrixScreen({ onClose, textColor = '#10b981', bgColor = '#09090b' }: MatrixScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fluid sizing
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Grid details
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);

    // Characters matching green rain (Latin alphabets + Greek + numbers)
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$ΞΞΔΠΘΨΩΞΣ₮₿Ξ';

    let animationId: number;

    const draw = () => {
      // Semi-transparent background to create trail effect
      ctx.fillStyle = bgColor === '#faf6ef' ? 'rgba(250, 246, 239, 0.1)' : 'rgba(9, 9, 11, 0.1)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drops when they reach bottom
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [textColor, bgColor]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden cursor-pointer" onClick={onClose}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-6 left-6 font-mono text-xs px-3 py-1.5 bg-black/80 border border-emerald-500/30 text-emerald-400 select-none rounded shadow">
        [SCREENSAVER ACTIVE] Click screen anywhere to exit digital rain
      </div>
    </div>
  );
}
