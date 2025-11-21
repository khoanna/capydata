"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  hint?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

const CustomSelect = ({
  label,
  value,
  onChange,
  options,
  hint,
  placeholder = "Select an option",
  icon,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono text-xs text-gray-400 mb-2 tracking-wide">
          {label}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Select Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full glass-input px-4 py-3 rounded-lg font-mono text-sm text-left flex items-center justify-between transition-all duration-300 ${
            isOpen ? "border-yuzu/50 shadow-[0_0_20px_rgba(255,159,28,0.2)]" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            {icon && <div className="text-gray-400">{icon}</div>}
            <span className={selectedOption ? "text-white" : "text-gray-500"}>
              {displayText}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 glass-card rounded-lg border border-white/10 shadow-xl max-h-64 overflow-y-auto backdrop-blur-xl
            animate-in fade-in slide-in-from-top-2 duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-3 text-left transition-all flex items-center justify-between group
                    ${
                      isSelected
                        ? "bg-yuzu/10 border-l-2 border-yuzu"
                        : "hover:bg-white/5"
                    }`}
                >
                  <span
                    className={`font-mono text-sm ${
                      isSelected
                        ? "text-yuzu font-bold"
                        : "text-gray-300 group-hover:text-white"
                    }`}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-yuzu" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {hint && (
        <p className="mt-2 text-xs font-mono text-gray-500">{hint}</p>
      )}
    </div>
  );
};

export default CustomSelect;
