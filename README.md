# StadiumIQ — FIFA World Cup 2026 Smart Stadiums & Tournament Operations

StadiumIQ is a GenAI-enabled, high-performance web platform built to optimize stadium operations, enhance the tournament experience for fans, organizers, volunteers, and venue staff, and automate real-time decision-making during the **FIFA World Cup 2026**.

**🌐 Live Deployed Application URL:** [https://fifa2026-smart-stadium.vercel.app/stadium](https://fifa2026-smart-stadium.vercel.app/stadium)

## 🏟️ Chosen Vertical
**Challenge 4: Smart Stadiums & Tournament Operations**
Our solution addresses the operational complexities and fan engagement challenges of managing massive crowd flows, real-time safety, multilingual assistance, accessibility routing, dynamic transportation coordination, and sustainability tracking across all **16 host venues** in the US, Mexico, and Canada.

---

## 🚀 Architecture & Core Principles
To comply with strict enterprise standards and prevent regressions, the codebase adheres to three core directives:

1. **Strict Type Safety (`zero-implicit-any`)**:
   - The compiler enforces absolute strict type checking (`strict: true`, `noImplicitAny: true`, `noUnusedLocals: true`, `noUnusedParameters: true`).
   - Every interface, lookup object, and API payload is strictly typed inside [types.ts](file:///d:/PROMPT%20WARS%20VIRTUAL%20PROJECTS/%5BChallenge%204%5D%20Smart%20Stadiums%20&%20Tournament%20Operations/stadium-iq/src/services/stadium/types.ts).

2. **Zero Cyclomatic Complexity Lookup Engine**:
   - Avoids nested `if-else` blocks and `switch` statements.
   - Core decision rules, language mappings, navigation node metadata, crowd density calculations, transport statuses, and emergency actions are resolved using typed `Record` configurations mapped inside [operationMatrix.ts](file:///d:/PROMPT%20WARS%20VIRTUAL%20PROJECTS/%5BChallenge%204%5D%20Smart%20Stadiums%20&%20Tournament%20Operations/stadium-iq/src/services/stadium/operationMatrix.ts).

3. **Modular Isolation**:
   - High degree of separation between the UI presentation views ([src/app/](file:///d:/PROMPT%20WARS%20VIRTUAL%20PROJECTS/%5BChallenge%204%5D%20Smart%20Stadiums%20&%20Tournament%20Operations/stadium-iq/src/app/)), dynamic page components ([src/components/](file:///d:/PROMPT%20WARS%20VIRTUAL%20PROJECTS/%5BChallenge%204%5D%20Smart%20Stadiums%20&%20Tournament%20Operations/stadium-iq/src/components/)), and functional processing/data engines ([src/services/stadium/](file:///d:/PROMPT%20WARS%20VIRTUAL%20PROJECTS/%5BChallenge%204%5D%20Smart%20Stadiums%20&%20Tournament%20Operations/stadium-iq/src/services/stadium/)).

---

## 🛠️ Feature Modules

1. **AI Concierge Chatbot (Gemini-powered)**:
   - Multilingual AI assistant support (English, Spanish, French, Portuguese, Arabic, Hindi, German, Japanese, Korean, Chinese) to handle attendee inquiries dynamically.
2. **Crowd Intelligence**:
   - Real-time crowd density tracking, section-by-section occupancy analysis, queue status, and threshold alerts for security teams.
3. **Smart Navigation & Wayfinding**:
   - Interactive spatial mapping linking gates, concession stands, restrooms, and seat sections with estimated walk times.
4. **Accessibility Hub**:
   - Focused on inclusivity, locating wheelchair-accessible ramps, elevators, sensory-friendly rooms, sign-language interpreters, and service animal areas.
5. **Transportation Optimizer**:
   - Real-time updates on mass transit, shuttle schedules, rideshare availability, and parking lot capacity.
6. **Sustainability Tracker**:
   - Visualizing real-time resource usage (energy, water, solar generation) and waste diversion metrics to maintain green venue goals.
7. **Operations Command Center**:
   - Staff-facing panel tracking medical, security, infrastructure, and crowd-control incidents with severe warning thresholds.

---

## 🔧 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Verification & Validation
Run type checks and lints to ensure a clean codebase:
```bash
# Verify TypeScript Type Safety
npm run build

# Run ESLint validation
npm run lint
```

## ⚙️ How the Solution Works

StadiumIQ coordinates real-time stadium dynamics through a two-layered engine:
1. **GenAI Intent Parser**: Incoming fan or coordinator queries are first analyzed by the local regex dispatcher inside [aiAgent.ts](file:///d:/PROMPT%20WARS%20VIRTUAL%20PROJECTS/%5BChallenge%204%5D%20Smart%20Stadiums%20&%20Tournament%20Operations/stadium-iq/src/services/stadium/aiAgent.ts) to classify intent (e.g., emergency, navigation). If a `GEMINI_API_KEY` is present, it forwards the query to the live Gemini API with a strict **2.5s timeout** wrapper. If the request times out or the key is missing, it instantly falls back to the high-speed offline local rules system.
2. **Deterministic Lookup Pipelines**: All operational calculations—such as spatial wayfinding path generation, carbon savings calculations, crowd occupancy indices, and transportation status—are dispatched via typed configurations in [operationMatrix.ts](file:///d:/PROMPT%20WARS%20VIRTUAL%20PROJECTS/%5BChallenge%204%5D%20Smart%20Stadiums%20&%20Tournament%20Operations/stadium-iq/src/services/stadium/operationMatrix.ts) with **O(1) lookup complexity**, preventing complex nested logical routing.

---

## 🧠 Assumptions Made
- **Real-Time Data Simulators**: Live metrics such as crowd levels, parking availability, transit status, and incident reports are simulated via deterministically randomized data generators aligned with host stadium capacity configurations.
- **Localization**: Localized strings are stored in memory and resolved using standard ISO language tags (`en`, `es`, `fr`, etc.) with English acting as the default fallback.
- **App Directory Routing**: The app assumes Next.js App Router structure where `/` performs a server-side redirect to the `/stadium` dashboard.
