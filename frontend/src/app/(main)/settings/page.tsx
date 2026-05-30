"use client";

import React, { useState, useEffect } from "react";
import { getLocalProfile, saveLocalProfile, UserProfile } from "@/lib/mockData";
import { motion } from "motion/react";
import {
  User,
  Sliders,
  Database,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const ageOptions = ["18-24", "25-34", "35-44", "45-54", "55+"];
  
  const goalOptions = [
    { id: "stress", label: "Reduce Daily Stress" },
    { id: "sleep", label: "Better Rest & Sleep" },
    { id: "clarity", label: "Emotional Clarity" },
    { id: "focus", label: "Sharpen Attention" },
    { id: "growth", label: "Self-Discovery" }
  ];

  useEffect(() => {
    const profile = getLocalProfile();
    if (profile) {
      setName(profile.name || "");
      setAgeRange(profile.ageRange || "");
      setGoals(profile.goals || []);
    }
  }, []);

  const handleGoalToggle = (id: string) => {
    if (goals.includes(id)) {
      setGoals(goals.filter((g) => g !== id));
    } else {
      setGoals([...goals, id]);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const profile: UserProfile = {
      name,
      ageRange,
      goals,
      isOnboarded: true,
    };

    saveLocalProfile(profile);
    setAlertMsg("Profile configuration changes saved successfully.");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  const handleClearAllData = () => {
    if (
      confirm(
        "Are you absolutely sure you want to delete all MindLens AI wellness logs, voice transcripts, and profiles? This action is local and permanent."
      )
    ) {
      localStorage.clear();
      setAlertMsg("All device logs have been deleted successfully. Redirecting you to onboarding...");
      setShowAlert(true);
      setTimeout(() => {
        window.location.href = "/welcome";
      }, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 w-full text-left"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-heading font-semibold text-3xl tracking-tight text-foreground">
          Companion Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Customize your semantic profile goals and manage privacy keys.
        </p>
      </div>

      {showAlert && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-energy/10 text-energy border border-energy/20 text-xs font-semibold shadow-sm">
          <CheckCircle className="h-4.5 w-4.5" />
          {alertMsg}
        </div>
      )}

      {/* Settings core layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* Left Column: Manage Profile Details (Span 7) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl glass-card border border-border shadow-sm flex flex-col gap-5">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" />
              Manage Wellness Profile
            </span>

            <div className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/80">Companion Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card border border-border text-xs outline-none focus:border-primary/50"
                  required
                  id="settings-name-input"
                />
              </div>

              {/* Age */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-foreground/80">Life Stage Template</label>
                <div className="flex flex-wrap gap-2">
                  {ageOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAgeRange(opt)}
                      className={`px-3 py-1.5 rounded-full border text-[10px] font-semibold transition-all ${
                        ageRange === opt
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-card border-border text-muted-foreground hover:bg-muted"
                      }`}
                      id={`settings-age-${opt}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-foreground/80 font-heading">Focused Targets</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {goalOptions.map((goal) => {
                    const isSelected = goals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => handleGoalToggle(goal.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-left text-[11px] font-semibold transition-all ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-inner"
                            : "bg-card border-border hover:bg-muted"
                        }`}
                        id={`settings-goal-${goal.id}`}
                      >
                        <span className={`h-3 w-3 rounded-full flex items-center justify-center border text-[8px] ${
                          isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                        }`} />
                        {goal.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:bg-primary/95 transition-all self-end mt-2"
              id="settings-save-btn"
            >
              Save Configuration
            </button>
          </form>
        </div>

        {/* Right Column: Manage Privacy & Wipe tools (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Privacy info panel */}
          <div className="p-6 rounded-3xl glass-card border border-border shadow-sm flex flex-col gap-4">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-energy" />
              Privacy Assurance
            </span>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-light">
              Your safety is paramount. All speech transcriptions, pause indicators, and written diaries remain local on this device. We do not engage with external semantic libraries or trackers for analytics.
            </p>
          </div>

          {/* Database management */}
          <div className="p-6 rounded-3xl glass-card border border-border shadow-sm flex flex-col gap-4">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
              <Database className="h-4 w-4 text-focus" />
              Companion Storage
            </span>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-light">
              Clear device storage tags to permanently remove all chat metrics, journal analysis logs, and local custom parameters.
            </p>
            <button
              onClick={handleClearAllData}
              className="px-5 py-2.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all font-semibold text-xs shadow-sm self-start mt-2"
              id="settings-wipe-btn"
            >
              Wipe Companion Data
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
