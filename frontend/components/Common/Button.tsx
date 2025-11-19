import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "font-mono font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-yuzu text-black hover:bg-yuzu-light hover:scale-105 hover:shadow-[0_0_25px_rgba(255,159,28,0.5)] ripple",
    secondary:
      "bg-hydro text-black hover:bg-hydro-light hover:scale-105 hover:shadow-[0_0_25px_rgba(78,205,196,0.5)] ripple",
    ghost:
      "bg-transparent text-white hover:bg-white/10 border border-white/10 hover:border-white/30",
    outline:
      "bg-transparent text-yuzu border border-yuzu/30 hover:bg-yuzu/10 hover:border-yuzu hover:shadow-[0_0_20px_rgba(255,159,28,0.3)]",
    danger:
      "bg-error text-white hover:bg-red-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] ripple",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs rounded-md",
    md: "px-6 py-3 text-sm rounded-lg",
    lg: "px-8 py-4 text-base rounded-xl",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
