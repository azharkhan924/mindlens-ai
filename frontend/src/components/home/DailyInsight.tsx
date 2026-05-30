"use client";

import React from "react";
import { Sparkles, ArrowRight, Brain } from "lucide-react";
import Link from "next/link";

interface DailyInsightProps {
  insight: string;
  stressScore: number;
}

export default function DailyInsight({ insight, stressScore }: DailyInsightProps) {
  let stressLevel = "low";
  let stressColor = "text-energy";
  
  if (stressScore > 65) {
    stressLevel = "elevated";
    stressColor = "text-destructive";
  } else if (stressScore > 40) {
    stressLevel = "moderate";
    stressColor = "text-focus";
  }

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[320px] relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-focus/10 to-transparent rounded-full filter blur-xl"></div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-warmth animate-pulse" />
          AI Daily Insight
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          Stress: <span className={`font-bold ${stressColor}`}>{stressLevel}</span>
        </span>
      </div>

      <div className="my-6">
        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20">
          <Brain className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium leading-relaxed text-foreground/90">
          &quot;{insight}&quot;
        </p>
      </div>

      <Link
        href="/predictions"
        className="group flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-all self-start mt-2"
        id="insight-learn-more-btn"
      >
        See Wellness Predictions
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
