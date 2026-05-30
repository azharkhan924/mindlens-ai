"use client";

import React, { useState, useEffect } from "react";
import { getLocalJournals, saveLocalJournal, JournalEntry, EmotionDetail } from "@/lib/mockData";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingDown,
  Calendar,
  AlertCircle,
  Tag,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function JournalPage() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  
  // Just analyzed state for animations
  const [justAnalyzed, setJustAnalyzed] = useState<JournalEntry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const list = getLocalJournals();
    setJournals(list);
    if (list.length > 0 && !selectedEntry) {
      setSelectedEntry(list[0]);
    }
  }, [selectedEntry]);

  const handleSaveEntry = () => {
    if (!title.trim() || !content.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const saved = saveLocalJournal({ title, content });
      setJournals(getLocalJournals());
      setSelectedEntry(saved);
      setJustAnalyzed(saved);
      setIsWriting(false);
      setTitle("");
      setContent("");
      setIsAnalyzing(false);
      
      // Auto-hide alert badge after a few seconds
      setTimeout(() => setJustAnalyzed(null), 5000);
    }, 2000);
  };

  const getMetricColor = (val: number, isStress = false) => {
    if (isStress) {
      if (val > 65) return "bg-destructive";
      if (val > 40) return "bg-focus";
      return "bg-energy";
    } else {
      if (val > 70) return "bg-energy";
      if (val > 45) return "bg-focus";
      return "bg-destructive/70";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 w-full"
    >
      {/* Top Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-semibold text-3xl tracking-tight">
            Journal Intelligence
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Express yourself freely. Our companion engine infers metrics automatically.
          </p>
        </div>
        {!isWriting && (
          <button
            onClick={() => {
              setIsWriting(true);
              setSelectedEntry(null);
            }}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 shadow transition-all self-start sm:self-auto"
            id="journal-new-entry-btn"
          >
            <Plus className="h-4 w-4" />
            Write Reflection
          </button>
        )}
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Side: Historical List (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase px-2">
            Historical Reflections ({journals.length})
          </span>

          <div className="flex flex-col gap-3">
            {journals.map((j) => {
              const isSelected = selectedEntry?.id === j.id && !isWriting;
              return (
                <button
                  key={j.id}
                  onClick={() => {
                    setSelectedEntry(j);
                    setIsWriting(false);
                  }}
                  className={cn(
                    "p-4 rounded-3xl border text-left transition-all relative flex flex-col gap-2",
                    isSelected
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-card border-border hover:bg-muted"
                  )}
                  id={`journal-list-item-${j.id}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-foreground line-clamp-1 max-w-[70%]">
                      {j.title}
                    </span>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(j.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {j.content}
                  </p>
                  
                  {/* Mini-pills of key emotions inside history card */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {j.analysis.emotions.slice(0, 2).map((emo) => (
                      <span
                        key={emo.name}
                        className="text-[8px] font-medium px-2 py-0.5 rounded-full border border-border bg-background"
                        style={{ color: emo.color }}
                      >
                        {emo.name}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Primary Display (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {/* WRITING MODE EDITOR */}
            {isWriting ? (
              <motion.div
                key="writing-editor"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col gap-4 p-6 rounded-3xl glass-card border border-border shadow-sm w-full"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    New reflection
                  </span>
                  <button
                    onClick={() => {
                      setIsWriting(false);
                      if (journals.length > 0) setSelectedEntry(journals[0]);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Give this reflection a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-muted/40 border border-transparent focus:border-border outline-none text-sm font-semibold"
                    disabled={isAnalyzing}
                    id="journal-title-input"
                  />
                  <textarea
                    placeholder="Write freely. Don't worry about structuring your thoughts—express what you are experiencing right now..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-4 rounded-2xl bg-muted/40 border border-transparent focus:border-border outline-none text-sm leading-relaxed resize-none"
                    disabled={isAnalyzing}
                    id="journal-body-input"
                  />
                </div>

                <button
                  onClick={handleSaveEntry}
                  disabled={!title.trim() || !content.trim() || isAnalyzing}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:bg-primary/95 disabled:opacity-50 disabled:pointer-events-none transition-all mt-2 self-end"
                  id="journal-save-btn"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      Analyzing Inner State...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze & Save Entry
                    </>
                  )}
                </button>
              </motion.div>
            ) : selectedEntry ? (
              /* DETAIL MODE & EXTRACTED DATA VIEW */
              <motion.div
                key="detail-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-6"
              >
                {/* Alert confirmation card */}
                {justAnalyzed?.id === selectedEntry.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2.5 p-4 rounded-2xl bg-energy/10 text-energy border border-energy/20 text-xs font-semibold shadow-sm"
                  >
                    <CheckCircle className="h-4.5 w-4.5" />
                    State scan completed. Dynamic metrics calculated below!
                  </motion.div>
                )}

                {/* Journal body and details */}
                <div className="p-6 rounded-3xl glass-card border border-border shadow-sm flex flex-col gap-4 w-full">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-xl tracking-tight">
                      {selectedEntry.title}
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted py-1 px-3 rounded-full border border-border">
                      {new Date(selectedEntry.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap border-l-2 border-border pl-4">
                    {selectedEntry.content}
                  </p>
                </div>

                {/* Extracted cognitive engine results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Metrics meters */}
                  <div className="p-6 rounded-3xl glass-card border border-border shadow-sm flex flex-col gap-5">
                    <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                      Inferred Wellness Meters
                    </span>

                    <div className="flex flex-col gap-4">
                      {/* Stress meter */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-muted-foreground">Stress Level</span>
                          <span className="font-bold">{selectedEntry.analysis.stressScore}/100</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-1000", getMetricColor(selectedEntry.analysis.stressScore, true))}
                            style={{ width: `${selectedEntry.analysis.stressScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Energy meter */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-muted-foreground">Energy Balance</span>
                          <span className="font-bold">{selectedEntry.analysis.energyScore}/100</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-1000", getMetricColor(selectedEntry.analysis.energyScore))}
                            style={{ width: `${selectedEntry.analysis.energyScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Confidence meter */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-muted-foreground">Personal Confidence</span>
                          <span className="font-bold">{selectedEntry.analysis.confidenceScore}/100</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-1000", getMetricColor(selectedEntry.analysis.confidenceScore))}
                            style={{ width: `${selectedEntry.analysis.confidenceScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Focus meter */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-muted-foreground">Attention Focus</span>
                          <span className="font-bold">{selectedEntry.analysis.focusScore}/100</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-1000", getMetricColor(selectedEntry.analysis.focusScore))}
                            style={{ width: `${selectedEntry.analysis.focusScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emotion tags and advisor insight */}
                  <div className="flex flex-col gap-6">
                    {/* Emotion tags */}
                    <div className="p-6 rounded-3xl glass-card border border-border shadow-sm flex flex-col gap-4">
                      <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        Inferred Emotional Spectrum
                      </span>

                      <div className="flex flex-wrap gap-2.5">
                        {selectedEntry.analysis.emotions.map((emo) => (
                          <div
                            key={emo.name}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card/50 text-xs font-medium shadow-sm transition-all"
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: emo.color }}
                            />
                            <span>{emo.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {Math.round(emo.intensity * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Theme tags */}
                      <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-border">
                        {selectedEntry.analysis.themes.map((theme) => (
                          <span
                            key={theme}
                            className="text-[9px] font-semibold text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-full uppercase tracking-wider"
                          >
                            #{theme}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Advisor feedback */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-calm/10 to-focus/10 border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-warmth/20 to-transparent rounded-full filter blur-xl"></div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-warmth" />
                        Empathetic Advice
                      </span>
                      <p className="text-xs text-foreground/90 leading-relaxed font-light">
                        {selectedEntry.analysis.insight}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* EMPTY FALLBACK */
              <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-3xl">
                <BookOpen className="h-10 w-10 text-muted-foreground mb-3 animate-pulse" />
                <h4 className="text-sm font-semibold">No reflections loaded</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Click &apos;Write Reflection&apos; above to record your first entry.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
