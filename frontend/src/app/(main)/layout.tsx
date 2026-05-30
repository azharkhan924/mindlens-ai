"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLocalProfile } from "@/lib/mockData";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { Heart } from "lucide-react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = getLocalProfile();
    if (!profile || !profile.isOnboarded) {
      router.push("/welcome");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
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
