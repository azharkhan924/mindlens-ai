"use client";

import React from "react";
import { motion } from "motion/react";
import { Activity } from "lucide-react";

interface WellnessScoreRingProps {
  score: number;
  insight: string;
}

export default function WellnessScoreRing({ score, insight }: WellnessScoreRingProps) {
  // SVG Ring Calculations
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine status color based on score
  let statusColor = "stroke-energy";
  let textColor = "text-energy";
  let statusBg = "bg-energy/10";
  let statusText = "Optimal";

  if (score < 50) {
    statusColor = "stroke-destructive";
    textColor = "text-destructive";
    statusBg = "bg-destructive/10";
    statusText = "Load Warning";
  } else if (score < 75) {
    statusColor = "stroke-focus";
    textColor = "text-focus";
    statusBg = "bg-focus/10";
    statusText = "Rest Advised";
  }

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-between text-center min-h-[320px] relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-calm/10 to-transparent rounded-full filter blur-xl"></div>
      
      <div className="w-full flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
          Wellness Index
        </span>
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border border-transparent ${statusBg} ${textColor} flex items-center gap-1 shadow-sm`}>
          <Activity className="h-3 w-3" />
          {statusText}
        </div>
      </div>

      <div className="relative h-40 w-40 flex items-center justify-center my-4">
        {/* SVG Ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          {/* Base track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            className="stroke-muted fill-none"
            strokeWidth={strokeWidth}
          />
          {/* Active progress */}
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            className={`fill-none transition-colors duration-500 ${statusColor}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Text centered inside wheel */}
        <div className="absolute flex flex-col items-center">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-heading font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent"
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest mt-0.5">
            Score
          </span>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed px-4 line-clamp-2">
        {insight}
      </p>
    </div>
  );
}
