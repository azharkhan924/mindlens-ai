"use client";

import React, { useEffect, useState } from "react";
import { getLocalProfile, getWellnessScore, WellnessScore, getLocalJournals } from "@/lib/mockData";
import WellnessScoreRing from "@/components/home/WellnessScoreRing";
import DailyInsight from "@/components/home/DailyInsight";
import Link from "next/link";
import {
  MessageSquare,
  BookOpen,
  Mic,
  ArrowRight,
  Wind,
  Moon,
  BatteryCharging,
  Compass,
} from "lucide-react";
import { motion } from "motion/react";

export default function HomePage() {
  const [name, setName] = useState("Companion");
  const [scoreData, setScoreData] = useState<WellnessScore | null>(null);
  const [hasJournals, setHasJournals] = useState(false);

  useEffect(() => {
    const profile = getLocalProfile();
    if (profile && profile.name) {
      setName(profile.name);
    }
    const score = getWellnessScore();
    setScoreData(score);
    
    const journals = getLocalJournals();
    setHasJournals(journals.length > 0);
  }, []);

  const recommendations = [
    {
      title: "Box Breathing",
      desc: "5-min nervous system reset. Regulates elevated heart rates and stress scores.",
      icon: Wind,
      duration: "5 min",
      action: "Start Breathe",
      color: "bg-calm/10 border-calm/20 text-primary",
    },
    {
      title: "Vagus Nerve Reset",
      desc: "Gentle physical posture to trigger cognitive deceleration.",
      icon: BatteryCharging,
      duration: "8 min",
      action: "View Posture",
      color: "bg-focus/10 border-focus/20 text-focus",
    },
    {
      title: "Nature Walk Recalibration",
      desc: "Outdoor step reset. Notice speaking speed differences after completion.",
      icon: Compass,
      duration: "15 min",
      action: "Log Walk",
      color: "bg-energy/10 border-energy/20 text-energy",
    },
    {
      title: "Wind Down Digital Sabbath",
      desc: "Dim blue sources. Prepares sleep pathways inside your timeline.",
      icon: Moon,
      duration: "30 min",
      action: "Set Silent",
      color: "bg-warmth/10 border-warmth/20 text-warmth",
    },
  ];

  if (!scoreData) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-8 w-full"
    >
      {/* Header Info */}
      <div className="flex flex-col gap-1">
        <h2 className="font-heading font-semibold text-3xl tracking-tight text-foreground">
          Welcome back, {name}
        </h2>
        <p className="text-sm text-muted-foreground">
          How is your mental battery balancing today? Here is your cognitive scan:
        </p>
      </div>

      {/* Wellness Index & Insights row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <WellnessScoreRing score={scoreData.overall} insight={scoreData.insight} />
        <DailyInsight insight={scoreData.insight} stressScore={scoreData.stress} />
      </div>

      {/* Quick Action Navigation links */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
          Companion Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {/* Speak to companion */}
          <Link
            href="/chat"
            className="flex items-center justify-between p-5 rounded-3xl bg-card border border-border hover:border-primary/30 shadow-sm hover:shadow transition-all group"
            id="action-chat-btn"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform border border-primary/20">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-semibold">AI Companion Chat</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Empathetic support & journaling advice</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          {/* Log journal */}
          <Link
            href="/journal"
            className="flex items-center justify-between p-5 rounded-3xl bg-card border border-border hover:border-calm/30 shadow-sm hover:shadow transition-all group"
            id="action-journal-btn"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-calm/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform border border-calm/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-semibold">Journal Intelligence</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {hasJournals ? "Analyze your reflections" : "Write your first entry"}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          {/* Record voice */}
          <Link
            href="/voice"
            className="flex items-center justify-between p-5 rounded-3xl bg-card border border-border hover:border-focus/30 shadow-sm hover:shadow transition-all group"
            id="action-voice-btn"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-focus/10 flex items-center justify-center text-focus group-hover:scale-105 transition-transform border border-focus/20">
                <Mic className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-semibold">Voice Energy Scan</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Analyze speaking pace & pauses</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>

      {/* Horizontal recommendations blocks */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
          AI Guided Recommendations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {recommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div
                key={rec.title}
                className="flex flex-col justify-between p-5 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden"
              >
                <div>
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center border ${rec.color} mb-3`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-xs font-semibold text-foreground tracking-tight">{rec.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-1.5">{rec.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-border">
                  <span className="text-[9px] font-semibold text-muted-foreground">{rec.duration}</span>
                  <button className="text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors">
                    {rec.action}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
