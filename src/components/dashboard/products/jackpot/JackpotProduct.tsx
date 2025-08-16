import React, { useEffect } from "react";
import { JackpotSelector } from "./JackpotSelector";
import { useJackpotStore } from "@/stores/jackpotStore";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { CreateFirstProductPlaceholder } from "../common/CreateFirstProductPlaceholder";
import { JackpotPlaceholder } from "./JackpotPlaceholder";
import { useNavigate, useParams } from "react-router-dom";

interface JackpotProductProps {
  onModeChange?: (mode: "edit" | "report") => void;
  mode?: "edit" | "report";
}

export const JackpotProduct: React.FC<JackpotProductProps> = ({}) => {
  const navigate = useNavigate();
  const { jackpotId } = useParams<{ jackpotId?: string }>();
  const { user } = useAuth();
  const { selectedStoreId, stores } = useStore();
  const selectedStore = stores.find((s) => s.id === selectedStoreId);
  const tiendanubeStoreId = selectedStore?.tiendanube_store_id;

  const {
    jackpots,
    selectedJackpotId,
    selectedJackpot,
    loadJackpots,
    selectJackpot,
    createJackpot,
  } = useJackpotStore();

  useEffect(() => {
    if (tiendanubeStoreId && user) {
      loadJackpots(tiendanubeStoreId);
    }
  }, [tiendanubeStoreId, user]);

  useEffect(() => {
    if (jackpotId && jackpotId !== selectedJackpotId) {
      selectJackpot(jackpotId);
    } else if (!jackpotId && selectedJackpotId) {
      navigate(`/dashboard/jackpots/${selectedJackpotId}`);
    }
  }, [jackpotId, selectedJackpotId]);

  const handleCreate = async (name: string) => {
    if (!tiendanubeStoreId) return;
    const id = await createJackpot(tiendanubeStoreId, name);
    const targetId = (id as string) || selectedJackpotId;
    if (targetId) navigate(`/dashboard/jackpots/${targetId}`);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="h-16 flex items-center justify-center px-4">
        <JackpotSelector
          jackpots={jackpots.map((j) => ({ id: j.id, name: j.name }))}
          selectedJackpotId={selectedJackpotId || ""}
          onSelectJackpot={(id) => selectJackpot(id)}
          onCreateJackpot={handleCreate}
        />
      </div>
      {!selectedJackpot ? (
        <CreateFirstProductPlaceholder
          onCreate={() => handleCreate("Mi Jackpot")}
          primaryMessage="Haz clic para crear tu primer Jackpot"
          secondaryMessage="¡Comienza a interactuar con tus clientes!"
        >
          <div className="opacity-100">
            <JackpotPlaceholder size={500} />
          </div>
        </CreateFirstProductPlaceholder>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Vista previa del Jackpot próximamente
        </div>
      )}
    </div>
  );
};
