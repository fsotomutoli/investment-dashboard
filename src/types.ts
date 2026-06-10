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

export interface SnapshotInvestment {
  id: number;
  name: string;
  valorActual: number;
  aporte: number;
}

export interface Snapshot {
  fecha: string;
  totalActual: number;
  totalAporte: number;
  ganancia: number;
  pct: number;
  investments: SnapshotInvestment[];
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
