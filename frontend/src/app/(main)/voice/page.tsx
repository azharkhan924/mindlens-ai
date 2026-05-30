"use client";

import React, { useState, useEffect, useRef } from "react";
import { getLocalVoiceEntries, saveLocalVoice, VoiceEntry } from "@/lib/mockData";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  Square,
  Sparkles,
  Play,
  Volume2,
  Calendar,
  Compass,
  Zap,
  Info,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function VoicePage() {
  const [voiceEntries, setVoiceEntries] = useState<VoiceEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<VoiceEntry | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [justAnalyzed, setJustAnalyzed] = useState<VoiceEntry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const list = getLocalVoiceEntries();
    setVoiceEntries(list);
    if (list.length > 0) {
      setSelectedEntry(list[0]);
    }
  }, []);

  // Format recording timer
  const formatTimer = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // Waveform canvas mock simulation
  useEffect(() => {
    if (!isRecording) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angle = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.lineWidth = 2.5;
      
      // Draw smooth sine-like breathing waves
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, "rgba(114, 144, 200, 0.4)");
      grad.addColorStop(0.5, "rgba(114, 184, 145, 0.8)");
      grad.addColorStop(1, "rgba(114, 144, 200, 0.4)");
      ctx.strokeStyle = grad;

      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        // Amplitude fluctuates between soft breath states
        const amplitude = 12 + Math.sin(angle * 0.05) * 8 + Math.random() * 4;
        const y = height / 2 + Math.sin(x * 0.04 + angle) * amplitude;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      angle += 0.08;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRecording]);

  // Start recording timer
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordTime(0);
    timerRef.current = setInterval(() => {
      setRecordTime((prev) => prev + 1);
    }, 1000);
  };

  // Stop recording & parse
  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    
    setIsAnalyzing(true);
    
    // Simulate speech-to-text + emotional pace scan
    setTimeout(() => {
      const transcription = "Honestly, I've had a really busy week and I've been feeling somewhat restless, but speaking things out loud is helping me capture how much focus I've lost.";
      const duration = formatTimer(recordTime);
      const pace = Math.round(95 + Math.random() * 25); // ~110 WPM
      const energy = Math.round(45 + Math.random() * 20); // moderate energy
      const pauses = Math.round(3 + Math.random() * 3); // 3 to 6 pauses
      
      const saved = saveLocalVoice(transcription, pace, energy, pauses, duration);
      setVoiceEntries(getLocalVoiceEntries());
      setSelectedEntry(saved);
      setJustAnalyzed(saved);
      setIsAnalyzing(false);
      
      setTimeout(() => setJustAnalyzed(null), 5000);
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 w-full"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-heading font-semibold text-3xl tracking-tight">
          Voice Energy Scan
        </h2>
        <p className="text-sm text-muted-foreground">
          Analyze speaking speed, cadence, and verbal volume without sharing audio externally.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left pane: Recording hub (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Active recorder card */}
          <div className="p-6 rounded-3xl glass-card border border-border shadow-sm flex flex-col items-center justify-center text-center gap-6 min-h-[300px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-calm/10 to-transparent rounded-full filter blur-xl"></div>
            
            <AnimatePresence mode="wait">
              {isRecording ? (
                <motion.div
                  key="recording-ui"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 w-full"
                >
                  <span className="text-xs font-semibold text-destructive animate-pulse-glow flex items-center gap-1.5 bg-destructive/10 px-3 py-1 rounded-full border border-destructive/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-ping"></span>
                    Capturing Vocal Waves
                  </span>
                  
                  <span className="text-4xl font-mono font-medium tracking-wider">
                    {formatTimer(recordTime)}
                  </span>

                  {/* Waveform Canvas */}
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={100}
                    className="w-full max-w-md h-24 bg-muted/20 border border-border/50 rounded-2xl shadow-inner mt-2"
                  />

                  <button
                    onClick={handleStopRecording}
                    className="mt-4 p-4 rounded-full bg-destructive text-white hover:bg-destructive/90 transition-all shadow-md group active:scale-95"
                    title="Stop Voice Scan"
                    id="stop-voice-btn"
                  >
                    <Square className="h-5 w-5 fill-white" />
                  </button>
                </motion.div>
              ) : isAnalyzing ? (
                <motion.div
                  key="analyzing-ui"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-calm to-focus flex items-center justify-center text-white shadow-md animate-spin">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h4 className="font-heading font-semibold text-lg">Decoding Acoustic Cadence...</h4>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Calculating word-per-minute flow patterns and pause ratios to estimate distress levels.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="idle-ui"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-5"
                >
                  <button
                    onClick={handleStartRecording}
                    className="h-20 w-20 rounded-full bg-gradient-to-tr from-calm to-focus flex items-center justify-center text-white hover:shadow-lg transition-all group active:scale-95 shadow-md border border-white/10"
                    title="Start Voice Checkin"
                    id="start-voice-btn"
                  >
                    <Mic className="h-8 w-8 transition-transform group-hover:scale-110" />
                  </button>
                  <div>
                    <h4 className="font-heading font-semibold text-base">Tap to speak</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-normal">
                      Speak naturally about your day, frustrations, or plans. We analyze the pace and energy metrics.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Extracted Speech stats */}
          <AnimatePresence mode="wait">
            {selectedEntry && !isRecording && !isAnalyzing && (
              <motion.div
                key="voice-detail"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
              >
                {justAnalyzed?.id === selectedEntry.id && (
                  <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-energy/10 text-energy border border-energy/20 text-xs font-semibold shadow-sm">
                    <CheckCircle className="h-4.5 w-4.5" />
                    Speech transcription completed. Cadence indices rendered.
                  </div>
                )}

                {/* Info panels */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
                  {/* Pace */}
                  <div className="p-4 rounded-3xl glass-card border border-border shadow-sm text-center flex flex-col items-center justify-center gap-1">
                    <Compass className="h-5 w-5 text-primary mb-1" />
                    <span className="text-lg font-heading font-bold">{selectedEntry.pace}</span>
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Flow (WPM)</span>
                  </div>

                  {/* Volume energy */}
                  <div className="p-4 rounded-3xl glass-card border border-border shadow-sm text-center flex flex-col items-center justify-center gap-1">
                    <Zap className="h-5 w-5 text-warmth mb-1" />
                    <span className="text-lg font-heading font-bold">{selectedEntry.energy}%</span>
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acoustic Energy</span>
                  </div>

                  {/* Pauses */}
                  <div className="p-4 rounded-3xl glass-card border border-border shadow-sm text-center flex flex-col items-center justify-center gap-1">
                    <Volume2 className="h-5 w-5 text-focus mb-1" />
                    <span className="text-lg font-heading font-bold">{selectedEntry.pauses}</span>
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Focus Pauses</span>
                  </div>

                  {/* Speech Confidence */}
                  <div className="p-4 rounded-3xl glass-card border border-border shadow-sm text-center flex flex-col items-center justify-center gap-1">
                    <Info className="h-5 w-5 text-energy mb-1" />
                    <span className="text-lg font-heading font-bold">{selectedEntry.confidence}%</span>
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Confidence Score</span>
                  </div>
                </div>

                {/* Transcription text */}
                <div className="p-6 rounded-3xl glass-card border border-border shadow-sm flex flex-col gap-3">
                  <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                    Acoustic Transcription
                  </span>
                  <p className="text-sm font-light leading-relaxed text-foreground/80">
                    &quot;{selectedEntry.transcription}&quot;
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right pane: Historical audio clips (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase px-2">
            Acoustic Captures ({voiceEntries.length})
          </span>

          <div className="flex flex-col gap-3">
            {voiceEntries.map((v) => {
              const isSelected = selectedEntry?.id === v.id && !isRecording && !isAnalyzing;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedEntry(v)}
                  className={cn(
                    "p-4 rounded-3xl border text-left transition-all relative flex items-center justify-between gap-3 group",
                    isSelected
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-card border-border hover:bg-muted"
                  )}
                  id={`voice-list-item-${v.id}`}
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-foreground line-clamp-1 max-w-[130px] flex items-center gap-1">
                      <Play className="h-3 w-3 text-primary group-hover:scale-110 transition-transform fill-primary" />
                      Voice Scan
                    </span>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(v.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-semibold text-primary">{v.duration}</span>
                    <p className="text-[8px] text-muted-foreground mt-1 uppercase font-semibold">Flow: {v.pace} WPM</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
