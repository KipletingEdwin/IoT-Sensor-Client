

import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Play, Pause, RotateCcw, Cpu, Zap, Activity } from "lucide-react";
import { createConsumer } from "@rails/actioncable"; // Official Rails Client

// Schema and State Actions
import { SENSOR_IDS } from "./constants/sensorSchema";
import { useSensorStore } from "./features/zustand/useSensorStore";
import {
  updateSensor as reduxUpdate,
  resetStore as reduxReset,
} from "./features/redux/sensorSlice";

// Isolated Granular Child Components (Bypass parent rendering trees)
import { ZustandCard } from "./components/ZustandCard";
import { ReduxCard } from "./components/ReduxCard";

export default function App() {
  // Engine and Telemetry Stream Sync Configuration
  const [activeEngine, setActiveEngine] = useState("ZUSTAND"); // 'ZUSTAND' | 'REDUX'
  const [frequency, setFrequency] = useState(250); // 250ms | 50ms | 10ms
  const [isRunning, setIsRunning] = useState(false);

  // Performance Benchmarking Metrics
  const [updateCount, setUpdateCount] = useState(0);
  const [fps, setFps] = useState(60);

  // Extract baseline mutation methods
  const zustandUpdate = useSensorStore((state) => state.updateSensor);
  const zustandReset = useSensorStore((state) => state.resetStore);
  const reduxDispatch = useDispatch();

  const staticSensorIds = Object.values(SENSOR_IDS);

  // Refs for tracking mutable data streams smoothly under high frequency
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());
  const activeEngineRef = useRef(activeEngine);
  const zustandUpdateRef = useRef(zustandUpdate);
  const reduxDispatchRef = useRef(reduxDispatch);
  const cableConsumerRef = useRef(null);
  const channelSubscriptionRef = useRef(null);

  // Sync references immediately to prevent state closure lag on data influxes
  useEffect(() => {
    activeEngineRef.current = activeEngine;
    zustandUpdateRef.current = zustandUpdate;
    reduxDispatchRef.current = reduxDispatch;
  }, [activeEngine, zustandUpdate, reduxDispatch]);

  // FPS Counter Frame Loop
  useEffect(() => {
    let animationFrameId;
    const calculateFps = () => {
      frameCountRef.current += 1;
      const now = performance.now();
      if (now - lastFpsUpdateRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
      animationFrameId = requestAnimationFrame(calculateFps);
    };
    animationFrameId = requestAnimationFrame(calculateFps);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Sync Local UI Clock speed modifications to the Rails Backend Engine Environment
  const syncServerSimulationInterval = async (ms) => {
    const secondsValue = ms / 1000.0;
    try {
      const response = await fetch(
        "http://localhost:3000/api/simulation/interval",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interval: secondsValue }),
        },
      );
      if (!response.ok)
        throw new Error("Network synchronization reject boundaries.");
    } catch (error) {
      console.error("[Backend Engine Sync Failed]:", error);
    }
  };

  // Manage Live ActionCable WebSocket Channels
  useEffect(() => {
    if (isRunning) {
      // 1. Establish the Active Consumer Connection Link
      cableConsumerRef.current = createConsumer("ws://localhost:3000/cable");

      // 2. Instantiate Subscription to the Asynchronous Channel Stream
      channelSubscriptionRef.current =
        cableConsumerRef.current.subscriptions.create(
          { channel: "IotTelemetryChannel" },
          {
            received(payload) {
              // Unpack server event parameters safely
              const { id, value, status, lastUpdated, zoneIdentifier } =
                payload;

              const standardizedPayload = {
                value,
                status,
                lastUpdated,
                zoneIdentifier,
              };

              // Inject payload updates into the targeted architectural store layout
              if (activeEngineRef.current === "ZUSTAND") {
                zustandUpdateRef.current(id, standardizedPayload);
              } else {
                reduxDispatchRef.current(
                  reduxUpdate({ id, updatedData: standardizedPayload }),
                );
              }

              setUpdateCount((prev) => prev + 1);
            },
            connected() {
              console.log(
                "%c[WebSocket Connected to Rails Streaming Server]",
                "color: #10b981; font-weight: bold;",
              );
            },
            disconnected() {
              console.log(
                "%c[WebSocket Disconnected]",
                "color: #ef4444; font-weight: bold;",
              );
            },
          },
        );

      // Sync backend interval loop rate on initialization
      syncServerSimulationInterval(frequency);
    } else {
      // Graceful Teardown of WebSockets to clean up open file descriptors
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
      if (channelSubscriptionRef.current)
        channelSubscriptionRef.current.unsubscribe();
      if (cableConsumerRef.current) cableConsumerRef.current.disconnect();
    };
  }, [isRunning]);

  // Adjust frequencies dynamically and trigger an immediate HTTP payload payload sync
  const handleFrequencyChange = (speed) => {
    setFrequency(speed);
    if (isRunning) {
      syncServerSimulationInterval(speed);
    }
  };

  // Reset Control Handler
  const handleResetAll = () => {
    setIsRunning(false);
    zustandReset();
    reduxDispatch(reduxReset());
    setUpdateCount(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 font-sans">
      {/* Header Panel */}
      <header className="mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="text-emerald-400" /> IoT <span className="text-blue-600" >Monitor</span>
          </h1>
          {/* <p className="text-sm text-slate-400 mt-1">
            MSc Thesis Performance Sandbox: Zustand vs Redux Toolkit
          </p> */}
        </div>

        {/* Real-time Diagnostics HUD */}
        <div className="flex items-center gap-6 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
          <div className="text-center">
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Live Server Packets
            </span>
            <span className="text-lg font-mono font-bold text-emerald-400">
              {updateCount}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div className="text-center">
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              UI Refresh Rate
            </span>
            <span
              className={`text-lg font-mono font-bold ${fps < 30 ? "text-rose-500" : "text-amber-400"}`}
            >
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
              onClick={() => setActiveEngine("ZUSTAND")}
              className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                activeEngine === "ZUSTAND"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ZUSTAND
            </button>
            <button
              onClick={() => setActiveEngine("REDUX")}
              className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                activeEngine === "REDUX"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
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
                onClick={() => handleFrequencyChange(speed)}
                className={`py-1.5 text-xs font-mono font-bold rounded-md transition-all ${
                  frequency === speed
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {speed}ms
              </button>
            ))}
          </div>
        </div>

        {/* System Simulation Master Controls */}
        <div className="flex gap-2 pt-4 md:pt-0">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              isRunning
                ? "bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900"
                : "bg-emerald-500 text-slate-950 font-extrabold hover:bg-emerald-400 shadow-lg shadow-emerald-950/20"
            }`}
          >
            {isRunning ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            {isRunning ? "Disconnect Stream" : "Connect Server Stream"}
          </button>
          <button
            onClick={handleResetAll}
            className="px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title="Reset Stores to Baseline"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </section>

      {/* Main Node Grid: Evaluates subscriber rendering boundaries */}
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {activeEngine === "ZUSTAND"
          ? staticSensorIds.map((id) => <ZustandCard key={id} id={id} />)
          : staticSensorIds.map((id) => <ReduxCard key={id} id={id} />)}
      </main>
    </div>
  );
}
