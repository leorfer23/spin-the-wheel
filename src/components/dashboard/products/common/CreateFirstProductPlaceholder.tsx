import React from "react";

interface CreateFirstProductPlaceholderProps {
  onCreate: (name?: string) => void;
  primaryMessage: string;
  secondaryMessage?: string;
  children: React.ReactNode;
}

export const CreateFirstProductPlaceholder: React.FC<
  CreateFirstProductPlaceholderProps
> = ({ onCreate, primaryMessage, secondaryMessage, children }) => {
  return (
    <div className="flex items-center justify-center h-full w-full p-8">
      <div
        className="relative group cursor-pointer w-full max-w-[600px] aspect-square flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300"
        onClick={() => onCreate()}
      >
        {/* Purple glowing ring effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-[520px] h-[520px] rounded-full bg-purple-500/20 animate-pulse blur-xl group-hover:bg-purple-500/30 transition-all duration-500"></div>
          <div className="absolute w-[510px] h-[510px] rounded-full ring-2 ring-purple-500/30 group-hover:ring-purple-500/50 group-hover:ring-4 transition-all duration-300"></div>
        </div>

        {/* Product placeholder content */}
        <div
          className="relative opacity-30 hover:opacity-50 transition-opacity duration-300 pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>

        {/* Hover tooltip */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-900/95 backdrop-blur text-white px-6 py-3 rounded-lg shadow-xl transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300 border border-purple-500/30">
            <p className="text-lg font-medium">{primaryMessage}</p>
            {secondaryMessage && (
              <p className="text-sm text-gray-300 mt-1">{secondaryMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
