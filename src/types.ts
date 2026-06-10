export interface Investment {
  id: number;
  name: string;
  platform: string;
  aporte: number;
  valorActual: number;
  tipo: string;
  color: string;
  updatedAt: string;
}

export interface Snapshot {
  fecha: string;
  totalActual: number;
  totalAporte: number;
  ganancia: number;
  pct: number;
}

export type ModalState =
  | { type: "valor"; inv: Investment }
  | { type: "aporte"; inv: Investment }
  | { type: "add" }
  | { type: "remove"; inv: Investment }
  | null;

export interface NewInvestmentForm {
  name: string;
  platform: string;
  aporte: string;
  valorActual: string;
  tipo: string;
  color: string;
}
