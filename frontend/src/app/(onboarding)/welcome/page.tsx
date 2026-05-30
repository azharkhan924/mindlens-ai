"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, ArrowRight, Sparkles, Check, ChevronRight, Mic, Bell, Mail, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function WelcomePage() {
  const router = useRouter();
  const { register, login, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [breathState, setBreathState] = useState("Inhale...");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  
  // Track permissions mock
  const [micStatus, setMicStatus] = useState<"idle" | "granted">("idle");
  const [bellStatus, setBellStatus] = useState<"idle" | "granted">("idle");

  const ageOptions = ["18-24", "25-34", "35-44", "45-54", "55+"];
  
  const goalOptions = [
    { id: "stress", label: "Reduce Daily Stress", desc: "Soothe anxiety triggers & slow racing thoughts." },
    { id: "sleep", label: "Better Rest & Sleep", desc: "Identify sleep patterns and mental wind-down gaps." },
    { id: "clarity", label: "Emotional Clarity", desc: "Observe underlying shifts without manual tracking." },
    { id: "focus", label: "Sharpen Attention", desc: "Build sustainable focus blocks and avoid burnout." },
    { id: "growth", label: "Self-Discovery", desc: "Track motivational spikes and long-term wellness habits." }
  ];

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  // Simple breathing timer trigger
  React.useEffect(() => {
    if (step !== 1) return;
    const interval = setInterval(() => {
      setBreathState((prev) => (prev === "Inhale..." ? "Exhale..." : "Inhale..."));
    }, 2500);
    return () => clearInterval(interval);
  }, [step]);

  const handleGoalToggle = (id: string) => {
    if (goals.includes(id)) {
      setGoals(goals.filter((g) => g !== id));
    } else {
      setGoals([...goals, id]);
    }
  };

  const handleNext = async () => {
    if (step === 2 && (!name.trim() || !email.trim() || !password.trim())) return;
    if (step === 3 && !ageRange) return;
    if (step === 4 && goals.length === 0) return;
    
    if (step < 6) {
      setStep(step + 1);
    } else {
      // Final step — register with backend
      setIsSubmitting(true);
      setError("");
      try {
        await register({
          email,
          password,
          name,
          ageRange,
          wellnessGoals: goals,
        });
        router.push("/home");
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Registration failed. Please try again.";
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      await login(email, password);
      router.push("/home");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Check your credentials.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 min-h-screen flex flex-col justify-between bg-gradient-to-tr from-background via-background to-calm/10 p-6 md:p-12 relative overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-calm/10 rounded-full filter blur-3xl opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-focus/5 rounded-full filter blur-3xl opacity-40"></div>

      {/* Top Bar info */}
      <div className="flex items-center justify-between z-10 w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-calm to-focus flex items-center justify-center shadow-md">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading font-semibold text-sm tracking-tight">MindLens AI</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Step {step} of 6
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center py-12 z-10 w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center text-center gap-8 w-full"
            >
              {/* Breath Ring Animation */}
              <div className="relative h-44 w-44 flex items-center justify-center">
                <div 
                  className={`absolute inset-0 rounded-full bg-gradient-to-tr from-calm/20 to-focus/15 transition-all duration-[2500ms] ease-in-out border border-calm/30 ${
                    breathState === "Inhale..." ? "scale-105 opacity-80" : "scale-90 opacity-40"
                  }`}
                />
                <div 
                  className={`absolute h-32 w-32 rounded-full bg-gradient-to-tr from-calm/35 to-focus/30 transition-all duration-[2500ms] ease-in-out shadow-inner ${
                    breathState === "Inhale..." ? "scale-110" : "scale-95"
                  }`}
                />
                <span className="z-10 font-heading font-medium text-primary text-lg animate-pulse-glow">
                  {breathState}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="font-heading font-semibold text-3xl tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Meet Lens, your AI wellness companion.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed px-4">
                  Most wellness tools ask you to select simple emotion tags. Lens automatically senses deep stress, motivation, and clarity dynamics from your journals, conversational tone, and voice energy.
                </p>
              </div>

              <button
                onClick={handleNext}
                className="group flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-md hover:bg-primary/95 hover:shadow-lg transition-all"
                id="onboarding-welcome-btn"
              >
                Let&apos;s begin
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-5 w-full text-left"
            >
              <div className="flex flex-col gap-2">
                <div className="h-10 w-10 rounded-2xl bg-calm/10 flex items-center justify-center text-primary mb-2 shadow-sm border border-calm/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-semibold text-2xl tracking-tight">
                  {authMode === "register" ? "Create your companion space" : "Welcome back"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {authMode === "register" 
                    ? "Set up your profile to personalize your wellness journey."
                    : "Sign in to continue your wellness journey."}
                </p>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                {authMode === "register" && (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your preferred name..."
                    className="w-full px-5 py-3.5 rounded-2xl bg-card border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all shadow-sm font-medium"
                    autoFocus
                    id="onboarding-name-input"
                  />
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address..."
                    className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-card border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all shadow-sm font-medium"
                    id="onboarding-email-input"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min. 6 characters)..."
                    className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-card border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all shadow-sm font-medium"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (authMode === "login") handleLogin();
                        else if (name.trim() && email.trim() && password.trim()) handleNext();
                      }
                    }}
                    id="onboarding-password-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => {
                    setAuthMode(authMode === "register" ? "login" : "register");
                    setError("");
                  }}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {authMode === "register" ? "Already have an account? Sign in" : "Need an account? Register"}
                </button>

                <button
                  onClick={authMode === "login" ? handleLogin : handleNext}
                  disabled={isSubmitting || !email.trim() || !password.trim() || (authMode === "register" && !name.trim())}
                  className="group flex items-center gap-1.5 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-md hover:bg-primary/95 disabled:opacity-50 disabled:pointer-events-none transition-all"
                  id="onboarding-name-next"
                >
                  {isSubmitting ? "Loading..." : authMode === "login" ? "Sign In" : "Continue"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6 w-full text-left"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-heading font-semibold text-2xl tracking-tight">
                  Select your age group, {name}.
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cognitive and stress recovery cycles fluctuate naturally depending on life stage templates.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {ageOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAgeRange(opt)}
                    className={`px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all text-center shadow-sm ${
                      ageRange === opt
                        ? "bg-primary/10 border-primary text-primary ring-2 ring-primary/10"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    id={`onboarding-age-${opt}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={!ageRange}
                className="self-end group flex items-center gap-1.5 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-md hover:bg-primary/95 disabled:opacity-50 disabled:pointer-events-none transition-all mt-4"
                id="onboarding-age-next"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-5 w-full text-left"
            >
              <div className="flex flex-col gap-1">
                <h3 className="font-heading font-semibold text-2xl tracking-tight">
                  What are your wellness goals?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select all targets that align with your current mindset path.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {goalOptions.map((goal) => {
                  const isSelected = goals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => handleGoalToggle(goal.id)}
                      className={`flex items-start gap-3.5 p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "bg-primary/5 border-primary shadow-sm"
                          : "bg-card border-border hover:bg-muted"
                      }`}
                      id={`onboarding-goal-${goal.id}`}
                    >
                      <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center border text-[10px] ${
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                      }`}>
                        {isSelected && <Check className="h-3 w-3 stroke-[3px]" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-foreground leading-tight">
                          {goal.label}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                          {goal.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNext}
                disabled={goals.length === 0}
                className="self-end group flex items-center gap-1.5 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-md hover:bg-primary/95 disabled:opacity-50 disabled:pointer-events-none transition-all mt-3"
                id="onboarding-goals-next"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6 w-full text-left"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-heading font-semibold text-2xl tracking-tight">
                  Seamless companion signals.
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  MindLens delivers optimal guidance when integrated with microphone voice captures and proactive notifications.
                </p>
              </div>

              <div className="flex flex-col gap-3.5 mt-2">
                {/* Micro permissions */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-calm/10 flex items-center justify-center text-primary border border-calm/20">
                      <Mic className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold">Microphone Signal</h4>
                      <p className="text-[9px] text-muted-foreground leading-normal mt-0.5">Required for speech analysis & energy scan.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMicStatus("granted")}
                    disabled={micStatus === "granted"}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      micStatus === "granted"
                        ? "bg-energy/10 text-energy border-energy/20"
                        : "bg-muted text-foreground border-border hover:bg-accent"
                    }`}
                    id="onboarding-mic-btn"
                  >
                    {micStatus === "granted" ? "Allowed" : "Allow"}
                  </button>
                </div>

                {/* Notifications permissions */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-warmth/10 flex items-center justify-center text-warmth border border-warmth/20">
                      <Bell className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold">Proactive Insights</h4>
                      <p className="text-[9px] text-muted-foreground leading-normal mt-0.5">Receive stress escalation warnings early.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBellStatus("granted")}
                    disabled={bellStatus === "granted"}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      bellStatus === "granted"
                        ? "bg-energy/10 text-energy border-energy/20"
                        : "bg-muted text-foreground border-border hover:bg-accent"
                    }`}
                    id="onboarding-bell-btn"
                  >
                    {bellStatus === "granted" ? "Allowed" : "Allow"}
                  </button>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="self-end group flex items-center gap-1.5 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-md hover:bg-primary/95 transition-all mt-4"
                id="onboarding-signals-next"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center text-center gap-6 w-full"
            >
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-energy to-calm flex items-center justify-center text-white shadow-md animate-bounce">
                <Check className="h-7 w-7 stroke-[3px]" />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium w-full">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <h3 className="font-heading font-semibold text-2xl tracking-tight">
                  Your companion space is ready.
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed px-2">
                  Welcome to MindLens AI, {name}. Your timeline is primed. Let&apos;s open your dashboard and begin checking in with your companion.
                </p>
              </div>

              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-md hover:bg-primary/95 hover:shadow-lg transition-all mt-4 disabled:opacity-50"
                id="onboarding-finish-btn"
              >
                {isSubmitting ? "Creating your space..." : "Enter Companion Dashboard"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center z-10 max-w-lg mx-auto">
        <p className="text-[9px] text-muted-foreground leading-normal font-light">
          Disclaimer: MindLens AI provides wellness insights, trend tracking, and stress metrics. It does NOT diagnose clinical mental health disorders or provide medical diagnosis. Please refer to support lists under settings in emergency conditions.
        </p>
      </div>
    </main>
  );
}
