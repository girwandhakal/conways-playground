import { useState, useCallback, useEffect, useRef } from 'react';
import { Terminal, Info, X, Menu, BarChart3, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid } from './components/Grid';
import { Controls } from './components/Controls';
import { Stats } from './components/Stats';
import { InteractiveButton } from './components/ui/InteractiveButton';
import { createGrid, nextGeneration } from './lib/gameLogic';
import { CellColorMode, SimulationStats } from './types';
import { cn } from './lib/utils';

const INITIAL_GRID_SIZE = 50;

export default function App() {
  const [gridSize, setGridSize] = useState(INITIAL_GRID_SIZE);
  const [grid, setGrid] = useState<Set<string>>(() => createGrid(gridSize, gridSize));
  const [generation, setGeneration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isConverged, setIsConverged] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [stats, setStats] = useState<SimulationStats[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showControlsMobile, setShowControlsMobile] = useState(false);
  const [showStatsMobile, setShowStatsMobile] = useState(false);
  const [survivalRules, setSurvivalRules] = useState<number[]>([2, 3]);
  const [birthRules, setBirthRules] = useState<number[]>([3]);
  const [generationLimit, setGenerationLimit] = useState<number | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [cellColorMode, setCellColorMode] = useState<CellColorMode>('solid');
  const [cellColor, setCellColor] = useState('#1e1b4b');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const countLiveCells = useCallback((currentGrid: Set<string>) => {
    return currentGrid.size;
  }, []);

  const updateStats = useCallback((gen: number, grid: Set<string>) => {
    const liveCount = countLiveCells(grid);
    setStats(prev => {
      if (prev.length > 0 && prev[prev.length - 1].generation === gen) {
        return prev;
      }
      return [...prev, { generation: gen, liveCells: liveCount }];
    });
  }, [countLiveCells]);

  const gridRef = useRef(grid);
  const generationRef = useRef(generation);

  useEffect(() => {
    gridRef.current = grid;
    generationRef.current = generation;
  }, [grid, generation]);

  const handleStep = useCallback(() => {
    const currentGrid = gridRef.current;
    const next = nextGeneration(currentGrid, gridSize, gridSize, survivalRules, birthRules);
    
    // Check for convergence
    let changed = false;
    if (currentGrid.size !== next.size) {
      changed = true;
    } else {
      for (const key of currentGrid) {
        if (!next.has(key)) {
          changed = true;
          break;
        }
      }
    }

    if (!changed) {
      setIsRunning(false);
      setIsConverged(true);
    } else {
      setGrid(next);
      setGeneration(g => g + 1);
    }
  }, [survivalRules, birthRules, gridSize]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(handleStep, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, speed, handleStep]);

  useEffect(() => {
    updateStats(generation, grid);
    if (generationLimit !== null && generation >= generationLimit && isRunning) {
      setIsRunning(false);
      setIsLimitReached(true);
    }
  }, [generation, grid, updateStats, generationLimit, isRunning]);

  const handleToggleCell = (r: number, c: number) => {
    setGrid(prev => {
      const newGrid = new Set(prev);
      const key = `${r},${c}`;
      if (newGrid.has(key)) {
        newGrid.delete(key);
      } else {
        newGrid.add(key);
      }
      return newGrid;
    });
  };

  const handlePaintCell = (r: number, c: number) => {
    setGrid(prev => {
      const key = `${r},${c}`;
      if (prev.has(key)) return prev;
      const newGrid = new Set(prev);
      newGrid.add(key);
      return newGrid;
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsConverged(false);
    setIsLimitReached(false);
    setGrid(createGrid(gridSize, gridSize));
    setGeneration(0);
    setStats([]);
  };

  const handleRandomize = () => {
    setIsRunning(false);
    setIsConverged(false);
    setIsLimitReached(false);
    const threshold = 0.55 + Math.random() * 0.4; 
    const newGrid = new Set<string>();
    
    // Instead of looping infinitely, we randomize within the user's defined grid size viewport
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (Math.random() > threshold) {
          newGrid.add(`${r},${c}`);
        }
      }
    }
    
    setGrid(newGrid);
    setGeneration(0);
    setStats([]);
  };

  const handlePresetLoad = (pattern: any) => {
    setIsRunning(false);
    setIsConverged(false);
    setIsLimitReached(false);
    
    const targetSize = Math.max(gridSize, pattern.gridSize || gridSize);
    if (targetSize > gridSize) {
      setGridSize(targetSize);
    }

    const newGrid = new Set<string>();
    let maxR = -Infinity; let maxC = -Infinity; let minR = Infinity; let minC = Infinity;
    for (const [r, c] of pattern.cells) {
        if (r > maxR) maxR = r;
        if (c > maxC) maxC = c;
        if (r < minR) minR = r;
        if (c < minC) minC = c;
    }
    
    const pWidth = maxC - minC + 1;
    const pHeight = maxR - minR + 1;

    const offsetR = Math.floor((targetSize - pHeight) / 2) - minR;
    const offsetC = Math.floor((targetSize - pWidth) / 2) - minC;

    for (const [r, c] of pattern.cells) {
      newGrid.add(`${r + offsetR},${c + offsetC}`);
    }

    setGrid(newGrid);
    setGeneration(0);
    setStats([]);
  };

  const handleGridSizeChange = (newSize: number) => {
    setIsRunning(false);
    setIsConverged(false);
    setIsLimitReached(false);
    setGridSize(newSize);
    setGrid(createGrid(newSize, newSize));
    setGeneration(0);
    setStats([]);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-black selection:bg-blue-100 relative">
      {/* Absolute Overlays Layer (Full App Blur) */}
      <AnimatePresence>
        {(isConverged || isLimitReached || showInfo) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/20"
          >
            {isConverged ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.3)] text-center max-w-sm mx-4"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100 shadow-inner">
                  <Info className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-sans font-bold text-black mb-3">Equilibrium Reached</h3>
                <p className="text-sm text-slate-600 font-sans leading-relaxed">
                  The ecosystem has reached a stable state. No further biological changes detected in the current generation.
                </p>
                <InteractiveButton 
                  onClick={() => setIsConverged(false)}
                  variant="primary"
                  tone="blue"
                  size="lg"
                  className="mt-10 w-full"
                  contentClassName="tracking-[0.26em]"
                >
                  Return to Bench
                </InteractiveButton>
              </motion.div>
            ) : isLimitReached ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.3)] text-center max-w-sm mx-4"
              >
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100 shadow-inner">
                  <Terminal className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-2xl font-sans font-bold text-black mb-3">Limit Reached</h3>
                <p className="text-sm text-slate-600 font-sans leading-relaxed">
                  Generation limit of {generationLimit} reached. The simulation has paused.
                </p>
                <InteractiveButton 
                  onClick={() => setIsLimitReached(false)}
                  variant="primary"
                  tone="blue"
                  size="lg"
                  className="mt-10 w-full"
                  contentClassName="tracking-[0.26em]"
                >
                  Return to Bench
                </InteractiveButton>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white border border-slate-200 p-8 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.3)] w-full max-w-lg mx-4 relative"
              >
                <InteractiveButton 
                  onClick={() => setShowInfo(false)}
                  variant="ghost"
                  tone="blue"
                  size="icon"
                  className="absolute top-8 right-8 rounded-full text-slate-400 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </InteractiveButton>
                <h3 className="text-sm font-sans font-black text-black mb-6 uppercase tracking-widest border-b border-slate-100 pb-5">About</h3>
                <div className="space-y-4">
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    This playground is an interactive simulation of Conway's Game of Life. Each cell lives or dies based on the density of its neighbors, leading to complex emergent behaviors. 
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    Click on the board to seed life manually, or use 'Mix' for a random start, and watch the population evolution unfold.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-14 border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 bg-white z-20">
        <div className="flex items-center gap-3">
          <InteractiveButton 
            onClick={() => setShowControlsMobile(!showControlsMobile)}
            variant="secondary"
            tone="blue"
            size="icon"
            className="lg:hidden text-slate-600"
          >
            <Settings2 className="w-5 h-5" />
          </InteractiveButton>
          <div className="hidden sm:flex w-8 h-8 rounded-lg border border-slate-200 items-center justify-center bg-slate-50 shadow-sm">
            <Terminal className="w-4 h-4 text-black" />
          </div>
          <h1 className="text-xs sm:text-sm font-sans font-bold tracking-tight text-black uppercase">Conway</h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
           <InteractiveButton 
             onClick={() => setShowStatsMobile(!showStatsMobile)}
             variant="secondary"
             tone="blue"
             size="icon"
             className="lg:hidden text-slate-600"
            >
            <BarChart3 className="w-5 h-5" />
          </InteractiveButton>

           <InteractiveButton 
             onClick={() => setShowInfo(!showInfo)}
             variant="secondary"
             tone="blue"
             size="icon"
             className="h-10 w-10 lg:h-8 lg:w-8 lg:rounded-lg text-slate-600 shadow-sm"
            >
            <Info className="w-5 h-5 lg:w-4 lg:h-4" />
          </InteractiveButton>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Mobile Overlays for Sidebars */}
        <AnimatePresence>
          {showControlsMobile && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowControlsMobile(false)}
                className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
              />
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-white shadow-2xl"
              >
                <div className="h-full relative flex flex-col">
                  <div className="h-14 flex items-center justify-between px-6 border-b border-slate-100 flex-shrink-0">
                    <h2 className="text-[10px] font-sans font-black uppercase tracking-widest text-slate-400">Configuration</h2>
                    <InteractiveButton 
                      onClick={() => setShowControlsMobile(false)}
                      variant="ghost"
                      tone="blue"
                      size="icon"
                      className="h-8 w-8 rounded-full text-slate-500"
                    >
                      <X className="w-4 h-4" />
                    </InteractiveButton>
                  </div>
                  <div className="flex-1 min-h-0">
                      <Controls 
                        isRunning={isRunning}
                        onToggleRunning={() => setIsRunning(!isRunning)}
                        onReset={handleReset}
                        onStep={handleStep}
                        onRandomize={handleRandomize}
                        onPresetLoad={handlePresetLoad}
                        speed={speed}
                        onSpeedChange={setSpeed}
                        gridSize={gridSize}
                        onGridSizeChange={handleGridSizeChange}
                        survivalRules={survivalRules}
                        onSurvivalRulesChange={setSurvivalRules}
                        birthRules={birthRules}
                        onBirthRulesChange={setBirthRules}
                        generationLimit={generationLimit}
                        onGenerationLimitChange={setGenerationLimit}
                        cellColorMode={cellColorMode}
                        onCellColorModeChange={setCellColorMode}
                        cellColor={cellColor}
                        onCellColorChange={setCellColor}
                      />
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {showStatsMobile && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowStatsMobile(false)}
                className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed right-0 top-0 bottom-0 z-40 w-[280px] bg-white shadow-2xl"
              >
                <div className="h-full relative flex flex-col">
                  <div className="h-14 flex items-center justify-between px-6 border-b border-slate-100 flex-shrink-0">
                    <InteractiveButton 
                      onClick={() => setShowStatsMobile(false)}
                      variant="ghost"
                      tone="blue"
                      size="icon"
                      className="h-8 w-8 rounded-full text-slate-500"
                    >
                      <X className="w-4 h-4" />
                    </InteractiveButton>
                    <h2 className="text-[10px] font-sans font-black uppercase tracking-widest text-slate-400">Analysis</h2>
                  </div>
                  <div className="flex-1 min-h-0">
                    <Stats 
                      stats={stats}
                      generation={generation}
                      liveCount={countLiveCells(grid)}
                    />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar (Controls) */}
        <div className="hidden lg:block w-72 border-r border-slate-200">
          <Controls 
            isRunning={isRunning}
            onToggleRunning={() => setIsRunning(!isRunning)}
            onReset={handleReset}
            onStep={handleStep}
            onRandomize={handleRandomize}
            onPresetLoad={handlePresetLoad}
            speed={speed}
            onSpeedChange={setSpeed}
            gridSize={gridSize}
            onGridSizeChange={handleGridSizeChange}
            survivalRules={survivalRules}
            onSurvivalRulesChange={setSurvivalRules}
            birthRules={birthRules}
            onBirthRulesChange={setBirthRules}
            generationLimit={generationLimit}
            onGenerationLimitChange={setGenerationLimit}
            cellColorMode={cellColorMode}
            onCellColorModeChange={setCellColorMode}
            cellColor={cellColor}
            onCellColorChange={setCellColor}
          />
        </div>
        
        <div className="flex-1 bg-slate-50 flex items-center justify-center relative overflow-hidden">
          <div className="w-full h-full flex items-center justify-center p-4">
             <Grid 
                grid={grid} 
                rows={gridSize}
                cols={gridSize}
                onToggleCell={handleToggleCell} 
                onPaintCell={handlePaintCell}
                colorMode={cellColorMode}
                cellColor={cellColor}
                generation={generation}
              />
          </div>
        </div>

        {/* Desktop Sidebar (Stats) */}
        <div className="hidden lg:block w-72 border-l border-slate-200">
          <Stats 
            stats={stats}
            generation={generation}
            liveCount={countLiveCells(grid)}
          />
        </div>
      </main>
    </div>
  );
}
