import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface Tractor3DModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  color?: string; // Main tractor body color (e.g., '#c0392b' Indian red or '#1b5e20' John Deere green)
  wheelColor?: string; // Rim color
  isIdling?: boolean;
}

export const Tractor3DModel: React.FC<Tractor3DModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = '#c0392b',
  wheelColor = '#fbc02d',
  isIdling = true,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const engineVibeRef = useRef<THREE.Group>(null);
  const exhaustFlapRef = useRef<THREE.Mesh>(null);

  // Materials
  const materials = useMemo(() => {
    return {
      body: new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.65,
      }),
      bodyAccent: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.2,
        metalness: 0.8,
      }),
      chassis: new THREE.MeshStandardMaterial({
        color: '#263238',
        roughness: 0.8,
        metalness: 0.4,
      }),
      tireRubber: new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        roughness: 0.9,
        metalness: 0.05,
      }),
      rim: new THREE.MeshStandardMaterial({
        color: wheelColor,
        roughness: 0.4,
        metalness: 0.5,
      }),
      grille: new THREE.MeshStandardMaterial({
        color: '#111111',
        roughness: 0.6,
        metalness: 0.8,
      }),
      headlightGlass: new THREE.MeshStandardMaterial({
        color: '#fffae6',
        emissive: '#fff2a8',
        emissiveIntensity: 0.6,
        roughness: 0.1,
        metalness: 0.1,
      }),
      taillight: new THREE.MeshStandardMaterial({
        color: '#ff1744',
        emissive: '#d50000',
        emissiveIntensity: 0.5,
      }),
      seat: new THREE.MeshStandardMaterial({
        color: '#212121',
        roughness: 0.7,
      }),
      exhaust: new THREE.MeshStandardMaterial({
        color: '#37474f',
        roughness: 0.5,
        metalness: 0.7,
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: '#e0e0e0',
        roughness: 0.15,
        metalness: 0.9,
      }),
    };
  }, [color, wheelColor]);

  // Generate chevron lug positions around the rear wheel circumference
  const chevronLugs = useMemo(() => {
    const count = 14;
    const lugs = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      lugs.push({
        angle,
        x: Math.cos(angle) * 0.53,
        y: Math.sin(angle) * 0.53,
      });
    }
    return lugs;
  }, []);

  useFrame((state) => {
    if (!isIdling) return;
    const time = state.clock.getElapsedTime();

    // Gentle diesel engine idle rumble
    if (engineVibeRef.current) {
      engineVibeRef.current.position.y = Math.sin(time * 28) * 0.003;
    }

    // Exhaust rain cap flapping with exhaust pulses
    if (exhaustFlapRef.current) {
      exhaustFlapRef.current.rotation.z = -0.2 + Math.abs(Math.sin(time * 18)) * 0.35;
    }
  });

  return (
    <group ref={rootRef} position={position} rotation={rotation} scale={scale}>
      {/* ================= WHEELS & RUNNING GEAR ================= */}

      {/* Rear Left Drive Wheel (Big Agricultural Tire) */}
      <group position={[-0.78, 0.55, -0.65]}>
        {/* Main tire torus */}
        <mesh rotation={[0, Math.PI / 2, 0]} material={materials.tireRubber} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.3, 24]} />
        </mesh>
        {/* Metal Wheel Rim / Dish */}
        <mesh rotation={[0, Math.PI / 2, 0]} material={materials.rim} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.31, 20]} />
        </mesh>
        {/* Center Hub */}
        <mesh position={[-0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.chassis}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 12]} />
        </mesh>
        {/* Chevron Tread Cleats (Tractor lugs) */}
        {chevronLugs.map((lug, idx) => (
          <group key={idx} position={[0, lug.y, lug.x]} rotation={[lug.angle, 0, 0]}>
            <mesh position={[-0.04, 0, 0]} rotation={[0, 0.3, 0]} material={materials.tireRubber}>
              <boxGeometry args={[0.12, 0.05, 0.06]} />
            </mesh>
            <mesh position={[0.04, 0, 0]} rotation={[0, -0.3, 0]} material={materials.tireRubber}>
              <boxGeometry args={[0.12, 0.05, 0.06]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Rear Right Drive Wheel */}
      <group position={[0.78, 0.55, -0.65]}>
        <mesh rotation={[0, Math.PI / 2, 0]} material={materials.tireRubber} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.3, 24]} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]} material={materials.rim} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.31, 20]} />
        </mesh>
        <mesh position={[0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.chassis}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 12]} />
        </mesh>
        {chevronLugs.map((lug, idx) => (
          <group key={idx} position={[0, lug.y, lug.x]} rotation={[lug.angle, 0, 0]}>
            <mesh position={[-0.04, 0, 0]} rotation={[0, 0.3, 0]} material={materials.tireRubber}>
              <boxGeometry args={[0.12, 0.05, 0.06]} />
            </mesh>
            <mesh position={[0.04, 0, 0]} rotation={[0, -0.3, 0]} material={materials.tireRubber}>
              <boxGeometry args={[0.12, 0.05, 0.06]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Front Left Steering Wheel */}
      <group position={[-0.62, 0.3, 0.95]}>
        <mesh rotation={[0, Math.PI / 2, 0]} material={materials.tireRubber} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.16, 20]} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]} material={materials.rim}>
          <cylinderGeometry args={[0.18, 0.18, 0.17, 16]} />
        </mesh>
        <mesh position={[-0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.chassis}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 10]} />
        </mesh>
      </group>

      {/* Front Right Steering Wheel */}
      <group position={[0.62, 0.3, 0.95]}>
        <mesh rotation={[0, Math.PI / 2, 0]} material={materials.tireRubber} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.16, 20]} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]} material={materials.rim}>
          <cylinderGeometry args={[0.18, 0.18, 0.17, 16]} />
        </mesh>
        <mesh position={[0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.chassis}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 10]} />
        </mesh>
      </group>

      {/* Heavy Steel Chassis Spine & Axles */}
      <mesh position={[0, 0.42, 0.1]} material={materials.chassis} castShadow>
        <boxGeometry args={[0.5, 0.22, 1.9]} />
      </mesh>
      {/* Front Axle Beam */}
      <mesh position={[0, 0.3, 0.95]} rotation={[0, 0, Math.PI / 2]} material={materials.chassis}>
        <cylinderGeometry args={[0.05, 0.05, 1.25, 12]} />
      </mesh>
      {/* Rear Axle Housing */}
      <mesh position={[0, 0.55, -0.65]} rotation={[0, 0, Math.PI / 2]} material={materials.chassis}>
        <cylinderGeometry args={[0.08, 0.08, 1.5, 12]} />
      </mesh>

      {/* ================= ENGINE, BONNET & HOOD (VIBRATING IDLE) ================= */}
      <group ref={engineVibeRef}>
        {/* Main Sculpted Tractor Hood (Bonnet) */}
        <group position={[0, 0.82, 0.55]}>
          {/* Central Hood Body */}
          <mesh position={[0, 0, 0]} material={materials.body} castShadow receiveShadow>
            <boxGeometry args={[0.62, 0.48, 1.25]} />
          </mesh>
          {/* Rounded Hood Top */}
          <mesh position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.body} castShadow>
            <cylinderGeometry args={[0.31, 0.31, 1.25, 16, 1, false, 0, Math.PI]} />
          </mesh>
          {/* Side Chrome Accent Stripes */}
          <mesh position={[0.315, 0.05, 0]} material={materials.bodyAccent}>
            <boxGeometry args={[0.01, 0.035, 1.15]} />
          </mesh>
          <mesh position={[-0.315, 0.05, 0]} material={materials.bodyAccent}>
            <boxGeometry args={[0.01, 0.035, 1.15]} />
          </mesh>
        </group>

        {/* Front Radiator Grille */}
        <group position={[0, 0.8, 1.18]}>
          {/* Grille Surround */}
          <mesh material={materials.grille} castShadow>
            <boxGeometry args={[0.58, 0.44, 0.05]} />
          </mesh>
          {/* Horizontal Slat Highlights */}
          {[-0.14, -0.07, 0, 0.07, 0.14].map((y, i) => (
            <mesh key={i} position={[0, y, 0.028]} material={materials.chrome}>
              <boxGeometry args={[0.52, 0.015, 0.01]} />
            </mesh>
          ))}
          {/* Tractor Front Emblem */}
          <mesh position={[0, 0.15, 0.03]} material={materials.chrome}>
            <cylinderGeometry args={[0.045, 0.045, 0.015, 12]} />
          </mesh>
          {/* Front Headlights */}
          <group position={[0.2, 0.08, 0.03]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.chrome}>
              <cylinderGeometry args={[0.07, 0.07, 0.03, 16]} />
            </mesh>
            <mesh position={[0, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]} material={materials.headlightGlass}>
              <cylinderGeometry args={[0.06, 0.06, 0.01, 16]} />
            </mesh>
          </group>
          <group position={[-0.2, 0.08, 0.03]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.chrome}>
              <cylinderGeometry args={[0.07, 0.07, 0.03, 16]} />
            </mesh>
            <mesh position={[0, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]} material={materials.headlightGlass}>
              <cylinderGeometry args={[0.06, 0.06, 0.01, 16]} />
            </mesh>
          </group>
        </group>

        {/* Engine Block & Mechanical Details */}
        <group position={[0, 0.48, 0.45]}>
          <mesh material={materials.chassis} castShadow>
            <boxGeometry args={[0.54, 0.28, 0.7]} />
          </mesh>
          {/* Starter / Filter Canister (Left) */}
          <mesh position={[-0.3, 0.05, 0.1]} material={materials.chassis}>
            <cylinderGeometry args={[0.06, 0.06, 0.22, 12]} />
          </mesh>
          {/* Oil Filter (Right) */}
          <mesh position={[0.3, 0.02, -0.05]} material={materials.bodyAccent}>
            <cylinderGeometry args={[0.05, 0.05, 0.15, 10]} />
          </mesh>
        </group>

        {/* Exhaust Stack (Right Front Chimney with Flapper Cap) */}
        <group position={[0.26, 0.95, 0.8]}>
          <mesh position={[0, 0.35, 0]} material={materials.exhaust} castShadow>
            <cylinderGeometry args={[0.03, 0.035, 0.7, 12]} />
          </mesh>
          {/* Curved Exhaust Tip */}
          <mesh position={[0, 0.7, 0.02]} rotation={[0.4, 0, 0]} material={materials.exhaust}>
            <cylinderGeometry args={[0.03, 0.03, 0.12, 10]} />
          </mesh>
          {/* Hinged Rain Flap */}
          <mesh ref={exhaustFlapRef} position={[0, 0.76, 0.04]} material={materials.exhaust}>
            <boxGeometry args={[0.07, 0.01, 0.07]} />
          </mesh>
        </group>

        {/* Air Cleaner Snorkel Canister (Left Front) */}
        <group position={[-0.26, 0.95, 0.75]}>
          <mesh position={[0, 0.25, 0]} material={materials.chassis}>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 12]} />
          </mesh>
          {/* Cyclone Pre-cleaner Bowl */}
          <mesh position={[0, 0.52, 0]} material={materials.chassis}>
            <cylinderGeometry args={[0.08, 0.06, 0.12, 12]} />
          </mesh>
        </group>
      </group>

      {/* ================= OPERATOR CABIN / DRIVER DECK ================= */}
      {/* Floor Footboards */}
      <mesh position={[0, 0.48, -0.25]} material={materials.chassis} castShadow>
        <boxGeometry args={[1.05, 0.05, 0.8]} />
      </mesh>

      {/* Arched Rear Mudguards (Fenders) */}
      <group position={[-0.68, 0.82, -0.65]}>
        <mesh material={materials.body} castShadow receiveShadow>
          <boxGeometry args={[0.25, 0.45, 0.85]} />
        </mesh>
        {/* Tail reflector */}
        <mesh position={[-0.05, 0, -0.43]} material={materials.taillight}>
          <boxGeometry args={[0.1, 0.08, 0.02]} />
        </mesh>
      </group>
      <group position={[0.68, 0.82, -0.65]}>
        <mesh material={materials.body} castShadow receiveShadow>
          <boxGeometry args={[0.25, 0.45, 0.85]} />
        </mesh>
        <mesh position={[0.05, 0, -0.43]} material={materials.taillight}>
          <boxGeometry args={[0.1, 0.08, 0.02]} />
        </mesh>
      </group>

      {/* Deluxe Suspension Farmer Seat */}
      <group position={[0, 0.75, -0.55]}>
        {/* Cushion Base */}
        <mesh position={[0, 0.05, 0]} material={materials.seat} castShadow>
          <boxGeometry args={[0.38, 0.09, 0.35]} />
        </mesh>
        {/* Ergonomic Backrest */}
        <mesh position={[0, 0.26, -0.16]} rotation={[-0.1, 0, 0]} material={materials.seat} castShadow>
          <boxGeometry args={[0.36, 0.34, 0.08]} />
        </mesh>
        {/* Seat Mounting Spring Bracket */}
        <mesh position={[0, -0.12, 0]} material={materials.chassis}>
          <cylinderGeometry args={[0.05, 0.07, 0.22, 10]} />
        </mesh>
      </group>

      {/* Steering Column & Wheel */}
      <group position={[0, 0.85, -0.1]}>
        {/* Angled Steering Shaft */}
        <mesh position={[0, 0.15, 0.08]} rotation={[-0.4, 0, 0]} material={materials.chassis}>
          <cylinderGeometry args={[0.025, 0.025, 0.42, 10]} />
        </mesh>
        {/* 3-Spoke Steering Wheel */}
        <mesh position={[0, 0.32, -0.02]} rotation={[1.15, 0, 0]} material={materials.seat}>
          <torusGeometry args={[0.15, 0.02, 8, 20]} />
        </mesh>
        {/* Steering Wheel Center Cap */}
        <mesh position={[0, 0.32, -0.02]} rotation={[1.15, 0, 0]} material={materials.chrome}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 10]} />
        </mesh>
      </group>

      {/* Dashboard / Instrument Cowl */}
      <mesh position={[0, 0.88, 0.02]} rotation={[-0.35, 0, 0]} material={materials.chassis}>
        <boxGeometry args={[0.55, 0.18, 0.12]} />
      </mesh>

      {/* Rear 3-Point Tow Hitch & Drawbar */}
      <group position={[0, 0.38, -1.05]}>
        <mesh material={materials.chassis} castShadow>
          <boxGeometry args={[0.3, 0.08, 0.25]} />
        </mesh>
        <mesh position={[0, -0.05, -0.1]} material={materials.chrome}>
          <cylinderGeometry args={[0.025, 0.025, 0.12, 8]} />
        </mesh>
      </group>
    </group>
  );
};

export default Tractor3DModel;

