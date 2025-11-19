import React from "react";

interface BadgeProps {
  variant?:
    | "status"
    | "type"
    | "price"
    | "chain"
    | "success"
    | "error"
    | "pending"
    | "info";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

const Badge = ({
  variant = "status",
  size = "md",
  children,
  className = "",
}: BadgeProps) => {
  const baseStyles =
    "font-mono font-bold inline-flex items-center gap-1.5 transition-all duration-300 whitespace-nowrap";

  const variants = {
    status: "bg-panel border border-white/10 text-gray-400",
    type: "bg-yuzu/10 border border-yuzu/30 text-yuzu",
    price: "bg-gradient-yuzu-hydro text-black shadow-[0_0_15px_rgba(255,159,28,0.3)]",
    chain: "bg-hydro/10 border border-hydro/30 text-hydro",
    success: "bg-success/10 border border-success/30 text-success",
    error: "bg-error/10 border border-error/30 text-error",
    pending:
      "bg-pending/10 border border-pending/30 text-pending animate-pulse-glow",
    info: "bg-info/10 border border-info/30 text-info",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] rounded tracking-widest",
    md: "px-3 py-1 text-xs rounded-md tracking-wide",
    lg: "px-4 py-1.5 text-sm rounded-lg tracking-wide",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
