import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus } from 'lucide-react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function TrainingDashboard({ isOpen, onClose }: Props) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const historyStr = localStorage.getItem('trainingHistory');
      if (historyStr) {
        try {
          setData(JSON.parse(historyStr));
        } catch(e) {}
      }
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-4xl bg-black border-4 border-[#FF9900] pixel-panel shadow-[0_0_30px_rgba(255,153,0,0.4)] flex flex-col pointer-events-auto overflow-hidden"
            style={{ imageRendering: 'pixelated' }}
          >
            {/* Header */}
            <div className="bg-[#FF9900] p-2 md:p-3 flex items-center justify-between">
              <h2 className="font-pixel text-[10px] md:text-sm text-black tracking-widest uppercase truncate drop-shadow-sm">
                Training Analytics
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={onClose}
                  className="w-6 h-6 bg-black border-2 border-black flex items-center justify-center hover:bg-gray-800 transition-colors text-[#FF9900]"
                >
                  <Minus size={14} />
                </button>
                <button 
                  onClick={onClose}
                  className="w-6 h-6 bg-red-600 border-2 border-black flex items-center justify-center hover:bg-red-500 transition-colors text-white"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-4 md:p-6 w-full h-[60vh] min-h-[300px] flex flex-col bg-[#111]">
              {data.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="font-pixel text-[#FF9900] text-[10px] md:text-xs tracking-widest text-center animate-pulse">
                    NO TRAINING DATA YET.<br/><br/>
                    ENTER THE CHAMBER TO BEGIN.
                  </p>
                </div>
              ) : (
                <div className="w-full h-full font-pixel text-[8px] md:text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={data}
                      margin={{ top: 20, right: 20, bottom: 20, left: -20 }}
                    >
                      <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#888" 
                        tick={{ fill: '#888', fontSize: 10, fontFamily: '"Press Start 2P", monospace' }} 
                        tickLine={false}
                        axisLine={{ stroke: '#666' }}
                      />
                      <YAxis 
                        yAxisId="left" 
                        stroke="#3b82f6" 
                        tick={{ fill: '#3b82f6', fontSize: 10, fontFamily: '"Press Start 2P", monospace' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#f97316" 
                        tick={{ fill: '#f97316', fontSize: 10, fontFamily: '"Press Start 2P", monospace' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.9)', 
                          border: '2px solid #FF9900',
                          fontFamily: '"Press Start 2P", monospace',
                          fontSize: '10px',
                          color: '#fff',
                          textTransform: 'uppercase'
                        }}
                        itemStyle={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px', paddingTop: '10px' }}
                      />
                      <Bar 
                        yAxisId="left" 
                        dataKey="minutes" 
                        name="Time (mins)" 
                        fill="#3b82f6" 
                        barSize={15} 
                        opacity={0.5}
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="tasksDone" 
                        name="Tasks" 
                        fill="#f97316" 
                        barSize={15} 
                        opacity={0.5}
                      />
                      <Line 
                        yAxisId="left" 
                        type="step" 
                        dataKey="minutes" 
                        name="Time Trend" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        dot={{ r: 3, fill: '#000' }}
                        activeDot={{ r: 5, fill: '#3b82f6' }}
                      />
                      <Line 
                        yAxisId="right" 
                        type="step" 
                        dataKey="tasksDone" 
                        name="Task Trend" 
                        stroke="#f97316" 
                        strokeWidth={2} 
                        dot={{ r: 3, fill: '#000' }}
                        activeDot={{ r: 5, fill: '#f97316' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
