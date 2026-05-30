"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  MessageSquare,
  BookOpen,
  Mic,
  Activity,
  Sparkles,
  BarChart2,
  Settings,
  ShieldAlert,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/home", icon: Home },
    { label: "AI Companion Chat", href: "/chat", icon: MessageSquare },
    { label: "Journal Intel", href: "/journal", icon: BookOpen },
    { label: "Voice Analysis", href: "/voice", icon: Mic },
    { label: "Timeline", href: "/timeline", icon: Activity },
    { label: "Wellness Predictions", href: "/predictions", icon: Sparkles },
    { label: "Insights", href: "/insights", icon: BarChart2 },
    { label: "Emergency", href: "/emergency", icon: ShieldAlert },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-64 glass-panel border-r border-border min-h-[calc(100vh-73px)] p-6 gap-8",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase px-3">
          Wellness Core
        </span>
        <nav className="flex flex-col gap-1.5 mt-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group border border-transparent",
                  isActive
                    ? "bg-primary/10 text-primary border-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                id={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase px-3">
          AI & Analytics
        </span>
        <nav className="flex flex-col gap-1.5 mt-2">
          {navItems.slice(4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group border border-transparent",
                  isActive
                    ? "bg-primary/10 text-primary border-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                id={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-calm/10 to-focus/10 border border-border flex flex-col gap-2 relative overflow-hidden shadow-inner">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-warmth/20 to-transparent rounded-full filter blur-xl"></div>
        <h4 className="text-xs font-semibold tracking-tight">Need a breather?</h4>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          MindLens is fully privacy-secured. Your data remains strictly personal and secure.
        </p>
      </div>
    </aside>
  );
}
