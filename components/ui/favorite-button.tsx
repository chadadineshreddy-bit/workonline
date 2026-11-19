"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { getFavorites, toggleFavorite } from "@/lib/favorites";

interface FavoriteButtonProps {
  toolSlug: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FavoriteButton({ toolSlug, className = "", size = "md" }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    getFavorites(user?.id).then((favs) => {
      setIsFav(favs.includes(toolSlug));
    });
  }, [toolSlug, user?.id]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAnimating(true);
    const newStatus = await toggleFavorite(toolSlug, user?.id);
    setIsFav(newStatus);
    setTimeout(() => setAnimating(false), 300);
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`p-1.5 rounded-lg transition-all ${
        isFav
          ? "text-[#F04452] hover:text-[#D72638] bg-red-500/10"
          : "text-[#777777] hover:text-[#202124] hover:bg-white/40"
      } ${animating ? "scale-125" : "scale-100"} ${className}`}
      title={isFav ? "Remove from Favorites" : "Add to Favorites"}
      aria-label={isFav ? "Remove from Favorites" : "Add to Favorites"}
    >
      <Star
        className={`${iconSizes[size]} transition-all ${
          isFav ? "fill-amber-400 text-amber-500" : ""
        }`}
      />
    </button>
  );
}
