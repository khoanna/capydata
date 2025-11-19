import React from "react";

interface CardProps {
  variant?: "glass" | "solid" | "outline";
  hover?: boolean;
  glow?: "yuzu" | "hydro" | "grass" | "none";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const Card = ({
  variant = "glass",
  hover = true,
  glow = "none",
  className = "",
  children,
  onClick,
}: CardProps) => {
  const baseStyles = "rounded-xl transition-all duration-300";

  const variants = {
    glass: "glass-card",
    solid: "bg-panel border border-white/10",
    outline: "bg-transparent border border-white/20",
  };

  const hoverStyles = hover
    ? "hover:scale-[1.02] hover:shadow-2xl cursor-pointer transform"
    : "";

  const glowStyles = {
    yuzu: "hover:border-yuzu/50 hover:shadow-[0_0_30px_rgba(255,159,28,0.4)]",
    hydro: "hover:border-hydro/50 hover:shadow-[0_0_30px_rgba(78,205,196,0.4)]",
    grass: "hover:border-grass/50 hover:shadow-[0_0_30px_rgba(149,214,0,0.4)]",
    none: "",
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${glowStyles[glow]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
