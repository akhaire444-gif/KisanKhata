import React, { useRef, useState, useEffect, useMemo, Component, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { StaticHeroFallback } from './StaticHeroFallback';

// ----------------------------------------------------
// Capability Detection (Guard Rails)
// ----------------------------------------------------
export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  // Check user motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }

  // Check low-memory or battery-saving device constraints
  const nav = navigator as any;
  if (nav.deviceMemory && nav.deviceMemory <= 2) return false;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) return false;
  if (nav.connection && nav.connection.saveData) return false;

  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// Error Boundary to ensure 3D failure NEVER crashes page
// ----------------------------------------------------
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}

export class ThreeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('WebGL / Three.js fallback activated:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export { StaticHeroFallback } from './StaticHeroFallback';

// ----------------------------------------------------
// 3D Objects: Glossy Water Droplets & Low-Poly Crop Leaf
// ----------------------------------------------------
const WaterDroplet: React.FC<{
  position: [number, number, number];
  scale?: number;
  speed?: number;
  tint?: string;
}> = ({ position, scale = 1, speed = 1.2, tint = '#a1f4c8' }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(tint),
        transmission: 0.94,
        roughness: 0.05,
        thickness: 1.1,
        ior: 1.333, // Water refractive index
        specularIntensity: 1.0,
        specularColor: new THREE.Color(0xffffff),
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        transparent: true,
        opacity: 0.88,
      }),
    [tint]
  );

  return (
    <Float speed={speed} rotationIntensity={1.2} floatIntensity={1.8}>
      <mesh ref={meshRef} position={position} scale={scale} material={material}>
        <sphereGeometry args={[0.55, 32, 32]} />
      </mesh>
    </Float>
  );
};

const CropSproutGroup: React.FC = () => {
  const sproutRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!sproutRef.current) return;
    const t = state.clock.getElapsedTime();
    // Gentle natural wind sway
    sproutRef.current.rotation.z = Math.sin(t * 0.8) * 0.06;
    sproutRef.current.rotation.y = Math.cos(t * 0.5) * 0.08;
  });

  const stemMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#116c4a'),
        roughness: 0.35,
        metalness: 0.1,
      }),
    []
  );

  const leafMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#1b724f'),
        roughness: 0.25,
        clearcoat: 0.4,
        clearcoatRoughness: 0.2,
      }),
    []
  );

  const lightLeafMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#34a853'),
        roughness: 0.2,
        clearcoat: 0.5,
      }),
    []
  );

  return (
    <group ref={sproutRef} position={[0, -0.6, 0]} scale={1.1}>
      {/* Central Stem */}
      <mesh position={[0, 0, 0]} material={stemMaterial}>
        <cylinderGeometry args={[0.07, 0.1, 1.6, 16]} />
      </mesh>

      {/* Primary Left Leaf */}
      <mesh position={[-0.45, 0.45, 0]} rotation={[0.2, 0, 0.7]} scale={[0.6, 0.22, 0.08]} material={leafMaterial}>
        <sphereGeometry args={[1, 16, 16]} />
      </mesh>

      {/* Secondary Right Leaf */}
      <mesh position={[0.48, 0.65, 0.1]} rotation={[-0.2, 0, -0.75]} scale={[0.55, 0.2, 0.08]} material={lightLeafMaterial}>
        <sphereGeometry args={[1, 16, 16]} />
      </mesh>

      {/* Young Top Leaf Bud */}
      <mesh position={[0.05, 0.95, 0]} rotation={[0, 0, -0.2]} scale={[0.3, 0.5, 0.08]} material={lightLeafMaterial}>
        <sphereGeometry args={[1, 16, 16]} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// Parallax Scene Rig
// ----------------------------------------------------
const SceneRig: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const { pointer } = state;
    // Damped mouse parallax: tilts maximum ~6-8 degrees
    const targetY = pointer.x * 0.14;
    const targetX = -pointer.y * 0.10;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
  });

  return (
    <group ref={groupRef}>
      {/* Crop Plant Centerpiece */}
      <CropSproutGroup />

      {/* Floating Translucent Water Droplets */}
      <WaterDroplet position={[-1.7, 0.9, 0.4]} scale={0.7} speed={1.3} tint="#a1f4c8" />
      <WaterDroplet position={[1.8, 0.7, -0.2]} scale={0.85} speed={1.5} tint="#8fe3d9" />
      <WaterDroplet position={[-1.2, -1.0, 0.8]} scale={0.5} speed={1.0} tint="#c1ecd4" />
      <WaterDroplet position={[1.4, -0.9, 0.5]} scale={0.62} speed={1.4} tint="#ffdcc3" />
      <WaterDroplet position={[0.1, 1.6, -0.5]} scale={0.45} speed={1.6} tint="#a1f4c8" />
    </group>
  );
};

// ----------------------------------------------------
// Main HeroScene Component (with visibility pause & fallbacks)
// ----------------------------------------------------
export const HeroScene: React.FC = () => {
  const [canRenderWebGL, setCanRenderWebGL] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanRenderWebGL(isWebGLAvailable());

    // Observe container visibility so canvas rendering stops when scrolled off-screen
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);

    // Pause on tab visibility change
    const handleVisibility = () => {
      setIsVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  if (!canRenderWebGL) {
    return <StaticHeroFallback />;
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <ThreeErrorBoundary fallback={<StaticHeroFallback />}>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 42 }}
          dpr={[1, 1.5]}
          frameloop={isVisible ? 'always' : 'demand'}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
          className="w-full h-full"
        >
          {/* Studio Lighting System */}
          <ambientLight intensity={1.1} />
          <directionalLight position={[6, 8, 5]} intensity={1.8} color="#ffffff" />
          <pointLight position={[-4, 2, -2]} intensity={1.5} color="#8fe3d9" distance={10} />
          <pointLight position={[4, -3, 2]} intensity={1.2} color="#ffdcc3" distance={10} />
          <pointLight position={[0, -4, 3]} intensity={0.9} color="#a1f4c8" distance={8} />

          <SceneRig />
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
};

export default HeroScene;
