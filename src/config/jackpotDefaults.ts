export const DEFAULT_JACKPOT_SYMBOLS: {
  id: string;
  label: string;
  icon: string;
  weight1: number;
  weight2: number;
  weight3: number;
}[] = [
  {
    id: "cherry",
    label: "Cherry",
    icon: "🍒",
    weight1: 30,
    weight2: 30,
    weight3: 30,
  },
  {
    id: "lemon",
    label: "Lemon",
    icon: "🍋",
    weight1: 25,
    weight2: 25,
    weight3: 25,
  },
  {
    id: "grape",
    label: "Grape",
    icon: "🍇",
    weight1: 20,
    weight2: 20,
    weight3: 20,
  },
  {
    id: "bell",
    label: "Bell",
    icon: "🔔",
    weight1: 15,
    weight2: 15,
    weight3: 15,
  },
  {
    id: "seven",
    label: "Seven",
    icon: "7️⃣",
    weight1: 10,
    weight2: 10,
    weight3: 10,
  },
];

export const DEFAULT_JACKPOT_SCHEDULE = {
  enabled: false,
  timezone: "UTC",
  dateRange: { startDate: null as any, endDate: null as any },
};

export const DEFAULT_JACKPOT_WIDGET_CONFIG = {
  handlePosition: "right" as const,
  handleType: "floating" as const,
  handleText: "¡Juega al Jackpot!",
  handleBackgroundColor: "#8B5CF6",
  handleTextColor: "#FFFFFF",
  handleIcon: "💰",
  handleSize: "medium" as const,
  handleAnimation: "pulse" as const,
  handleBorderRadius: "9999px",
  captureImageUrl: "",
  captureTitle: "¡Probá tu suerte en el Jackpot!",
  captureSubtitle: "Ingresa tu email para participar en premios exclusivos",
  captureButtonText: "¡Jugar Ahora!",
  capturePrivacyText: "Al participar, aceptas recibir emails promocionales.",
  captureFormat: "instant" as const,
};
