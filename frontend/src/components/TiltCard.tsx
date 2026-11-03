import React, { useRef, useState, useCallback, useEffect } from 'react';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number; // max tilt degrees (default 6)
  className?: string;
  glareEffect?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxTilt = 6,
  className = '',
  glareEffect = true,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [canTilt, setCanTilt] = useState(false);

  useEffect(() => {
    // Only enable 3D tilt on devices with hover pointer and when reduced-motion is not requested
    const hasPointerHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCanTilt(hasPointerHover && !prefersReducedMotion);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!canTilt || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;

    // Calculate rotation between -maxTilt and +maxTilt
    const rotateY = ((x / width) - 0.5) * (maxTilt * 2);
    const rotateX = -((y / height) - 0.5) * (maxTilt * 2);

    setStyle({
      transform: `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`,
      transition: 'transform 0.08s ease-out',
      transformStyle: 'preserve-3d',
    });

    if (glareEffect) {
      setGlareStyle({
        opacity: 0.35,
        background: `radial-gradient(circle 180px at ${xPercent}% ${yPercent}%, rgba(255, 255, 255, 0.75), transparent 80%)`,
        transition: 'opacity 0.15s ease-out',
      });
    }
  }, [canTilt, maxTilt, glareEffect]);

  const handleMouseLeave = useCallback(() => {
    if (!canTilt) return;

    setStyle({
      transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)',
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    });

    if (glareEffect) {
      setGlareStyle({
        opacity: 0,
        transition: 'opacity 0.35s ease-out',
      });
    }
  }, [canTilt, glareEffect]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`relative overflow-hidden ${className}`}
      {...rest}
    >
      {/* Specular Glare overlay */}
      {glareEffect && canTilt && (
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] mix-blend-overlay"
          style={glareStyle}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
};

