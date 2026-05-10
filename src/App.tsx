import { useState, useCallback, useEffect, useRef } from 'react';
import { Terminal, Info, X, Menu, BarChart3, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid } from './components/Grid';
import { Controls } from './components/Controls';
import { Stats } from './components/Stats';
import { createGrid, nextGeneration } from './lib/gameLogic';
import { SimulationStats } from './types';
import { cn } from './lib/utils';

const INITIAL_GRID_SIZE = 50;

export default function App() {
  const [gridSize, setGridSize] = useState(INITIAL_GRID_SIZE);
  const [grid, setGrid] = useState<boolean[][]>(() => createGrid(gridSize, gridSize));
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const countLiveCells = useCallback((currentGrid: boolean[][]) => {
    return currentGrid.reduce((acc, row) => acc + row.filter(cell => cell).length, 0);
  }, []);

  const updateStats = useCallback((gen: number, grid: boolean[][]) => {
    const liveCount = countLiveCells(grid);
    setStats(prev => [...prev, { generation: gen, liveCells: liveCount }]);
  }, [countLiveCells]);

  const handleStep = useCallback(() => {
    setGrid(prev => {
      const next = nextGeneration(prev, survivalRules, birthRules);
      
      // Check for convergence
      let changed = false;
      for (let r = 0; r < prev.length; r++) {
        for (let c = 0; c < prev[0].length; c++) {
          if (prev[r][c] !== next[r][c]) {
            changed = true;
            break;
          }
        }
        if (changed) break;
      }

      if (!changed) {
        setIsRunning(false);
        setIsConverged(true);
        return prev;
      }

      setGeneration(g => g + 1);
      return next;
    });
  }, [survivalRules, birthRules]);

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
  }, [generation, grid, updateStats]);

  const handleToggleCell = (r: number, c: number) => {
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[r][c] = !newGrid[r][c];
      return newGrid;
    });
  };

  const handlePaintCell = (r: number, c: number) => {
    setGrid(prev => {
      if (prev[r][c]) return prev;
      const newGrid = prev.map(row => [...row]);
      newGrid[r][c] = true;
      return newGrid;
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsConverged(false);
    setGrid(createGrid(gridSize, gridSize));
    setGeneration(0);
    setStats([]);
  };

  const handleRandomize = () => {
    setIsRunning(false);
    setIsConverged(false);
    // Density varies between 5% and 45% (wider range)
    const threshold = 0.55 + Math.random() * 0.4; 
    const newGrid = grid.map(row => row.map(() => Math.random() > threshold));
    setGrid(newGrid);
    setGeneration(0);
    setStats([]);
  };

  const handleGridSizeChange = (newSize: number) => {
    setIsRunning(false);
    setIsConverged(false);
    setGridSize(newSize);
    setGrid(createGrid(newSize, newSize));
    setGeneration(0);
    setStats([]);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-black selection:bg-blue-100 relative">
      {/* Absolute Overlays Layer (Full App Blur) */}
      <AnimatePresence>
        {(isConverged || showInfo) && (
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
                <button 
                  onClick={() => setIsConverged(false)}
                  className="mt-10 w-full py-4 bg-black text-white text-xs font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 uppercase tracking-widest"
                >
                  Return to Bench
                </button>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white border border-slate-200 p-8 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.3)] w-full max-w-lg mx-4 relative"
              >
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: '#F1F5F9' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowInfo(false)}
                  className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full transition-colors text-slate-400 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </motion.button>
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
          <button 
            onClick={() => setShowControlsMobile(!showControlsMobile)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 active:scale-95 transition-transform"
          >
            <Settings2 className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex w-8 h-8 rounded-lg border border-slate-200 items-center justify-center bg-slate-50 shadow-sm">
            <Terminal className="w-4 h-4 text-black" />
          </div>
          <h1 className="text-xs sm:text-sm font-sans font-bold tracking-tight text-black uppercase">Conway</h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setShowStatsMobile(!showStatsMobile)}
             className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600"
            >
            <BarChart3 className="w-5 h-5" />
          </motion.button>

           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setShowInfo(!showInfo)}
             className="w-10 h-10 lg:w-8 lg:h-8 flex items-center justify-center rounded-xl lg:rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 shadow-sm"
            >
            <Info className="w-5 h-5 lg:w-4 lg:h-4" />
          </motion.button>
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
                    <button 
                      onClick={() => setShowControlsMobile(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0">
                    <Controls 
                      isRunning={isRunning}
                      onToggleRunning={() => setIsRunning(!isRunning)}
                      onReset={handleReset}
                      onStep={handleStep}
                      onRandomize={handleRandomize}
                      speed={speed}
                      onSpeedChange={setSpeed}
                      gridSize={gridSize}
                      onGridSizeChange={handleGridSizeChange}
                      survivalRules={survivalRules}
                      onSurvivalRulesChange={setSurvivalRules}
                      birthRules={birthRules}
                      onBirthRulesChange={setBirthRules}
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
                    <button 
                      onClick={() => setShowStatsMobile(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
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
            speed={speed}
            onSpeedChange={setSpeed}
            gridSize={gridSize}
            onGridSizeChange={handleGridSizeChange}
            survivalRules={survivalRules}
            onSurvivalRulesChange={setSurvivalRules}
            birthRules={birthRules}
            onBirthRulesChange={setBirthRules}
          />
        </div>
        
        <div className="flex-1 bg-slate-50 flex items-center justify-center relative overflow-hidden">
          <div className="w-full h-full flex items-center justify-center p-4">
             <Grid 
                grid={grid} 
                onToggleCell={handleToggleCell} 
                onPaintCell={handlePaintCell}
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
