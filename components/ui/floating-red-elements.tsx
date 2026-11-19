"use client";

import React from "react";

interface FloatingRedElementsProps {
  variant?: "hero" | "subtle" | "banner";
}

export function FloatingRedElements({ variant = "hero" }: FloatingRedElementsProps) {
  if (variant === "subtle") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Soft background red glow orbs giving translucent glass backdrop lighting */}
        <div className="ambient-glow-red -top-12 -left-12 w-80 h-80 opacity-70" />
        <div className="ambient-glow-red -bottom-16 -right-16 w-96 h-96 opacity-75" />
        <div className="ambient-glow-red top-1/2 left-1/3 w-64 h-64 opacity-40" />

        {/* Small floating 3D red sphere */}
        <div className="absolute top-6 right-8 w-10 h-10 sphere-3d-red animate-float-slow opacity-85" />
        {/* Translucent glass red bubble */}
        <div className="absolute bottom-10 left-6 w-14 h-14 bubble-glass-red animate-float-reverse opacity-80" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Deep Background Ambient Glows - Layer 0 */}
      <div className="ambient-glow-red -top-24 left-1/4 w-[36rem] h-[36rem] opacity-75" />
      <div className="ambient-glow-red top-1/3 -right-20 w-[32rem] h-[32rem] opacity-65" />
      <div className="ambient-glow-red -bottom-20 left-10 w-[30rem] h-[30rem] opacity-60" />
      <div className="ambient-glow-red top-2/3 right-1/4 w-80 h-80 opacity-50" />

      {/* Floating 3D Red Spheres & Glass Bubbles */}
      {/* 1. Large Top-Right Glossy Sphere */}
      <div
        className="absolute -top-6 -right-4 sm:top-2 sm:right-10 w-16 h-16 sm:w-20 sm:h-20 sphere-3d-red animate-float-slow z-20 shadow-sphere-3d"
        style={{ animationDuration: "7s" }}
      />

      {/* 2. Medium Left Translucent Glass Bubble with Red Rim */}
      <div
        className="absolute top-28 -left-5 sm:left-4 w-14 h-14 sm:w-16 sm:h-16 bubble-glass-red animate-float-reverse z-20"
        style={{ animationDuration: "8.5s" }}
      />

      {/* 3. Small Floating Glossy Sphere near Center-Right */}
      <div
        className="absolute top-1/2 right-4 sm:right-16 w-8 h-8 sm:w-10 sm:h-10 sphere-3d-red animate-float-gentle z-20 shadow-sphere-3d-sm"
        style={{ animationDuration: "5.5s" }}
      />

      {/* 4. Bottom-Left Soft Red Floating Disc */}
      <div
        className="absolute -bottom-6 left-12 sm:left-24 w-12 h-12 sm:w-14 sm:h-14 sphere-3d-red animate-float-slow z-20 opacity-90 shadow-sphere-3d-sm"
        style={{ animationDuration: "6.5s" }}
      />

      {/* 5. Delicate Micro Glass Bubble Bottom-Right */}
      <div
        className="absolute bottom-16 right-1/3 w-9 h-9 bubble-glass-red animate-float-reverse z-20 opacity-85"
        style={{ animationDuration: "9s" }}
      />
    </div>
  );
}
