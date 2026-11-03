import React, { useRef, useMemo, useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { StaticHeroFallback } from './StaticHeroFallback';

// Error Boundary for Three.js WebGL crashes
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('WebGL FarmHeroScene error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// -------------------------------------------------------------
// 1. PROCEDURAL 3D INDIAN FARMER COMPONENT
// -------------------------------------------------------------
function StylizedFarmer({ isPaused }: { isPaused: boolean }) {
  const farmerGroup = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const toolRef = useRef<THREE.Group>(null);

  // Materials with warm, natural cotton & skin tones
  const materials = useMemo(() => {
    return {
      skin: new THREE.MeshLambertMaterial({ color: '#c68642' }),
      turban: new THREE.MeshLambertMaterial({ color: '#ea580c' }), // Saffron / Orange Gamcha Pagri
      kurta: new THREE.MeshLambertMaterial({ color: '#f8fafc' }),  // Crisp white cotton
      dhoti: new THREE.MeshLambertMaterial({ color: '#f1f5f9' }),  // Traditional light cotton dhoti
      sash: new THREE.MeshLambertMaterial({ color: '#047857' }),   // Green waist band
      toolHandle: new THREE.MeshLambertMaterial({ color: '#78350f' }), // Wood handle
      toolBlade: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.4, metalness: 0.7 }) // Iron hoe
    };
  }, []);

  // Natural looping farming activity (tending / hoeing crops)
  useFrame((state) => {
    if (isPaused) return;
    const t = state.clock.getElapsedTime();

    // Gentle full-body breathing and weight shift
    if (farmerGroup.current) {
      farmerGroup.current.position.y = -0.55 + Math.sin(t * 2) * 0.03;
    }

    // Torso bends forward slightly rhythmically to inspect/work soil
    if (torsoRef.current) {
      torsoRef.current.rotation.x = 0.25 + Math.sin(t * 1.8) * 0.08;
      torsoRef.current.rotation.y = Math.sin(t * 1.2) * 0.05;
    }

    // Head tilts to inspect the plants
    if (headRef.current) {
      headRef.current.rotation.x = -0.1 + Math.sin(t * 1.8) * 0.06;
      headRef.current.rotation.y = Math.sin(t * 1.4) * 0.12;
    }

    // Right arm works the farming tool
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -0.4 + Math.sin(t * 2.2) * 0.35;
      rightArmRef.current.rotation.z = -0.15 + Math.cos(t * 2.2) * 0.08;
    }

    // Left arm balances / supports
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = 0.1 + Math.sin(t * 2.2 + 0.5) * 0.15;
      leftArmRef.current.rotation.z = 0.2 + Math.cos(t * 1.5) * 0.05;
    }

    // Tool follows hoeing motion into the soil
    if (toolRef.current) {
      toolRef.current.rotation.x = -0.2 + Math.sin(t * 2.2) * 0.25;
    }
  });

  return (
    <group ref={farmerGroup} position={[0.7, -0.55, 0.4]} rotation={[0, -0.5, 0]} scale={0.78}>
      {/* --- LEGS & DHOTI --- */}
      {/* Left Leg */}
      <group position={[-0.15, 0.35, 0]}>
        <mesh material={materials.dhoti}>
          <cylinderGeometry args={[0.09, 0.07, 0.7, 8]} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -0.38, 0.06]} material={materials.skin}>
          <boxGeometry args={[0.09, 0.06, 0.18]} />
        </mesh>
      </group>

      {/* Right Leg (slightly stepped forward) */}
      <group position={[0.15, 0.35, 0.1]}>
        <mesh material={materials.dhoti}>
          <cylinderGeometry args={[0.09, 0.07, 0.7, 8]} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -0.38, 0.06]} material={materials.skin}>
          <boxGeometry args={[0.09, 0.06, 0.18]} />
        </mesh>
      </group>

      {/* Waist Sash (Kamarbandh) */}
      <mesh position={[0, 0.72, 0.02]} material={materials.sash}>
        <cylinderGeometry args={[0.22, 0.21, 0.12, 10]} />
      </mesh>

      {/* --- TORSO GROUP --- */}
      <group ref={torsoRef} position={[0, 0.76, 0]}>
        {/* Main Kurta / Chest */}
        <mesh position={[0, 0.35, 0]} material={materials.kurta}>
          <cylinderGeometry args={[0.19, 0.22, 0.65, 8]} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.72, 0]} material={materials.skin}>
          <cylinderGeometry args={[0.08, 0.09, 0.14, 8]} />
        </mesh>

        {/* --- HEAD & TURBAN (PAGRI) --- */}
        <group ref={headRef} position={[0, 0.88, 0]}>
          {/* Face */}
          <mesh material={materials.skin}>
            <sphereGeometry args={[0.14, 12, 12]} />
          </mesh>

          {/* Traditional Indian Pagri / Turban */}
          <group position={[0, 0.06, 0]}>
            {/* Main wrap */}
            <mesh material={materials.turban}>
              <torusGeometry args={[0.15, 0.07, 8, 16]} />
            </mesh>
            {/* Top crown */}
            <mesh position={[0, 0.08, 0]} material={materials.turban}>
              <sphereGeometry args={[0.14, 10, 10]} />
            </mesh>
            {/* Gamcha tail cloth hanging slightly over shoulder */}
            <mesh position={[-0.12, -0.15, -0.05]} rotation={[0, 0, 0.2]} material={materials.turban}>
              <boxGeometry args={[0.06, 0.32, 0.02]} />
            </mesh>
          </group>
        </group>

        {/* --- LEFT ARM --- */}
        <group ref={leftArmRef} position={[-0.24, 0.55, 0]}>
          {/* Upper Arm */}
          <mesh position={[0, -0.16, 0]} material={materials.kurta}>
            <cylinderGeometry args={[0.06, 0.05, 0.32, 8]} />
          </mesh>
          {/* Forearm & Hand */}
          <mesh position={[0, -0.38, 0.06]} rotation={[0.4, 0, 0]} material={materials.skin}>
            <cylinderGeometry args={[0.05, 0.04, 0.3, 8]} />
          </mesh>
        </group>

        {/* --- RIGHT ARM & FARMING HOE --- */}
        <group ref={rightArmRef} position={[0.24, 0.55, 0]}>
          {/* Upper Arm */}
          <mesh position={[0, -0.16, 0]} material={materials.kurta}>
            <cylinderGeometry args={[0.06, 0.05, 0.32, 8]} />
          </mesh>
          {/* Forearm */}
          <group position={[0, -0.34, 0.05]} rotation={[0.6, 0, 0]}>
            <mesh material={materials.skin}>
              <cylinderGeometry args={[0.05, 0.04, 0.28, 8]} />
            </mesh>

            {/* Farming Tool (Hoe / Pawda) in hand */}
            <group ref={toolRef} position={[0, -0.15, 0]} rotation={[0.4, 0, 0.1]}>
              {/* Wooden Handle */}
              <mesh position={[0, 0.1, 0]} material={materials.toolHandle}>
                <cylinderGeometry args={[0.02, 0.02, 1.25, 8]} />
              </mesh>
              {/* Iron Blade */}
              <mesh position={[0, -0.52, 0.08]} rotation={[0.8, 0, 0]} material={materials.toolBlade}>
                <boxGeometry args={[0.18, 0.14, 0.02]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// 2. PROCEDURAL CROPS & AGRICULTURAL BED ROWS
// -------------------------------------------------------------
function CropRows({ isPaused }: { isPaused: boolean }) {
  const foliageRef = useRef<THREE.Group>(null);

  // Materials
  const materials = useMemo(() => {
    return {
      stem: new THREE.MeshLambertMaterial({ color: '#15803d' }),
      leafDeep: new THREE.MeshLambertMaterial({ color: '#16a34a' }),
      leafLight: new THREE.MeshLambertMaterial({ color: '#4ade80' }),
      soil: new THREE.MeshLambertMaterial({ color: '#573719' }),
      canalWater: new THREE.MeshPhysicalMaterial({
        color: '#67e8f9',
        transparent: true,
        opacity: 0.75,
        roughness: 0.1,
        transmission: 0.85,
        ior: 1.333
      })
    };
  }, []);

  // Natural leaf sway in breeze
  useFrame((state) => {
    if (isPaused || !foliageRef.current) return;
    const t = state.clock.getElapsedTime();
    foliageRef.current.children.forEach((plant, i) => {
      plant.rotation.z = Math.sin(t * 2 + i * 0.4) * 0.06;
      plant.rotation.x = Math.cos(t * 1.5 + i * 0.3) * 0.04;
    });
  });

  // Generate plant coordinates in orderly agricultural rows
  const plants = useMemo(() => {
    const list: { pos: [number, number, number]; scale: number }[] = [];
    const rows = [-0.6, -0.1, 0.4];
    rows.forEach((z) => {
      for (let x = -2.2; x <= 0.2; x += 0.4) {
        list.push({
          pos: [x, -0.65, z],
          scale: 0.7 + Math.random() * 0.25
        });
      }
    });
    return list;
  }, []);

  return (
    <group>
      {/* Raised Soil Ridges for Crops */}
      {[-0.6, -0.1, 0.4].map((z, idx) => (
        <mesh key={idx} position={[-1.0, -0.76, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.8, 0.32]} />
          <meshLambertMaterial color="#45260e" />
        </mesh>
      ))}

      {/* Swaying Foliage Plants */}
      <group ref={foliageRef}>
        {plants.map((p, idx) => (
          <group key={idx} position={p.pos} scale={p.scale}>
            {/* Stem */}
            <mesh position={[0, 0.16, 0]} material={materials.stem}>
              <cylinderGeometry args={[0.02, 0.03, 0.32, 6]} />
            </mesh>
            {/* Layered lush leaves */}
            <mesh position={[0.08, 0.24, 0]} rotation={[0.4, 0, 0.7]} material={materials.leafLight}>
              <coneGeometry args={[0.09, 0.22, 5]} />
            </mesh>
            <mesh position={[-0.08, 0.22, 0]} rotation={[-0.3, 0, -0.7]} material={materials.leafDeep}>
              <coneGeometry args={[0.09, 0.22, 5]} />
            </mesh>
            <mesh position={[0, 0.3, 0.08]} rotation={[0.7, 0.8, 0]} material={materials.leafLight}>
              <coneGeometry args={[0.08, 0.2, 5]} />
            </mesh>
            <mesh position={[0, 0.31, -0.08]} rotation={[-0.7, -0.8, 0]} material={materials.leafDeep}>
              <coneGeometry args={[0.08, 0.2, 5]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Irrigation Water Canal alongside crops */}
      <group position={[-1.0, -0.78, 0.95]}>
        {/* Water trench bed */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 0.35]} />
          <meshLambertMaterial color="#2d1c0e" />
        </mesh>
        {/* Translucent living water stream */}
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.canalWater}>
          <planeGeometry args={[3.2, 0.28]} />
        </mesh>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// 3. DISTANT TREES, CLOUDS & ENVIRONMENT
// -------------------------------------------------------------
function FarmEnvironment({ isPaused }: { isPaused: boolean }) {
  const cloudsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (isPaused || !cloudsRef.current) return;
    const t = state.clock.getElapsedTime();
    cloudsRef.current.children.forEach((cloud, i) => {
      cloud.position.x = ((cloud.position.x + 0.002 * (i + 1) + 4) % 8) - 4;
    });
  });

  return (
    <group>
      {/* Ground plane - Fertile Green Landscape */}
      <mesh position={[0, -0.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshLambertMaterial color="#86efac" />
      </mesh>

      {/* Distant Rolling Hills */}
      <mesh position={[0, -0.6, -3.5]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[5, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
        <meshLambertMaterial color="#15803d" />
      </mesh>

      {/* Distant Low-Poly Tree Line */}
      {[-2.8, -2.1, -1.4, -0.6, 0.2, 1.0, 1.8, 2.6].map((x, i) => (
        <group key={i} position={[x, -0.35, -2.8]} scale={0.55 + (i % 3) * 0.15}>
          {/* Trunk */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.4, 6]} />
            <meshLambertMaterial color="#5c3818" />
          </mesh>
          {/* Tree Canopy */}
          <mesh position={[0, 0.55, 0]}>
            <coneGeometry args={[0.28, 0.65, 6]} />
            <meshLambertMaterial color={i % 2 === 0 ? '#166534' : '#15803d'} />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <coneGeometry args={[0.22, 0.5, 6]} />
            <meshLambertMaterial color={i % 2 === 0 ? '#15803d' : '#22c55e'} />
          </mesh>
        </group>
      ))}

      {/* Drifting Low-Poly Fluffy Clouds */}
      <group ref={cloudsRef}>
        {[
          { pos: [-2.5, 1.8, -2.5], scale: 0.6 },
          { pos: [0.8, 2.1, -3.0], scale: 0.8 },
          { pos: [2.8, 1.6, -2.2], scale: 0.5 }
        ].map((c, i) => (
          <group key={i} position={c.pos as [number, number, number]} scale={c.scale}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.35, 8, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.88} />
            </mesh>
            <mesh position={[-0.25, -0.05, 0]}>
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.88} />
            </mesh>
            <mesh position={[0.28, -0.04, 0]}>
              <sphereGeometry args={[0.26, 8, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.88} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// 4. PARALLAX CAMERA RIG
// -------------------------------------------------------------
function CameraRig({ isPaused }: { isPaused: boolean }) {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (isPaused) return;
    // Gentle damped camera parallax lerp
    const targetX = mouse.current.x * 0.35;
    const targetY = 0.2 + mouse.current.y * 0.15;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.04);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

// -------------------------------------------------------------
// 5. MAIN HERO SCENE EXPORT WITH LIFECYCLE GUARDS
// -------------------------------------------------------------
export default function FarmHeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // Pause rendering when out of viewport or tab hidden
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false);
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setIsVisible(rect.bottom > 0 && rect.top < window.innerHeight);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // If WebGL is unsupported, render lightweight CSS fallback
  if (hasWebGL === false) {
    return <StaticHeroFallback />;
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <WebGLErrorBoundary fallback={<StaticHeroFallback />}>
        <Canvas
          camera={{ position: [0, 0.2, 3.6], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
          className="w-full h-full"
        >
          {/* Sunlight & Natural Ambient Lighting */}
          <ambientLight intensity={0.9} color="#e0f2fe" />
          <directionalLight position={[4, 5, 3]} intensity={1.5} color="#fffbeb" castShadow={false} />
          <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#86efac" />
          <pointLight position={[0.5, 0.5, 1.5]} intensity={0.4} color="#fde047" />

          {/* Farm Scene Elements */}
          <FarmEnvironment isPaused={!isVisible} />
          <CropRows isPaused={!isVisible} />
          <StylizedFarmer isPaused={!isVisible} />

          {/* Damped Parallax Camera Rig */}
          <CameraRig isPaused={!isVisible} />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}

