"use client";

import React, { useState, useEffect } from "react";
import { getWellnessPredictions, WellnessPrediction } from "@/lib/mockData";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<WellnessPrediction[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setPredictions(getWellnessPredictions());
  }, []);

  const getStatusBadge = (status: "low" | "medium" | "high") => {
    switch (status) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-focus/10 text-focus border-focus/20";
      default:
        return "bg-energy/10 text-energy border-energy/20";
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 w-full"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-heading font-semibold text-3xl tracking-tight">
          Wellness Predictions
        </h2>
        <p className="text-sm text-muted-foreground">
          Forward-looking wellness signals utilizing advanced semantic models to predict cognitive fatigue risks.
        </p>
      </div>

      {/* Main explanation warning */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-calm/10 to-focus/10 border border-border shadow-sm flex items-start gap-4 max-w-4xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-warmth/10 to-transparent rounded-full filter blur-xl"></div>
        <div className="h-10 w-10 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-primary mt-0.5 shadow-sm">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
            Explainable AI Companion Scanning
          </h3>
          <p className="text-xs text-foreground/80 leading-relaxed mt-1 font-light">
            These scores analyze rolling vectors from your voice pauses, speaking cadence, and journal sentiment. Each calculation outlines why it was made, mapping specific stressors directly back to your writing themes.
          </p>
        </div>
      </div>

      {/* Predictions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {predictions.map((p) => {
          const isExpanded = expandedId === p.id;
          return (
            <div
              key={p.id}
              className="p-6 rounded-3xl glass-card border border-border shadow-sm flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {p.type}
                </span>
                <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold border", getStatusBadge(p.status))}>
                  {p.status}
                </span>
              </div>

              {/* Score Display and explanatory ring */}
              <div className="flex items-center gap-6 my-2 text-left">
                <div className="relative h-20 w-20 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-xl font-bold shadow-inner">
                  {p.score}%
                  <span className="absolute bottom-1 text-[8px] text-muted-foreground uppercase font-semibold tracking-wider">
                    Risk
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold">Model Confidence: {p.confidence}%</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                    Aggregated semantic match strength across 5 check-ins.
                  </p>
                </div>
              </div>

              {/* Explanation panel */}
              <div className="bg-muted/40 p-4.5 rounded-2xl border border-border/50 text-left">
                <p className="text-xs leading-relaxed text-foreground/90 font-light">
                  {p.explanation}
                </p>
              </div>

              {/* Expand details trigger */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => toggleExpand(p.id)}
                  className="flex items-center justify-between text-xs font-semibold text-primary hover:text-primary/80 transition-colors w-full border-t border-border pt-3"
                  id={`prediction-expand-${p.id}`}
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="h-4 w-4" />
                    How this was calculated
                  </span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="flex flex-col gap-2 pl-2 border-l border-border mt-1">
                        {p.details.map((detail, idx) => (
                          <li
                            key={idx}
                            className="text-[10px] text-muted-foreground leading-relaxed flex items-start gap-1.5"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-energy mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
