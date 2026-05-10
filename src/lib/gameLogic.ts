export const createGrid = (rows: number, cols: number): Set<string> => {
  return new Set<string>();
};

export const nextGeneration = (grid: Set<string>, rows: number, cols: number, survivalRules: number[] = [2, 3], birthRules: number[] = [3]): Set<string> => {
  const next = new Set<string>();
  const neighborCounts = new Map<string, number>();

  for (const key of grid) {
    const [rStr, cStr] = key.split(',');
    const r = parseInt(rStr, 10);
    const c = parseInt(cStr, 10);
    
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const nr = r + i;
        const nc = c + j;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const nKey = `${nr},${nc}`;
          neighborCounts.set(nKey, (neighborCounts.get(nKey) || 0) + 1);
        }
      }
    }
  }

  for (const [key, count] of neighborCounts) {
    if (grid.has(key)) {
      if (survivalRules.includes(count)) {
        next.add(key);
      }
    } else {
      if (birthRules.includes(count)) {
        next.add(key);
      }
    }
  }
  
  return next;
};
