import React, { useEffect, useRef } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

export type ParticleType = 'blue-energy' | 'purple-aura' | 'golden-light' | 'shadow-smoke' | 'fire-sparks' | 'snow' | 'stars';

interface ParticleEngineProps {
  type: ParticleType;
  intensity?: number; // 1-10
  fullScreen?: boolean;
}

export const ParticleEngine: React.FC<ParticleEngineProps> = ({ type, intensity = 5, fullScreen = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reducedMotion } = useSettings();
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = fullScreen ? window.innerWidth : canvas.clientWidth;
    let height = canvas.height = fullScreen ? window.innerHeight : canvas.clientHeight;

    const resize = () => {
      width = canvas.width = fullScreen ? window.innerWidth : canvas.clientWidth;
      height = canvas.height = fullScreen ? window.innerHeight : canvas.clientHeight;
    };

    window.addEventListener('resize', resize);

    // Particle logic
    const particles: any[] = [];
    const count = intensity * (type === 'snow' || type === 'stars' ? 20 : 10);

    for (let i = 0; i < count; i++) {
      particles.push(createParticle(type, width, height));
    }

    function createParticle(ptype: ParticleType, w: number, h: number) {
      const p: any = { x: Math.random() * w, y: Math.random() * h, alpha: Math.random() };
      
      if (ptype === 'blue-energy') {
        p.size = Math.random() * 2 + 1;
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = -Math.random() * 1.5;
        p.color = `rgba(0, 212, 255, ${p.alpha})`;
      } else if (ptype === 'purple-aura') {
        p.size = Math.random() * 3 + 1;
        p.vx = (Math.random() - 0.5) * 0.3;
        p.vy = -Math.random() * 0.5;
        p.color = `rgba(168, 85, 247, ${p.alpha})`;
      } else if (ptype === 'golden-light') {
        p.size = Math.random() * 1.5 + 0.5;
        p.vx = (Math.random() - 0.5) * 0.2;
        p.vy = Math.random() * 0.5 - 1;
        p.color = `rgba(250, 204, 21, ${p.alpha})`;
      } else if (ptype === 'shadow-smoke') {
        p.size = Math.random() * 15 + 5;
        p.vx = (Math.random() - 0.5) * 0.8;
        p.vy = -Math.random() * 1.5;
        p.color = `rgba(0, 0, 0, ${p.alpha * 0.2})`;
      } else if (ptype === 'snow') {
        p.size = Math.random() * 2 + 0.5;
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = Math.random() * 2 + 1;
        p.color = `rgba(255, 255, 255, ${p.alpha})`;
      } else if (ptype === 'stars') {
        p.size = Math.random() * 1.5;
        p.vx = (Math.random() - 0.5) * 0.05;
        p.vy = (Math.random() - 0.5) * 0.05;
        p.color = `rgba(255, 255, 255, ${p.alpha})`;
        p.twinkleSpeed = Math.random() * 0.02 + 0.01;
      }
      return p;
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        ctx.beginPath();
        if (type === 'shadow-smoke') {
          // Soft blur circle for smoke
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gradient;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        } else {
          ctx.fillStyle = p.color;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        }
        ctx.fill();

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Special updates
        if (type === 'stars') {
          p.alpha += p.twinkleSpeed;
          if (p.alpha > 1 || p.alpha < 0) p.twinkleSpeed *= -1;
          p.color = `rgba(255, 255, 255, ${Math.abs(p.alpha)})`;
        }

        // Reset if out of bounds
        if (p.y < -50 || p.y > height + 50 || p.x < -50 || p.x > width + 50) {
          particles[i] = createParticle(type, width, height);
          if (type !== 'snow' && type !== 'stars') {
            particles[i].y = height + 20; // reset to bottom for ascending particles
          } else if (type === 'snow') {
            particles[i].y = -20; // reset to top for descending
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [type, intensity, fullScreen, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas 
      ref={canvasRef} 
      className={`pointer-events-none ${fullScreen ? 'fixed inset-0 z-0' : 'absolute inset-0 w-full h-full'}`}
      style={{ mixBlendMode: type === 'shadow-smoke' ? 'multiply' : 'screen' }}
    />
  );
};
