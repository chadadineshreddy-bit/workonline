"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ArrowUp } from "lucide-react";

/**
 * AmbientScrollExperience
 * 
 * Provides:
 * 1. Living, continuously moving background auroras & floating liquid particles
 *    that move and breathe while watching the website.
 * 2. Luminous crimson liquid scroll progress bar tracking page depth.
 * 3. Subtle parallax response when scrolling.
 * 4. Floating frosted glass Back-to-Top pill for effortless navigation.
 */
export function AmbientScrollExperience() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (currentY / docHeight) * 100 : 0;

          setScrollProgress(progress);
          setShowScrollTop(currentY > 380);
          setScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 18 Floating Liquid Stardust Particles drifting continuously across the viewport
  const particles = useMemo(() => {
    return [
      { id: 1, left: "6%", size: 6, duration: 18, delay: 0, opacity: 0.65 },
      { id: 2, left: "14%", size: 4, duration: 22, delay: 3, opacity: 0.5 },
      { id: 3, left: "22%", size: 9, duration: 20, delay: 7, opacity: 0.7 },
      { id: 4, left: "29%", size: 5, duration: 24, delay: 1, opacity: 0.55 },
      { id: 5, left: "37%", size: 8, duration: 19, delay: 5, opacity: 0.6 },
      { id: 6, left: "44%", size: 4, duration: 26, delay: 9, opacity: 0.45 },
      { id: 7, left: "52%", size: 10, duration: 21, delay: 2, opacity: 0.75 },
      { id: 8, left: "59%", size: 5, duration: 23, delay: 8, opacity: 0.5 },
      { id: 9, left: "66%", size: 7, duration: 17, delay: 4, opacity: 0.65 },
      { id: 10, left: "73%", size: 4, duration: 25, delay: 11, opacity: 0.4 },
      { id: 11, left: "81%", size: 8, duration: 20, delay: 6, opacity: 0.7 },
      { id: 12, left: "88%", size: 5, duration: 22, delay: 10, opacity: 0.55 },
      { id: 13, left: "94%", size: 9, duration: 19, delay: 1, opacity: 0.6 },
      { id: 14, left: "18%", size: 3, duration: 27, delay: 13, opacity: 0.45 },
      { id: 15, left: "48%", size: 4, duration: 23, delay: 12, opacity: 0.5 },
      { id: 16, left: "78%", size: 6, duration: 18, delay: 14, opacity: 0.65 },
      { id: 17, left: "33%", size: 11, duration: 22, delay: 8, opacity: 0.6 },
      { id: 18, left: "85%", size: 3, duration: 24, delay: 4, opacity: 0.45 },
    ];
  }, []);

  return (
    <>
      {/* 1. Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#DC2626] via-[#FB7185] to-[#DC2626] shadow-[0_0_14px_rgba(220,38,38,0.9)] transition-all duration-75 ease-out relative"
          style={{ width: `${scrollProgress}%` }}
        >
          {/* Specular White Leading Edge Refraction */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/90 shadow-[0_0_10px_white]" />
        </div>
      </div>

      {/* 2. LIVING CONTINUOUS MOVING SPATIAL BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle Fine Cyber-Glass Grid */}
        <div className="absolute inset-0 bg-cyber-grid opacity-35" />

        {/* Ambient Moving Aurora 1 - Top Center Deep Crimson (Continuous 22s Orbit) */}
        <div
          className="absolute -top-36 left-1/2 w-[820px] h-[520px] rounded-full bg-gradient-to-b from-[#DC2626]/25 via-[#991B1B]/15 to-transparent blur-[125px] animate-aurora-1 will-change-transform"
          style={{
            marginTop: `${scrollY * 0.08}px`,
          }}
        />

        {/* Ambient Moving Aurora 2 - Mid Right Scarlet-Rose Flare (Continuous 26s Orbit) */}
        <div
          className="absolute top-1/4 -right-28 w-[680px] h-[680px] rounded-full bg-gradient-to-bl from-[#F43F5E]/18 via-[#DC2626]/10 to-transparent blur-[135px] animate-aurora-2 will-change-transform"
          style={{
            marginTop: `${-scrollY * 0.06}px`,
          }}
        />

        {/* Ambient Moving Aurora 3 - Mid Left Ruby Caustic (Continuous 20s Orbit) */}
        <div
          className="absolute top-1/2 -left-36 w-[720px] h-[720px] rounded-full bg-gradient-to-tr from-[#DC2626]/16 via-[#881337]/10 to-transparent blur-[140px] animate-aurora-3 will-change-transform"
          style={{
            marginTop: `${scrollY * 0.05}px`,
          }}
        />

        {/* Ambient Moving Aurora 4 - Lower Center Warm Amber-Ruby (Continuous 28s Orbit) */}
        <div
          className="absolute top-3/4 left-1/2 w-[620px] h-[480px] rounded-full bg-gradient-to-t from-[#E11D48]/14 via-[#991B1B]/08 to-transparent blur-[130px] animate-aurora-4 will-change-transform"
          style={{
            marginTop: `${-scrollY * 0.04}px`,
          }}
        />

        {/* 3. Floating Liquid Stardust Light Particles (Move continuously in background) */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none will-change-transform"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background:
                p.size > 7
                  ? "radial-gradient(circle, rgba(251, 113, 133, 0.9) 0%, rgba(220, 38, 38, 0.4) 60%, transparent 100%)"
                  : "rgba(255, 255, 255, 0.85)",
              boxShadow:
                p.size > 7
                  ? "0 0 16px rgba(220, 38, 38, 0.8), 0 0 6px rgba(251, 113, 133, 0.9)"
                  : "0 0 8px rgba(255, 255, 255, 0.9), 0 0 14px rgba(220, 38, 38, 0.6)",
              animation: `floatLiquidParticle ${p.duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
              animationDelay: `${p.delay}s`,
              opacity: p.opacity,
            }}
          />
        ))}

        {/* Ambient Vignette - Smooth Cinematic Edge Falloff */}
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
      </div>

      {/* 4. Floating Frosted Glass Back-to-Top Pill */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#100C0E]/80 hover:bg-[#171114] border border-white/20 text-[#E2D4D6] hover:text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 animate-in fade-in zoom-in-95 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 text-white" />
        </button>
      )}
    </>
  );
}
