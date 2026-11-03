import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface CropModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  autoRotate?: boolean;
  rotationSpeed?: number;
}

// ----------------------------------------------------
// 1. MANGO (Alphonso / Kesar Indian Mango)
// ----------------------------------------------------
export const Mango3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Mango Body - Asymmetrical organic shape */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, -0.15]} castShadow>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Mango Beak Curve */}
      <mesh position={[0.22, -0.25, 0]} rotation={[0, 0, -0.7]} castShadow>
        <coneGeometry args={[0.3, 0.45, 16]} />
        <meshStandardMaterial color="#f97316" roughness={0.35} />
      </mesh>
      {/* Reddish sun-blush cheek */}
      <mesh position={[-0.15, 0.1, 0.25]} scale={[0.35, 0.45, 0.15]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#ea580c" roughness={0.4} />
      </mesh>
      {/* Stem */}
      <mesh position={[-0.05, 0.58, 0]} rotation={[0, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.25, 8]} />
        <meshStandardMaterial color="#4a3728" roughness={0.8} />
      </mesh>
      {/* Glossy Green Leaf */}
      <group position={[-0.08, 0.52, 0.05]} rotation={[0.4, 0.3, -0.8]}>
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.6, 0.02]} />
          <meshStandardMaterial color="#15803d" roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
};

// ----------------------------------------------------
// 2. BANANA (Indian Robusta / Yelakki Bunch)
// ----------------------------------------------------
export const Banana3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  const bananas = useMemo(() => {
    return [
      { rotZ: -0.2, rotY: 0, posX: 0.15, posY: 0 },
      { rotZ: 0.1, rotY: 0.8, posX: -0.1, posY: 0.05 },
      { rotZ: 0.25, rotY: 1.6, posX: -0.18, posY: -0.02 },
      { rotZ: -0.1, rotY: 2.4, posX: 0.05, posY: 0.08 },
      { rotZ: 0.15, rotY: 3.2, posX: 0.12, posY: -0.05 },
    ];
  }, []);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Central Crown / Stalk */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.22, 10]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.8} />
      </mesh>

      {/* Clustered curved bananas */}
      {bananas.map((b, i) => (
        <group key={i} position={[b.posX, b.posY, 0]} rotation={[0, b.rotY, b.rotZ]}>
          {/* Main Curved Body */}
          <mesh position={[0, -0.15, 0.12]} rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.07, 0.75, 10]} />
            <meshStandardMaterial color="#facc15" roughness={0.35} />
          </mesh>
          {/* Green Tip */}
          <mesh position={[0, -0.52, 0.27]} rotation={[0.4, 0, 0]}>
            <coneGeometry args={[0.07, 0.15, 8]} />
            <meshStandardMaterial color="#65a30d" roughness={0.6} />
          </mesh>
          {/* Stem connector */}
          <mesh position={[0, 0.22, -0.02]} rotation={[-0.3, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.18, 8]} />
            <meshStandardMaterial color="#84cc16" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ----------------------------------------------------
// 3. GRAPES (Nasik Black / Green Grapes Cluster)
// ----------------------------------------------------
export const Grapes3D: React.FC<CropModelProps & { color?: string }> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
  color = '#4c1d95', // Rich purple/black grape
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  // Generate conical berry cluster
  const berries = useMemo(() => {
    const list: [number, number, number][] = [];
    const layers = [
      { y: 0.25, count: 6, r: 0.22 },
      { y: 0.1, count: 7, r: 0.26 },
      { y: -0.05, count: 6, r: 0.22 },
      { y: -0.2, count: 5, r: 0.18 },
      { y: -0.35, count: 3, r: 0.12 },
      { y: -0.48, count: 1, r: 0.02 },
    ];
    layers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        const angle = (i / layer.count) * Math.PI * 2 + (layer.y * 2);
        list.push([
          Math.cos(angle) * layer.r,
          layer.y,
          Math.sin(angle) * layer.r,
        ]);
      }
    });
    return list;
  }, []);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Woody Main Stem */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.3, 8]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.8} />
      </mesh>
      {/* Vine Tendril & Leaf */}
      <mesh position={[0.12, 0.38, 0]} rotation={[0.2, 0, -0.6]} castShadow>
        <boxGeometry args={[0.28, 0.24, 0.02]} />
        <meshStandardMaterial color="#16a34a" roughness={0.3} />
      </mesh>
      {/* Berries */}
      {berries.map((pos, idx) => (
        <mesh key={idx} position={pos} castShadow>
          <sphereGeometry args={[0.11, 14, 14]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
};

// ----------------------------------------------------
// 4. POMEGRANATE (Bhagwa Anaar)
// ----------------------------------------------------
export const Pomegranate3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Main Round Fruit Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.52, 22, 22]} />
        <meshStandardMaterial color="#be123c" roughness={0.35} metalness={0.05} />
      </mesh>
      {/* Signature Calyx Crown (Pointed Sepals at bottom) */}
      <group position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.1, 0.14, 0.12, 8]} />
          <meshStandardMaterial color="#9f1239" roughness={0.5} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            position={[Math.cos((i * Math.PI) / 3) * 0.1, 0.14, Math.sin((i * Math.PI) / 3) * 0.1]}
            rotation={[0.3, (i * Math.PI) / 3, 0]}
          >
            <coneGeometry args={[0.04, 0.12, 5]} />
            <meshStandardMaterial color="#881337" roughness={0.5} />
          </mesh>
        ))}
      </group>
      {/* Woody Stem at top */}
      <mesh position={[0, 0.54, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.16, 8]} />
        <meshStandardMaterial color="#57361a" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// 5. ORANGE / CITRUS (Nagpur Santra)
// ----------------------------------------------------
export const Orange3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Textured Orange Citrus Sphere */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color="#ea580c" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Green Calyx Button & Leaf */}
      <mesh position={[0, 0.49, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.02, 0.04, 6]} />
        <meshStandardMaterial color="#15803d" roughness={0.6} />
      </mesh>
      <mesh position={[0.15, 0.54, 0]} rotation={[0.2, 0, -0.5]} castShadow>
        <boxGeometry args={[0.22, 0.42, 0.02]} />
        <meshStandardMaterial color="#166534" roughness={0.3} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// 6. GUAVA (Amrud / Jam)
// ----------------------------------------------------
export const Guava3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Globular / Pear Light Green Fruit */}
      <mesh position={[0, -0.05, 0]} scale={[1, 1.15, 1]} castShadow>
        <sphereGeometry args={[0.48, 20, 20]} />
        <meshStandardMaterial color="#84cc16" roughness={0.55} />
      </mesh>
      {/* Apex floral remnant */}
      <mesh position={[0, -0.58, 0]}>
        <cylinderGeometry args={[0.05, 0.02, 0.04, 6]} />
        <meshStandardMaterial color="#3f2e1a" roughness={0.9} />
      </mesh>
      {/* Stem & Leaves */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.16, 8]} />
        <meshStandardMaterial color="#4d321d" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// 7. PAPAYA
// ----------------------------------------------------
export const Papaya3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Elongated Oval Body */}
      <mesh position={[0, 0, 0]} scale={[0.85, 1.4, 0.85]} castShadow>
        <sphereGeometry args={[0.45, 20, 20]} />
        <meshStandardMaterial color="#eab308" roughness={0.4} />
      </mesh>
      {/* Green patches */}
      <mesh position={[0.1, 0.1, 0.2]} scale={[0.5, 0.9, 0.5]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#65a30d" roughness={0.5} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.15, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.7} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// 8. WATERMELON (Tarbooj)
// ----------------------------------------------------
export const Watermelon3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Large Oblong Melon Body */}
      <mesh position={[0, 0, 0]} scale={[1, 1.25, 1]} castShadow>
        <sphereGeometry args={[0.52, 24, 24]} />
        <meshStandardMaterial color="#15803d" roughness={0.35} />
      </mesh>
      {/* Dark green stripes */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 4, 0]}>
          <mesh position={[0, 0, 0.52]} scale={[0.08, 1.24, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#052e16" roughness={0.4} />
          </mesh>
        </group>
      ))}
      {/* Curly Vine Tendril */}
      <mesh position={[0, 0.68, 0]} rotation={[0.4, 0.2, 0]}>
        <torusGeometry args={[0.06, 0.02, 6, 14, Math.PI * 1.5]} />
        <meshStandardMaterial color="#4ade80" roughness={0.6} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// 9. TOMATO (Tamatar)
// ----------------------------------------------------
export const Tomato3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Glossy Red Plump Body with slight lobed indentations */}
      <mesh position={[0, 0, 0]} scale={[1.1, 0.95, 1.1]} castShadow>
        <sphereGeometry args={[0.48, 24, 24]} />
        <meshStandardMaterial color="#dc2626" roughness={0.25} metalness={0.05} />
      </mesh>
      {/* Green 5-pointed Calyx */}
      <group position={[0, 0.44, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[Math.cos((i * Math.PI * 2) / 5) * 0.12, 0, Math.sin((i * Math.PI * 2) / 5) * 0.12]}
            rotation={[0.3, -(i * Math.PI * 2) / 5, 0]}
          >
            <coneGeometry args={[0.045, 0.22, 5]} />
            <meshStandardMaterial color="#16a34a" roughness={0.4} />
          </mesh>
        ))}
        {/* Vine Segment */}
        <mesh position={[0, 0.1, 0]} rotation={[0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.18, 8]} />
          <meshStandardMaterial color="#15803d" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
};

// ----------------------------------------------------
// 10. ONION (Pyaaz / Kanda)
// ----------------------------------------------------
export const Onion3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Bulbous Body */}
      <mesh position={[0, 0, 0]} scale={[1.15, 1, 1.15]} castShadow>
        <sphereGeometry args={[0.46, 22, 22]} />
        <meshStandardMaterial color="#9d174d" roughness={0.45} />
      </mesh>
      {/* Tapered Neck at top */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <coneGeometry args={[0.18, 0.35, 14]} />
        <meshStandardMaterial color="#831843" roughness={0.5} />
      </mesh>
      {/* Dried Shoot tip */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.02, 0.05, 0.16, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Root Tendrils at base */}
      <group position={[0, -0.46, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[Math.cos((i * Math.PI * 2) / 5) * 0.05, -0.06, Math.sin((i * Math.PI * 2) / 5) * 0.05]}
            rotation={[0.2, (i * Math.PI * 2) / 5, 0]}
          >
            <cylinderGeometry args={[0.01, 0.005, 0.14, 5]} />
            <meshStandardMaterial color="#d4b499" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ----------------------------------------------------
// 11. POTATO (Aloo / Batata)
// ----------------------------------------------------
export const Potato3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Organic Lumpy Tuber */}
      <mesh position={[0, 0, 0]} scale={[1.25, 0.85, 0.95]} rotation={[0.1, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.48, 20, 20]} />
        <meshStandardMaterial color="#b45309" roughness={0.85} />
      </mesh>
      {/* Dimpled Potato Eyes */}
      {[
        [-0.25, 0.1, 0.35],
        [0.2, -0.15, 0.32],
        [-0.1, -0.2, -0.35],
        [0.35, 0.12, -0.2],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

// ----------------------------------------------------
// 12. BRINJAL / EGGPLANT (Baingan / Vangi)
// ----------------------------------------------------
export const Brinjal3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Glossy Deep Violet Teardrop Body */}
      <mesh position={[0, -0.1, 0]} scale={[1, 1.45, 1]} castShadow>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial color="#3b0764" roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Spiky Green Calyx Cap */}
      <group position={[0, 0.48, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.25, 0.12, 8]} />
          <meshStandardMaterial color="#166534" roughness={0.6} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[Math.cos((i * Math.PI) / 2) * 0.18, -0.06, Math.sin((i * Math.PI) / 2) * 0.18]}
            rotation={[0.6, (i * Math.PI) / 2, 0]}
          >
            <coneGeometry args={[0.06, 0.2, 5]} />
            <meshStandardMaterial color="#15803d" roughness={0.6} />
          </mesh>
        ))}
        {/* Sturdy Stem */}
        <mesh position={[0, 0.15, 0]} rotation={[0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 0.22, 8]} />
          <meshStandardMaterial color="#14532d" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
};

// ----------------------------------------------------
// 13. CHILLI (Mirchi)
// ----------------------------------------------------
export const Chilli3D: React.FC<CropModelProps & { color?: string }> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
  color = '#ef4444', // Fiery red
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Curved Chilli Pod */}
      <group position={[0, 0.1, 0]}>
        <mesh position={[0, 0, 0]} rotation={[0.15, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.09, 0.45, 10]} />
          <meshStandardMaterial color={color} roughness={0.25} />
        </mesh>
        {/* Tapering Pointed Tip with Curve */}
        <mesh position={[0, -0.38, 0.08]} rotation={[0.45, 0, 0]} castShadow>
          <coneGeometry args={[0.09, 0.45, 10]} />
          <meshStandardMaterial color={color} roughness={0.25} />
        </mesh>
      </group>
      {/* Calyx & Stem */}
      <group position={[0, 0.35, -0.04]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.13, 0.08, 6]} />
          <meshStandardMaterial color="#15803d" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.12, -0.02]} rotation={[-0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.2, 6]} />
          <meshStandardMaterial color="#166534" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
};

// ----------------------------------------------------
// 14. CABBAGE / CAULIFLOWER (Patta Gobhi)
// ----------------------------------------------------
export const Cabbage3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Central Dense Head */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.45, 20, 20]} />
        <meshStandardMaterial color="#86efac" roughness={0.4} />
      </mesh>
      {/* Overlapping Ruffled Outer Leaves */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * Math.PI * 2) / 6;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.25, -0.05, Math.sin(angle) * 0.25]}
            rotation={[0.35, angle, 0]}
            castShadow
          >
            <sphereGeometry args={[0.36, 12, 12, 0, Math.PI]} />
            <meshStandardMaterial color="#22c55e" roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
};

// ----------------------------------------------------
// 15. OKRA / LADYFINGER (Bhindi)
// ----------------------------------------------------
export const Okra3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* 5-Fluted Ridged Tapering Pod */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <coneGeometry args={[0.13, 0.85, 5]} />
        <meshStandardMaterial color="#16a34a" roughness={0.65} />
      </mesh>
      {/* Hexagonal Cap */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.08, 6]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.16, 6]} />
        <meshStandardMaterial color="#14532d" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// 16. WHEAT (Gehun)
// ----------------------------------------------------
export const Wheat3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  // Spikelet pairs alternating along stem
  const spikelets = useMemo(() => {
    const list: { y: number; side: number }[] = [];
    for (let i = 0; i < 9; i++) {
      list.push({ y: -0.1 + i * 0.08, side: i % 2 === 0 ? 1 : -1 });
    }
    return list;
  }, []);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Slender Golden Stem */}
      <mesh position={[0, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.025, 0.7, 8]} />
        <meshStandardMaterial color="#eab308" roughness={0.6} />
      </mesh>
      {/* Alternating Wheat Grains & Whisker Awns */}
      {spikelets.map((s, idx) => (
        <group key={idx} position={[s.side * 0.05, s.y, 0]}>
          {/* Grain kernel */}
          <mesh rotation={[0, 0, s.side * 0.4]} castShadow>
            <cylinderGeometry args={[0.035, 0.025, 0.12, 6]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.5} />
          </mesh>
          {/* Awn / Whisker extending upward */}
          <mesh position={[s.side * 0.05, 0.12, 0]} rotation={[0, 0, s.side * 0.2]}>
            <cylinderGeometry args={[0.005, 0.005, 0.2, 4]} />
            <meshStandardMaterial color="#d97706" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ----------------------------------------------------
// 17. MAIZE / CORN (Makka / Bhutta)
// ----------------------------------------------------
export const Maize3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Central Golden Cob with Kernels */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.85, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} />
      </mesh>
      {/* Corn Silk Tassel at Apex */}
      <group position={[0, 0.46, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 0.08, 0]} rotation={[0.2, (i * Math.PI) / 2, 0]}>
            <cylinderGeometry args={[0.01, 0.005, 0.18, 4]} />
            <meshStandardMaterial color="#b45309" roughness={0.8} />
          </mesh>
        ))}
      </group>
      {/* Peeling Pale Green Husk Leaves */}
      {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, idx) => (
        <group key={idx} rotation={[0, angle, 0]}>
          <mesh position={[0.16, -0.15, 0]} rotation={[0, 0, -0.25]} castShadow>
            <boxGeometry args={[0.12, 0.65, 0.02]} />
            <meshStandardMaterial color="#bef264" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Stalk base */}
      <mesh position={[0, -0.48, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.16, 8]} />
        <meshStandardMaterial color="#65a30d" roughness={0.7} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// 18. SUGARCANE (Ganna / Oos)
// ----------------------------------------------------
export const Sugarcane3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Segmented Bamboo-like Stalk with Nodes */}
      {[-0.35, -0.1, 0.15, 0.4].map((y, idx) => (
        <group key={idx} position={[0, y, 0]}>
          {/* Cane Internode */}
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.23, 12]} />
            <meshStandardMaterial color="#65a30d" roughness={0.35} />
          </mesh>
          {/* Swollen Node Ring */}
          <mesh position={[0, 0.115, 0]}>
            <torusGeometry args={[0.072, 0.015, 6, 16]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.7} />
          </mesh>
        </group>
      ))}
      {/* Arching Blade Leaves at Top */}
      <group position={[0, 0.55, 0]}>
        {[0, 1.5, 3, 4.5].map((angle, idx) => (
          <mesh key={idx} rotation={[0.4, angle, 0]} position={[0.15, 0.1, 0]}>
            <boxGeometry args={[0.08, 0.45, 0.01]} />
            <meshStandardMaterial color="#16a34a" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ----------------------------------------------------
// 19. COTTON (Kapaas)
// ----------------------------------------------------
export const Cotton3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Woody Stem & Bracts */}
      <mesh position={[0, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.4, 8]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>
      {/* 4 Dried Brown Calyx Lobes */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[Math.cos((i * Math.PI) / 2) * 0.18, -0.05, Math.sin((i * Math.PI) / 2) * 0.18]}
          rotation={[0.7, (i * Math.PI) / 2, 0]}
        >
          <coneGeometry args={[0.09, 0.25, 4]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      ))}
      {/* 4 Fluffy White Cotton Puffs (Bolls) */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[Math.cos((i * Math.PI) / 2 + 0.4) * 0.15, 0.1, Math.sin((i * Math.PI) / 2 + 0.4) * 0.15]}
          castShadow
        >
          <sphereGeometry args={[0.18, 14, 14]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// 20. PULSES / LEGUME POD (Chana / Moong / Arhar)
// ----------------------------------------------------
export const PulsePod3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Curved Green Pod Hull */}
      <mesh position={[0, 0, 0]} scale={[0.4, 1.4, 0.2]} rotation={[0, 0, 0.1]} castShadow>
        <cylinderGeometry args={[0.3, 0.1, 0.7, 12]} />
        <meshStandardMaterial color="#65a30d" roughness={0.5} />
      </mesh>
      {/* Visible round peas/seeds pushing against hull */}
      {[-0.2, 0, 0.2].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]} castShadow>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#84cc16" roughness={0.4} />
        </mesh>
      ))}
      {/* Stem connector */}
      <mesh position={[-0.04, 0.45, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.02, 0.03, 0.14, 6]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.7} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// 21. SPROUT / SEEDLING (Fallback for any custom crop)
// ----------------------------------------------------
export const Sprout3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Earth mound base */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.45, 0.15, 12]} />
        <meshStandardMaterial color="#543d2b" roughness={0.9} />
      </mesh>
      {/* Slender green shoot */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.5, 8]} />
        <meshStandardMaterial color="#84cc16" roughness={0.6} />
      </mesh>
      {/* Pair of vibrant cotyledon leaves */}
      <mesh position={[0.18, 0.18, 0]} rotation={[0.3, 0, -0.5]} castShadow>
        <boxGeometry args={[0.26, 0.18, 0.02]} />
        <meshStandardMaterial color="#22c55e" roughness={0.3} />
      </mesh>
      <mesh position={[-0.18, 0.18, 0]} rotation={[-0.3, 0, 0.5]} castShadow>
        <boxGeometry args={[0.26, 0.18, 0.02]} />
        <meshStandardMaterial color="#22c55e" roughness={0.3} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// 22. FERTILIZER BAG (Khaad / NPK Sack)
// ----------------------------------------------------
export const FertilizerBag3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Burlap / Poly Woven Sack Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.75, 0.35]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.85} />
      </mesh>
      {/* Top Sewn Hem */}
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.58, 0.05, 0.38]} />
        <meshStandardMaterial color="#d97706" roughness={0.9} />
      </mesh>
      {/* Stenciled Green Fertilizer Brand Band */}
      <mesh position={[0, 0.02, 0.18]}>
        <boxGeometry args={[0.48, 0.28, 0.01]} />
        <meshStandardMaterial color="#15803d" roughness={0.5} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// 23. SPRAYER (Knapsack Crop Sprayer)
// ----------------------------------------------------
export const Sprayer3D: React.FC<CropModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Yellow Poly Tank */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.42, 0.65, 0.26]} />
        <meshStandardMaterial color="#eab308" roughness={0.35} />
      </mesh>
      {/* Fill Cap */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 12]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} />
      </mesh>
      {/* Hand Pump Lever */}
      <mesh position={[0.26, 0.05, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.55, 8]} />
        <meshStandardMaterial color="#262626" roughness={0.7} metalness={0.5} />
      </mesh>
      {/* Brass Spray Lance */}
      <mesh position={[-0.26, 0.1, 0.1]} rotation={[0.2, 0, -0.3]}>
        <cylinderGeometry args={[0.015, 0.015, 0.7, 8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// MASTER DISPATCHER: Crop3DModel
// ----------------------------------------------------
export interface Crop3DModelProps extends CropModelProps {
  modelType: string;
}

export const Crop3DModel: React.FC<Crop3DModelProps> = ({
  modelType,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.8,
}) => {
  const normKey = (modelType || '').toLowerCase().trim();

  switch (normKey) {
    case 'mango':
      return <Mango3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'banana':
      return <Banana3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'grapes':
      return <Grapes3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'pomegranate':
      return <Pomegranate3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'orange':
      return <Orange3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'guava':
      return <Guava3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'papaya':
      return <Papaya3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'watermelon':
      return <Watermelon3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'tomato':
      return <Tomato3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'onion':
      return <Onion3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'potato':
      return <Potato3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'brinjal':
      return <Brinjal3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'chilli':
      return <Chilli3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'cabbage':
    case 'cauliflower':
      return <Cabbage3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'okra':
      return <Okra3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'wheat':
    case 'rice':
      return <Wheat3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'maize':
      return <Maize3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'sugarcane':
      return <Sugarcane3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'cotton':
      return <Cotton3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'pulse_pod':
      return <PulsePod3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'fertilizer_bag':
      return <FertilizerBag3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    case 'sprayer':
      return <Sprayer3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
    default:
      return <Sprout3D position={position} rotation={rotation} scale={scale} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />;
  }
};

export default Crop3DModel;

