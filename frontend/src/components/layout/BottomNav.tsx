"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, MessageSquare, BookOpen, Mic, BarChart2 } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/home", icon: Home },
    { label: "Chat", href: "/chat", icon: MessageSquare },
    { label: "Journal", href: "/journal", icon: BookOpen },
    { label: "Voice", href: "/voice", icon: Mic },
    { label: "Insights", href: "/insights", icon: BarChart2 },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-lg border-t border-border flex items-center justify-around py-3 px-4 pb-safe shadow-lg"
      aria-label="Mobile Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1.5 px-3 py-1 rounded-xl transition-all duration-200 group text-center relative",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            id={`mobile-nav-link-${item.label.toLowerCase()}`}
          >
            <Icon className={cn("h-5 w-5 transition-transform group-active:scale-95", isActive ? "stroke-[2.2px]" : "stroke-[1.8px]")} />
            <span className="text-[10px] font-medium tracking-tight">
              {item.label}
            </span>
            {isActive && (
              <span className="absolute -top-1.5 h-1 w-5 rounded-full bg-primary animate-fade-in"></span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
