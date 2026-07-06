import React, { useEffect, useRef } from 'react';

export const HunterTrainingBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Initialize particles
    for (let i = 0; i < 70; i++) {
      const isRed = Math.random() > 0.8;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 2 - 1, // float up faster
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.1,
        color: isRed ? 'rgba(239, 68, 68,' : 'rgba(0, 212, 255,' // Red or Cyan
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = `${p.color}0.8)`;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#00050b]">
      {/* Base gradient with slight crimson tint at bottom */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent opacity-50" />
      
      {/* Intense Hexagon Grid */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='138.564' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0l34.64 20v40L40 80 5.36 60V20z' fill-opacity='0' stroke='%2300d4ff' stroke-width='2'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 138.56px',
          animation: 'pan-background 40s linear infinite'
        }}
      />
      
      {/* Moving Particles */}
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pan-background {
          from { background-position: 0 0; }
          to { background-position: -800px -1385px; }
        }
      `}} />
    </div>
  );
};
