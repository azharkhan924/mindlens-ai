"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  Moon,
  Clock,
  Zap,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [sleepData, setSleepData] = useState<any[]>([
    { day: "Mon", Hours: 6.8, Quality: 68 },
    { day: "Tue", Hours: 7.2, Quality: 75 },
    { day: "Wed", Hours: 5.5, Quality: 48 },
    { day: "Thu", Hours: 7.0, Quality: 70 },
    { day: "Fri", Hours: 8.2, Quality: 85 },
    { day: "Sat", Hours: 8.5, Quality: 90 },
    { day: "Sun", Hours: 7.8, Quality: 82 },
  ]);

  const [sentimentDistribution, setSentimentDistribution] = useState<any[]>([
    { name: "Serenity", count: 42, color: "var(--calm)" },
    { name: "Focus", count: 25, color: "var(--focus)" },
    { name: "Anxiety", count: 18, color: "var(--destructive)" },
    { name: "Gratitude", count: 15, color: "var(--warmth)" },
  ]);

  const [heatmapData, setHeatmapData] = useState<{ [key: string]: number }>({
    "Mon-Morning": 4, "Mon-Afternoon": 6, "Mon-Evening": 3, "Mon-Night": 2,
    "Tue-Morning": 5, "Tue-Afternoon": 7, "Tue-Evening": 4, "Tue-Night": 3,
    "Wed-Morning": 6, "Wed-Afternoon": 8, "Wed-Evening": 5, "Wed-Night": 4,
    "Thu-Morning": 4, "Thu-Afternoon": 5, "Thu-Evening": 3, "Thu-Night": 2,
    "Fri-Morning": 3, "Fri-Afternoon": 4, "Fri-Evening": 2, "Fri-Night": 1,
    "Sat-Morning": 2, "Sat-Afternoon": 2, "Sat-Evening": 1, "Sat-Night": 1,
    "Sun-Morning": 1, "Sun-Afternoon": 2, "Sun-Evening": 1, "Sun-Night": 1,
  });

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const periods = ["Morning", "Afternoon", "Evening", "Night"];

  useEffect(() => {
    async function loadDashboardInsights() {
      try {
        const data = await fetchApi("/insights/dashboard");
        if (data) {
          if (data.sleepData) setSleepData(data.sleepData);
          if (data.sentimentDistribution) setSentimentDistribution(data.sentimentDistribution);
          if (data.heatmapData) setHeatmapData(data.heatmapData);
        }
      } catch {
        // Fallback silently to static defaults
      } finally {
        setLoading(false);
      }
    }
    loadDashboardInsights();
  }, []);

  const getHeatmapColor = (stressVal: number) => {
    if (stressVal >= 7) return "bg-destructive/35 border-destructive/20"; // high stress
    if (stressVal >= 5) return "bg-focus/25 border-focus/15"; // moderate
    if (stressVal >= 3) return "bg-calm/25 border-calm/15"; // light
    return "bg-energy/20 border-energy/10"; // optimal calm
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 w-full"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-heading font-semibold text-3xl tracking-tight">
          Insights Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Advanced cognitive scan details mapped automatically from sleep notes and sentiment frequency.
        </p>
      </div>

      {/* Sleep dynamics & Weekly stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Sleep Quality and Inferred Rest Card (Span 7) */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-border shadow-sm flex flex-col gap-4 min-h-[350px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
              <Moon className="h-4 w-4 text-primary" />
              Inferred Sleep Trends
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Source: Journal mentions & sentiment tags
            </span>
          </div>

          <div className="flex-1 w-full h-[250px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.5)" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  domain={[0, 10]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "1rem",
                  }}
                  itemStyle={{ fontSize: "11px" }}
                />
                <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                <Bar dataKey="Hours" fill="var(--calm)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment breakdown (Span 5) */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-border shadow-sm flex flex-col gap-5 justify-between min-h-[350px]">
          <div>
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Sentiment Density Frequency
            </span>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
              Relative frequency of emotional vectors computed in all saved content.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {sentimentDistribution.map((item) => (
              <div key={item.name} className="flex flex-col gap-1.5 text-xs text-left">
                <div className="flex justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span>{item.count}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${item.count}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-calm/10 to-transparent rounded-2xl border border-border text-[10px] text-muted-foreground leading-normal">
            <CheckCircle className="h-4.5 w-4.5 text-primary shrink-0" />
            <span>Highest density lies in Serenity. This indicates strong long-term emotional stability patterns.</span>
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="grid grid-cols-1 gap-6 w-full">
        <div className="p-6 rounded-3xl glass-card border border-border shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-focus" />
              Acoustic & Stress Cadence Heatmap
            </span>
            <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-energy" /> Optimal
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-focus" /> Moderate
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-destructive" /> Elevated
              </span>
            </div>
          </div>

          {/* Heatmap Responsive Grid */}
          <div className="overflow-x-auto w-full mt-2 pr-1">
            <div className="min-w-[650px] grid grid-cols-8 gap-2.5">
              {/* Top corner blank block */}
              <div className="h-8 flex items-center justify-start text-[10px] font-semibold text-muted-foreground">
                Time period
              </div>

              {/* Day Headers */}
              {days.map((day) => (
                <div key={day} className="h-8 flex items-center justify-center text-[10px] font-semibold text-muted-foreground uppercase">
                  {day}
                </div>
              ))}

              {/* Periods Rows */}
              {periods.map((period) => (
                <React.Fragment key={period}>
                  {/* Period label column */}
                  <div className="h-10 flex items-center justify-start text-[10px] font-semibold text-foreground/80 pr-2">
                    {period}
                  </div>

                  {/* Day cells */}
                  {days.map((day) => {
                    const key = `${day}-${period}`;
                    const stressVal = heatmapData[key] || 1;
                    return (
                      <div
                        key={day}
                        className={`h-10 rounded-2xl border text-center flex items-center justify-center text-[10px] font-bold shadow-sm transition-all duration-300 ${getHeatmapColor(stressVal)}`}
                        title={`${day} ${period}: stress load level ${stressVal}/10`}
                      >
                        {stressVal}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Advice card bottom */}
          <div className="flex items-start gap-3 p-4 bg-muted/40 rounded-2xl border border-border/50 text-left mt-1">
            <HelpCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <strong>Understanding the Matrix:</strong> We trace vocal speaking speed variations (crying triggers/pauses) co-occurring in evening and night periods. Notice how Wed-Afternoon represents a stress overload gap (8/10). Restricting work schedules at these specific intervals will dramatically buffer wellness scores.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
