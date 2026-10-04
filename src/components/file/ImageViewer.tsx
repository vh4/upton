'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt: string;
}

export function ImageViewer({ src, alt }: ImageViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const toggleFullscreen = () => {
    const el = document.getElementById('upton-image-preview');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      id="upton-image-preview"
      className="relative w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800/80 flex items-center justify-center p-4 min-h-[300px] max-h-[75vh]"
    >
      {/* Background checker pattern for transparent PNG/SVG/WEBP */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #888 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />

      {/* Floating View Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 p-1 rounded-xl bg-white/90 dark:bg-zinc-900/80 backdrop-blur border border-zinc-300 dark:border-zinc-800 shadow-sm">
        <button
          type="button"
          onClick={() => setIsZoomed(!isZoomed)}
          title={isZoomed ? 'Zoom Out' : 'Zoom In'}
          className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          title="Fullscreen"
          className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Image Element */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`rounded-lg object-contain transition-transform duration-300 ${
          isZoomed
            ? 'scale-150 cursor-zoom-out'
            : 'max-h-[68vh] w-auto max-w-full cursor-zoom-in shadow-xl'
        }`}
        onClick={() => setIsZoomed(!isZoomed)}
      />
    </div>
  );
}
