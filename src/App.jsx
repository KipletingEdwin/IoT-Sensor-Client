import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Play, Pause, RotateCcw, Cpu, Zap, Activity, Timer, BarChart4 } from 'lucide-react';
import { createConsumer } from '@rails/actioncable';

// Schema and State Actions
import { SENSOR_IDS } from './constants/sensorSchema';
import { useSensorStore } from './features/zustand/useSensorStore';
import { updateSensor as reduxUpdate, resetStore as reduxReset } from './features/redux/sensorSlice';

// Isolated Granular Child Components
import { ZustandCard } from './components/ZustandCard';
import { ReduxCard } from './components/ReduxCard';

export default function App() {
  // Configuration State
  const [activeEngine, setActiveEngine] = useState('ZUSTAND'); // 'ZUSTAND' | 'REDUX'
  const [frequency, setFrequency] = useState(250); // 250ms | 50ms | 10ms
  const [isRunning, setIsRunning] = useState(false);

  // Real-time HUD Diagnostics
  const [updateCount, setUpdateCount] = useState(0);
  const [fps, setFps] = useState(60);
  const [secondsLeft, setSecondsLeft] = useState(15);

  // Final Benchmark Report State
  const [benchmarkReport, setBenchmarkReport] = useState(null);

  // Extract Store Mutators
  const zustandReset = useSensorStore((state) => state.resetStore);
  const zustandUpdate = useSensorStore((state) => state.updateSensor);
  const reduxDispatch = useDispatch();
  const staticSensorIds = Object.values(SENSOR_IDS);

  // Core High-Frequency Reference Accumulators
  const activeEngineRef = useRef(activeEngine);
  const zustandUpdateRef = useRef(zustandUpdate);
  const reduxDispatchRef = useRef(reduxDispatch);
  const cableConsumerRef = useRef(null);
  const channelSubscriptionRef = useRef(null);

  // Performance Telemetry Arrays and Timers
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());
  const fpsHistoryRef = useRef([]);
  const estimatedTbtRef = useRef(0);
  const lastLongTaskCheckRef = useRef(performance.now());
  const initialHeapRef = useRef(0);
  const sessionCountdownRef = useRef(null);

  // Keep state references current to prevent stale closure traps
  useEffect(() => {
    activeEngineRef.current = activeEngine;
    zustandUpdateRef.current = zustandUpdate;
    reduxDispatchRef.current = reduxDispatch;
  }, [activeEngine, zustandUpdate, reduxDispatch]);

  // UI Frame Pacing and Total Blocking Time (TBT) Reference Observers
  useEffect(() => {
    let animationFrameId;

    const runTelemetryLoop = () => {
      frameCountRef.current += 1;
      const now = performance.now();

      // 1. Long Task / Total Blocking Time (TBT) Approximation
      // If the delta between two frame ticks exceeds 50ms, calculate the blocking penalty
      const frameDelta = now - lastLongTaskCheckRef.current;
      if (frameDelta > 50) {
        estimatedTbtRef.current += (frameDelta - 50);
      }
      lastLongTaskCheckRef.current = now;

      // 2. Real-time FPS Calculator (Flushed every 1000ms)
      if (now - lastFpsUpdateRef.current >= 1000) {
        const calculatedFps = frameCountRef.current;
        setFps(calculatedFps);
        
        if (isRunning) {
          fpsHistoryRef.current.push(calculatedFps);
        }

        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      animationFrameId = requestAnimationFrame(runTelemetryLoop);
    };

    animationFrameId = requestAnimationFrame(runTelemetryLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning]);

  // Synchronize dynamic background execution speed with the Rails server
  const syncServerSimulationInterval = async (ms) => {
    try {
      await fetch('http://localhost:3000/api/simulation/interval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval: ms / 1000.0 }),
      });
    } catch (error) {
      console.error('[CORS Configuration Sync Failed]:', error);
    }
  };

  // Full-Stack Automated Benchmarking Session Engine
  useEffect(() => {
    if (isRunning) {
      // Initialize Session Telemetry Clearances
      fpsHistoryRef.current = [];
      estimatedTbtRef.current = 0;
      setBenchmarkReport(null);
      setSecondsLeft(15);
      lastLongTaskCheckRef.current = performance.now();

      // Read Chrome V8 performance memory safely
      initialHeapRef.current = window.performance?.memory 
        ? window.performance.memory.usedJSHeapSize 
        : 0;

      // Establish WebSocket Client Consumer Subscriptions
      cableConsumerRef.current = createConsumer('ws://localhost:3000/cable');
      channelSubscriptionRef.current = cableConsumerRef.current.subscriptions.create(
        { channel: 'IotTelemetryChannel' },
        {
          received(payload) {
            const { id, value, status, lastUpdated, zoneIdentifier } = payload;
            const updatedData = { value, status, lastUpdated, zoneIdentifier };

            if (activeEngineRef.current === 'ZUSTAND') {
              zustandUpdateRef.current(id, updatedData);
            } else {
              reduxDispatchRef.current(reduxUpdate({ id, updatedData }));
            }
            setUpdateCount((prev) => prev + 1);
          }
        }
      );

      // Sync server clock rate
      syncServerSimulationInterval(frequency);

      // Run 15-second Lab Timer Execution Flow
      let currentTick = 15;
      sessionCountdownRef.current = setInterval(() => {
        currentTick -= 1;
        setSecondsLeft(currentTick);

        if (currentTick <= 0) {
          // Automated Laboratory Termination Sequence
          clearInterval(sessionCountdownRef.current);
          setIsRunning(false);

          // Calculate End-of-Run Metrics
          const finalHeap = window.performance?.memory ? window.performance.memory.usedJSHeapSize : 0;
          const heapDeltaBytes = finalHeap - initialHeapRef.current;
          const avgFps = fpsHistoryRef.current.length > 0 
            ? (fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length).toFixed(1) 
            : '60.0';

          setBenchmarkReport({
            engine: activeEngineRef.current,
            intervalMs: frequency,
            avgFps: avgFps,
            totalBlockingTimeMs: estimatedTbtRef.current.toFixed(1),
            heapDeltaMb: (heapDeltaBytes / (1024 * 1024)).toFixed(3),
            packetsProcessed: updateCount + 1
          });
        }
      }, 1000);

    } else {
      // Clean up connections if stopped manually
      if (sessionCountdownRef.current) clearInterval(sessionCountdownRef.current);
      if (channelSubscriptionRef.current) {
        channelSubscriptionRef.current.unsubscribe();
        channelSubscriptionRef.current = null;
      }
      if (cableConsumerRef.current) {
        cableConsumerRef.current.disconnect();
        cableConsumerRef.current = null;
      }
    }

    return () => {
      if (sessionCountdownRef.current) clearInterval(sessionCountdownRef.current);
      if (channelSubscriptionRef.current) channelSubscriptionRef.current.unsubscribe();
      if (cableConsumerRef.current) cableConsumerRef.current.disconnect();
    };
  }, [isRunning]);

  const handleFrequencyChange = (speed) => {
    if (isRunning) return; // Locked down during tests
    setFrequency(speed);
  };

  const handleResetAll = () => {
    if (isRunning) return; // Locked down during tests
    setIsRunning(false);
    zustandReset();
    reduxDispatch(reduxReset());
    setUpdateCount(0);
    setBenchmarkReport(null);
    setSecondsLeft(15);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 font-sans">
      {/* Header Panel */}
      <header className="mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="text-emerald-400 animate-pulse" /> IoT <span className='text-blue-600' > Monitor </span>    
          </h1>
          {/* <p className="text-sm text-slate-400 mt-1">MSc Thesis Performance Sandbox: Zustand vs Redux Toolkit</p> */}
        </div>

        {/* Real-time Diagnostics HUD */}
        <div className="flex items-center gap-6 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
          <div className="text-center">
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Run Time</span>
            <span className="text-lg font-mono font-bold text-sky-400 flex items-center justify-center gap-1">
              <Timer size={14} /> {secondsLeft}s
            </span>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div className="text-center">
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Packets</span>
            <span className="text-lg font-mono font-bold text-emerald-400">{updateCount}</span>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div className="text-center">
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">UI Framerate</span>
            <span className={`text-lg font-mono font-bold ${fps < 45 ? 'text-rose-500' : 'text-amber-400'}`}>
              {fps} FPS
            </span>
          </div>
        </div>
      </header>

      {/* Primary Configuration Dash HUD */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* State Engine Switcher */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wide flex items-center gap-1.5">
            <Cpu size={14} /> Active Architecture
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              disabled={isRunning}
              onClick={() => setActiveEngine('ZUSTAND')}
              className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                activeEngine === 'ZUSTAND' 
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                  : 'text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-500'
              }`}
            >
              ZUSTAND
            </button>
            <button
              disabled={isRunning}
              onClick={() => setActiveEngine('REDUX')}
              className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                activeEngine === 'REDUX' 
                  ? 'bg-purple-600 text-white shadow-md font-black' 
                  : 'text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-500'
              }`}
            >
              REDUX TOOLKIT
            </button>
          </div>
        </div>

        {/* Telemetry Clock Frequency */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wide flex items-center gap-1.5">
            <Zap size={14} /> Server Pulse Frequency
          </label>
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[250, 50, 10].map((speed) => (
              <button
                key={speed}
                disabled={isRunning}
                onClick={() => handleFrequencyChange(speed)}
                className={`py-1.5 text-xs font-mono font-bold rounded-md transition-all ${
                  frequency === speed 
                    ? 'bg-slate-800 text-white border border-slate-700' 
                    : 'text-slate-600 hover:text-slate-300 disabled:opacity-20 disabled:hover:text-slate-600'
                }`}
              >
                {speed}ms
              </button>
            ))}
          </div>
        </div>

        {/* System Simulation Controls */}
        <div className="flex gap-2 pt-4 md:pt-0">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              isRunning 
                ? 'bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900' 
                : 'bg-emerald-500 text-slate-950 font-extrabold hover:bg-emerald-400 shadow-lg shadow-emerald-950/20'
            }`}
          >
            {isRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            {isRunning ? 'Halt Session' : 'Connect Server Stream'}
          </button>
          <button
            disabled={isRunning}
            onClick={handleResetAll}
            className="px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:border-slate-700 transition-all disabled:opacity-30"
            title="Reset Lab Stores"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </section>

      {/* Automated Laboratory Session Report HUD */}
      {benchmarkReport && (
        <section className="mb-8 p-5 bg-slate-900 border border-emerald-500/30 rounded-xl shadow-2xl shadow-emerald-950/10 animate-fadeIn animate-duration-300">
          <h2 className="text-sm font-black text-emerald-400 tracking-wider uppercase mb-4 flex items-center gap-2">
            <BarChart4 size={16} /> Consolidated Laboratory Session Report (15.00s Target Run)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Engine Tested</span>
              <span className={`text-base font-mono font-black ${benchmarkReport.engine === 'ZUSTAND' ? 'text-amber-400' : 'text-purple-400'}`}>
                {benchmarkReport.engine}
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Clock Speed</span>
              <span className="text-base font-mono font-bold text-slate-100">{benchmarkReport.intervalMs}ms</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Average UI Cadence</span>
              <span className="text-base font-mono font-bold text-white">{benchmarkReport.avgFps} FPS</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Est. Blocking Time (TBT)</span>
              <span className={`text-base font-mono font-bold ${parseFloat(benchmarkReport.totalBlockingTimeMs) > 100 ? 'text-rose-400' : 'text-slate-300'}`}>
                {benchmarkReport.totalBlockingTimeMs}ms
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 col-span-2 md:col-span-1">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">V8 Heap Allocation Delta</span>
              <span className="text-base font-mono font-bold text-sky-400">
                {benchmarkReport.heapDeltaMb !== '0.000' ? `${benchmarkReport.heapDeltaMb} MB` : 'N/A (No Extension)'}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Main Node Grid */}
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {activeEngine === 'ZUSTAND' 
          ? staticSensorIds.map((id) => <ZustandCard key={id} id={id} />)
          : staticSensorIds.map((id) => <ReduxCard key={id} id={id} />)
        }
      </main>
    </div>
  );
}
