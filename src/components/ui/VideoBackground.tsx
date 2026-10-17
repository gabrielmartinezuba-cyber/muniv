'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VideoBackgroundProps {
  /** URL of the background video */
  src: string;
  /** Optional poster image URL shown before video loads */
  poster?: string;
  /** Whether to render the gradient overlay (default: true) */
  overlay?: boolean;
  /** Overlay opacity from 0 to 1 (default: 0.7) */
  overlayOpacity?: number;
  /** Additional CSS classes for the container */
  className?: string;
  /** Content rendered on top of the video */
  children?: ReactNode;
}

export function VideoBackground({
  src,
  poster,
  overlay = true,
  overlayOpacity = 0.7,
  className,
  children,
}: VideoBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Lazy-load: only start loading the video when container enters viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Auto-play the video once it's loaded and in view
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isInView) return;

    const handleCanPlay = () => {
      video.play().catch(() => {
        // Autoplay blocked — treat as error fallback
        setHasError(true);
      });
    };

    const handlePlaying = () => setIsPlaying(true);
    const handleError = () => setHasError(true);

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    // If the video is already ready (cached), trigger play manually
    if (video.readyState >= 3) {
      handleCanPlay();
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
    };
  }, [isInView]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-stone-950',
        className
      )}
    >
      {/* Poster / Fallback background */}
      {poster && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${poster})` }}
          aria-hidden="true"
        />
      )}

      {/* Video element — only rendered once in viewport */}
      <AnimatePresence>
        {isInView && !hasError && (
          <motion.video
            ref={videoRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: isPlaying ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 h-full w-full object-cover"
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            autoPlay
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Gradient overlay */}
      {overlay && (
        <div
          className="video-overlay-gradient absolute inset-0"
          style={{ opacity: overlayOpacity }}
          aria-hidden="true"
        />
      )}

      {/* Content layer */}
      {children && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  );
}
