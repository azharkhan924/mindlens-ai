"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, ShieldAlert, Sparkles, Zap, Battery, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartDataPoint {
  dateLabel: string;
  Stress: number;
  Energy: number;
  Confidence: number;
  Focus: number;
  Motivation: number;
}

export default function TimelinePage() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");
  const [activeMetric, setActiveMetric] = useState<keyof Omit<ChartDataPoint, "dateLabel">>("Stress");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimeline() {
      try {
        const data = await fetchApi("/wellness/timeline");
        if (data && data.length > 0) {
          // Sort chronologically ascending
          const sorted = [...data].sort((a, b) => new Date(a.scoredAt).getTime() - new Date(b.scoredAt).getTime());
          const mapped: ChartDataPoint[] = sorted.map((p: any) => ({
            dateLabel: new Date(p.scoredAt).toLocaleDateString([], { month: "short", day: "numeric" }),
            Stress: p.stress,
            Energy: p.energy,
            Confidence: p.confidence,
            Focus: p.focus,
            Motivation: p.motivation,
          }));

          const limit = timeRange === "7d" ? 7 : 30;
          setChartData(mapped.slice(-limit));
        } else {
          // Fallback mock progression if empty
          generateMockProgression();
        }
      } catch {
        generateMockProgression();
      } finally {
        setLoading(false);
      }
    }

    function generateMockProgression() {
      const generated: ChartDataPoint[] = [];
      const now = Date.now();
      const limit = timeRange === "7d" ? 7 : 30;
      for (let i = limit - 1; i >= 0; i--) {
        const d = new Date(now - i * 24 * 3600 * 1000);
        generated.push({
          dateLabel: d.toLocaleDateString([], { month: "short", day: "numeric" }),
          Stress: Math.round(25 + Math.sin(i) * 12 + Math.random() * 5),
          Energy: Math.round(65 + Math.sin(i * 1.5) * 8 + Math.random() * 5),
          Confidence: Math.round(70 + Math.random() * 8),
          Focus: Math.round(65 + Math.random() * 10),
          Motivation: Math.round(60 + Math.random() * 12),
        });
      }
      setChartData(generated);
    }

    loadTimeline();
  }, [timeRange]);

  const metrics = [
    { label: "Stress", color: "var(--destructive)", icon: ShieldAlert },
    { label: "Energy", color: "var(--energy)", icon: Battery },
    { label: "Confidence", color: "var(--warmth)", icon: Sparkles },
    { label: "Focus", color: "var(--focus)", icon: Activity },
  ];

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case "Stress": return "#ef4444";
      case "Energy": return "#22c55e";
      case "Confidence": return "#f59e0b";
      case "Focus": return "#a855f7";
      default: return "#3b82f6";
    }
  };

  const currentStrokeColor = getMetricColor(activeMetric);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 w-full"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-semibold text-3xl tracking-tight">
            Emotional Timeline
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visualize your wellness vectors aggregated over days and weeks.
          </p>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-full self-start">
          <button
            onClick={() => setTimeRange("7d")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
              timeRange === "7d" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
            id="timeline-filter-7d"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
              timeRange === "30d" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
            id="timeline-filter-30d"
          >
            Last Month
          </button>
        </div>
      </div>

      {/* Main visualization grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Metric Selector triggers (Span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase px-2">
            Select Wellness Dimension
          </span>

          <div className="flex flex-col gap-2.5">
            {metrics.map((m) => {
              const Icon = m.icon;
              const isSelected = activeMetric === m.label;
              return (
                <button
                  key={m.label}
                  onClick={() => setActiveMetric(m.label as any)}
                  className={cn(
                    "p-4 rounded-3xl border text-left transition-all flex items-center justify-between gap-4 group",
                    isSelected
                      ? "bg-card border-primary shadow-sm ring-2 ring-primary/5"
                      : "bg-card border-border hover:bg-muted"
                  )}
                  id={`timeline-metric-btn-${m.label.toLowerCase()}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-2xl flex items-center justify-center border"
                      style={{
                        backgroundColor: isSelected ? `${m.color}15` : "rgba(var(--muted), 0.2)",
                        borderColor: isSelected ? `${m.color}35` : "var(--border)",
                        color: m.color
                      }}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground leading-tight">
                        {m.label} Trend
                      </h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        Dynamic weekly scan
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recharts Pane (Span 9) */}
        <div className="lg:col-span-9 p-6 rounded-3xl glass-card border border-border shadow-sm flex flex-col gap-4 min-h-[400px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Dynamic Area Chart Matrix
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Tracing Vector: <span className="font-bold text-primary">{activeMetric}</span>
            </span>
          </div>

          <div className="flex-1 w-full h-[320px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentStrokeColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={currentStrokeColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.5)" />
                <XAxis
                  dataKey="dateLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "1rem",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  }}
                  labelStyle={{ fontWeight: "bold", fontSize: "11px", color: "var(--foreground)" }}
                  itemStyle={{ fontSize: "11px" }}
                />
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke={currentStrokeColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
