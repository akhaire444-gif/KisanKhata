import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface FarmerCharacterProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  animationMode?: 'idle' | 'farming' | 'waving' | 'auto';
  turbanColor?: string;
  kurtaColor?: string;
  showTool?: boolean;
}

export const FarmerCharacter: React.FC<FarmerCharacterProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  animationMode = 'auto',
  turbanColor = '#e67e22', // Vibrant saffron
  kurtaColor = '#f5eedb',  // Khadi cream
  showTool = true,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const toolRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);

  // Reusable PBR Materials
  const materials = useMemo(() => {
    return {
      skin: new THREE.MeshStandardMaterial({
        color: '#b3764d',
        roughness: 0.7,
        metalness: 0.05,
      }),
      kurta: new THREE.MeshStandardMaterial({
        color: kurtaColor,
        roughness: 0.85,
        metalness: 0.0,
      }),
      dhoti: new THREE.MeshStandardMaterial({
        color: '#ede6d6',
        roughness: 0.9,
        metalness: 0.0,
      }),
      turban: new THREE.MeshStandardMaterial({
        color: turbanColor,
        roughness: 0.75,
        metalness: 0.05,
      }),
      gamcha: new THREE.MeshStandardMaterial({
        color: '#d35400',
        roughness: 0.8,
        metalness: 0.0,
      }),
      mustache: new THREE.MeshStandardMaterial({
        color: '#261c14',
        roughness: 0.9,
      }),
      sandal: new THREE.MeshStandardMaterial({
        color: '#3e2723',
        roughness: 0.6,
      }),
      wood: new THREE.MeshStandardMaterial({
        color: '#6d4c41',
        roughness: 0.55,
      }),
      metal: new THREE.MeshStandardMaterial({
        color: '#78909c',
        metalness: 0.85,
        roughness: 0.35,
      }),
    };
  }, [kurtaColor, turbanColor]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Determine current effective animation mode
    let effectiveMode = animationMode;
    if (animationMode === 'auto') {
      const cycle = time % 24; // 24 second full cycle
      if (cycle < 10) effectiveMode = 'farming';
      else if (cycle < 18) effectiveMode = 'idle';
      else effectiveMode = 'waving';
    }

    if (!torsoRef.current || !rightArmRef.current || !leftArmRef.current || !headRef.current) return;

    if (effectiveMode === 'farming') {
      // Hoeing rhythm (period = 2.4s)
      const farmingPhase = (time * 2.6) % (Math.PI * 2);
      const swing = Math.sin(farmingPhase);

      // Torso leans forward on downswing
      const lean = THREE.MathUtils.lerp(0.1, 0.45, (swing + 1) / 2);
      torsoRef.current.rotation.x = THREE.MathUtils.lerp(torsoRef.current.rotation.x, lean, 0.1);
      torsoRef.current.position.y = THREE.MathUtils.lerp(
        torsoRef.current.position.y,
        0.82 - Math.max(0, swing) * 0.06,
        0.1
      );

      // Arms swinging tool
      const armSwing = THREE.MathUtils.lerp(-0.3, 0.85, (swing + 1) / 2);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, armSwing, 0.15);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.2, 0.1);

      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, armSwing * 0.9, 0.15);
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.3, 0.1);

      // Head looks towards ground
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0.25 + swing * 0.1, 0.1);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, 0, 0.1);

      // Hoe angle aligns with swing
      if (toolRef.current) {
        toolRef.current.rotation.x = THREE.MathUtils.lerp(toolRef.current.rotation.x, 0.4 + swing * 0.4, 0.15);
      }
    } else if (effectiveMode === 'waving') {
      // Friendly wave to camera/visitor
      const waveCycle = Math.sin(time * 6);

      // Torso upright with gentle breathing
      torsoRef.current.rotation.x = THREE.MathUtils.lerp(torsoRef.current.rotation.x, 0, 0.08);
      torsoRef.current.position.y = THREE.MathUtils.lerp(torsoRef.current.position.y, 0.85 + Math.sin(time * 2) * 0.015, 0.08);

      // Right arm raised high waving
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.4, 0.12);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.6 + waveCycle * 0.35, 0.2);

      // Left arm resting comfortably holding tool
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0.2, 0.1);
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.25, 0.1);

      // Head turns slightly toward viewer with a nod
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, Math.sin(time * 1.5) * 0.15, 0.1);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.05, 0.1);

      if (toolRef.current) {
        toolRef.current.rotation.x = THREE.MathUtils.lerp(toolRef.current.rotation.x, 0.2, 0.1);
      }
    } else {
      // Idle: peaceful standing, looking over the farm, gentle breathing
      const breath = Math.sin(time * 1.8);
      torsoRef.current.rotation.x = THREE.MathUtils.lerp(torsoRef.current.rotation.x, 0.02 * breath, 0.05);
      torsoRef.current.position.y = THREE.MathUtils.lerp(torsoRef.current.position.y, 0.85 + breath * 0.012, 0.05);

      // Resting arms
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.35, 0.08);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.15, 0.08);

      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0.3, 0.08);
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.15, 0.08);

      // Head glances left and right over fields
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, Math.sin(time * 0.6) * 0.25, 0.04);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, Math.cos(time * 0.8) * 0.06, 0.04);

      if (toolRef.current) {
        toolRef.current.rotation.x = THREE.MathUtils.lerp(toolRef.current.rotation.x, 0.2, 0.08);
      }
    }
  });

  return (
    <group ref={rootGroupRef} position={position} rotation={rotation} scale={scale}>
      {/* ================= LOWER BODY: LEGS, DHOTI & SANDALS ================= */}
      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.13, 0.42, 0]}>
        {/* Upper thigh dhoti drape */}
        <mesh position={[0, 0.05, 0]} material={materials.dhoti} castShadow receiveShadow>
          <cylinderGeometry args={[0.11, 0.09, 0.35, 12]} />
        </mesh>
        {/* Lower calf */}
        <mesh position={[0, -0.22, 0]} material={materials.skin} castShadow receiveShadow>
          <cylinderGeometry args={[0.055, 0.045, 0.28, 10]} />
        </mesh>
        {/* Sandal / Chappal */}
        <mesh position={[0, -0.38, 0.03]} material={materials.sandal} castShadow>
          <boxGeometry args={[0.1, 0.035, 0.22]} />
        </mesh>
        {/* Sandal strap */}
        <mesh position={[0, -0.35, 0.02]} material={materials.sandal}>
          <torusGeometry args={[0.045, 0.012, 6, 12, Math.PI]} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.13, 0.42, 0]}>
        {/* Upper thigh dhoti drape */}
        <mesh position={[0, 0.05, 0]} material={materials.dhoti} castShadow receiveShadow>
          <cylinderGeometry args={[0.11, 0.09, 0.35, 12]} />
        </mesh>
        {/* Lower calf */}
        <mesh position={[0, -0.22, 0]} material={materials.skin} castShadow receiveShadow>
          <cylinderGeometry args={[0.055, 0.045, 0.28, 10]} />
        </mesh>
        {/* Sandal / Chappal */}
        <mesh position={[0, -0.38, 0.03]} material={materials.sandal} castShadow>
          <boxGeometry args={[0.1, 0.035, 0.22]} />
        </mesh>
        {/* Sandal strap */}
        <mesh position={[0, -0.35, 0.02]} material={materials.sandal}>
          <torusGeometry args={[0.045, 0.012, 6, 12, Math.PI]} />
        </mesh>
      </group>

      {/* Central Dhoti Pleats & Gather */}
      <mesh position={[0, 0.52, 0.04]} rotation={[0.08, 0, 0]} material={materials.dhoti} castShadow>
        <cylinderGeometry args={[0.18, 0.15, 0.32, 14]} />
      </mesh>
      <mesh position={[0, 0.42, 0.1]} material={materials.dhoti} castShadow>
        <boxGeometry args={[0.08, 0.22, 0.04]} />
      </mesh>

      {/* ================= TORSO & UPPER BODY ================= */}
      <group ref={torsoRef} position={[0, 0.85, 0]}>
        {/* Kurta Lower Skirt/Hem hanging over dhoti */}
        <mesh position={[0, -0.15, 0]} material={materials.kurta} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.25, 0.3, 14]} />
        </mesh>

        {/* Main Chest / Kurta Body */}
        <mesh position={[0, 0.12, 0]} material={materials.kurta} castShadow receiveShadow>
          <cylinderGeometry args={[0.24, 0.22, 0.4, 14]} />
        </mesh>

        {/* Kurta Mandarin Collar */}
        <mesh position={[0, 0.33, 0]} material={materials.kurta} castShadow>
          <cylinderGeometry args={[0.1, 0.11, 0.07, 12]} />
        </mesh>

        {/* Gamcha / Angavastram (Shoulder Scarf draped over left shoulder) */}
        <group position={[-0.1, 0.22, 0]}>
          <mesh rotation={[0.2, 0.2, -0.15]} material={materials.gamcha} castShadow>
            <boxGeometry args={[0.12, 0.42, 0.06]} />
          </mesh>
          <mesh position={[0.04, -0.18, 0.1]} rotation={[-0.2, 0, 0.3]} material={materials.gamcha} castShadow>
            <boxGeometry args={[0.09, 0.32, 0.04]} />
          </mesh>
        </group>

        {/* Neck */}
        <mesh position={[0, 0.37, 0]} material={materials.skin} castShadow>
          <cylinderGeometry args={[0.065, 0.075, 0.1, 10]} />
        </mesh>

        {/* ================= HEAD & TURBAN ================= */}
        <group ref={headRef} position={[0, 0.49, 0]}>
          {/* Face / Cranium */}
          <mesh position={[0, 0, 0]} material={materials.skin} castShadow receiveShadow>
            <sphereGeometry args={[0.125, 18, 18]} />
          </mesh>

          {/* Nose */}
          <mesh position={[0, -0.01, 0.13]} rotation={[0.15, 0, 0]} material={materials.skin}>
            <coneGeometry args={[0.025, 0.06, 6]} />
          </mesh>

          {/* Ears */}
          <mesh position={[0.125, 0.01, -0.01]} material={materials.skin}>
            <sphereGeometry args={[0.035, 8, 8]} />
          </mesh>
          <mesh position={[-0.125, 0.01, -0.01]} material={materials.skin}>
            <sphereGeometry args={[0.035, 8, 8]} />
          </mesh>

          {/* Farmer Mustache */}
          <group position={[0, -0.045, 0.12]}>
            <mesh position={[0.03, 0, 0]} rotation={[0, 0, -0.3]} material={materials.mustache}>
              <cylinderGeometry args={[0.012, 0.006, 0.07, 8]} />
            </mesh>
            <mesh position={[-0.03, 0, 0]} rotation={[0, 0, 0.3]} material={materials.mustache}>
              <cylinderGeometry args={[0.012, 0.006, 0.07, 8]} />
            </mesh>
          </group>

          {/* Eyes (Stylized) */}
          <mesh position={[0.045, 0.03, 0.11]} material={materials.mustache}>
            <sphereGeometry args={[0.014, 6, 6]} />
          </mesh>
          <mesh position={[-0.045, 0.03, 0.11]} material={materials.mustache}>
            <sphereGeometry args={[0.014, 6, 6]} />
          </mesh>

          {/* Traditional Indian Pagri / Safa (Turban) */}
          <group position={[0, 0.06, 0]}>
            {/* Base wrapping rings */}
            <mesh position={[0, 0.02, 0]} rotation={[0.1, 0, 0]} material={materials.turban} castShadow>
              <torusGeometry args={[0.13, 0.045, 10, 20]} />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[-0.08, 0.1, 0]} material={materials.turban} castShadow>
              <torusGeometry args={[0.125, 0.04, 10, 20]} />
            </mesh>
            {/* Top crown fold */}
            <mesh position={[0, 0.085, 0.01]} material={materials.turban} castShadow>
              <sphereGeometry args={[0.13, 16, 12]} />
            </mesh>
            {/* Front crest pleat / kalgi fold */}
            <mesh position={[0, 0.09, 0.12]} rotation={[0.4, 0, 0]} material={materials.turban} castShadow>
              <boxGeometry args={[0.08, 0.09, 0.05]} />
            </mesh>
            {/* Hanging tail at the back (Turban Pallu) */}
            <mesh position={[0.05, -0.06, -0.12]} rotation={[-0.2, 0, 0.1]} material={materials.turban} castShadow>
              <boxGeometry args={[0.07, 0.22, 0.025]} />
            </mesh>
          </group>
        </group>

        {/* ================= RIGHT ARM & HAND ================= */}
        <group ref={rightArmRef} position={[0.25, 0.24, 0]}>
          {/* Shoulder sleeve */}
          <mesh position={[0, -0.05, 0]} material={materials.kurta} castShadow>
            <cylinderGeometry args={[0.07, 0.065, 0.16, 10]} />
          </mesh>
          {/* Forearm */}
          <group ref={rightForearmRef} position={[0, -0.16, 0]}>
            <mesh position={[0, -0.1, 0]} material={materials.skin} castShadow>
              <cylinderGeometry args={[0.05, 0.04, 0.2, 10]} />
            </mesh>
            {/* Hand */}
            <mesh position={[0, -0.22, 0]} material={materials.skin} castShadow>
              <sphereGeometry args={[0.045, 8, 8]} />
            </mesh>
          </group>
        </group>

        {/* ================= LEFT ARM & HAND ================= */}
        <group ref={leftArmRef} position={[-0.25, 0.24, 0]}>
          {/* Shoulder sleeve */}
          <mesh position={[0, -0.05, 0]} material={materials.kurta} castShadow>
            <cylinderGeometry args={[0.07, 0.065, 0.16, 10]} />
          </mesh>
          {/* Forearm */}
          <group position={[0, -0.16, 0]}>
            <mesh position={[0, -0.1, 0]} material={materials.skin} castShadow>
              <cylinderGeometry args={[0.05, 0.04, 0.2, 10]} />
            </mesh>
            {/* Hand */}
            <mesh position={[0, -0.22, 0]} material={materials.skin} castShadow>
              <sphereGeometry args={[0.045, 8, 8]} />
            </mesh>
          </group>
        </group>

        {/* ================= AGRICULTURAL TOOL (HOE / PHAWRA) ================= */}
        {showTool && (
          <group ref={toolRef} position={[0.24, 0.05, 0.1]}>
            {/* Wooden Handle */}
            <mesh position={[0, -0.2, 0.18]} rotation={[0.3, 0, 0]} material={materials.wood} castShadow>
              <cylinderGeometry args={[0.02, 0.022, 1.15, 10]} />
            </mesh>
            {/* Metal socket */}
            <mesh position={[0, -0.7, 0.34]} rotation={[0.3, 0, 0]} material={materials.metal}>
              <cylinderGeometry args={[0.03, 0.03, 0.1, 10]} />
            </mesh>
            {/* Curved Steel Hoe Blade */}
            <mesh position={[0, -0.76, 0.4]} rotation={[1.1, 0, 0]} material={materials.metal} castShadow>
              <boxGeometry args={[0.22, 0.24, 0.02]} />
            </mesh>
            {/* Blade sharp edge highlight */}
            <mesh position={[0, -0.85, 0.44]} rotation={[1.1, 0, 0]} material={materials.metal}>
              <boxGeometry args={[0.23, 0.03, 0.01]} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
};

export default FarmerCharacter;

