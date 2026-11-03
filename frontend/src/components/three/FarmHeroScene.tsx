import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FarmerCharacter } from './models/FarmerCharacter';
import { Tractor3DModel } from './models/Tractor3DModel';
import { StaticHeroFallback } from './StaticHeroFallback';

// ----------------------------------------------------
// 1. FLOATING CLOUDS
// ----------------------------------------------------
const Clouds: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  const cloudPuffs = useMemo(() => {
    return [
      { pos: [-16, 8, -18], scale: 1.8 },
      { pos: [-6, 9.5, -22], scale: 2.2 },
      { pos: [8, 10, -20], scale: 2.0 },
      { pos: [18, 8.5, -16], scale: 1.6 },
    ];
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x += delta * 0.15;
      if (groupRef.current.position.x > 25) {
        groupRef.current.position.x = -25;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {cloudPuffs.map((c, idx) => (
        <group key={idx} position={c.pos as [number, number, number]} scale={c.scale}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={1} opacity={0.88} transparent />
          </mesh>
          <mesh position={[0.9, -0.1, 0]}>
            <sphereGeometry args={[0.75, 8, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={1} opacity={0.85} transparent />
          </mesh>
          <mesh position={[-0.9, -0.15, 0]}>
            <sphereGeometry args={[0.7, 8, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={1} opacity={0.85} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ----------------------------------------------------
// 2. DISTANT ROLLING HILLS & MOUNTAIN RIDGE
// ----------------------------------------------------
const DistantHills: React.FC = () => {
  return (
    <group position={[0, -1, -28]}>
      {/* Background Far Mountain Range */}
      <mesh position={[-12, 4, 0]} rotation={[0, 0.2, 0]}>
        <coneGeometry args={[14, 9, 8]} />
        <meshStandardMaterial color="#1b4332" roughness={0.9} />
      </mesh>
      <mesh position={[6, 5, -2]} rotation={[0, -0.3, 0]}>
        <coneGeometry args={[16, 11, 8]} />
        <meshStandardMaterial color="#163e2e" roughness={0.9} />
      </mesh>
      <mesh position={[18, 3.5, 0]}>
        <coneGeometry args={[12, 8, 8]} />
        <meshStandardMaterial color="#1f4e3c" roughness={0.9} />
      </mesh>

      {/* Mid Hills */}
      <mesh position={[-5, 2, 8]} scale={[20, 4, 6]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#2d6a4f" roughness={0.85} />
      </mesh>
      <mesh position={[12, 1.5, 7]} scale={[18, 3.5, 6]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#387a5c" roughness={0.85} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// 3. ORCHARD FRUIT TREES
// ----------------------------------------------------
const FruitTree: React.FC<{ position: [number, number, number]; fruitColor?: string }> = ({
  position,
  fruitColor = '#f59e0b',
}) => {
  return (
    <group position={position}>
      {/* Tree Trunk */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 2.2, 8]} />
        <meshStandardMaterial color="#543d2b" roughness={0.85} />
      </mesh>
      {/* Foliage Canopy Clusters */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <sphereGeometry args={[1.1, 12, 12]} />
        <meshStandardMaterial color="#1b5e20" roughness={0.7} />
      </mesh>
      <mesh position={[0.4, 2.6, 0.3]} castShadow>
        <sphereGeometry args={[0.85, 10, 10]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.7} />
      </mesh>
      <mesh position={[-0.45, 2.5, -0.2]} castShadow>
        <sphereGeometry args={[0.8, 10, 10]} />
        <meshStandardMaterial color="#388e3c" roughness={0.7} />
      </mesh>

      {/* Hanging Ripe Fruits */}
      {[
        [0.4, 2.1, 0.8],
        [-0.5, 2.0, 0.7],
        [0.7, 2.3, -0.4],
        [-0.6, 2.2, -0.5],
        [0, 1.8, 0.9],
      ].map((p, idx) => (
        <mesh key={idx} position={p as [number, number, number]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color={fruitColor} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

// ----------------------------------------------------
// 4. ANIMATED FLOWING IRRIGATION WATER CANAL
// ----------------------------------------------------
const IrrigationCanal: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (waterRef.current) {
      const time = state.clock.getElapsedTime();
      // Flowing surface shimmer
      waterRef.current.position.y = -0.08 + Math.sin(time * 2.2) * 0.012;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Canal Trench Excavation */}
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0.32]}>
        <planeGeometry args={[2.4, 28]} />
        <meshStandardMaterial color="#3e2723" roughness={0.9} />
      </mesh>

      {/* Water Surface with Flow */}
      <mesh
        ref={waterRef}
        position={[0, -0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0.32]}
        receiveShadow
      >
        <planeGeometry args={[2.1, 28, 16, 32]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#0369a1"
          emissiveIntensity={0.2}
          roughness={0.08}
          metalness={0.3}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Stone / Earth Embankment Edges */}
      {[-1.15, 1.15].map((xOffset, idx) => (
        <mesh
          key={idx}
          position={[xOffset * Math.cos(0.32), 0.02, -xOffset * Math.sin(0.32)]}
          rotation={[-Math.PI / 2, 0, 0.32]}
        >
          <planeGeometry args={[0.25, 28]} />
          <meshStandardMaterial color="#6d4c41" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
};

// ----------------------------------------------------
// 5. CROP ROWS WITH WIND SWAY
// ----------------------------------------------------
const CropRows: React.FC = () => {
  const cropsRef = useRef<THREE.Group>(null);

  // Generate crop plant positions along furrow lines
  const plants = useMemo(() => {
    const list: [number, number, number, string][] = [];
    const rows = [
      { x: 3.2, zStart: -6, zEnd: 5, color: '#22c55e' },
      { x: 4.1, zStart: -7, zEnd: 4, color: '#eab308' }, // Golden wheat row
      { x: 5.0, zStart: -6, zEnd: 3, color: '#16a34a' },
      { x: 5.9, zStart: -5, zEnd: 2, color: '#ef4444' }, // Red tomato row
      { x: -4.5, zStart: -7, zEnd: -1, color: '#22c55e' },
      { x: -5.4, zStart: -6, zEnd: -2, color: '#84cc16' },
    ];

    rows.forEach((r) => {
      for (let z = r.zStart; z <= r.zEnd; z += 0.7) {
        list.push([r.x + (Math.sin(z) * 0.06), 0, z, r.color]);
      }
    });
    return list;
  }, []);

  useFrame((state) => {
    if (cropsRef.current) {
      const time = state.clock.getElapsedTime();
      // Gentle wind breeze swaying the plants
      cropsRef.current.children.forEach((child, i) => {
        child.rotation.z = Math.sin(time * 2 + i * 0.4) * 0.08;
      });
    }
  });

  return (
    <group ref={cropsRef}>
      {plants.map(([x, y, z, color], idx) => (
        <group key={idx} position={[x, y, z]}>
          {/* Plant Stems & Leaves */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.03, 0.5, 6]} />
            <meshStandardMaterial color="#15803d" roughness={0.6} />
          </mesh>
          <mesh position={[0.08, 0.35, 0]} rotation={[0.4, 0, 0.5]}>
            <boxGeometry args={[0.12, 0.22, 0.015]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
          <mesh position={[-0.08, 0.3, 0]} rotation={[-0.3, 0, -0.5]}>
            <boxGeometry args={[0.12, 0.22, 0.015]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ----------------------------------------------------
// 6. MAIN FARM GROUND TERRAIN
// ----------------------------------------------------
const FarmGround: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Main Fertile Earth & Grass Plain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[50, 45, 32, 32]} />
        <meshStandardMaterial color="#1b4332" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Farm Pathway / Dirt Road */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-2.5, 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[2.5, 30]} />
        <meshStandardMaterial color="#543d2b" roughness={0.95} />
      </mesh>

      {/* Furrow Mound Lines */}
      {[-5, -4.1, 3.2, 4.1, 5.0, 5.9].map((x, idx) => (
        <mesh
          key={idx}
          position={[x, 0.04, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[0.35, 26]} />
          <meshStandardMaterial color="#2d6a4f" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

// ----------------------------------------------------
// 7. CAMERA PARALLAX RIG
// ----------------------------------------------------
const CameraRig: React.FC = () => {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coords between -1 and 1
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(({ camera }) => {
    // Subtle, smooth damped tilt & pan matching cursor
    const targetX = mouse.current.x * 0.9;
    const targetY = 2.4 + mouse.current.y * 0.4;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04);
    camera.lookAt(0, 1.1, 0);
  });

  return null;
};

// ----------------------------------------------------
// 8. MASTER SCENE CONTAINER (FarmHeroScene)
// ----------------------------------------------------
export const FarmHeroScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  // WebGL & Motion Preference Check
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

  // IntersectionObserver to pause rendering when scrolled off-screen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Tab visibility check to conserve battery & GPU
  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  if (hasWebGL === false) {
    return <StaticHeroFallback />;
  }

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      <Suspense fallback={<StaticHeroFallback />}>
        {isVisible && (
          <Canvas
            shadows
            dpr={[1, 1.5]}
            camera={{ position: [0, 2.5, 9.5], fov: 42 }}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              alpha: true,
            }}
            className="w-full h-full pointer-events-auto"
          >
            {/* Atmosphere & Lighting */}
            <fog attach="fog" args={['#dcfce7', 16, 48]} />
            <ambientLight color="#fff8e7" intensity={0.85} />
            <directionalLight
              position={[12, 18, 10]}
              intensity={2.0}
              color="#fff4cc"
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-bias={-0.0001}
            />
            <hemisphereLight args={['#bae6fd', '#14532d', 0.6]} />

            {/* Camera Parallax */}
            <CameraRig />

            {/* Natural Scenery */}
            <Clouds />
            <DistantHills />
            <FarmGround />
            <IrrigationCanal />
            <CropRows />

            {/* Orchard Fruit Trees */}
            <FruitTree position={[-7.5, 0, -5]} fruitColor="#ea580c" />
            <FruitTree position={[-8.5, 0, -2]} fruitColor="#f59e0b" />
            <FruitTree position={[7.5, 0, -6]} fruitColor="#ef4444" />
            <FruitTree position={[8.5, 0, -3]} fruitColor="#f59e0b" />

            {/* 3D Indian Tractor Model (Parked on dirt road, idling) */}
            <Tractor3DModel
              position={[-2.4, 0, 0.4]}
              rotation={[0, 0.65, 0]}
              scale={0.95}
              color="#c0392b"
              wheelColor="#fbc02d"
            />

            {/* 3D Indian Farmer Character (Active in crop field, hoeing/waving) */}
            <FarmerCharacter
              position={[2.2, 0, 1.4]}
              rotation={[0, -0.4, 0]}
              scale={1.05}
              animationMode="auto"
              turbanColor="#e67e22"
              kurtaColor="#f7f2e7"
              showTool={true}
            />
          </Canvas>
        )}
      </Suspense>
    </div>
  );
};

export default FarmHeroScene;

