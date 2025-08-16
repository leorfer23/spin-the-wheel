export interface JackpotSymbol {
  id: string;
  label: string;
  icon: string;
  weight1: number;
  weight2: number;
  weight3: number;
}

export interface JackpotConfig {
  id: string;
  name: string;
  symbols: JackpotSymbol[];
  widgetConfig?: Record<string, unknown>;
  schedule?: Record<string, unknown>;
}
