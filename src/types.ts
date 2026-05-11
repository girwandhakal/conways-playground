export interface SimulationStats {
  generation: number;
  liveCells: number;
}

export type CellColorMode = 'solid' | 'rainbow' | 'multicolor' | 'flashing' | 'random';
