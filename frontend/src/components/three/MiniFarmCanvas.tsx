import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { FarmerCharacter } from './models/FarmerCharacter';
import { Tractor3DModel } from './models/Tractor3DModel';

export interface MiniFarmCanvasProps {
  className?: string;
}

export const MiniFarmCanvas: React.FC<MiniFarmCanvasProps> = ({
  className = 'w-48 h-44',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setHasWebGL(Boolean(gl) && !prefersReduced);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (hasWebGL === false) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-900/30 to-green-800/20 border border-white/20 p-4 ${className}`}>
        <span className="material-symbols-outlined text-emerald-400 text-5xl">agriculture</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-white/25 shadow-lg bg-gradient-to-b from-emerald-950/40 via-green-900/30 to-emerald-950/50 backdrop-blur-md ${className}`}
    >
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-400 text-4xl animate-pulse">spa</span>
          </div>
        }
      >
        <Canvas
          dpr={[1, 1.3]}
          camera={{ position: [0, 1.4, 3.8], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
          className="w-full h-full"
        >
          <ambientLight color="#fff8e7" intensity={0.9} />
          <directionalLight position={[5, 8, 5]} intensity={2.2} color="#fff4cc" castShadow />
          <hemisphereLight args={['#a7f3d0', '#064e3b', 0.6]} />

          {/* Mini Earth Pedestal */}
          <mesh position={[0, -0.05, 0]} receiveShadow>
            <cylinderGeometry args={[2.0, 2.2, 0.1, 24]} />
            <meshStandardMaterial color="#1b4332" roughness={0.8} />
          </mesh>

          {/* Mini Crop Sprouts around pedestal */}
          {[-1.2, -0.6, 0.7, 1.3].map((x, i) => (
            <mesh key={i} position={[x, 0.1, 0.8]} rotation={[0, 0, (i % 2 === 0 ? 0.1 : -0.1)]}>
              <coneGeometry args={[0.06, 0.25, 5]} />
              <meshStandardMaterial color="#84cc16" roughness={0.5} />
            </mesh>
          ))}

          {/* Mini Tractor parked at back */}
          <Tractor3DModel
            position={[-0.9, 0, -0.3]}
            rotation={[0, 0.7, 0]}
            scale={0.48}
            color="#c0392b"
            isIdling={true}
          />

          {/* Friendly Farmer waving */}
          <FarmerCharacter
            position={[0.5, 0, 0.2]}
            rotation={[0, -0.35, 0]}
            scale={0.88}
            animationMode="waving"
            turbanColor="#ea580c"
            kurtaColor="#fef3c7"
            showTool={true}
          />
        </Canvas>
      </Suspense>

      {/* Glass badge */}
      <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider text-emerald-200 bg-emerald-950/60 border border-emerald-500/30 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          DIGITAL FARM 3D
        </span>
      </div>
    </div>
  );
};

export default MiniFarmCanvas;

