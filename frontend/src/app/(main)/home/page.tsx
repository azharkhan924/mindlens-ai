"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import WellnessScoreRing from "@/components/home/WellnessScoreRing";
import DailyInsight from "@/components/home/DailyInsight";
import Link from "next/link";
import { MessageSquare, BookOpen, Mic, ArrowRight, Wind, Moon, BatteryCharging, Compass } from "lucide-react";
import { motion } from "motion/react";

interface WellnessScore {
  overallScore: number;
  stress: number;
  energy: number;
  confidence: number;
  focus: number;
  motivation: number;
  insight: string;
}

export default function HomePage() {
  const { user } = useAuth();
  const [scoreData, setScoreData] = useState<WellnessScore | null>(null);
  const [journalCount, setJournalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [score, journals] = await Promise.allSettled([
          fetchApi("/wellness/score"),
          fetchApi("/journals"),
        ]);
        if (score.status === "fulfilled" && score.value) {
          setScoreData(score.value);
        }
        if (journals.status === "fulfilled" && Array.isArray(journals.value)) {
          setJournalCount(journals.value.length);
        }
      } catch {
        // Dashboard loads with defaults if API unavailable
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const name = user?.name || "Companion";
  const overallScore = scoreData?.overallScore ?? 0;
  const insight = scoreData?.insight ?? "Start journaling or chatting to generate your first wellness insight.";
  const stressScore = scoreData?.stress ?? 0;

  const quickActions = [
    { title: "AI Chat", desc: "Talk with Lens", icon: MessageSquare, href: "/chat", color: "bg-calm/10 border-calm/20 text-primary" },
    { title: "Journal", desc: "Write a reflection", icon: BookOpen, href: "/journal", color: "bg-focus/10 border-focus/20 text-focus" },
    { title: "Voice Scan", desc: "Analyze your tone", icon: Mic, href: "/voice", color: "bg-energy/10 border-energy/20 text-energy" },
  ];

  const recommendations = [
    { title: "Box Breathing", desc: "5-min nervous system reset. Inhale 4s, hold 4s, exhale 4s, hold 4s.", icon: Wind, duration: "5 min", action: "Start Breathe", color: "bg-calm/10 border-calm/20 text-primary" },
    { title: "Vagus Nerve Reset", desc: "Gentle physical posture resets to calm your autonomic nervous system.", icon: BatteryCharging, duration: "8 min", action: "View Posture", color: "bg-focus/10 border-focus/20 text-focus" },
    { title: "Nature Walk Recalibration", desc: "Outdoor step reset to ground your attention and reduce cortisol.", icon: Compass, duration: "15 min", action: "Log Walk", color: "bg-energy/10 border-energy/20 text-energy" },
    { title: "Wind Down Digital Sabbath", desc: "Dim blue sources to prepare your circadian rhythm for rest.", icon: Moon, duration: "30 min", action: "Set Silent", color: "bg-warmth/10 border-warmth/20 text-warmth" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
        <h1 className="font-heading font-semibold text-2xl md:text-3xl tracking-tight">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {name}.
        </h1>
        <p className="text-sm text-muted-foreground">
          {journalCount === 0 ? "Start your first journal entry to unlock wellness insights." : "Here's your wellness overview for today."}
        </p>
      </motion.div>

      {/* Wellness Score + Daily Insight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {loading ? (
            <div className="h-56 rounded-3xl bg-card border border-border animate-pulse flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Loading wellness data...</span>
            </div>
          ) : (
            <WellnessScoreRing score={overallScore} insight={insight} />
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <DailyInsight insight={insight} stressScore={stressScore} />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="font-heading font-semibold text-base mb-3 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link href={action.href} key={action.title} className={`group flex flex-col items-center gap-2 p-4 rounded-2xl border ${action.color} transition-all hover:shadow-md hover:scale-[1.02]`}>
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <h3 className="text-xs font-semibold">{action.title}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-base tracking-tight">AI Recommendations</h2>
          <Link href="/predictions" className="text-xs text-primary hover:underline flex items-center gap-1">
            View Predictions <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec) => (
            <div key={rec.title} className={`flex items-start gap-3 p-4 rounded-2xl border ${rec.color} transition-all hover:shadow-sm`}>
              <div className="mt-0.5">
                <rec.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold">{rec.title}</h3>
                  <span className="text-[10px] text-muted-foreground font-mono">{rec.duration}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{rec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
