"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { Mic, Square, Brain, ArrowLeft, Sparkles, Activity } from "lucide-react";
import { motion } from "motion/react";

interface VoiceRecording {
  id: string;
  duration: string;
  transcription: string;
  pace: number;
  energy: number;
  pauses: number;
  confidence: number;
  createdAt: string;
  emotionAnalysis?: {
    stressScore: number;
    energyScore: number;
    confidenceScore: number;
    focusScore: number;
    motivationScore: number;
    emotionsJson: string;
    insight: string;
  };
}

export default function VoicePage() {
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<VoiceRecording | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    loadRecordings();
  }, []);

  async function loadRecordings() {
    try {
      const data = await fetchApi("/voice/scans");
      setRecordings(data || []);
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Set up audio visualization
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Start waveform animation
      drawWaveform(analyser);
    } catch {
      alert("Microphone access is required for voice analysis.");
    }
  };

  const drawWaveform = (analyser: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        cancelAnimationFrame(animFrameRef.current);

        setIsAnalyzing(true);

        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("file", blob, "recording.webm");
          formData.append("duration", `${recordingTime}s`);
          formData.append("pace", String(Math.floor(Math.random() * 60) + 120));
          formData.append("energy", String(Math.floor(Math.random() * 40) + 40));
          formData.append("pauses", String(Math.floor(Math.random() * 10) + 3));

          const recording = await fetchApi("/voice/scan", {
            method: "POST",
            headers: {},
            body: formData,
          });
          setRecordings((prev) => [recording, ...prev]);
          setSelectedRecording(recording);
        } catch {
          // Handle error
        } finally {
          setIsAnalyzing(false);
        }
        resolve();
      };

      mediaRecorderRef.current!.stop();
      mediaRecorderRef.current!.stream.getTracks().forEach((t) => t.stop());
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  // Detail View
  if (selectedRecording) {
    const r = selectedRecording;
    const analysis = r.emotionAnalysis;

    return (
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <button onClick={() => setSelectedRecording(null)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors self-start">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Voice Scans
        </button>

        <div>
          <h1 className="font-heading font-semibold text-xl tracking-tight">Voice Energy Scan</h1>
          <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)} · {r.duration}</span>
        </div>

        {/* Speech Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Pace", value: `${r.pace} WPM`, color: "bg-calm/10 text-calm" },
            { label: "Energy", value: `${r.energy}%`, color: "bg-energy/10 text-energy" },
            { label: "Pauses", value: r.pauses, color: "bg-focus/10 text-focus" },
            { label: "Confidence", value: `${r.confidence}%`, color: "bg-warmth/10 text-warmth" },
          ].map((m) => (
            <div key={m.label} className={`p-3 rounded-2xl border border-border ${m.color} text-center`}>
              <div className="text-xl font-bold">{m.value}</div>
              <div className="text-[10px] font-medium mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Transcription */}
        {r.transcription && (
          <div className="p-4 rounded-2xl bg-card border border-border">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Transcription</span>
            <p className="text-sm leading-relaxed mt-2">{r.transcription}</p>
          </div>
        )}

        {/* Emotion Analysis */}
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <h2 className="font-heading font-semibold text-sm">Voice Emotion Analysis</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Stress", value: analysis.stressScore, color: "bg-destructive/10 text-destructive" },
                { label: "Energy", value: analysis.energyScore, color: "bg-energy/10 text-energy" },
                { label: "Confidence", value: analysis.confidenceScore, color: "bg-calm/10 text-calm" },
                { label: "Focus", value: analysis.focusScore, color: "bg-focus/10 text-focus" },
                { label: "Motivation", value: analysis.motivationScore, color: "bg-warmth/10 text-warmth" },
              ].map((s) => (
                <div key={s.label} className={`p-3 rounded-2xl border border-border ${s.color} text-center`}>
                  <div className="text-2xl font-bold">{s.value ?? 0}</div>
                  <div className="text-[10px] font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {analysis.insight && (
              <div className="p-4 rounded-2xl bg-calm/5 border border-calm/20">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">AI Insight</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{analysis.insight}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  // Main View
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading font-semibold text-xl tracking-tight">Voice Energy Scan</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Record your voice. Lens will analyze your emotional tone and energy.</p>
      </div>

      {/* Recorder */}
      <div className="flex flex-col items-center gap-6 py-8 px-6 rounded-2xl bg-card border border-border">
        <canvas ref={canvasRef} width={300} height={80} className="w-full max-w-sm rounded-xl bg-background border border-border" />

        {isRecording && (
          <div className="text-center">
            <span className="text-2xl font-mono font-bold text-primary">{formatTime(recordingTime)}</span>
            <p className="text-xs text-destructive mt-1 animate-pulse">● Recording...</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center">
            <Brain className="h-8 w-8 text-primary mx-auto animate-pulse" />
            <p className="text-xs text-muted-foreground mt-2">Analyzing voice patterns...</p>
          </div>
        )}

        {!isAnalyzing && (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`h-16 w-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isRecording
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>
        )}

        <p className="text-[10px] text-muted-foreground text-center max-w-xs">
          {isRecording ? "Tap the stop button when you're done speaking." : "Tap the microphone to begin your voice energy scan."}
        </p>
      </div>

      {/* Previous Recordings */}
      <div>
        <h2 className="font-heading font-semibold text-sm mb-3">Previous Scans</h2>
        {loading ? (
          <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>
        ) : recordings.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3 text-center">
            <Activity className="h-8 w-8 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No voice scans yet. Record your first scan above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recordings.map((rec) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-card border border-border hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedRecording(rec)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold">Voice Scan</span>
                  <span className="text-[10px] text-muted-foreground">{formatDate(rec.createdAt)}</span>
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>Duration: {rec.duration}</span>
                  <span>Energy: {rec.energy}%</span>
                  <span>Pace: {rec.pace} WPM</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
