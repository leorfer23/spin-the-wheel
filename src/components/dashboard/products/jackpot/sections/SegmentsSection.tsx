import React from "react";
import type { JackpotSymbol } from "../types";

interface SegmentsProps {
  symbols: JackpotSymbol[];
  onUpdateSymbols: (symbols: JackpotSymbol[]) => void;
}

export const SegmentsSection: React.FC<SegmentsProps> = ({
  symbols,
  onUpdateSymbols,
}) => {
  const update = (
    idx: number,
    field: keyof JackpotSymbol,
    value: string | number
  ) => {
    const next = symbols.slice();
    (next[idx] as any)[field] =
      typeof (next[idx] as any)[field] === "number" ? Number(value) : value;
    onUpdateSymbols(next);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-7 gap-2 font-medium">
        <div>Icono</div>
        <div>Nombre</div>
        <div>Reel 1</div>
        <div>Reel 2</div>
        <div>Reel 3</div>
        <div>Total</div>
        <div></div>
      </div>
      {symbols.map((s, i) => {
        // TODO: Update to use new reel-based weight structure in M2
        const total = 100; // Placeholder
        return (
          <div key={s.id} className="grid grid-cols-7 gap-2 items-center">
            <div className="text-2xl">{s.icon}</div>
            <input
              className="border rounded px-2 py-1"
              value={s.label}
              onChange={(e) => update(i, "label", e.target.value)}
            />
            <input
              type="number"
              className="border rounded px-2 py-1"
              value={30}
              disabled
              placeholder="Reel 1"
            />
            <input
              type="number"
              className="border rounded px-2 py-1"
              value={30}
              disabled
              placeholder="Reel 2"
            />
            <input
              type="number"
              className="border rounded px-2 py-1"
              value={30}
              disabled
              placeholder="Reel 3"
            />
            <div className="text-sm text-gray-600">{total}</div>
            <div></div>
          </div>
        );
      })}
      <p className="text-xs text-gray-500">
        Ajusta los pesos por reel para definir probabilidades.
      </p>
    </div>
  );
};
