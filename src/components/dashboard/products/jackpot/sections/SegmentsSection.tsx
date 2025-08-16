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
        const total = s.weight1 + s.weight2 + s.weight3;
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
              value={s.weight1}
              onChange={(e) => update(i, "weight1", e.target.value)}
            />
            <input
              type="number"
              className="border rounded px-2 py-1"
              value={s.weight2}
              onChange={(e) => update(i, "weight2", e.target.value)}
            />
            <input
              type="number"
              className="border rounded px-2 py-1"
              value={s.weight3}
              onChange={(e) => update(i, "weight3", e.target.value)}
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
