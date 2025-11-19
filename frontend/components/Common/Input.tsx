import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const Input = ({
  label,
  error,
  hint,
  icon,
  className = "",
  ...props
}: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono text-xs text-gray-400 mb-2 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <input
          className={`w-full glass-input px-4 py-3 ${icon ? "pl-10" : ""} rounded-lg font-mono text-sm text-white placeholder:text-gray-600 ${
            error ? "border-error animate-wiggle" : ""
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs font-mono text-error flex items-center gap-1">
          <i data-lucide="alert-circle" className="w-3 h-3"></i>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs font-mono text-gray-500">{hint}</p>
      )}
    </div>
  );
};

export const TextArea = ({
  label,
  error,
  hint,
  className = "",
  ...props
}: TextAreaProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono text-xs text-gray-400 mb-2 tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={`w-full glass-input px-4 py-3 rounded-lg font-mono text-sm text-white placeholder:text-gray-600 min-h-[120px] resize-y ${
          error ? "border-error animate-wiggle" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs font-mono text-error flex items-center gap-1">
          <i data-lucide="alert-circle" className="w-3 h-3"></i>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs font-mono text-gray-500">{hint}</p>
      )}
    </div>
  );
};

export const Select = ({
  label,
  error,
  hint,
  options,
  className = "",
  ...props
}: SelectProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono text-xs text-gray-400 mb-2 tracking-wide">
          {label}
        </label>
      )}
      <select
        className={`w-full glass-input px-4 py-3 rounded-lg font-mono text-sm text-white ${
          error ? "border-error animate-wiggle" : ""
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-panel text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs font-mono text-error flex items-center gap-1">
          <i data-lucide="alert-circle" className="w-3 h-3"></i>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs font-mono text-gray-500">{hint}</p>
      )}
    </div>
  );
};

export default Input;
