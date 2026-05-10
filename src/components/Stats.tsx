import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SimulationStats } from '../types';

interface StatsProps {
  stats: SimulationStats[];
  generation: number;
  liveCount: number;
}

export const Stats: React.FC<StatsProps> = ({ stats, generation, liveCount }) => {
  return (
    <div className="w-full glass-panel flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">Generation</div>
            <div className="text-2xl font-mono text-black tabular-nums font-bold">{generation}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">Population</div>
            <div className="text-2xl font-mono text-black tabular-nums font-bold">{liveCount}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-12 overflow-y-auto">
        <div className="space-y-4">
          <h3 className="text-[10px] font-sans font-bold uppercase text-slate-500 tracking-wider">Population Growth</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis 
                  dataKey="generation" 
                  hide 
                />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  fontFamily="Inter"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '10px', fontFamily: 'Inter', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                  itemStyle={{ color: '#2563EB', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="liveCells" 
                  stroke="#000000" 
                  strokeWidth={2} 
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pt-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[11px] leading-relaxed text-slate-600 font-sans italic">
                    "Any configuration with three neighbors gives birth. Two or three neighbors survive. Otherwise, death by isolation or overpopulation."
                </p>
                <p className="text-[10px] mt-3 text-slate-900 font-sans font-bold uppercase tracking-wider">— John Conway</p>
            </div>
        </div>
      </div>
    </div>
  );
};
