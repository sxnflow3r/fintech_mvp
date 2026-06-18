"use client";
import { useState } from "react";
import ConnectScreen from "@/components/ConnectScreen";
import DashboardScreen from "@/components/DashboardScreen";
import MarketplaceScreen from "@/components/MarketplaceScreen";

type Screen = "connect" | "dashboard" | "marketplace";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("connect");

  return (
    <main>
      {screen === "connect" && (
        <ConnectScreen onComplete={() => setScreen("dashboard")} />
      )}
      {screen === "dashboard" && (
        <DashboardScreen onGapDetected={() => setScreen("marketplace")} />
      )}
      {screen === "marketplace" && (
        <MarketplaceScreen onBack={() => setScreen("dashboard")} />
      )}
    </main>
  );
}
