"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings,
  CheckCircle2,
  Volume2,
  ChevronRight,
  Flame,
  Award,
  Coffee,
  Brain
} from "lucide-react";

type TimerMode = "focus" | "shortBreak" | "longBreak";

export function PomodoroTimerSuite() {
  // Custom durations in minutes
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);

  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Exact timestamp tracking to prevent background tab drift
  const endTimeRef = useRef<number | null>(null);

  // Play synthetic chime via Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // AudioContext might be blocked until user interaction
    }
  };

  // Timer tick effect with timestamp delta
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      interval = setInterval(() => {
        if (!endTimeRef.current) return;
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));

        if (remaining <= 0) {
          playChime();
          setIsRunning(false);
          endTimeRef.current = null;

          if (mode === "focus") {
            const nextCompleted = sessionsCompleted + 1;
            setSessionsCompleted(nextCompleted);
            setTotalFocusMinutes((prev) => prev + focusDuration);

            // Determine break mode
            if (nextCompleted % longBreakInterval === 0) {
              setMode("longBreak");
              setTimeLeft(longBreakDuration * 60);
            } else {
              setMode("shortBreak");
              setTimeLeft(shortBreakDuration * 60);
            }
          } else {
            // Break finished -> back to focus
            setMode("focus");
            setTimeLeft(focusDuration * 60);
          }
        } else {
          setTimeLeft(remaining);
        }
      }, 500);
    } else {
      endTimeRef.current = null;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isRunning,
    timeLeft,
    mode,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    longBreakInterval,
    sessionsCompleted,
  ]);

  const handleStart = () => {
    endTimeRef.current = Date.now() + timeLeft * 1000;
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    endTimeRef.current = null;
  };

  const handleReset = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    const dur =
      mode === "focus"
        ? focusDuration
        : mode === "shortBreak"
        ? shortBreakDuration
        : longBreakDuration;
    setTimeLeft(dur * 60);
  };

  const handleSkip = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    if (mode === "focus") {
      setMode("shortBreak");
      setTimeLeft(shortBreakDuration * 60);
    } else {
      setMode("focus");
      setTimeLeft(focusDuration * 60);
    }
  };

  const handleSwitchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    endTimeRef.current = null;
    setMode(newMode);
    const dur =
      newMode === "focus"
        ? focusDuration
        : newMode === "shortBreak"
        ? shortBreakDuration
        : longBreakDuration;
    setTimeLeft(dur * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatDigit = (n: number) => n.toString().padStart(2, "0");

  const totalCurrentDuration =
    (mode === "focus"
      ? focusDuration
      : mode === "shortBreak"
      ? shortBreakDuration
      : longBreakDuration) * 60;
  const progressPercent =
    totalCurrentDuration > 0
      ? ((totalCurrentDuration - timeLeft) / totalCurrentDuration) * 100
      : 0;

  return (
    <div className="text-white space-y-8">
      {/* Top Banner */}
      <div className="liquid-glass-pill p-3 px-6 mb-6 flex items-center justify-between print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/student-zone"
              className="text-xs font-semibold text-[#F04452] hover:text-[#D72638] flex items-center gap-1"
            >
              Student Zone <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                <Clock className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Pomodoro Focus & Study Timer
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-[#777777]" />
              <span>Timer Settings</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Focus & Interval Study Timer
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1">
            Deep work timer built with drift-resistant timestamps and automated rest cycles.
          </p>
        </div>

        {/* Timer Card */}
        <div className="floating-glass-canvas rounded-3xl shadow-md p-8 sm:p-12 text-center space-y-8 relative overflow-hidden">
          {/* Mode Selector Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-white/30 text-xs font-semibold">
            <button
              onClick={() => handleSwitchMode("focus")}
              className={`px-4 py-2 rounded-lg transition-all ${
                mode === "focus"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-[#777777] hover:text-[#202124]"
              }`}
            >
              Focus ({focusDuration}m)
            </button>
            <button
              onClick={() => handleSwitchMode("shortBreak")}
              className={`px-4 py-2 rounded-lg transition-all ${
                mode === "shortBreak"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-[#777777] hover:text-[#202124]"
              }`}
            >
              Short Break ({shortBreakDuration}m)
            </button>
            <button
              onClick={() => handleSwitchMode("longBreak")}
              className={`px-4 py-2 rounded-lg transition-all ${
                mode === "longBreak"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-[#777777] hover:text-[#202124]"
              }`}
            >
              Long Break ({longBreakDuration}m)
            </button>
          </div>

          {/* Large Clock Display */}
          <div className="space-y-2">
            <div className="text-7xl sm:text-8xl font-black font-mono tracking-tight text-[#202124] select-none">
              {formatDigit(minutes)}:{formatDigit(seconds)}
            </div>
            <p className="text-xs font-semibold text-[#777777] uppercase tracking-widest">
              {mode === "focus"
                ? "Deep Focus Session"
                : mode === "shortBreak"
                ? "Relax & Stretch"
                : "Extended Rest & Refresh"}
            </p>
          </div>

          {/* Progress bar */}
          <div className="max-w-md mx-auto">
            <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  mode === "focus"
                    ? "bg-rose-500"
                    : mode === "shortBreak"
                    ? "bg-teal-500"
                    : "bg-indigo-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="p-3 rounded-full border border-white/80 text-[#777777] hover:bg-white/30 transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {isRunning ? (
              <button
                onClick={handlePause}
                className="px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-base font-bold shadow-md flex items-center gap-2 transition-all"
              >
                <Pause className="w-5 h-5 fill-white" /> Pause
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="px-8 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-base font-bold shadow-md flex items-center gap-2 transition-all"
              >
                <Play className="w-5 h-5 fill-white" /> Start Focus
              </button>
            )}

            <button
              onClick={handleSkip}
              className="p-3 rounded-full border border-white/80 text-[#777777] hover:bg-white/30 transition-colors"
              title="Skip to next session"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Session Metrics */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4 border-t border-white/60 text-xs">
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-[10px] text-[#777777] uppercase tracking-wider block font-bold">
                Completed Sessions
              </span>
              <span className="text-xl font-black text-[#202124] font-mono">
                {sessionsCompleted}
              </span>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-[10px] text-[#777777] uppercase tracking-wider block font-bold">
                Total Focus Time
              </span>
              <span className="text-xl font-black text-rose-600 font-mono">
                {totalFocusMinutes} mins
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Modal */}
        {isConfigOpen && (
          <div className="liquid-glass-card rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#202124]">Customize Interval Durations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-medium text-[#777777] block mb-1">
                  Focus (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={focusDuration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 25;
                    setFocusDuration(val);
                    if (mode === "focus" && !isRunning) setTimeLeft(val * 60);
                  }}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#777777] block mb-1">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={shortBreakDuration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 5;
                    setShortBreakDuration(val);
                    if (mode === "shortBreak" && !isRunning) setTimeLeft(val * 60);
                  }}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#777777] block mb-1">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={longBreakDuration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 15;
                    setLongBreakDuration(val);
                    if (mode === "longBreak" && !isRunning) setTimeLeft(val * 60);
                  }}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsConfigOpen(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Close Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
