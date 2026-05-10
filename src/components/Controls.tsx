import React from 'react';
import { Play, Pause, RotateCcw, StepForward, Shuffle, Grid3X3, ChevronDown, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { PRESETS, Pattern } from '../lib/presets';

interface ControlsProps {
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  onStep: () => void;
  onRandomize: () => void;
  onPresetLoad: (preset: Pattern) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  survivalRules: number[];
  onSurvivalRulesChange: (rules: number[]) => void;
  birthRules: number[];
  onBirthRulesChange: (rules: number[]) => void;
  generationLimit: number | null;
  onGenerationLimitChange: (limit: number | null) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  onToggleRunning,
  onReset,
  onStep,
  onRandomize,
  onPresetLoad,
  speed,
  onSpeedChange,
  gridSize,
  onGridSizeChange,
  survivalRules,
  onSurvivalRulesChange,
  birthRules,
  onBirthRulesChange,
  generationLimit,
  onGenerationLimitChange,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const toggleRule = (current: number[], set: (rules: number[]) => void, value: number) => {
    if (current.includes(value)) {
      set(current.filter(v => v !== value));
    } else {
      set([...current, value].sort());
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 w-full glass-panel h-full overflow-y-auto">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggleRunning}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-sans font-bold text-xs transition-all shadow-sm",
              isRunning 
                ? "bg-rose-600 text-white hover:bg-rose-700" 
                : "bg-black text-white hover:bg-slate-800"
            )}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isRunning ? 'PAUSE' : 'START'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStep}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass-button text-black font-sans font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <StepForward className="w-4 h-4" /> STEP
          </motion.button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRandomize}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass-button text-black font-sans font-bold text-xs"
          >
            <Shuffle className="w-4 h-4" /> MIX
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass-button text-black font-sans font-bold text-xs"
          >
            <RotateCcw className="w-4 h-4" /> RESET
          </motion.button>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Grid3X3 className="w-3 h-3 text-black" /> Presets
        </h2>
        
        <div className="flex flex-col gap-2">
           {PRESETS.map((preset) => (
              <button
                 key={preset.name}
                 onClick={() => onPresetLoad(preset)}
                 className="text-left px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-sans font-bold text-slate-700 transition-colors flex justify-between items-center"
              >
                  {preset.name}
              </button>
           ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Grid3X3 className="w-3 h-3 text-black" /> Parameters
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-sans font-bold text-black uppercase tracking-wider">
            <span>Interval</span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{speed}ms</span>
          </div>
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full accent-black h-1 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-sans font-bold text-black uppercase tracking-wider">
            <span>Resolution</span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{gridSize}x{gridSize}</span>
          </div>
          <input
            type="range"
            min="20"
            max="200"
            step="10"
            value={gridSize}
            onChange={(e) => onGridSizeChange(Number(e.target.value))}
            className="w-full accent-black h-1 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>

        <div className="pt-2">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full py-3 text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest hover:text-black transition-colors border-t border-slate-100"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-3 h-3" />
              Advanced Settings
            </div>
            <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", showAdvanced && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-5 pt-2"
              >
                <div className="space-y-3">
                  <span className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider">Survival Threshold</span>
                  <div className="grid grid-cols-5 gap-1">
                    {[0,1,2,3,4,5,6,7,8].map(n => (
                      <button
                        key={`s-${n}`}
                        onClick={() => toggleRule(survivalRules, onSurvivalRulesChange, n)}
                        className={cn(
                          "h-6 rounded-md text-[10px] font-mono font-bold transition-all border",
                          survivalRules.includes(n) 
                            ? "bg-black text-white border-black" 
                            : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider">Birth Threshold</span>
                  <div className="grid grid-cols-5 gap-1">
                    {[0,1,2,3,4,5,6,7,8].map(n => (
                      <button
                        key={`b-${n}`}
                        onClick={() => toggleRule(birthRules, onBirthRulesChange, n)}
                        className={cn(
                          "h-6 rounded-md text-[10px] font-mono font-bold transition-all border",
                          birthRules.includes(n) 
                            ? "bg-blue-600 text-white border-blue-600" 
                            : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                    <span>Generation Limit</span>
                    <span className="font-mono bg-slate-100/50 px-1.5 py-0.5 rounded text-slate-500">{generationLimit === null ? '∞' : generationLimit}</span>
                  </div>
                  <div className="flex bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => onGenerationLimitChange(null)}
                      className={cn(
                        "flex-1 py-1.5 text-[10px] font-bold font-sans transition-colors",
                        generationLimit === null
                          ? "bg-black text-white"
                          : "text-slate-500 hover:bg-slate-100"
                      )}
                    >
                      None
                    </button>
                    {[100, 500, 1000].map(limit => (
                      <button
                        key={limit}
                        onClick={() => onGenerationLimitChange(limit)}
                        className={cn(
                          "flex-1 py-1.5 border-l border-slate-200 text-[10px] font-bold font-sans transition-colors",
                          generationLimit === limit
                            ? "bg-black text-white border-transparent"
                            : "text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        {limit}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onSurvivalRulesChange([2, 3]);
                      onBirthRulesChange([3]);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-sans font-bold uppercase tracking-wider rounded-md transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
