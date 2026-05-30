"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { Heart } from "lucide-react";
import { useEffect } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/welcome");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background min-h-screen">
        <div className="flex flex-col items-center gap-3 text-center animate-pulse">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-calm to-focus flex items-center justify-center shadow-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs text-muted-foreground">Authenticating companion space...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex relative">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
