"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useState, useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

function Embers({ isMobile }: { isMobile: boolean }) {
  const ref = useRef<THREE.Points>(null);
  
  // Create points in a sphere to simulate glowing embers/sparks
  const { positions, colors, particleCount } = useMemo(() => {
    // 30% of total desktop particles when on mobile
    const count = isMobile ? 600 : 2000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    // Rose-700 (#BE123C), Orange-500 (#F97316), Gold-500 (#D4AF37)
    const colorPalette = [
      new THREE.Color("#BE123C"), 
      new THREE.Color("#F97316"), 
      new THREE.Color("#D4AF37")
    ];

    for (let i = 0; i < count; i++) {
      const r = 10 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta); // x
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); // y
      pos[i * 3 + 2] = r * Math.cos(phi); // z
      
      const mixedColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      col[i * 3] = mixedColor.r;
      col[i * 3 + 1] = mixedColor.g;
      col[i * 3 + 2] = mixedColor.b;
    }
    return { positions: pos, colors: col, particleCount: count };
  }, [isMobile]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
      
      // Organic flow
      const time = state.clock.getElapsedTime();
      const positions = ref.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Subtle drift on y-axis resembling heat rising
        positions[i3 + 1] += Math.sin(time + positions[i3]) * 0.005;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.08}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function HeroScene() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check immediately on mount (ssr is false, window is safe)
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    // Adjust Device Pixel Ratio for performance on mobile
    <Canvas camera={{ position: [0, 0, 8] }} dpr={isMobile ? [1, 1] : [1, 2]}>
      <ambientLight intensity={0.5} />
      <Embers isMobile={isMobile} />
    </Canvas>
  );
}
