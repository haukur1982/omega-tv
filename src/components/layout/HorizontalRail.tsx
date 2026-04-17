'use client';

import { useRef, useCallback } from 'react';

interface HorizontalRailProps {
  children: React.ReactNode;
  className?: string;
}

export default function HorizontalRail({ children, className = '' }: HorizontalRailProps) {
  const railRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = railRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className={`rail-container ${className}`}>
      {/* Left Arrow */}
      <button
        className="rail-arrow rail-arrow-left"
        onClick={() => scroll('left')}
        aria-label="Scroll left"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>
      </button>

      {/* Scrollable rail */}
      <div
        ref={railRef}
        className="rail-scroll"
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          gap: '16px',
          paddingBottom: '12px',
        }}
      >
        {children}
      </div>

      {/* Right Arrow */}
      <button
        className="rail-arrow rail-arrow-right"
        onClick={() => scroll('right')}
        aria-label="Scroll right"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>
      </button>
    </div>
  );
}
