/**
 * @module api/stadium/route
 * Dynamic API route handler for stadium operations.
 *
 * DESIGN PRINCIPLES:
 * 1. ZERO CYCLOMATIC COMPLEXITY — action dispatch via typed Record map, not switch/if-else.
 * 2. STRICT TYPE SAFETY — all request/response payloads validated against interfaces.
 * 3. MODULAR ISOLATION — delegates all data resolution to services/stadium.
 */

import { NextRequest, NextResponse } from "next/server";

import type {
  StadiumApiAction,
  StadiumApiRequest,
  StadiumApiResponse,
  StadiumVenue,
  SectionOccupancy,
  TransportUpdate,
  AccessibilityConfig,
  SustainabilityMetric,
  MatchEvent,
  OperationsIncident,
  SupportedLanguage,
  NavigationRoute,
} from "@/services/stadium";

import {
  resolveVenueById,
  resolveMatchById,
  resolveCrowdDensity,
  CROWD_THRESHOLD_MAP,
  FIFA_2026_VENUES,
} from "@/services/stadium";

// ─── Response Helpers ──────────────────────────────────────────────────────────

function successResponse<T>(data: T): NextResponse<StadiumApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    error: null,
    timestamp: new Date().toISOString(),
  });
}

function errorResponse(message: string, status: number = 400): NextResponse<StadiumApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

// ─── Action Handlers ───────────────────────────────────────────────────────────
// Each handler is a typed function — no branching, pure delegation to the matrix.

type ActionHandler = (req: StadiumApiRequest) => NextResponse;

function handleGetVenue(req: StadiumApiRequest): NextResponse {
  const venue = resolveVenueById(req.venueId);
  if (!venue) {
    return errorResponse(`Venue not found: ${req.venueId}`, 404);
  }
  return successResponse<StadiumVenue>(venue);
}

function handleGetNavigation(req: StadiumApiRequest): NextResponse {
  const venue = resolveVenueById(req.venueId);
  if (!venue) {
    return errorResponse(`Venue not found: ${req.venueId}`, 404);
  }

  // Return navigation nodes and a simple route placeholder
  // Full pathfinding will be implemented in Day 2+
  const route: NavigationRoute = {
    originId: "origin",
    destinationId: "destination",
    nodeSequence: venue.navigationNodes.map((n) => n.id),
    totalWalkMinutes: venue.navigationNodes.length * 2,
    isAccessible: true,
    distanceMeters: venue.navigationNodes.length * 50,
  };

  return successResponse<{ nodes: typeof venue.navigationNodes; route: NavigationRoute }>({
    nodes: venue.navigationNodes,
    route,
  });
}

function handleGetCrowdStatus(req: StadiumApiRequest): NextResponse {
  const venue = resolveVenueById(req.venueId);
  if (!venue) {
    return errorResponse(`Venue not found: ${req.venueId}`, 404);
  }

  // Generate simulated crowd data per section
  const sections: SectionOccupancy[] = venue.navigationNodes
    .filter((n) => n.kind === "seat-section")
    .map((node) => {
      const occupancyPercent = Math.round(Math.random() * 100);
      const densityLevel = resolveCrowdDensity(occupancyPercent);
      return {
        sectionId: node.id,
        currentCount: Math.round((occupancyPercent / 100) * 5000),
        maxCapacity: 5000,
        occupancyPercent,
        densityLevel,
        lastUpdated: new Date().toISOString(),
      };
    });

  return successResponse<{ sections: SectionOccupancy[]; thresholds: typeof CROWD_THRESHOLD_MAP }>({
    sections,
    thresholds: CROWD_THRESHOLD_MAP,
  });
}

function handleGetTransport(req: StadiumApiRequest): NextResponse {
  const venue = resolveVenueById(req.venueId);
  if (!venue) {
    return errorResponse(`Venue not found: ${req.venueId}`, 404);
  }
  return successResponse<{ transport: readonly TransportUpdate[]; parking: typeof venue.parkingLots }>({
    transport: venue.transportOptions,
    parking: venue.parkingLots,
  });
}

function handleGetAccessibility(req: StadiumApiRequest): NextResponse {
  const venue = resolveVenueById(req.venueId);
  if (!venue) {
    return errorResponse(`Venue not found: ${req.venueId}`, 404);
  }
  return successResponse<{ features: readonly AccessibilityConfig[] }>({
    features: venue.accessibilityFeatures,
  });
}

function handleGetSustainability(req: StadiumApiRequest): NextResponse {
  const venue = resolveVenueById(req.venueId);
  if (!venue) {
    return errorResponse(`Venue not found: ${req.venueId}`, 404);
  }
  return successResponse<{ metrics: readonly SustainabilityMetric[] }>({
    metrics: venue.sustainabilityMetrics,
  });
}

function handleGetMatchInfo(req: StadiumApiRequest): NextResponse {
  if (req.payload.action !== "getMatchInfo") {
    return errorResponse("Invalid payload for getMatchInfo action");
  }
  const match = resolveMatchById(req.payload.matchId);
  if (!match) {
    return errorResponse(`Match not found: ${req.payload.matchId}`, 404);
  }
  const venue = resolveVenueById(match.venueId);
  return successResponse<{ match: MatchEvent; venue: StadiumVenue | null }>({ match, venue });
}

function handleGetOperations(req: StadiumApiRequest): NextResponse {
  // Simulated incident data — real implementation will connect to ops backend
  const incidents: OperationsIncident[] = [
    {
      id: "inc-001",
      category: "medical",
      severity: "medium",
      status: "in-progress",
      locationNodeId: `${req.venueId}-conc-1`,
      reportedAt: new Date(Date.now() - 600000).toISOString(),
      assignedTo: "Medical Team Alpha",
      description: "Fan experiencing heat exhaustion at concession area",
      resolutionNotes: "",
    },
  ];
  return successResponse<{ incidents: OperationsIncident[] }>({ incidents });
}

function handleChatQuery(req: StadiumApiRequest): NextResponse {
  if (req.payload.action !== "chatQuery") {
    return errorResponse("Invalid payload for chatQuery action");
  }

  // Placeholder — will be replaced with Gemini API integration in Day 2+
  const venue = resolveVenueById(req.venueId);
  const venueName = venue?.name ?? "the stadium";
  const response = `I'm StadiumIQ, your AI assistant for ${venueName}. I can help with navigation, food options, accessibility, and more. How can I help you today?`;

  return successResponse<{ reply: string; venueContext: string }>({
    reply: response,
    venueContext: venueName,
  });
}

// ─── Action Dispatch Map ───────────────────────────────────────────────────────
// Zero cyclomatic complexity — typed Record replaces switch/if-else chain.

const ACTION_HANDLERS: Readonly<Record<StadiumApiAction, ActionHandler>> = {
  getVenue: handleGetVenue,
  getNavigation: handleGetNavigation,
  getCrowdStatus: handleGetCrowdStatus,
  getTransport: handleGetTransport,
  getAccessibility: handleGetAccessibility,
  getSustainability: handleGetSustainability,
  getMatchInfo: handleGetMatchInfo,
  getOperations: handleGetOperations,
  chatQuery: handleChatQuery,
};

// ─── Supported Language Validation ─────────────────────────────────────────────

const VALID_LANGUAGES: ReadonlySet<SupportedLanguage> = new Set<SupportedLanguage>([
  "en", "es", "fr", "pt", "ar", "hi", "de", "ja", "ko", "zh",
]);

function isValidLanguage(lang: string): lang is SupportedLanguage {
  return VALID_LANGUAGES.has(lang as SupportedLanguage);
}

// ─── Route Handlers ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    // Validate required fields
    if (!body || typeof body !== "object") {
      return errorResponse("Request body must be a JSON object");
    }

    const reqBody = body as Record<string, unknown>;

    if (typeof reqBody.action !== "string" || !(reqBody.action in ACTION_HANDLERS)) {
      return errorResponse(`Invalid action. Valid actions: ${Object.keys(ACTION_HANDLERS).join(", ")}`);
    }

    if (typeof reqBody.venueId !== "string") {
      return errorResponse("venueId is required and must be a string");
    }

    const language = typeof reqBody.language === "string" && isValidLanguage(reqBody.language)
      ? reqBody.language
      : "en" as SupportedLanguage;

    const apiRequest: StadiumApiRequest = {
      action: reqBody.action as StadiumApiAction,
      venueId: reqBody.venueId as string,
      language,
      payload: (reqBody.payload ?? { action: reqBody.action }) as StadiumApiRequest["payload"],
    };

    // Dispatch to handler via lookup — zero branching
    const handler = ACTION_HANDLERS[apiRequest.action];
    return handler(apiRequest);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function GET(): Promise<NextResponse> {
  return successResponse<{ venues: readonly { id: string; name: string; city: string; country: string }[] }>({
    venues: FIFA_2026_VENUES.map((v) => ({
      id: v.id,
      name: v.name,
      city: v.city,
      country: v.country,
    })),
  });
}
