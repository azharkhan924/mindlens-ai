"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLocalProfile } from "@/lib/mockData";
import { Heart } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if onboarded
    const profile = getLocalProfile();
    if (profile && profile.isOnboarded) {
      router.push("/home");
    } else {
      router.push("/welcome");
    }
  }, [router]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center gap-4 text-center animate-pulse">
        <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-calm to-focus flex items-center justify-center shadow-lg">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-2xl tracking-tight">MindLens AI</h2>
          <p className="text-sm text-muted-foreground mt-1">Calibrating wellness signals...</p>
        </div>
      </div>
    </main>
  );
}
