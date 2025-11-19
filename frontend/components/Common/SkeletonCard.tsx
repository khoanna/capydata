import React from "react";

interface SkeletonCardProps {
  variant?: "asset" | "profile" | "list";
  className?: string;
}

const SkeletonCard = ({ variant = "asset", className = "" }: SkeletonCardProps) => {
  if (variant === "asset") {
    return (
      <div className={`glass-card p-4 ${className}`}>
        {/* Thumbnail */}
        <div className="w-full h-48 rounded-lg skeleton mb-4" />

        {/* Title */}
        <div className="h-6 w-3/4 skeleton rounded mb-3" />

        {/* Price Badge */}
        <div className="h-8 w-1/2 skeleton rounded-lg mb-3" />

        {/* Footer Metadata */}
        <div className="flex gap-2">
          <div className="h-5 w-16 skeleton rounded" />
          <div className="h-5 w-16 skeleton rounded" />
        </div>
      </div>
    );
  }

  if (variant === "profile") {
    return (
      <div className={`glass-card p-6 ${className}`}>
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full skeleton mb-4" />

        {/* Name */}
        <div className="h-8 w-48 skeleton rounded mb-2" />

        {/* Address */}
        <div className="h-5 w-32 skeleton rounded mb-4" />

        {/* Stats */}
        <div className="flex gap-4">
          <div className="h-16 w-24 skeleton rounded-lg" />
          <div className="h-16 w-24 skeleton rounded-lg" />
          <div className="h-16 w-24 skeleton rounded-lg" />
        </div>
      </div>
    );
  }

  // List variant
  return (
    <div className={`glass-card p-4 flex gap-4 ${className}`}>
      {/* Icon/Thumbnail */}
      <div className="w-16 h-16 skeleton rounded-lg flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="h-5 w-full skeleton rounded" />
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-4 w-1/2 skeleton rounded" />
      </div>
    </div>
  );
};

export default SkeletonCard;
