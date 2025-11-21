import React from "react";
import { UserPlus } from "lucide-react";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  placeholder?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const AddressInput = ({
  value,
  onChange,
  onAdd,
  placeholder = "Enter Sui address (0x...)",
  hint = "Only these addresses can purchase",
  icon,
}: AddressInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <div className="w-full">
      {/* Input and Button Row - Same Height */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </div>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full glass-input px-4 py-3 ${
              icon ? "pl-10" : ""
            } rounded-lg font-mono text-sm text-white placeholder:text-gray-600 h-full`}
          />
        </div>
        <button
          onClick={onAdd}
          className="px-6 py-3 bg-yuzu/10 border border-yuzu/30 rounded-lg hover:bg-yuzu/20 hover:border-yuzu hover:shadow-[0_0_20px_rgba(255,159,28,0.3)] transition-all flex items-center gap-2 font-mono text-sm text-yuzu font-bold shrink-0 h-full"
        >
          <UserPlus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Hint Below */}
      {hint && (
        <p className="mt-2 text-xs font-mono text-gray-500 pb-2">{hint}</p>
      )}
    </div>
  );
};

export default AddressInput;
