import React, { useState } from "react";

interface JackpotSelectorProps {
  jackpots: { id: string; name: string }[];
  selectedJackpotId: string;
  onSelectJackpot: (id: string) => void;
  onCreateJackpot?: (name: string) => void;
}

export const JackpotSelector: React.FC<JackpotSelectorProps> = ({
  jackpots,
  selectedJackpotId,
  onSelectJackpot,
  onCreateJackpot,
}) => {
  const [newName, setNewName] = useState("Mi Jackpot");

  return (
    <div className="flex items-center gap-2">
      <select
        className="border rounded px-3 py-2"
        value={selectedJackpotId}
        onChange={(e) => onSelectJackpot(e.target.value)}
      >
        {jackpots.map((j) => (
          <option key={j.id} value={j.id}>
            {j.name}
          </option>
        ))}
      </select>
      {onCreateJackpot && (
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-2 py-1"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            className="bg-purple-600 text-white px-3 py-2 rounded"
            onClick={() => onCreateJackpot(newName)}
          >
            Crear
          </button>
        </div>
      )}
    </div>
  );
};
