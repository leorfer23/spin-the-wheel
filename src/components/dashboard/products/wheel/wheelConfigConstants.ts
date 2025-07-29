import { Star, Zap, Gift, Trophy, Palette, Eye, Calendar } from "lucide-react";

export const predefinedColors = [
  { name: "Ocean", colors: ["#0EA5E9", "#0284C7", "#0369A1", "#075985"] },
  { name: "Sunset", colors: ["#F97316", "#EA580C", "#DC2626", "#B91C1C"] },
  { name: "Forest", colors: ["#22C55E", "#16A34A", "#15803D", "#166534"] },
  { name: "Royal", colors: ["#8B5CF6", "#7C3AED", "#6D28D9", "#5B21B6"] },
  { name: "Candy", colors: ["#EC4899", "#DB2777", "#BE185D", "#9D174D"] },
];

export const wheelStyles = [
  { id: "classic", name: "Classic", icon: Star, description: "Traditional casino style" },
  { id: "modern", name: "Modern", icon: Zap, description: "Sleek and minimal" },
  { id: "playful", name: "Playful", icon: Gift, description: "Fun and animated" },
  { id: "luxury", name: "Luxury", icon: Trophy, description: "Premium feel" },
];

export const wheelTemplates = [
  {
    name: "E-commerce Special",
    segments: [
      { label: "10% OFF", value: "SAVE10", weight: 30 },
      { label: "FREE SHIPPING", value: "FREESHIP", weight: 25 },
      { label: "TRY AGAIN", value: "TRYAGAIN", weight: 20 },
      { label: "20% OFF", value: "SAVE20", weight: 15 },
      { label: "BONUS GIFT", value: "BONUS", weight: 10 },
    ]
  },
  {
    name: "Holiday Giveaway",
    segments: [
      { label: "$5 OFF", value: "CASH5", weight: 35 },
      { label: "$10 OFF", value: "CASH10", weight: 25 },
      { label: "$15 OFF", value: "CASH15", weight: 20 },
      { label: "MEGA PRIZE", value: "MEGA", weight: 10 },
      { label: "SMALL GIFT", value: "SMALL", weight: 10 },
    ]
  },
  {
    name: "Loyalty Rewards",
    segments: [
      { label: "100 POINTS", value: "PTS100", weight: 40 },
      { label: "250 POINTS", value: "PTS250", weight: 30 },
      { label: "500 POINTS", value: "PTS500", weight: 20 },
      { label: "1000 POINTS", value: "PTS1000", weight: 10 },
    ]
  },
];

export const tabs = [
  { 
    id: "segments", 
    label: "Segmentos de Premios", 
    icon: Gift,
    description: "Configura los premios y probabilidades de cada segmento de la ruleta"
  },
  { 
    id: "appearance", 
    label: "Diseño de la Ruleta", 
    icon: Palette,
    description: "Personaliza los colores, efectos y estilo visual de tu ruleta"
  },
  { 
    id: "handle", 
    label: "Botón Flotante", 
    icon: Zap,
    description: "Configura el widget flotante que aparecerá en tu sitio web"
  },
  { 
    id: "capture", 
    label: "Captura de Email", 
    icon: Star,
    description: "Personaliza el formulario de captura de datos de tus visitantes"
  },
  { 
    id: "schedule", 
    label: "Programación", 
    icon: Calendar,
    description: "Programa cuando tu ruleta estará activa"
  },
  { 
    id: "embed", 
    label: "Integración", 
    icon: Eye,
    description: "Obtén el código para integrar la ruleta en tu sitio web"
  },
];

export const handleStyles = [
  { value: "floating", label: "Flotante", description: "Se mueve con el scroll" },
  { value: "tab", label: "Pestaña", description: "Fijo en el lateral" },
  { value: "bubble", label: "Burbuja", description: "Botón circular minimalista" },
];

export const handleSizes = [
  { value: "small", label: "Pequeño" },
  { value: "medium", label: "Mediano" },
  { value: "large", label: "Grande" },
];

export const handleAnimations = [
  { value: "none", label: "Sin animación" },
  { value: "pulse", label: "Pulso" },
  { value: "bounce", label: "Rebote" },
  { value: "rotate", label: "Rotación" },
];

export const captureFormats = [
  { 
    value: "instant", 
    label: "Instantáneo", 
    description: "Solo email, sin pasos adicionales" 
  },
  { 
    value: "minimal", 
    label: "Mínimo", 
    description: "Email y nombre" 
  },
  { 
    value: "social", 
    label: "Social", 
    description: "Incluye redes sociales opcionales" 
  },
];

export const backgroundStyles = [
  { value: "solid", label: "Color sólido" },
  { value: "gradient", label: "Degradado" },
  { value: "pattern", label: "Patrón" },
];

export const pegStyles = [
  { value: "circle", label: "Círculos" },
  { value: "star", label: "Estrellas" },
  { value: "diamond", label: "Diamantes" },
  { value: "none", label: "Sin decoración" },
];

export const pointerStyles = [
  { value: "arrow", label: "Flecha clásica" },
  { value: "triangle", label: "Triángulo moderno" },
  { value: "star", label: "Estrella" },
  { value: "custom", label: "Personalizado" },
];

export const spinningEffects = [
  { value: "smooth", label: "Suave" },
  { value: "elastic", label: "Elástico" },
  { value: "bounce", label: "Rebote" },
  { value: "realistic", label: "Realista" },
];