"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useState, useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

// Custom shader for per-particle randomness (size, opacity, flicker)
const EmberShader = {
  uniforms: {
    time: { value: 0 },
    pointTexture: { value: null },
  },
  vertexShader: `
    attribute float aSize;
    attribute float aOpacity;
    attribute float aFlickerSpeed;
    varying float vOpacity;
    varying vec3 vColor;
    varying float vFlicker;
    uniform float time;

    void main() {
      vColor = color;
      vFlicker = sin(time * aFlickerSpeed) * 0.5 + 0.5;
      vOpacity = aOpacity;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = aSize * (400.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D pointTexture;
    varying float vOpacity;
    varying vec3 vColor;
    varying float vFlicker;

    void main() {
      vec4 texColor = texture2D(pointTexture, gl_PointCoord);
      if (texColor.a < 0.2) discard;
      gl_FragColor = vec4(vColor, vOpacity * vFlicker) * texColor;
    }
  `,
};

function Embers({ isMobile }: { isMobile: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const flakeTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "white";
    ctx.beginPath();
    const centerX = 32, centerY = 32;
    const points = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radius = 5 + Math.random() * 25;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }, []);

  const { positions, colors, velocities, flutters, sizes, opacities, flickerSpeeds, particleCount } = useMemo(() => {
    const count = isMobile ? 12000 : 35000; // Restoring original high density
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    const flu = new Float32Array(count);
    const sz = new Float32Array(count);
    const op = new Float32Array(count);
    const fs = new Float32Array(count);

    const colorPalette = [
      new THREE.Color("#f97316"),
      new THREE.Color("#ea580c"),
      new THREE.Color("#991b1b"),
      new THREE.Color("#7c2d12"),
      new THREE.Color("#f59e0b"),
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      
      vel[i] = 0.006 + Math.random() * 0.025; 
      flu[i] = Math.random() * Math.PI * 2;
      sz[i] = Math.random() < 0.05 ? (0.15 + Math.random() * 0.3) : (0.02 + Math.random() * 0.04); 
      op[i] = 0.5 + Math.random() * 0.5; // Brighter min opacity
      fs[i] = 4.0 + Math.random() * 12.0; 

      const mixedColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      col[i * 3]     = mixedColor.r;
      col[i * 3 + 1] = mixedColor.g;
      col[i * 3 + 2] = mixedColor.b;
    }
    return { 
      positions: pos, colors: col, velocities: vel, flutters: flu, 
      sizes: sz, opacities: op, flickerSpeeds: fs, particleCount: count 
    };
  }, [isMobile]);

  useFrame((state) => {
    if (ref.current && materialRef.current) {
      const time = state.clock.getElapsedTime();
      materialRef.current.uniforms.time.value = time;
      const posAttr = ref.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        posAttr[i3 + 1] += velocities[i];
        posAttr[i3] += Math.sin(time * 1.2 + flutters[i]) * 0.003;

        if (posAttr[i3 + 1] > 8) {
          posAttr[i3 + 1] = -8;
          posAttr[i3] = (Math.random() - 0.5) * 35;
        }
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aOpacity" args={[opacities, 1]} />
        <bufferAttribute attach="attributes-aFlickerSpeed" args={[flickerSpeeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={useMemo(() => ({
          time: { value: 0 },
          pointTexture: { value: flakeTexture },
        }), [flakeTexture])}
        vertexShader={EmberShader.vertexShader}
        fragmentShader={EmberShader.fragmentShader}
      />
    </points>
  );
}

export default function AuraBackground({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0c0a09] overflow-hidden selection:bg-gold-500/30 selection:text-white">
      {/* Background Layer (Ember reinforcement) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <Canvas camera={{ position: [0, 0, 10] }} dpr={isMobile ? [1, 1] : [1, 1.5]}>
          <Embers isMobile={isMobile} />
        </Canvas>
      </div>

      {/* Atmospheric Neutral Glow Overlay (No more violet tint) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-transparent via-black/10 to-black/80" />

      {/* Content Layer */}
      <div className="relative z-10 w-full flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
