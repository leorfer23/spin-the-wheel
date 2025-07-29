import React from "react";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ColorInput: React.FC<ColorInputProps> = ({
  label,
  value,
  onChange,
  className = ""
}) => {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 mb-3 block">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-16 h-16 rounded-2xl cursor-pointer ring-2 ring-gray-200 hover:ring-purple-300 transition-all"
          />
          <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-mono"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
};