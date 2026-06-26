"use client";
// Top level page. Keeps track of which of the three screens is showing and which
// offer the owner accepted, and swaps between the screens.
import { useState } from "react";
import ConnectScreen from "@/components/ConnectScreen";
import DashboardScreen from "@/components/DashboardScreen";
import MarketplaceScreen from "@/components/MarketplaceScreen";
import type { LenderOffer } from "@/lib/mockData";

type Screen = "connect" | "dashboard" | "marketplace";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("connect");
  // The offer the SME accepted in the marketplace; once set, the dashboard shows
  // the financed trajectory and a "financing active" state.
  const [financedOffer, setFinancedOffer] = useState<LenderOffer | null>(null);

  return (
    <main>
      {screen === "connect" && (
        <ConnectScreen onComplete={() => setScreen("dashboard")} />
      )}
      {screen === "dashboard" && (
        <DashboardScreen onGapDetected={() => setScreen("marketplace")} financedOffer={financedOffer} />
      )}
      {screen === "marketplace" && (
        <MarketplaceScreen
          onBack={() => setScreen("dashboard")}
          onAccept={(offer) => setFinancedOffer(offer)}
        />
      )}
    </main>
  );
}
