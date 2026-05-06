import { useState, useEffect, useRef } from "react";

interface ResponsiveInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isCompact: boolean;
}

export function useResponsive(breakpoints?: {
  mobile?: number;
  tablet?: number;
  compact?: number;
}): ResponsiveInfo {
  const mobileBp = breakpoints?.mobile ?? 768;
  const tabletBp = breakpoints?.tablet ?? 1024;
  const compactBp = breakpoints?.compact ?? 800;

  const [sizes, setSizes] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    let rafId: number;

    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setSizes({ width: window.innerWidth, height: window.innerHeight });
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return {
    width: sizes.width,
    height: sizes.height,
    isMobile: sizes.width < mobileBp,
    isTablet: sizes.width >= mobileBp && sizes.width < tabletBp,
    isDesktop: sizes.width >= tabletBp,
    isCompact: sizes.width < compactBp || sizes.height < 600,
  };
}

export function useContainerSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [sizes, setSizes] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSizes({ width: Math.round(width), height: Math.round(height) });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, ...sizes };
}
