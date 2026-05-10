export const createGrid = (rows: number, cols: number): boolean[][] => {
  return Array.from({ length: rows }, () => Array(cols).fill(false));
};

export const nextGeneration = (grid: boolean[][], survivalRules: number[] = [2, 3], birthRules: number[] = [3]): boolean[][] => {
  const rows = grid.length;
  const cols = grid[0].length;
  const next = createGrid(rows, cols);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let neighbors = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const nr = r + i;
          const nc = c + j;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (grid[nr][nc]) neighbors++;
          }
        }
      }

      const isAlive = grid[r][c];
      if (isAlive && survivalRules.includes(neighbors)) {
        next[r][c] = true;
      } else if (!isAlive && birthRules.includes(neighbors)) {
        next[r][c] = true;
      }
    }
  }
  return next;
};
