import { Gift, Palette, Zap, Star, Calendar } from "lucide-react";

export const tabs = [
  {
    id: "segments",
    label: "Símbolos",
    icon: Gift,
    description: "Configura los símbolos y probabilidades por reel",
  },
  {
    id: "appearance",
    label: "Apariencia",
    icon: Palette,
    description: "Personaliza la apariencia del jackpot",
  },
  {
    id: "handle",
    label: "Botón Flotante",
    icon: Zap,
    description: "Configura el widget flotante",
  },
  {
    id: "capture",
    label: "Captura de Email",
    icon: Star,
    description: "Personaliza la captura de datos",
  },
  {
    id: "schedule",
    label: "Programación",
    icon: Calendar,
    description: "Programa cuándo estará activo",
  },
];
