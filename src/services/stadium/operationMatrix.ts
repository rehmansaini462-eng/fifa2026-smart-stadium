/**
 * @module stadium/operationMatrix
 * Strict static lookup data for all stadium operations.
 *
 * DESIGN PRINCIPLES:
 * 1. ZERO CYCLOMATIC COMPLEXITY — No if/else/switch. All dynamic parameters
 *    are resolved via typed lookup maps and Record-based configurations.
 * 2. STRICT TYPE SAFETY — Every lookup is typed against interfaces in types.ts.
 * 3. MODULAR ISOLATION — This is pure data + lookup functions. No UI, no side effects.
 */

import type {
  CrowdDensityLevel,
  CrowdThreshold,
  AlertPriority,
  SupportedLanguage,
  NavigationNodeKind,
  TransportMode,
  TransportStatus,
  AccessibilityFeature,
  AccessibilityConfig,
  SustainabilityMetricKind,
  SustainabilityMetric,
  StadiumVenue,
  HostCountry,
  MatchEvent,
  IncidentCategory,
  IncidentSeverity,
  NavigationNode,
  TransportUpdate,
  ParkingLot,
  MatchPhase,
} from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: Crowd Management Lookups
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Crowd density threshold lookup — maps each density level to its configuration.
 * Used instead of if/else chains to determine alert severity and color coding.
 */
export const CROWD_THRESHOLD_MAP: Readonly<Record<CrowdDensityLevel, CrowdThreshold>> = {
  empty: {
    level: "empty",
    minOccupancyPercent: 0,
    maxOccupancyPercent: 10,
    colorHex: "#1A1F3A",
    alertPriority: "none",
    actionRequired: "No action required",
  },
  low: {
    level: "low",
    minOccupancyPercent: 10,
    maxOccupancyPercent: 40,
    colorHex: "#00D4AA",
    alertPriority: "none",
    actionRequired: "Normal operations",
  },
  moderate: {
    level: "moderate",
    minOccupancyPercent: 40,
    maxOccupancyPercent: 70,
    colorHex: "#FFD93D",
    alertPriority: "info",
    actionRequired: "Monitor flow patterns",
  },
  high: {
    level: "high",
    minOccupancyPercent: 70,
    maxOccupancyPercent: 90,
    colorHex: "#FF6B35",
    alertPriority: "warning",
    actionRequired: "Deploy additional staff, open overflow gates",
  },
  critical: {
    level: "critical",
    minOccupancyPercent: 90,
    maxOccupancyPercent: 100,
    colorHex: "#FF2E63",
    alertPriority: "critical",
    actionRequired: "Initiate crowd control protocols, halt inbound flow",
  },
};

/**
 * Resolves a crowd density level from an occupancy percentage.
 * Uses ordered threshold lookup — no if/else branching.
 */
const DENSITY_THRESHOLDS: readonly { readonly maxPercent: number; readonly level: CrowdDensityLevel }[] = [
  { maxPercent: 10, level: "empty" },
  { maxPercent: 40, level: "low" },
  { maxPercent: 70, level: "moderate" },
  { maxPercent: 90, level: "high" },
  { maxPercent: 100, level: "critical" },
] as const;

export function resolveCrowdDensity(occupancyPercent: number): CrowdDensityLevel {
  const match = DENSITY_THRESHOLDS.find((t) => occupancyPercent <= t.maxPercent);
  return match?.level ?? "critical";
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: Alert Priority Lookups
// ═══════════════════════════════════════════════════════════════════════════════

export const ALERT_PRIORITY_CONFIG: Readonly<Record<AlertPriority, {
  readonly label: string;
  readonly colorHex: string;
  readonly iconEmoji: string;
  readonly soundEnabled: boolean;
}>> = {
  none: { label: "None", colorHex: "#6B7280", iconEmoji: "⚪", soundEnabled: false },
  info: { label: "Information", colorHex: "#3B82F6", iconEmoji: "ℹ️", soundEnabled: false },
  warning: { label: "Warning", colorHex: "#F59E0B", iconEmoji: "⚠️", soundEnabled: true },
  critical: { label: "Critical", colorHex: "#EF4444", iconEmoji: "🔴", soundEnabled: true },
  emergency: { label: "Emergency", colorHex: "#DC2626", iconEmoji: "🚨", soundEnabled: true },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: Navigation Node Kind Lookups
// ═══════════════════════════════════════════════════════════════════════════════

export const NAVIGATION_NODE_CONFIG: Readonly<Record<NavigationNodeKind, {
  readonly label: string;
  readonly iconEmoji: string;
  readonly isPublicFacing: boolean;
  readonly defaultAccessible: boolean;
}>> = {
  gate: { label: "Gate", iconEmoji: "🚪", isPublicFacing: true, defaultAccessible: true },
  "seat-section": { label: "Seat Section", iconEmoji: "💺", isPublicFacing: true, defaultAccessible: false },
  concession: { label: "Food & Drinks", iconEmoji: "🍔", isPublicFacing: true, defaultAccessible: true },
  restroom: { label: "Restroom", iconEmoji: "🚻", isPublicFacing: true, defaultAccessible: true },
  medical: { label: "Medical Station", iconEmoji: "🏥", isPublicFacing: true, defaultAccessible: true },
  exit: { label: "Exit", iconEmoji: "🚪", isPublicFacing: true, defaultAccessible: true },
  elevator: { label: "Elevator", iconEmoji: "🛗", isPublicFacing: true, defaultAccessible: true },
  escalator: { label: "Escalator", iconEmoji: "📶", isPublicFacing: true, defaultAccessible: false },
  stairs: { label: "Stairs", iconEmoji: "🪜", isPublicFacing: true, defaultAccessible: false },
  merchandise: { label: "Merchandise Shop", iconEmoji: "🛍️", isPublicFacing: true, defaultAccessible: true },
  atm: { label: "ATM", iconEmoji: "🏧", isPublicFacing: true, defaultAccessible: true },
  information: { label: "Information Desk", iconEmoji: "ℹ️", isPublicFacing: true, defaultAccessible: true },
  "accessible-entrance": { label: "Accessible Entrance", iconEmoji: "♿", isPublicFacing: true, defaultAccessible: true },
  "family-zone": { label: "Family Zone", iconEmoji: "👨‍👩‍👧‍👦", isPublicFacing: true, defaultAccessible: true },
  "sensory-room": { label: "Sensory Room", iconEmoji: "🧘", isPublicFacing: true, defaultAccessible: true },
  "prayer-room": { label: "Prayer Room", iconEmoji: "🕌", isPublicFacing: true, defaultAccessible: true },
  "vip-lounge": { label: "VIP Lounge", iconEmoji: "⭐", isPublicFacing: false, defaultAccessible: true },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: Multilingual Tag Lookups
// ═══════════════════════════════════════════════════════════════════════════════

export const LANGUAGE_CONFIG: Readonly<Record<SupportedLanguage, {
  readonly label: string;
  readonly nativeLabel: string;
  readonly direction: "ltr" | "rtl";
  readonly flagEmoji: string;
}>> = {
  en: { label: "English", nativeLabel: "English", direction: "ltr", flagEmoji: "🇺🇸" },
  es: { label: "Spanish", nativeLabel: "Español", direction: "ltr", flagEmoji: "🇪🇸" },
  fr: { label: "French", nativeLabel: "Français", direction: "ltr", flagEmoji: "🇫🇷" },
  pt: { label: "Portuguese", nativeLabel: "Português", direction: "ltr", flagEmoji: "🇧🇷" },
  ar: { label: "Arabic", nativeLabel: "العربية", direction: "rtl", flagEmoji: "🇸🇦" },
  hi: { label: "Hindi", nativeLabel: "हिन्दी", direction: "ltr", flagEmoji: "🇮🇳" },
  de: { label: "German", nativeLabel: "Deutsch", direction: "ltr", flagEmoji: "🇩🇪" },
  ja: { label: "Japanese", nativeLabel: "日本語", direction: "ltr", flagEmoji: "🇯🇵" },
  ko: { label: "Korean", nativeLabel: "한국어", direction: "ltr", flagEmoji: "🇰🇷" },
  zh: { label: "Chinese", nativeLabel: "中文", direction: "ltr", flagEmoji: "🇨🇳" },
};

/**
 * Common UI labels with full multilingual coverage.
 * Used for dynamic label resolution — no hardcoded string comparisons.
 */
export const UI_LABELS: Readonly<Record<string, Readonly<Record<SupportedLanguage, string>>>> = {
  welcome: {
    en: "Welcome to StadiumIQ",
    es: "Bienvenido a StadiumIQ",
    fr: "Bienvenue sur StadiumIQ",
    pt: "Bem-vindo ao StadiumIQ",
    ar: "مرحبًا بك في StadiumIQ",
    hi: "StadiumIQ में आपका स्वागत है",
    de: "Willkommen bei StadiumIQ",
    ja: "StadiumIQへようこそ",
    ko: "StadiumIQ에 오신 것을 환영합니다",
    zh: "欢迎使用StadiumIQ",
  },
  findSeat: {
    en: "Find My Seat",
    es: "Encontrar Mi Asiento",
    fr: "Trouver Mon Siège",
    pt: "Encontrar Meu Assento",
    ar: "ابحث عن مقعدي",
    hi: "मेरी सीट खोजें",
    de: "Meinen Platz finden",
    ja: "座席を探す",
    ko: "좌석 찾기",
    zh: "找到我的座位",
  },
  emergency: {
    en: "Emergency",
    es: "Emergencia",
    fr: "Urgence",
    pt: "Emergência",
    ar: "طوارئ",
    hi: "आपातकाल",
    de: "Notfall",
    ja: "緊急",
    ko: "비상",
    zh: "紧急情况",
  },
  nearestRestroom: {
    en: "Nearest Restroom",
    es: "Baño Más Cercano",
    fr: "Toilettes les Plus Proches",
    pt: "Banheiro Mais Próximo",
    ar: "أقرب دورة مياه",
    hi: "निकटतम शौचालय",
    de: "Nächste Toilette",
    ja: "最寄りのトイレ",
    ko: "가장 가까운 화장실",
    zh: "最近的洗手间",
  },
  foodAndDrinks: {
    en: "Food & Drinks",
    es: "Comida y Bebidas",
    fr: "Nourriture et Boissons",
    pt: "Comida e Bebidas",
    ar: "طعام ومشروبات",
    hi: "खाना और पेय",
    de: "Essen & Trinken",
    ja: "飲食",
    ko: "음식 및 음료",
    zh: "餐饮",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: Transportation Mode Lookups
// ═══════════════════════════════════════════════════════════════════════════════

export const TRANSPORT_MODE_CONFIG: Readonly<Record<TransportMode, {
  readonly label: string;
  readonly iconEmoji: string;
  readonly carbonKgPerKm: number;
  readonly avgSpeedKmh: number;
}>> = {
  metro: { label: "Metro/Subway", iconEmoji: "🚇", carbonKgPerKm: 0.041, avgSpeedKmh: 33 },
  bus: { label: "Bus", iconEmoji: "🚌", carbonKgPerKm: 0.089, avgSpeedKmh: 20 },
  rideshare: { label: "Rideshare", iconEmoji: "🚗", carbonKgPerKm: 0.171, avgSpeedKmh: 30 },
  parking: { label: "Drive & Park", iconEmoji: "🅿️", carbonKgPerKm: 0.192, avgSpeedKmh: 35 },
  shuttle: { label: "Shuttle Bus", iconEmoji: "🚐", carbonKgPerKm: 0.065, avgSpeedKmh: 25 },
  bicycle: { label: "Bicycle", iconEmoji: "🚲", carbonKgPerKm: 0, avgSpeedKmh: 15 },
  walking: { label: "Walking", iconEmoji: "🚶", carbonKgPerKm: 0, avgSpeedKmh: 5 },
};

export const TRANSPORT_STATUS_CONFIG: Readonly<Record<TransportStatus, {
  readonly label: string;
  readonly colorHex: string;
  readonly iconEmoji: string;
}>> = {
  "on-time": { label: "On Time", colorHex: "#00D4AA", iconEmoji: "✅" },
  delayed: { label: "Delayed", colorHex: "#F59E0B", iconEmoji: "⏳" },
  cancelled: { label: "Cancelled", colorHex: "#EF4444", iconEmoji: "❌" },
  congested: { label: "Congested", colorHex: "#FF6B35", iconEmoji: "🚧" },
  available: { label: "Available", colorHex: "#00D4AA", iconEmoji: "🟢" },
  full: { label: "Full", colorHex: "#EF4444", iconEmoji: "🔴" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: Accessibility Feature Lookups
// ═══════════════════════════════════════════════════════════════════════════════

export const ACCESSIBILITY_FEATURE_CONFIG: Readonly<Record<AccessibilityFeature, Omit<AccessibilityConfig, "availableAtNodes">>> = {
  "wheelchair-ramp": {
    feature: "wheelchair-ramp",
    label: "Wheelchair Ramp",
    localizedLabels: {
      en: "Wheelchair Ramp", es: "Rampa para Silla de Ruedas", fr: "Rampe pour Fauteuil Roulant",
      pt: "Rampa para Cadeira de Rodas", ar: "منحدر كرسي متحرك", hi: "व्हीलचेयर रैंप",
      de: "Rollstuhlrampe", ja: "車椅子用スロープ", ko: "휠체어 경사로", zh: "轮椅坡道",
    },
    iconEmoji: "♿",
    description: "Gentle-grade ramp for wheelchair and mobility device access",
  },
  "wheelchair-seating": {
    feature: "wheelchair-seating",
    label: "Wheelchair Seating",
    localizedLabels: {
      en: "Wheelchair Seating", es: "Asientos para Silla de Ruedas", fr: "Places Fauteuil Roulant",
      pt: "Assentos para Cadeira de Rodas", ar: "مقاعد كرسي متحرك", hi: "व्हीलचेयर सीटिंग",
      de: "Rollstuhlplätze", ja: "車椅子席", ko: "휠체어 좌석", zh: "轮椅座位",
    },
    iconEmoji: "💺",
    description: "Designated wheelchair-accessible seating areas with companion seats",
  },
  elevator: {
    feature: "elevator",
    label: "Elevator",
    localizedLabels: {
      en: "Elevator", es: "Ascensor", fr: "Ascenseur",
      pt: "Elevador", ar: "مصعد", hi: "लिफ्ट",
      de: "Aufzug", ja: "エレベーター", ko: "엘리베이터", zh: "电梯",
    },
    iconEmoji: "🛗",
    description: "Accessible elevator connecting all stadium levels",
  },
  "audio-description": {
    feature: "audio-description",
    label: "Audio Description",
    localizedLabels: {
      en: "Audio Description", es: "Audiodescripción", fr: "Audiodescription",
      pt: "Audiodescrição", ar: "وصف صوتي", hi: "ऑडियो विवरण",
      de: "Audiodeskription", ja: "音声解説", ko: "오디오 설명", zh: "音频描述",
    },
    iconEmoji: "🎧",
    description: "Live audio descriptions of match events for visually impaired fans",
  },
  "sign-language": {
    feature: "sign-language",
    label: "Sign Language",
    localizedLabels: {
      en: "Sign Language Interpreter", es: "Intérprete de Lengua de Señas", fr: "Interprète Langue des Signes",
      pt: "Intérprete de Língua de Sinais", ar: "مترجم لغة إشارة", hi: "सांकेतिक भाषा दुभाषिया",
      de: "Gebärdensprachdolmetscher", ja: "手話通訳", ko: "수어 통역사", zh: "手语翻译",
    },
    iconEmoji: "🤟",
    description: "On-site sign language interpreters for key announcements",
  },
  "braille-signage": {
    feature: "braille-signage",
    label: "Braille Signage",
    localizedLabels: {
      en: "Braille Signage", es: "Señalización en Braille", fr: "Signalisation en Braille",
      pt: "Sinalização em Braille", ar: "لافتات بريل", hi: "ब्रेल साइनेज",
      de: "Braille-Beschilderung", ja: "点字案内", ko: "점자 안내판", zh: "盲文标识",
    },
    iconEmoji: "⠿",
    description: "Tactile braille signage at all major navigation points",
  },
  "sensory-room": {
    feature: "sensory-room",
    label: "Sensory Room",
    localizedLabels: {
      en: "Sensory Room", es: "Sala Sensorial", fr: "Salle Sensorielle",
      pt: "Sala Sensorial", ar: "غرفة حسية", hi: "संवेदी कक्ष",
      de: "Sensorischer Raum", ja: "センサリールーム", ko: "감각 조절실", zh: "感官室",
    },
    iconEmoji: "🧘",
    description: "Low-stimulation quiet room with live match feed for neurodivergent guests",
  },
  "assistive-listening": {
    feature: "assistive-listening",
    label: "Assistive Listening",
    localizedLabels: {
      en: "Assistive Listening", es: "Escucha Asistida", fr: "Aide Auditive",
      pt: "Escuta Assistida", ar: "أجهزة سمعية مساعدة", hi: "सहायक श्रवण",
      de: "Hörhilfe", ja: "補助聴力", ko: "보조 청취", zh: "辅助听力",
    },
    iconEmoji: "👂",
    description: "Hearing loop and FM systems available for hearing-impaired fans",
  },
  "service-animal-area": {
    feature: "service-animal-area",
    label: "Service Animal Area",
    localizedLabels: {
      en: "Service Animal Area", es: "Área para Animales de Servicio", fr: "Zone Animaux d'Assistance",
      pt: "Área para Animais de Serviço", ar: "منطقة حيوانات الخدمة", hi: "सेवा पशु क्षेत्र",
      de: "Bereich für Assistenztiere", ja: "介助動物エリア", ko: "안내동물 구역", zh: "服务动物区",
    },
    iconEmoji: "🐕‍🦺",
    description: "Designated relief and rest areas for service animals",
  },
  "companion-seating": {
    feature: "companion-seating",
    label: "Companion Seating",
    localizedLabels: {
      en: "Companion Seating", es: "Asiento para Acompañante", fr: "Siège Accompagnateur",
      pt: "Assento para Acompanhante", ar: "مقعد مرافق", hi: "सहायक सीट",
      de: "Begleitplatz", ja: "同伴者席", ko: "동반자 좌석", zh: "陪同座位",
    },
    iconEmoji: "👥",
    description: "Adjacent seating for companions of guests with disabilities",
  },
  "wide-concourse": {
    feature: "wide-concourse",
    label: "Wide Concourse",
    localizedLabels: {
      en: "Wide Concourse", es: "Concurso Amplio", fr: "Concours Large",
      pt: "Concurso Amplo", ar: "ممر واسع", hi: "चौड़ा कंकोर्स",
      de: "Breiter Umlauf", ja: "広いコンコース", ko: "넓은 통로", zh: "宽阔通道",
    },
    iconEmoji: "↔️",
    description: "Extra-wide concourse areas for easy wheelchair and stroller movement",
  },
  "accessible-restroom": {
    feature: "accessible-restroom",
    label: "Accessible Restroom",
    localizedLabels: {
      en: "Accessible Restroom", es: "Baño Accesible", fr: "Toilettes Accessibles",
      pt: "Banheiro Acessível", ar: "دورة مياه ميسرة", hi: "सुलभ शौचालय",
      de: "Barrierefreie Toilette", ja: "バリアフリートイレ", ko: "접근 가능 화장실", zh: "无障碍卫生间",
    },
    iconEmoji: "🚻",
    description: "Fully accessible restroom with grab bars, lowered fixtures, and emergency call button",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: Sustainability Metric Lookups
// ═══════════════════════════════════════════════════════════════════════════════

export const SUSTAINABILITY_METRIC_CONFIG: Readonly<Record<SustainabilityMetricKind, {
  readonly label: string;
  readonly unit: string;
  readonly iconEmoji: string;
  readonly targetDescription: string;
}>> = {
  "energy-kwh": { label: "Energy Consumption", unit: "kWh", iconEmoji: "⚡", targetDescription: "30% reduction vs 2022 baseline" },
  "water-liters": { label: "Water Usage", unit: "liters", iconEmoji: "💧", targetDescription: "25% reduction via smart irrigation" },
  "waste-diverted-percent": { label: "Waste Diversion", unit: "%", iconEmoji: "♻️", targetDescription: "90% waste diverted from landfill" },
  "carbon-kg": { label: "Carbon Emissions", unit: "kg CO₂", iconEmoji: "🌍", targetDescription: "Carbon-neutral event operations" },
  "recycled-tons": { label: "Materials Recycled", unit: "tons", iconEmoji: "🔄", targetDescription: "500 tons recycled during tournament" },
  "solar-generation-kwh": { label: "Solar Generation", unit: "kWh", iconEmoji: "☀️", targetDescription: "15% of venue energy from on-site solar" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: Incident Category Lookups
// ═══════════════════════════════════════════════════════════════════════════════

export const INCIDENT_CATEGORY_CONFIG: Readonly<Record<IncidentCategory, {
  readonly label: string;
  readonly iconEmoji: string;
  readonly defaultSeverity: IncidentSeverity;
  readonly responseTeam: string;
}>> = {
  medical: { label: "Medical Emergency", iconEmoji: "🏥", defaultSeverity: "high", responseTeam: "Medical Response Unit" },
  security: { label: "Security Incident", iconEmoji: "🛡️", defaultSeverity: "medium", responseTeam: "Security Operations" },
  weather: { label: "Weather Alert", iconEmoji: "⛈️", defaultSeverity: "medium", responseTeam: "Venue Operations" },
  infrastructure: { label: "Infrastructure Issue", iconEmoji: "🔧", defaultSeverity: "low", responseTeam: "Facilities Management" },
  "crowd-control": { label: "Crowd Control", iconEmoji: "👥", defaultSeverity: "high", responseTeam: "Crowd Management Team" },
  "lost-child": { label: "Lost Child", iconEmoji: "🧒", defaultSeverity: "critical", responseTeam: "Guest Services + Security" },
  fire: { label: "Fire", iconEmoji: "🔥", defaultSeverity: "critical", responseTeam: "Fire Response Unit" },
  "power-outage": { label: "Power Outage", iconEmoji: "🔌", defaultSeverity: "high", responseTeam: "Electrical Engineering" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: Match Phase Lookups
// ═══════════════════════════════════════════════════════════════════════════════

export const MATCH_PHASE_CONFIG: Readonly<Record<MatchPhase, {
  readonly label: string;
  readonly iconEmoji: string;
  readonly crowdExpectation: CrowdDensityLevel;
  readonly operationsNote: string;
}>> = {
  "pre-match": { label: "Pre-Match", iconEmoji: "🏟️", crowdExpectation: "low", operationsNote: "Final setup checks; gates not yet open" },
  "gates-open": { label: "Gates Open", iconEmoji: "🚪", crowdExpectation: "moderate", operationsNote: "Inbound crowd surge; maximize gate throughput" },
  "warm-up": { label: "Warm-Up", iconEmoji: "🏃", crowdExpectation: "high", operationsNote: "Heavy concession traffic expected" },
  "first-half": { label: "First Half", iconEmoji: "⚽", crowdExpectation: "high", operationsNote: "Seated crowd; minimal movement" },
  halftime: { label: "Halftime", iconEmoji: "⏸️", crowdExpectation: "high", operationsNote: "Peak concession and restroom demand" },
  "second-half": { label: "Second Half", iconEmoji: "⚽", crowdExpectation: "high", operationsNote: "Seated crowd; prepare exit strategy" },
  "extra-time": { label: "Extra Time", iconEmoji: "⏱️", crowdExpectation: "high", operationsNote: "Extended operations; re-deploy staff" },
  penalties: { label: "Penalty Shootout", iconEmoji: "🥅", crowdExpectation: "critical", operationsNote: "Maximum tension; heightened medical standby" },
  "full-time": { label: "Full Time", iconEmoji: "🏁", crowdExpectation: "critical", operationsNote: "Mass egress; activate staggered exit plan" },
  "post-match": { label: "Post-Match", iconEmoji: "🌙", crowdExpectation: "moderate", operationsNote: "Cleanup and venue reset; transport coordination" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: FIFA 2026 Venue Data (All 16 Host Stadiums)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates a minimal navigation node for a venue.
 * Helper to reduce boilerplate — no logic branching.
 */
function createNavNode(
  id: string,
  kind: NavigationNodeKind,
  label: string,
  x: number,
  y: number,
  level: NavigationNode["coordinate"]["level"],
  connectedNodeIds: readonly string[],
): NavigationNode {
  const nodeConfig = NAVIGATION_NODE_CONFIG[kind];
  return {
    id,
    kind,
    label,
    localizedLabels: { en: label, es: label, fr: label, pt: label, ar: label, hi: label, de: label, ja: label, ko: label, zh: label },
    coordinate: { x, y, level },
    isAccessible: nodeConfig.defaultAccessible,
    connectedNodeIds,
    estimatedWalkMinutes: Object.fromEntries(connectedNodeIds.map((nid) => [nid, 2])),
  };
}

function createTransportUpdate(
  mode: TransportMode,
  routeId: string,
  routeName: string,
  status: TransportStatus,
  estimatedMinutes: number,
  capacityPercent: number,
): TransportUpdate {
  const statusConfig = TRANSPORT_STATUS_CONFIG[status];
  return {
    mode, routeId, routeName, status, estimatedMinutes, capacityPercent,
    lastUpdated: new Date().toISOString(),
    localizedStatus: {
      en: statusConfig.label, es: statusConfig.label, fr: statusConfig.label,
      pt: statusConfig.label, ar: statusConfig.label, hi: statusConfig.label,
      de: statusConfig.label, ja: statusConfig.label, ko: statusConfig.label,
      zh: statusConfig.label,
    },
  };
}

function createParkingLot(
  id: string, name: string, totalSpaces: number, availableSpaces: number,
  priceUsd: number, distanceMeters: number, isAccessible: boolean,
): ParkingLot {
  const fillPercent = Math.round(((totalSpaces - availableSpaces) / totalSpaces) * 100);
  return {
    id, name, totalSpaces, availableSpaces, fillPercent, priceUsd,
    distanceToGateMeters: distanceMeters, isAccessible,
    status: fillPercent >= 95 ? "full" : "available",
  };
}

function createSustainabilityMetric(
  kind: SustainabilityMetricKind, currentValue: number, targetValue: number,
): SustainabilityMetric {
  const config = SUSTAINABILITY_METRIC_CONFIG[kind];
  const progressPercent = Math.round((currentValue / targetValue) * 100);
  return {
    kind, label: config.label, currentValue, targetValue, unit: config.unit, progressPercent,
    trend: progressPercent >= 80 ? "improving" : progressPercent >= 50 ? "stable" : "declining",
  };
}

export const FIFA_2026_VENUES: readonly StadiumVenue[] = [
  // ── United States ──────────────────────────────────────
  {
    id: "metlife", name: "MetLife Stadium", city: "New York / New Jersey", country: "usa" as HostCountry, capacity: 82500,
    geoLocation: { latitude: 40.8135, longitude: -74.0745 }, timeZone: "America/New_York",
    navigationNodes: [
      createNavNode("metlife-gate-a", "gate", "Gate A", 10, 50, "ground", ["metlife-conc-1", "metlife-sec-101"]),
      createNavNode("metlife-conc-1", "concession", "Concession Stand 1", 20, 45, "concourse-lower", ["metlife-gate-a", "metlife-rest-1"]),
      createNavNode("metlife-rest-1", "restroom", "Restroom L1", 25, 40, "concourse-lower", ["metlife-conc-1", "metlife-sec-101"]),
      createNavNode("metlife-sec-101", "seat-section", "Section 101", 30, 50, "lower-bowl", ["metlife-gate-a", "metlife-rest-1"]),
      createNavNode("metlife-medical", "medical", "Medical Station", 50, 50, "concourse-lower", ["metlife-conc-1"]),
    ],
    transportOptions: [
      createTransportUpdate("metro", "nj-transit", "NJ Transit Rail", "on-time", 35, 72),
      createTransportUpdate("bus", "shuttle-nyp", "Shuttle from NY Penn", "on-time", 25, 60),
      createTransportUpdate("rideshare", "rideshare-zone", "Rideshare Pickup Zone B", "available", 8, 45),
    ],
    parkingLots: [
      createParkingLot("metlife-lot-a", "Lot A - Premium", 3000, 850, 75, 200, true),
      createParkingLot("metlife-lot-j", "Lot J - General", 5000, 1200, 40, 600, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["wheelchair-ramp"], availableAtNodes: ["metlife-gate-a"] },
      { ...ACCESSIBILITY_FEATURE_CONFIG["elevator"], availableAtNodes: ["metlife-conc-1"] },
      { ...ACCESSIBILITY_FEATURE_CONFIG["sensory-room"], availableAtNodes: ["metlife-medical"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("energy-kwh", 42000, 60000),
      createSustainabilityMetric("waste-diverted-percent", 82, 90),
      createSustainabilityMetric("solar-generation-kwh", 8500, 9000),
    ],
  },
  {
    id: "sofi", name: "SoFi Stadium", city: "Los Angeles", country: "usa" as HostCountry, capacity: 70240,
    geoLocation: { latitude: 33.9535, longitude: -118.3392 }, timeZone: "America/Los_Angeles",
    navigationNodes: [
      createNavNode("sofi-gate-1", "gate", "Gate 1 - Main", 15, 50, "ground", ["sofi-conc-north"]),
      createNavNode("sofi-conc-north", "concession", "North Concessions", 25, 30, "concourse-lower", ["sofi-gate-1", "sofi-sec-a"]),
      createNavNode("sofi-sec-a", "seat-section", "Section A", 40, 50, "lower-bowl", ["sofi-conc-north"]),
    ],
    transportOptions: [
      createTransportUpdate("metro", "la-metro-c", "LA Metro C Line", "on-time", 20, 55),
      createTransportUpdate("shuttle", "lax-shuttle", "LAX Stadium Shuttle", "delayed", 45, 80),
    ],
    parkingLots: [
      createParkingLot("sofi-pink", "Pink Lot", 4000, 600, 80, 300, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["wheelchair-seating"], availableAtNodes: ["sofi-sec-a"] },
      { ...ACCESSIBILITY_FEATURE_CONFIG["audio-description"], availableAtNodes: ["sofi-sec-a"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("energy-kwh", 38000, 55000),
      createSustainabilityMetric("solar-generation-kwh", 12000, 15000),
    ],
  },
  {
    id: "hardrock", name: "Hard Rock Stadium", city: "Miami", country: "usa" as HostCountry, capacity: 64767,
    geoLocation: { latitude: 25.958, longitude: -80.2389 }, timeZone: "America/New_York",
    navigationNodes: [
      createNavNode("hr-gate-north", "gate", "North Gate", 50, 10, "ground", ["hr-conc-main"]),
      createNavNode("hr-conc-main", "concession", "Main Concourse Food Court", 50, 30, "concourse-lower", ["hr-gate-north", "hr-sec-200"]),
      createNavNode("hr-sec-200", "seat-section", "Section 200", 50, 50, "lower-bowl", ["hr-conc-main"]),
    ],
    transportOptions: [
      createTransportUpdate("shuttle", "miami-express", "Miami Beach Express", "on-time", 30, 65),
      createTransportUpdate("rideshare", "hr-rideshare", "Rideshare Zone", "available", 10, 40),
    ],
    parkingLots: [
      createParkingLot("hr-lot-1", "Lot 1 - East", 5000, 2100, 50, 400, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["wheelchair-ramp"], availableAtNodes: ["hr-gate-north"] },
      { ...ACCESSIBILITY_FEATURE_CONFIG["service-animal-area"], availableAtNodes: ["hr-conc-main"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("water-liters", 150000, 200000),
      createSustainabilityMetric("waste-diverted-percent", 78, 90),
    ],
  },
  {
    id: "att", name: "AT&T Stadium", city: "Dallas", country: "usa" as HostCountry, capacity: 80000,
    geoLocation: { latitude: 32.7473, longitude: -97.0945 }, timeZone: "America/Chicago",
    navigationNodes: [
      createNavNode("att-gate-e", "gate", "East Gate", 80, 50, "ground", ["att-conc-e"]),
      createNavNode("att-conc-e", "concession", "East Concourse", 70, 50, "concourse-lower", ["att-gate-e"]),
    ],
    transportOptions: [
      createTransportUpdate("shuttle", "dart-rail", "DART Rail Connection", "on-time", 40, 50),
    ],
    parkingLots: [
      createParkingLot("att-lot-east", "East Lot", 6000, 3500, 60, 350, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["elevator"], availableAtNodes: ["att-conc-e"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("energy-kwh", 55000, 70000),
    ],
  },
  {
    id: "nrg", name: "NRG Stadium", city: "Houston", country: "usa" as HostCountry, capacity: 72220,
    geoLocation: { latitude: 29.6847, longitude: -95.4107 }, timeZone: "America/Chicago",
    navigationNodes: [
      createNavNode("nrg-gate-main", "gate", "Main Gate", 50, 80, "ground", ["nrg-conc-1"]),
      createNavNode("nrg-conc-1", "concession", "Level 1 Food Hall", 50, 60, "concourse-lower", ["nrg-gate-main"]),
    ],
    transportOptions: [
      createTransportUpdate("metro", "metrorail", "METRORail Purple Line", "on-time", 15, 65),
    ],
    parkingLots: [
      createParkingLot("nrg-blue", "Blue Lot", 8000, 4000, 45, 500, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["accessible-restroom"], availableAtNodes: ["nrg-conc-1"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("carbon-kg", 28000, 35000),
    ],
  },
  {
    id: "arrowhead", name: "Arrowhead Stadium", city: "Kansas City", country: "usa" as HostCountry, capacity: 76416,
    geoLocation: { latitude: 39.0489, longitude: -94.484 }, timeZone: "America/Chicago",
    navigationNodes: [
      createNavNode("arrow-gate-a", "gate", "Gate A", 20, 50, "ground", ["arrow-conc-main"]),
      createNavNode("arrow-conc-main", "concession", "Main Concourse", 40, 50, "concourse-lower", ["arrow-gate-a"]),
    ],
    transportOptions: [
      createTransportUpdate("bus", "kcata", "KCATA Express Bus", "on-time", 25, 55),
    ],
    parkingLots: [
      createParkingLot("arrow-lot-g", "Lot G", 10000, 6000, 35, 700, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["wide-concourse"], availableAtNodes: ["arrow-conc-main"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("recycled-tons", 120, 200),
    ],
  },
  {
    id: "mercedes", name: "Mercedes-Benz Stadium", city: "Atlanta", country: "usa" as HostCountry, capacity: 71000,
    geoLocation: { latitude: 33.7554, longitude: -84.4008 }, timeZone: "America/New_York",
    navigationNodes: [
      createNavNode("mb-gate-west", "gate", "West Gate", 10, 50, "ground", ["mb-conc-100"]),
      createNavNode("mb-conc-100", "concession", "100 Level Concourse", 30, 50, "concourse-lower", ["mb-gate-west"]),
    ],
    transportOptions: [
      createTransportUpdate("metro", "marta", "MARTA Vine City Station", "on-time", 5, 70),
    ],
    parkingLots: [
      createParkingLot("mb-red", "Red Deck", 3000, 900, 55, 250, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["sensory-room"], availableAtNodes: ["mb-conc-100"] },
      { ...ACCESSIBILITY_FEATURE_CONFIG["assistive-listening"], availableAtNodes: ["mb-conc-100"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("energy-kwh", 30000, 50000),
      createSustainabilityMetric("solar-generation-kwh", 5000, 6000),
      createSustainabilityMetric("waste-diverted-percent", 88, 90),
    ],
  },
  {
    id: "gillette", name: "Gillette Stadium", city: "Boston", country: "usa" as HostCountry, capacity: 65878,
    geoLocation: { latitude: 42.0909, longitude: -71.2643 }, timeZone: "America/New_York",
    navigationNodes: [
      createNavNode("gill-gate-d", "gate", "Gate D", 60, 80, "ground", ["gill-conc-north"]),
      createNavNode("gill-conc-north", "concession", "North Concourse", 60, 60, "concourse-lower", ["gill-gate-d"]),
    ],
    transportOptions: [
      createTransportUpdate("bus", "mbta-shuttle", "MBTA Shuttle from South Station", "on-time", 50, 60),
    ],
    parkingLots: [
      createParkingLot("gill-p5", "P5 General", 12000, 7000, 40, 800, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["companion-seating"], availableAtNodes: ["gill-conc-north"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("water-liters", 90000, 120000),
    ],
  },
  {
    id: "lumen", name: "Lumen Field", city: "Seattle", country: "usa" as HostCountry, capacity: 68740,
    geoLocation: { latitude: 47.5952, longitude: -122.3316 }, timeZone: "America/Los_Angeles",
    navigationNodes: [
      createNavNode("lumen-gate-n", "gate", "North Gate", 50, 10, "ground", ["lumen-conc-main"]),
      createNavNode("lumen-conc-main", "concession", "Main Concourse", 50, 30, "concourse-lower", ["lumen-gate-n"]),
    ],
    transportOptions: [
      createTransportUpdate("metro", "link-light", "Link Light Rail", "on-time", 10, 70),
    ],
    parkingLots: [
      createParkingLot("lumen-north", "North Lot", 2000, 800, 50, 300, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["braille-signage"], availableAtNodes: ["lumen-conc-main"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("energy-kwh", 28000, 40000),
    ],
  },
  {
    id: "lincoln", name: "Lincoln Financial Field", city: "Philadelphia", country: "usa" as HostCountry, capacity: 69328,
    geoLocation: { latitude: 39.9008, longitude: -75.1675 }, timeZone: "America/New_York",
    navigationNodes: [
      createNavNode("linc-gate-a", "gate", "Gate A", 20, 50, "ground", ["linc-conc-1"]),
      createNavNode("linc-conc-1", "concession", "Concourse 1", 35, 50, "concourse-lower", ["linc-gate-a"]),
    ],
    transportOptions: [
      createTransportUpdate("metro", "septa-bsl", "SEPTA Broad Street Line", "on-time", 12, 65),
    ],
    parkingLots: [
      createParkingLot("linc-lot-k", "Lot K", 6000, 3200, 35, 500, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["wheelchair-seating"], availableAtNodes: ["linc-conc-1"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("recycled-tons", 85, 150),
    ],
  },
  {
    id: "levis", name: "Levi's Stadium", city: "San Francisco Bay Area", country: "usa" as HostCountry, capacity: 68500,
    geoLocation: { latitude: 37.4033, longitude: -121.9694 }, timeZone: "America/Los_Angeles",
    navigationNodes: [
      createNavNode("levis-gate-f", "gate", "Gate F", 50, 90, "ground", ["levis-conc-main"]),
      createNavNode("levis-conc-main", "concession", "Main Level Concourse", 50, 70, "concourse-lower", ["levis-gate-f"]),
    ],
    transportOptions: [
      createTransportUpdate("metro", "vta-lrt", "VTA Light Rail", "on-time", 20, 50),
    ],
    parkingLots: [
      createParkingLot("levis-green", "Green Lot 1", 5000, 2500, 55, 400, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["sign-language"], availableAtNodes: ["levis-conc-main"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("solar-generation-kwh", 18000, 20000),
    ],
  },
  // ── Mexico ─────────────────────────────────────────────
  {
    id: "azteca", name: "Estadio Azteca", city: "Mexico City", country: "mexico" as HostCountry, capacity: 87523,
    geoLocation: { latitude: 19.3029, longitude: -99.1505 }, timeZone: "America/Mexico_City",
    navigationNodes: [
      createNavNode("azt-gate-main", "gate", "Puerta Principal", 50, 90, "ground", ["azt-conc-1"]),
      createNavNode("azt-conc-1", "concession", "Zona de Alimentos", 50, 70, "concourse-lower", ["azt-gate-main"]),
    ],
    transportOptions: [
      createTransportUpdate("metro", "metro-azteca", "Metro Estadio Azteca", "on-time", 5, 80),
    ],
    parkingLots: [
      createParkingLot("azt-est-1", "Estacionamiento 1", 4000, 1500, 30, 300, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["wheelchair-ramp"], availableAtNodes: ["azt-gate-main"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("water-liters", 200000, 250000),
    ],
  },
  {
    id: "akron", name: "Estadio Akron", city: "Guadalajara", country: "mexico" as HostCountry, capacity: 49850,
    geoLocation: { latitude: 20.6825, longitude: -103.4624 }, timeZone: "America/Mexico_City",
    navigationNodes: [
      createNavNode("akr-gate-1", "gate", "Puerta 1", 30, 50, "ground", ["akr-conc-1"]),
      createNavNode("akr-conc-1", "concession", "Concesiones", 45, 50, "concourse-lower", ["akr-gate-1"]),
    ],
    transportOptions: [
      createTransportUpdate("bus", "ruta-akron", "Ruta Estadio Akron", "on-time", 20, 55),
    ],
    parkingLots: [
      createParkingLot("akr-est-1", "Estacionamiento Principal", 3000, 1800, 25, 250, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["elevator"], availableAtNodes: ["akr-conc-1"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("energy-kwh", 22000, 30000),
    ],
  },
  {
    id: "bbva", name: "Estadio BBVA", city: "Monterrey", country: "mexico" as HostCountry, capacity: 53500,
    geoLocation: { latitude: 25.6651, longitude: -100.2446 }, timeZone: "America/Monterrey",
    navigationNodes: [
      createNavNode("bbva-gate-1", "gate", "Gate 1", 50, 10, "ground", ["bbva-conc-1"]),
      createNavNode("bbva-conc-1", "concession", "Food Court", 50, 30, "concourse-lower", ["bbva-gate-1"]),
    ],
    transportOptions: [
      createTransportUpdate("metro", "metrorrey", "Metrorrey Line 2", "on-time", 15, 60),
    ],
    parkingLots: [
      createParkingLot("bbva-lot-1", "Lot 1", 3500, 2000, 20, 200, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["accessible-restroom"], availableAtNodes: ["bbva-conc-1"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("carbon-kg", 18000, 25000),
    ],
  },
  // ── Canada ─────────────────────────────────────────────
  {
    id: "bmo", name: "BMO Field", city: "Toronto", country: "canada" as HostCountry, capacity: 45736,
    geoLocation: { latitude: 43.6332, longitude: -79.4186 }, timeZone: "America/Toronto",
    navigationNodes: [
      createNavNode("bmo-gate-1", "gate", "Gate 1 - East", 80, 50, "ground", ["bmo-conc-1"]),
      createNavNode("bmo-conc-1", "concession", "East Concourse", 65, 50, "concourse-lower", ["bmo-gate-1"]),
    ],
    transportOptions: [
      createTransportUpdate("metro", "ttc-line1", "TTC Line 1 - Exhibition", "on-time", 10, 60),
      createTransportUpdate("bus", "go-transit", "GO Transit Exhibition Bus", "on-time", 20, 45),
    ],
    parkingLots: [
      createParkingLot("bmo-lot-east", "East Parking", 2000, 1200, 35, 300, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["wheelchair-ramp"], availableAtNodes: ["bmo-gate-1"] },
      { ...ACCESSIBILITY_FEATURE_CONFIG["assistive-listening"], availableAtNodes: ["bmo-conc-1"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("waste-diverted-percent", 85, 90),
    ],
  },
  {
    id: "bcplace", name: "BC Place", city: "Vancouver", country: "canada" as HostCountry, capacity: 54500,
    geoLocation: { latitude: 49.2768, longitude: -123.112 }, timeZone: "America/Vancouver",
    navigationNodes: [
      createNavNode("bcp-gate-a", "gate", "Gate A", 30, 50, "ground", ["bcp-conc-1"]),
      createNavNode("bcp-conc-1", "concession", "Level 1 Concourse", 45, 50, "concourse-lower", ["bcp-gate-a"]),
    ],
    transportOptions: [
      createTransportUpdate("metro", "skytrain", "SkyTrain Expo Line - Stadium", "on-time", 3, 70),
    ],
    parkingLots: [
      createParkingLot("bcp-lot-1", "Lot 1 - Rogers Arena", 1500, 900, 40, 350, true),
    ],
    accessibilityFeatures: [
      { ...ACCESSIBILITY_FEATURE_CONFIG["sensory-room"], availableAtNodes: ["bcp-conc-1"] },
    ],
    sustainabilityMetrics: [
      createSustainabilityMetric("energy-kwh", 25000, 35000),
      createSustainabilityMetric("carbon-kg", 15000, 20000),
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 11: Sample Match Schedule Data
// ═══════════════════════════════════════════════════════════════════════════════

export const SAMPLE_MATCHES: readonly MatchEvent[] = [
  { matchId: "m001", homeTeam: "United States", awayTeam: "Brazil", venueId: "metlife", kickoffTime: "2026-06-11T18:00:00-04:00", phase: "pre-match", group: "A", round: "Group Stage" },
  { matchId: "m002", homeTeam: "Mexico", awayTeam: "Germany", venueId: "azteca", kickoffTime: "2026-06-12T12:00:00-06:00", phase: "pre-match", group: "B", round: "Group Stage" },
  { matchId: "m003", homeTeam: "Canada", awayTeam: "France", venueId: "bmo", kickoffTime: "2026-06-12T18:00:00-04:00", phase: "pre-match", group: "C", round: "Group Stage" },
  { matchId: "m004", homeTeam: "Argentina", awayTeam: "Japan", venueId: "sofi", kickoffTime: "2026-06-13T15:00:00-07:00", phase: "pre-match", group: "D", round: "Group Stage" },
  { matchId: "m005", homeTeam: "England", awayTeam: "Spain", venueId: "hardrock", kickoffTime: "2026-06-14T18:00:00-04:00", phase: "pre-match", group: "E", round: "Group Stage" },
  { matchId: "m006", homeTeam: "Portugal", awayTeam: "Netherlands", venueId: "mercedes", kickoffTime: "2026-06-15T15:00:00-04:00", phase: "pre-match", group: "F", round: "Group Stage" },
  { matchId: "m007", homeTeam: "India", awayTeam: "Italy", venueId: "att", kickoffTime: "2026-06-16T18:00:00-05:00", phase: "pre-match", group: "G", round: "Group Stage" },
  { matchId: "m008", homeTeam: "South Korea", awayTeam: "Australia", venueId: "bcplace", kickoffTime: "2026-06-17T15:00:00-07:00", phase: "pre-match", group: "H", round: "Group Stage" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 12: Lookup Utility Functions (Zero Branching)
// ═══════════════════════════════════════════════════════════════════════════════

/** Resolve a venue by ID — direct map lookup, no iteration. */
const VENUE_ID_MAP: Readonly<Record<string, StadiumVenue>> = Object.fromEntries(
  FIFA_2026_VENUES.map((v) => [v.id, v])
);

export function resolveVenueById(venueId: string): StadiumVenue | null {
  return VENUE_ID_MAP[venueId] ?? null;
}

/** Resolve a match by ID — direct map lookup. */
const MATCH_ID_MAP: Readonly<Record<string, MatchEvent>> = Object.fromEntries(
  SAMPLE_MATCHES.map((m) => [m.matchId, m])
);

export function resolveMatchById(matchId: string): MatchEvent | null {
  return MATCH_ID_MAP[matchId] ?? null;
}

/** Resolve venues by country — pre-grouped lookup. */
const VENUES_BY_COUNTRY: Readonly<Record<HostCountry, readonly StadiumVenue[]>> = {
  usa: FIFA_2026_VENUES.filter((v) => v.country === "usa"),
  mexico: FIFA_2026_VENUES.filter((v) => v.country === "mexico"),
  canada: FIFA_2026_VENUES.filter((v) => v.country === "canada"),
};

export function resolveVenuesByCountry(country: HostCountry): readonly StadiumVenue[] {
  return VENUES_BY_COUNTRY[country];
}

/** Resolve a localized label. Falls back to English. */
export function resolveLabel(
  key: string,
  language: SupportedLanguage,
): string {
  const labelSet = UI_LABELS[key];
  return labelSet?.[language] ?? labelSet?.en ?? key;
}
