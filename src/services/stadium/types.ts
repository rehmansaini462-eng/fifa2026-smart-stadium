/**
 * @module stadium/types
 * Strict type definitions for Smart Stadium operations.
 * ZERO implicit 'any' — every field is explicitly typed.
 * All dynamic parameters are mapped via discriminated unions or lookup interfaces.
 */

// ─── Coordinate & Spatial Types ────────────────────────────────────────────────

export interface GeoCoordinate {
  readonly latitude: number;
  readonly longitude: number;
}

export interface StadiumCoordinate {
  readonly x: number;
  readonly y: number;
  readonly level: StadiumLevel;
}

export type StadiumLevel =
  | "ground"
  | "lower-bowl"
  | "mid-tier"
  | "upper-deck"
  | "suite"
  | "rooftop"
  | "concourse-lower"
  | "concourse-upper";

// ─── Navigation Types ──────────────────────────────────────────────────────────

export type NavigationNodeKind =
  | "gate"
  | "seat-section"
  | "concession"
  | "restroom"
  | "medical"
  | "exit"
  | "elevator"
  | "escalator"
  | "stairs"
  | "merchandise"
  | "atm"
  | "information"
  | "accessible-entrance"
  | "family-zone"
  | "sensory-room"
  | "prayer-room"
  | "vip-lounge";

export interface NavigationNode {
  readonly id: string;
  readonly kind: NavigationNodeKind;
  readonly label: string;
  readonly localizedLabels: Readonly<Record<SupportedLanguage, string>>;
  readonly coordinate: StadiumCoordinate;
  readonly isAccessible: boolean;
  readonly connectedNodeIds: readonly string[];
  readonly estimatedWalkMinutes: Readonly<Record<string, number>>;
}

export interface NavigationRoute {
  readonly originId: string;
  readonly destinationId: string;
  readonly nodeSequence: readonly string[];
  readonly totalWalkMinutes: number;
  readonly isAccessible: boolean;
  readonly distanceMeters: number;
}

// ─── Multilingual Types ────────────────────────────────────────────────────────

export type SupportedLanguage =
  | "en"
  | "es"
  | "fr"
  | "pt"
  | "ar"
  | "hi"
  | "de"
  | "ja"
  | "ko"
  | "zh";

export interface MultilingualString {
  readonly key: string;
  readonly translations: Readonly<Record<SupportedLanguage, string>>;
}

// ─── Crowd Management Types ────────────────────────────────────────────────────

export type CrowdDensityLevel =
  | "empty"
  | "low"
  | "moderate"
  | "high"
  | "critical";

export interface CrowdThreshold {
  readonly level: CrowdDensityLevel;
  readonly minOccupancyPercent: number;
  readonly maxOccupancyPercent: number;
  readonly colorHex: string;
  readonly alertPriority: AlertPriority;
  readonly actionRequired: string;
}

export type AlertPriority = "none" | "info" | "warning" | "critical" | "emergency";

export interface SectionOccupancy {
  readonly sectionId: string;
  readonly currentCount: number;
  readonly maxCapacity: number;
  readonly occupancyPercent: number;
  readonly densityLevel: CrowdDensityLevel;
  readonly lastUpdated: string;
}

// ─── Transportation Types ──────────────────────────────────────────────────────

export type TransportMode =
  | "metro"
  | "bus"
  | "rideshare"
  | "parking"
  | "shuttle"
  | "bicycle"
  | "walking";

export type TransportStatus =
  | "on-time"
  | "delayed"
  | "cancelled"
  | "congested"
  | "available"
  | "full";

export interface TransportUpdate {
  readonly mode: TransportMode;
  readonly routeId: string;
  readonly routeName: string;
  readonly status: TransportStatus;
  readonly estimatedMinutes: number;
  readonly capacityPercent: number;
  readonly lastUpdated: string;
  readonly localizedStatus: Readonly<Record<SupportedLanguage, string>>;
}

export interface ParkingLot {
  readonly id: string;
  readonly name: string;
  readonly totalSpaces: number;
  readonly availableSpaces: number;
  readonly fillPercent: number;
  readonly priceUsd: number;
  readonly distanceToGateMeters: number;
  readonly isAccessible: boolean;
  readonly status: TransportStatus;
}

// ─── Accessibility Types ───────────────────────────────────────────────────────

export type AccessibilityFeature =
  | "wheelchair-ramp"
  | "wheelchair-seating"
  | "elevator"
  | "audio-description"
  | "sign-language"
  | "braille-signage"
  | "sensory-room"
  | "assistive-listening"
  | "service-animal-area"
  | "companion-seating"
  | "wide-concourse"
  | "accessible-restroom";

export interface AccessibilityConfig {
  readonly feature: AccessibilityFeature;
  readonly label: string;
  readonly localizedLabels: Readonly<Record<SupportedLanguage, string>>;
  readonly iconEmoji: string;
  readonly availableAtNodes: readonly string[];
  readonly description: string;
}

// ─── Sustainability Types ──────────────────────────────────────────────────────

export type SustainabilityMetricKind =
  | "energy-kwh"
  | "water-liters"
  | "waste-diverted-percent"
  | "carbon-kg"
  | "recycled-tons"
  | "solar-generation-kwh";

export interface SustainabilityMetric {
  readonly kind: SustainabilityMetricKind;
  readonly label: string;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly unit: string;
  readonly progressPercent: number;
  readonly trend: "improving" | "stable" | "declining";
}

// ─── Stadium & Venue Types ─────────────────────────────────────────────────────

export type HostCountry = "usa" | "mexico" | "canada";

export interface StadiumVenue {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly country: HostCountry;
  readonly capacity: number;
  readonly geoLocation: GeoCoordinate;
  readonly timeZone: string;
  readonly navigationNodes: readonly NavigationNode[];
  readonly transportOptions: readonly TransportUpdate[];
  readonly parkingLots: readonly ParkingLot[];
  readonly accessibilityFeatures: readonly AccessibilityConfig[];
  readonly sustainabilityMetrics: readonly SustainabilityMetric[];
}

// ─── Match & Schedule Types ────────────────────────────────────────────────────

export type MatchPhase =
  | "pre-match"
  | "gates-open"
  | "warm-up"
  | "first-half"
  | "halftime"
  | "second-half"
  | "extra-time"
  | "penalties"
  | "full-time"
  | "post-match";

export interface MatchEvent {
  readonly matchId: string;
  readonly homeTeam: string;
  readonly awayTeam: string;
  readonly venueId: string;
  readonly kickoffTime: string;
  readonly phase: MatchPhase;
  readonly group: string;
  readonly round: string;
}

// ─── Operations / Incident Types ───────────────────────────────────────────────

export type IncidentCategory =
  | "medical"
  | "security"
  | "weather"
  | "infrastructure"
  | "crowd-control"
  | "lost-child"
  | "fire"
  | "power-outage";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "reported" | "assigned" | "in-progress" | "resolved";

export interface OperationsIncident {
  readonly id: string;
  readonly category: IncidentCategory;
  readonly severity: IncidentSeverity;
  readonly status: IncidentStatus;
  readonly locationNodeId: string;
  readonly reportedAt: string;
  readonly assignedTo: string;
  readonly description: string;
  readonly resolutionNotes: string;
}

// ─── API Payload Types ─────────────────────────────────────────────────────────

export type StadiumApiAction =
  | "getVenue"
  | "getNavigation"
  | "getCrowdStatus"
  | "getTransport"
  | "getAccessibility"
  | "getSustainability"
  | "getMatchInfo"
  | "getOperations"
  | "chatQuery";

export interface StadiumApiRequest {
  readonly action: StadiumApiAction;
  readonly venueId: string;
  readonly language: SupportedLanguage;
  readonly payload: StadiumApiPayload;
}

export type StadiumApiPayload =
  | GetVenuePayload
  | GetNavigationPayload
  | GetCrowdStatusPayload
  | GetTransportPayload
  | GetAccessibilityPayload
  | GetSustainabilityPayload
  | GetMatchInfoPayload
  | GetOperationsPayload
  | ChatQueryPayload;

export interface GetVenuePayload {
  readonly action: "getVenue";
}

export interface GetNavigationPayload {
  readonly action: "getNavigation";
  readonly originNodeId: string;
  readonly destinationNodeId: string;
  readonly requireAccessible: boolean;
}

export interface GetCrowdStatusPayload {
  readonly action: "getCrowdStatus";
  readonly sectionIds: readonly string[];
}

export interface GetTransportPayload {
  readonly action: "getTransport";
  readonly modes: readonly TransportMode[];
}

export interface GetAccessibilityPayload {
  readonly action: "getAccessibility";
  readonly features: readonly AccessibilityFeature[];
}

export interface GetSustainabilityPayload {
  readonly action: "getSustainability";
}

export interface GetMatchInfoPayload {
  readonly action: "getMatchInfo";
  readonly matchId: string;
}

export interface GetOperationsPayload {
  readonly action: "getOperations";
  readonly incidentFilter: IncidentStatus | "all";
}

export interface ChatQueryPayload {
  readonly action: "chatQuery";
  readonly message: string;
  readonly conversationHistory: readonly ChatMessage[];
}

export interface ChatMessage {
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly timestamp: string;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface StadiumApiResponse<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: string | null;
  readonly timestamp: string;
}
