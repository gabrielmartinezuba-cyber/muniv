"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points } from "@react-three/drei";
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
      vFlicker = sin(time * aFlickerSpeed) * 0.5 + 0.5; // More dramatic flickering (0.0 to 1.0)
      vOpacity = aOpacity;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = aSize * (400.0 / -mvPosition.z); // Slightly larger base
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
      if (texColor.a < 0.2) discard; // Sharper irregular edges
      gl_FragColor = vec4(vColor, vOpacity * vFlicker) * texColor;
    }
  `,
};

function Embers({ isMobile }: { isMobile: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Irregular flake texture generation (Procedural Spark/Ash)
  const flakeTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Draw an irregular, jagged flake
    ctx.fillStyle = "white";
    ctx.beginPath();
    const centerX = 32, centerY = 32;
    // Lower point count for sharper, more 'ash-like' jaggies
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
    const count = isMobile ? 10000 : 35000; // Restoring "original" high density
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    const flu = new Float32Array(count);
    const sz = new Float32Array(count);
    const op = new Float32Array(count);
    const fs = new Float32Array(count);

    const colorPalette = [
      new THREE.Color("#f97316"), // Naranja fuego
      new THREE.Color("#ea580c"), // Deep orange
      new THREE.Color("#991b1b"), // Rojo vino
      new THREE.Color("#7c2d12"), // Borgoña profundo
      new THREE.Color("#f59e0b"), // Ámbar
    ];

    for (let i = 0; i < count; i++) {
      // SCREEN-WIDE DISTRIBUTION (Restoring proportional coverage)
      pos[i * 3]     = (Math.random() - 0.5) * 30; // Wide X spread (-15 to 15)
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14; // Full Y coverage
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;  // Depth
      
      vel[i] = 0.008 + Math.random() * 0.035; 
      flu[i] = Math.random() * Math.PI * 2;
      
      // STYLE: Keeping the validated irregular sparks and embers
      sz[i] = Math.random() < 0.02 ? (0.12 + Math.random() * 0.25) : (0.015 + Math.random() * 0.025); 
      
      op[i] = 0.4 + Math.random() * 0.6; 
      fs[i] = 5.0 + Math.random() * 15.0; 

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
        posAttr[i3] += Math.sin(time * 1.5 + flutters[i]) * 0.004;

        if (posAttr[i3 + 1] > 7) {
          posAttr[i3 + 1] = -7;
          posAttr[i3] = (Math.random() - 0.5) * 30; // Wide reset
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

export default function HeroScene() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 8] }} dpr={isMobile ? [1, 1] : [1, 2]}>
      <ambientLight intensity={0.3} />
      <Embers isMobile={isMobile} />
    </Canvas>
  );
}
