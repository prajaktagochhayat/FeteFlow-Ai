import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  char?: string;
}

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const particlesRef = useRef<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check for touch device or prefers-reduced-motion
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      setIsTouchDevice(true);
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animationFrameId: number;
    let lastSparkleTime = 0;

    const sparkleColors = ['#A48BFF', '#FF7C91', '#FFD700', '#EDE6FF', '#7655E8', '#00D2D3'];
    const starChars = ['✦', '✧', '⋆', '•'];

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        setIsVisible(true);
        ringX = mouseX;
        ringY = mouseY;
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInput = Boolean(target.closest('input, textarea'));
        const isInteractive = Boolean(
          target.closest('button, a, select, [role="button"], .clickable, .interactive')
        );
        setIsTextInput(isInput);
        setIsHoveringInteractive(isInteractive);
      }

      // Spawn fairy dust sparkles as mouse moves (throttled to ~40ms)
      const now = performance.now();
      if (now - lastSparkleTime > 35) {
        lastSparkleTime = now;
        if (particlesRef.current.length < 35) {
          particlesRef.current.push({
            id: Math.random(),
            x: mouseX + (Math.random() - 0.5) * 8,
            y: mouseY + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5 - 0.5,
            size: 8 + Math.random() * 6,
            color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
            alpha: 1.0,
            char: starChars[Math.floor(Math.random() * starChars.length)],
          });
        }
      }
    };

    // On Click: Celebration burst of 8 particles
    const onMouseDown = (e: MouseEvent) => {
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const speed = 2.5 + Math.random() * 2.5;
        particlesRef.current.push({
          id: Math.random(),
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 10 + Math.random() * 6,
          color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
          alpha: 1.0,
          char: starChars[Math.floor(Math.random() * starChars.length)],
        });
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    // Resize canvas to window
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      // Smooth spring interpolation
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      // Render sparkles on 2D canvas overlay
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const nextParticles: Particle[] = [];
          for (let i = 0; i < particlesRef.current.length; i++) {
            const p = particlesRef.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.04; // Gentle gravity
            p.alpha -= 0.028; // Fade out

            if (p.alpha > 0.05) {
              ctx.save();
              ctx.globalAlpha = p.alpha;
              ctx.fillStyle = p.color;
              ctx.font = `${p.size}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 6;
              ctx.fillText(p.char || '✦', p.x, p.y);
              ctx.restore();

              nextParticles.push(p);
            }
          }
          particlesRef.current = nextParticles;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseleave', onMouseLeave);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      {/* 2D Canvas for fairy dust sparkles & click bursts */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Center Core Dot */}
      <div
        ref={dotRef}
        className={`absolute -left-1.5 -top-1.5 rounded-full transition-transform duration-75 ease-out ${
          isTextInput
            ? 'h-5 w-1 bg-brand-primary rounded-sm shadow-[0_0_8px_var(--brand-primary)]'
            : isHoveringInteractive
            ? 'h-3.5 w-3.5 -left-1.5 -top-1.5 bg-gradient-to-tr from-brand-primary to-brand-coral shadow-[0_0_12px_#ff7c91]'
            : 'h-2.5 w-2.5 bg-brand-primary shadow-[0_0_10px_var(--brand-primary)]'
        }`}
      />

      {/* Magnetic Outer Translucent Celebration Ring with Star Glyph */}
      <div
        ref={ringRef}
        className={`absolute rounded-full transition-all duration-200 ease-out flex items-center justify-center backdrop-blur-[0.5px] ${
          isTextInput
            ? 'opacity-0 scale-50'
            : isHoveringInteractive
            ? 'h-14 w-14 -left-7 -top-7 scale-110 border-2 border-brand-coral/80 bg-gradient-to-tr from-brand-primary/20 via-brand-coral/25 to-brand-soft/30 shadow-[0_0_20px_rgba(255,124,145,0.4)]'
            : 'h-9 w-9 -left-4.5 -top-4.5 border border-brand-primary/50 bg-brand-primary/10 shadow-[0_0_10px_var(--brand-primary)]'
        }`}
      >
        {isHoveringInteractive && (
          <span className="text-[11px] text-white font-bold drop-shadow-md animate-spin duration-1000">
            ✦
          </span>
        )}
      </div>
    </div>
  );
};
