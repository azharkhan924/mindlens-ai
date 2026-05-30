"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { BookOpen, Plus, Trash2, Brain, ArrowLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface EmotionDetail {
  name: string;
  intensity: number;
  color: string;
}

interface EmotionAnalysis {
  stressScore: number;
  energyScore: number;
  confidenceScore: number;
  focusScore: number;
  motivationScore: number;
  emotionsJson: string;
  themesJson: string;
  insight: string;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  emotionAnalysis?: EmotionAnalysis;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const data = await fetchApi("/journals");
      setEntries(data || []);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }

  const saveEntry = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    try {
      const entry = await fetchApi("/journals", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim() || "Untitled Entry",
          content: content.trim(),
        }),
      });
      setEntries((prev) => [entry, ...prev]);
      setSelectedEntry(entry);
      setIsWriting(false);
      setTitle("");
      setContent("");
    } catch {
      // Handle error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await fetchApi(`/journals/${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (selectedEntry?.id === id) setSelectedEntry(null);
    } catch {
      // Handle error
    }
  };

  const parseEmotions = (json?: string): EmotionDetail[] => {
    if (!json) return [];
    try { return JSON.parse(json); } catch { return []; }
  };

  const parseThemes = (json?: string): string[] => {
    if (!json) return [];
    try { return JSON.parse(json); } catch { return []; }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  // Detail View
  if (selectedEntry) {
    const analysis = selectedEntry.emotionAnalysis;
    const emotions = parseEmotions(analysis?.emotionsJson);
    const themes = parseThemes(analysis?.themesJson);

    return (
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <button onClick={() => setSelectedEntry(null)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors self-start">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Journal
        </button>

        <div>
          <h1 className="font-heading font-semibold text-xl tracking-tight">{selectedEntry.title}</h1>
          <span className="text-xs text-muted-foreground">{formatDate(selectedEntry.createdAt)}</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>
        </div>

        {analysis && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <h2 className="font-heading font-semibold text-sm">AI Emotion Analysis</h2>
            </div>

            {/* Scores */}
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

            {/* Emotions */}
            {emotions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {emotions.map((em) => (
                  <span key={em.name} className="px-3 py-1.5 rounded-full text-xs font-medium border border-border" style={{ backgroundColor: `${em.color}15`, color: em.color }}>
                    {em.name} — {em.intensity}%
                  </span>
                ))}
              </div>
            )}

            {/* Themes */}
            {themes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {themes.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-full bg-muted border border-border text-[10px] text-muted-foreground font-medium">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Insight */}
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

  // List / Write View
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-semibold text-xl tracking-tight">Journal Intelligence</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Write freely. Lens will analyze your emotional patterns.</p>
        </div>
        {!isWriting && (
          <button
            onClick={() => setIsWriting(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/15 transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> New Entry
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isWriting && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-4 p-5 rounded-2xl bg-card border border-border">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry title (optional)..."
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium transition-all"
              autoFocus
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind today? Write freely..."
              rows={8}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-sm leading-relaxed resize-none transition-all"
            />
            <div className="flex items-center justify-between">
              <button onClick={() => { setIsWriting(false); setTitle(""); setContent(""); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button
                onClick={saveEntry}
                disabled={!content.trim() || isAnalyzing}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
              >
                {isAnalyzing ? (
                  <><Brain className="h-3.5 w-3.5 animate-pulse" /> Analyzing...</>
                ) : (
                  <><BookOpen className="h-3.5 w-3.5" /> Save & Analyze</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-xs text-muted-foreground animate-pulse">Loading journal entries...</span>
        </div>
      ) : entries.length === 0 && !isWriting ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="h-14 w-14 rounded-full bg-calm/10 flex items-center justify-center border border-calm/20">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base">No journal entries yet</h3>
            <p className="text-xs text-muted-foreground mt-1">Start writing to unlock AI emotion analysis.</p>
          </div>
          <button onClick={() => setIsWriting(true)} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all">
            Write Your First Entry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entries.map((entry) => {
            const emotions = parseEmotions(entry.emotionAnalysis?.emotionsJson);
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-card border border-border hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold truncate max-w-[200px]">{entry.title || "Untitled"}</h3>
                    <span className="text-[10px] text-muted-foreground">{formatDate(entry.createdAt)}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{entry.content}</p>
                {emotions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {emotions.slice(0, 3).map((em) => (
                      <span key={em.name} className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-border" style={{ backgroundColor: `${em.color}15`, color: em.color }}>
                        {em.name}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
