/**
 * @module components/StadiumDashboard
 * Client-side stadium dashboard component.
 * Renders venue selector and module navigation.
 * MODULAR ISOLATION: Pure UI — all data sourced via API or passed as props.
 */

"use client";

import { useState, useEffect } from "react";
import type { StadiumVenue, StadiumApiResponse } from "@/services/stadium";

interface VenueSummary {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly country: string;
}

async function fetchVenueDetailById(venueId: string): Promise<StadiumVenue | null> {
  try {
    const res = await fetch("/api/stadium", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getVenue",
        venueId,
        language: "en",
        payload: { action: "getVenue" },
      }),
    });
    const data: StadiumApiResponse<StadiumVenue> = await res.json();
    return data.success && data.data ? data.data : null;
  } catch {
    return null;
  }
}

export default function StadiumDashboard() {
  const [venues, setVenues] = useState<readonly VenueSummary[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [venueDetail, setVenueDetail] = useState<StadiumVenue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch venue list on mount, then auto-select + fetch detail for the first venue
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const res = await fetch("/api/stadium");
        const data: StadiumApiResponse<{ venues: VenueSummary[] }> = await res.json();
        if (cancelled) return;
        if (data.success && data.data) {
          setVenues(data.data.venues);
          const firstId = data.data.venues[0]?.id ?? "";
          setSelectedVenueId(firstId);
          if (firstId) {
            const detail = await fetchVenueDetailById(firstId);
            if (!cancelled) setVenueDetail(detail);
          }
        }
      } catch {
        // Silently handle — loading state will still clear
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  // Handle venue selection change via event handler — no effect needed
  async function handleVenueChange(venueId: string) {
    setSelectedVenueId(venueId);
    const detail = await fetchVenueDetailById(venueId);
    setVenueDetail(detail);
  }

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading StadiumIQ...</p>
      </div>
    );
  }

  return (
    <main className="stadium-dashboard">
      <header className="dashboard-header">
        <h1>🏟️ StadiumIQ</h1>
        <p className="dashboard-subtitle">
          AI-Powered Smart Stadium Companion — FIFA World Cup 2026
        </p>
      </header>

      <section className="venue-selector" aria-label="Select a venue">
        <label htmlFor="venue-select" className="venue-label">
          Select Venue
        </label>
        <select
          id="venue-select"
          className="venue-dropdown"
          value={selectedVenueId}
          onChange={(e) => handleVenueChange(e.target.value)}
        >
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} — {v.city}
            </option>
          ))}
        </select>
      </section>

      {venueDetail && (
        <section className="venue-overview" aria-label="Venue overview">
          <div className="venue-card glass-card">
            <h2>{venueDetail.name}</h2>
            <div className="venue-meta">
              <span className="meta-chip">📍 {venueDetail.city}</span>
              <span className="meta-chip">🏟️ Capacity: {venueDetail.capacity.toLocaleString()}</span>
              <span className="meta-chip">🕐 {venueDetail.timeZone}</span>
            </div>
          </div>

          <div className="module-grid">
            {MODULE_CARDS.map((mod) => (
              <div key={mod.id} className="module-card glass-card" id={`module-${mod.id}`}>
                <span className="module-icon">{mod.icon}</span>
                <h3>{mod.title}</h3>
                <p>{mod.description}</p>
                <span className="module-status">{mod.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

// ─── Module Card Data (Static Lookup) ──────────────────────────────────────────

interface ModuleCard {
  readonly id: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly status: string;
}

const MODULE_CARDS: readonly ModuleCard[] = [
  { id: "crowd", icon: "👥", title: "Crowd Intelligence", description: "Live density heatmaps, queue predictions, and flow analytics.", status: "🟢 Live" },
  { id: "navigation", icon: "🧭", title: "Smart Navigation", description: "Interactive wayfinding with accessible routes.", status: "🟢 Live" },
  { id: "ai-concierge", icon: "🤖", title: "AI Concierge", description: "Multilingual AI assistant powered by Gemini.", status: "🟡 Day 2" },
  { id: "accessibility", icon: "♿", title: "Accessibility Hub", description: "Wheelchair routes, sensory rooms, and assistive features.", status: "🟢 Live" },
  { id: "transport", icon: "🚇", title: "Transportation", description: "Parking, transit, and rideshare coordination.", status: "🟢 Live" },
  { id: "sustainability", icon: "🌍", title: "Sustainability", description: "Carbon footprint, waste metrics, and green initiatives.", status: "🟢 Live" },
  { id: "operations", icon: "🛡️", title: "Operations Center", description: "Incident management, staffing, and alerts.", status: "🟡 Day 2" },
] as const;
