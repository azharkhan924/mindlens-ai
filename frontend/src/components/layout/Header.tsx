"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, AlertTriangle, Bell, User, Heart } from "lucide-react";
import Link from "next/link";
import { getLocalProfile } from "@/lib/mockData";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [profileName, setProfileName] = useState("Companion");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const profile = getLocalProfile();
    if (profile && profile.name) {
      setProfileName(profile.name);
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-border py-4 px-6 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-calm to-focus flex items-center justify-center shadow-md animate-pulse-glow">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-semibold text-lg tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            MindLens AI
          </h1>
          <span className="hidden md:inline text-xs text-muted-foreground font-light">
            Empathetic Mental Wellness Companion
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Emergency quick button */}
        <Link
          href="/emergency"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all border border-destructive/20 shadow-sm"
          id="emergency-header-btn"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Crisis Support</span>
        </Link>

        {/* Notifications mock */}
        <button
          className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-all relative"
          aria-label="View notifications"
          id="notifications-btn"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-energy animate-ping"></span>
        </button>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-all"
            aria-label="Toggle theme"
            id="theme-toggle-btn"
          >
            {theme === "dark" ? (
              <Sun className="h-4.5 w-4.5 text-warmth" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-primary" />
            )}
          </button>
        )}

        {/* Profile indicator */}
        <Link
          href="/settings"
          className="flex items-center gap-2 p-1 md:py-1.5 md:px-3 rounded-full hover:bg-muted transition-all border border-transparent hover:border-border"
          id="profile-header-btn"
        >
          <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-semibold shadow-inner border border-border">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="hidden md:inline text-xs font-medium text-muted-foreground">
            {profileName}
          </span>
        </Link>
      </div>
    </header>
  );
}
