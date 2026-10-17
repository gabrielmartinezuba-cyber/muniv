"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy-load WebGL 3D embers ambient particles so they layer delicately over the video
const Scene3D = dynamic(() => import("@/components/3d/HeroScene"), {
  ssr: false,
  loading: () => null,
});

export function GlobalVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlaying = () => setIsVideoLoaded(true);
    video.addEventListener("playing", handlePlaying);

    // Attempt autoplay immediately
    video.play().catch(() => {
      // Autoplay with muted is allowed on all modern browsers
    });

    return () => {
      video.removeEventListener("playing", handlePlaying);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-50 w-full h-full overflow-hidden pointer-events-none select-none"
    >
      {/* 1. Cinematic Video Background (Fixed, Covering entire viewport) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`w-full h-full object-cover transition-opacity duration-1000 ${
          isVideoLoaded ? "opacity-100" : "opacity-80"
        }`}
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* 2. WebGL 3D Embers overlay - sparks floating over the video */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-40">
        <ErrorBoundary fallbackMessage="">
          <Scene3D />
        </ErrorBoundary>
      </div>

      {/* 3. High-Contrast Vignette: Transparent center, delicate dark edges for WCAG readability */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.5)_90%)]" />
    </div>
  );
}
