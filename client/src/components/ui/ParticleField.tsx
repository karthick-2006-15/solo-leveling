import React, { useMemo } from 'react';

const initialParticles = Array.from({ length: 30 }).map((_, i) => {
  const size = Math.random() * 2 + 1; // 1 to 3px
  const left = Math.random() * 100; // 0 to 100vw
  const animationDuration = Math.random() * 15 + 15; // 15s to 30s
  const animationDelay = Math.random() * -30; // negative delay
  const opacity = Math.random() * 0.15 + 0.05; // 0.05 to 0.20
  const isBlue = Math.random() > 0.5;
  const drift = (Math.random() - 0.5) * 40; 

  return {
    id: i,
    size,
    left,
    animationDuration,
    animationDelay,
    opacity,
    isBlue,
    drift
  };
});

const ParticleField: React.FC = () => {
  const particles = useMemo(() => initialParticles, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${p.isBlue ? 'bg-[var(--color-system-blue)]' : 'bg-white'}`}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            bottom: `-20px`,
            opacity: p.opacity,
            animation: `floatUp-${p.id} ${p.animationDuration}s linear infinite`,
            animationDelay: `${p.animationDelay}s`,
            boxShadow: p.isBlue ? '0 0 6px var(--color-system-blue)' : 'none'
          }}
        />
      ))}
      <style>
        {particles.map(p => `
          @keyframes floatUp-${p.id} {
            0% {
              transform: translateY(0) translateX(0);
              opacity: 0;
            }
            10% {
              opacity: ${p.opacity};
            }
            90% {
              opacity: ${p.opacity};
            }
            100% {
              transform: translateY(-110vh) translateX(${p.drift}px);
              opacity: 0;
            }
          }
        `).join('\n')}
      </style>
    </div>
  );
};

export default ParticleField;
