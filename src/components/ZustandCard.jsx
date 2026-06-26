
import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useSensorStore } from '../features/zustand/useSensorStore';

export const ZustandCard = ({ id }) => {
  // Granular subscription targeting exactly one sensor key
  const sensor = useSensorStore((state) => state.sensors[id]);

  const renderCountRef = useRef(0);
  const counterTextRef = useRef(null);

  renderCountRef.current += 1;

  useEffect(() => {
    if (counterTextRef.current) {
      counterTextRef.current.textContent = `R:${renderCountRef.current}`;
    }
  });

  const statusColors = {
    Normal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    offline: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  if (!sensor) return null;

  return (
    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 transition-all duration-100 flex flex-col justify-between shadow-lg relative overflow-hidden h-full hover:border-slate-700">
      <div className="flex justify-between items-start">
        <div className="truncate pr-2">
          <h4 className="text-xs font-bold text-slate-200 truncate">{sensor.name}</h4>
          <div className="flex items-center text-[10px] text-slate-400 font-medium mt-1.5 space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate">{sensor.zoneIdentifier || "Main Floor"}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 tracking-wider font-semibold">
            {sensor.id}
          </span>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded border font-mono bg-amber-500/10 text-amber-400 border-amber-500/20">
            ZUSTAND
          </span>
          <span 
            ref={counterTextRef}
            className="px-1.5 py-0.5 bg-slate-950 text-slate-400 text-[9px] font-mono rounded border border-slate-800"
          >
            R:0
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 my-4">
        <div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Telemetry</span>
          <span className="text-base font-mono font-bold text-slate-100">
            {typeof sensor.value === 'number' ? sensor.value.toFixed(1) : '0.0'}
            <span className="text-xs font-semibold text-slate-500 ml-0.5">{sensor.unit}</span>
          </span>
        </div>
        <div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Timestamp</span>
          <span className="text-[10px] font-mono font-medium text-slate-400 block truncate mt-1">
            {sensor.lastUpdated ? new Date(sensor.lastUpdated).toLocaleTimeString() : 'N/A'}
          </span>
        </div>
      </div>

      <div className={`text-[10px] py-1 px-2 rounded-md border font-bold text-center tracking-wider uppercase ${statusColors[sensor.status] || statusColors.offline}`}>
        {sensor.status}
      </div>
    </div>
  );
};
