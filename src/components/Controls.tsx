import React from 'react';
import { Play, Pause, RotateCcw, StepForward, Shuffle, Grid3X3, ChevronDown, Settings2, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { PRESETS, Pattern } from '../lib/presets';
import { CellColorMode } from '../types';
import { InteractiveButton } from './ui/InteractiveButton';

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
  cellColorMode: CellColorMode;
  onCellColorModeChange: (mode: CellColorMode) => void;
  cellColor: string;
  onCellColorChange: (color: string) => void;
}

const colorModes: { value: CellColorMode; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'multicolor', label: 'Multi' },
  { value: 'flashing', label: 'Flash' },
  { value: 'random', label: 'Random' },
];

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
  cellColorMode,
  onCellColorModeChange,
  cellColor,
  onCellColorChange,
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
          <InteractiveButton
            onClick={onToggleRunning}
            variant={isRunning ? 'danger' : 'primary'}
            tone="blue"
            size="md"
            className="w-full"
            contentClassName="tracking-[0.24em]"
          >
            {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isRunning ? 'PAUSE' : 'START'}
          </InteractiveButton>
          <InteractiveButton
            onClick={onStep}
            disabled={isRunning}
            variant="secondary"
            tone="blue"
            size="md"
            className="w-full"
            contentClassName="tracking-[0.24em]"
          >
            <StepForward className="w-4 h-4" /> STEP
          </InteractiveButton>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InteractiveButton
            onClick={onRandomize}
            variant="secondary"
            tone="blue"
            size="md"
            className="w-full"
            contentClassName="tracking-[0.24em]"
          >
            <Shuffle className="w-4 h-4" /> MIX
          </InteractiveButton>
          <InteractiveButton
            onClick={onReset}
            variant="secondary"
            tone="slate"
            size="md"
            className="w-full"
            contentClassName="tracking-[0.24em]"
          >
            <RotateCcw className="w-4 h-4" /> RESET
          </InteractiveButton>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Grid3X3 className="w-3 h-3 text-black" /> Presets
        </h2>

        <div className="flex flex-col gap-2">
          {PRESETS.map((preset) => (
            <InteractiveButton
              key={preset.name}
              onClick={() => onPresetLoad(preset)}
              variant="secondary"
              tone="blue"
              size="sm"
              className="w-full justify-start px-4 normal-case tracking-[0.08em]"
              contentClassName="w-full justify-between"
            >
              {preset.name}
            </InteractiveButton>
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
          <InteractiveButton
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="ghost"
            tone="blue"
            size="sm"
            className="w-full justify-between border-t border-slate-100 rounded-none px-0 pt-3 pb-0 text-[10px] tracking-[0.24em]"
            contentClassName="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-3 h-3" />
              Advanced Settings
            </div>
            <ChevronDown className={cn('w-3 h-3 transition-transform duration-300', showAdvanced && 'rotate-180')} />
          </InteractiveButton>

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
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <InteractiveButton
                        key={`s-${n}`}
                        onClick={() => toggleRule(survivalRules, onSurvivalRulesChange, n)}
                        variant="chip"
                        tone="slate"
                        size="xs"
                        active={survivalRules.includes(n)}
                        className="font-mono"
                        contentClassName="font-mono tracking-normal"
                      >
                        {n}
                      </InteractiveButton>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider">Birth Threshold</span>
                  <div className="grid grid-cols-5 gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <InteractiveButton
                        key={`b-${n}`}
                        onClick={() => toggleRule(birthRules, onBirthRulesChange, n)}
                        variant="chip"
                        tone="blue"
                        size="xs"
                        active={birthRules.includes(n)}
                        className="font-mono"
                        contentClassName="font-mono tracking-normal"
                      >
                        {n}
                      </InteractiveButton>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                    <span>Generation Limit</span>
                    <span className="font-mono bg-slate-100/50 px-1.5 py-0.5 rounded text-slate-500">
                      {generationLimit === null ? 'INF' : generationLimit}
                    </span>
                  </div>
                  <div className="flex bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                    <InteractiveButton
                      onClick={() => onGenerationLimitChange(null)}
                      variant="segment"
                      tone="slate"
                      size="sm"
                      active={generationLimit === null}
                      className="flex-1 rounded-none border-0 shadow-none"
                      contentClassName="tracking-[0.18em]"
                    >
                      None
                    </InteractiveButton>
                    {[100, 500, 1000].map((limit) => (
                      <InteractiveButton
                        key={limit}
                        onClick={() => onGenerationLimitChange(limit)}
                        variant="segment"
                        tone="slate"
                        size="sm"
                        active={generationLimit === limit}
                        className="flex-1 rounded-none border-y-0 border-r-0 border-l border-l-slate-200 shadow-none"
                        contentClassName="tracking-[0.18em]"
                      >
                        {limit}
                      </InteractiveButton>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Palette className="h-3 w-3" />
                      Cell Color
                    </span>
                    <span className="font-mono bg-slate-100/50 px-1.5 py-0.5 rounded text-slate-500">{cellColorMode}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {colorModes.map((mode) => (
                      <InteractiveButton
                        key={mode.value}
                        onClick={() => onCellColorModeChange(mode.value)}
                        variant="chip"
                        tone="blue"
                        size="sm"
                        active={cellColorMode === mode.value}
                        className="w-full"
                        contentClassName="tracking-[0.16em]"
                      >
                        {mode.label}
                      </InteractiveButton>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <div
                      className="h-10 w-10 rounded-lg border border-slate-200 shadow-inner"
                      style={{ backgroundColor: cellColor }}
                    />
                    <div className="flex-1">
                      <p className="text-[10px] font-sans font-bold uppercase tracking-[0.18em] text-slate-700">Base Color</p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Used for solid and flashing modes, and as the palette anchor for rainbow and multicolor.
                      </p>
                    </div>
                    <input
                      type="color"
                      value={cellColor}
                      onChange={(e) => onCellColorChange(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-1"
                      aria-label="Choose live cell color"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <InteractiveButton
                    onClick={() => {
                      onSurvivalRulesChange([2, 3]);
                      onBirthRulesChange([3]);
                      onCellColorModeChange('solid');
                      onCellColorChange('#1e1b4b');
                    }}
                    variant="secondary"
                    tone="blue"
                    size="sm"
                    className="w-full"
                    contentClassName="tracking-[0.2em]"
                  >
                    Reset
                  </InteractiveButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
