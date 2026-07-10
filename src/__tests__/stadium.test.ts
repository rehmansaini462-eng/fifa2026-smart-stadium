import test from "node:test";
import assert from "node:assert";
import { matchQueryIntent, generateAiReply } from "../services/stadium/aiAgent";
import { resolveVenueById, resolveCrowdDensity } from "../services/stadium/operationMatrix";

test("StadiumIQ - Operation Matrix Lookups", () => {
  // Test resolveVenueById
  const metlife = resolveVenueById("metlife");
  assert.ok(metlife, "MetLife stadium should be found");
  assert.strictEqual(metlife?.name, "MetLife Stadium");

  // Test resolveCrowdDensity
  assert.strictEqual(resolveCrowdDensity(5), "empty");
  assert.strictEqual(resolveCrowdDensity(30), "low");
  assert.strictEqual(resolveCrowdDensity(60), "moderate");
  assert.strictEqual(resolveCrowdDensity(80), "high");
  assert.strictEqual(resolveCrowdDensity(95), "critical");
});

test("StadiumIQ - AI Agent Intent Matching", () => {
  assert.strictEqual(matchQueryIntent("We need medical assistance now!"), "emergency");
  assert.strictEqual(matchQueryIntent("Where is Gate A and my seat?"), "navigation");
  assert.strictEqual(matchQueryIntent("Is Section 102 crowded or busy?"), "crowd");
  assert.strictEqual(matchQueryIntent("Should I take the metro or bus?"), "transport");
  assert.strictEqual(matchQueryIntent("Where is the elevator or wheelchair ramp?"), "accessibility");
  assert.strictEqual(matchQueryIntent("Tell me about carbon emissions and recycling"), "sustainability");
  assert.strictEqual(matchQueryIntent("Hello there!"), "general");
});

test("StadiumIQ - AI Agent Caching Layer", async () => {
  const context = {
    venueId: "metlife",
    language: "en" as const,
    query: "Where is the restroom?",
  };

  const reply1 = await generateAiReply(context, []);

  const startCached = Date.now();
  const reply2 = await generateAiReply(context, []);
  const duration2 = Date.now() - startCached;

  assert.strictEqual(reply1, reply2, "Cached reply should be identical");
  assert.ok(duration2 < 15, "Cached query should resolve from memory instantly");
});

test("StadiumIQ - AI Agent Gemini API Fallback on Timeout", async () => {
  // Mock fetch to simulate latency exceeding 2.5s
  const originalFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = "test-mock-key";

  globalThis.fetch = async (url, options) => {
    // Check if it's the Gemini endpoint
    if (typeof url === "string" && url.includes("generativelanguage.googleapis.com")) {
      return new Promise((resolve, reject) => {
        const signal = options?.signal;
        const timer = setTimeout(() => {
          resolve(new Response(JSON.stringify({
            candidates: [{ content: { parts: [{ text: "Gemini Success!" }] } }]
          })));
        }, 3000); // 3 seconds latency (exceeds 2.5s abort limit)

        if (signal) {
          signal.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(new DOMException("The user aborted a request.", "AbortError"));
          });
        }
      });
    }
    return originalFetch(url, options);
  };

  const context = {
    venueId: "metlife",
    language: "en" as const,
    query: "security help emergency",
  };

  const reply = await generateAiReply(context, []);
  assert.ok(reply.includes("Emergency Protocol Activated"), "Should fall back to rules default response when Gemini times out");

  // Restore global state
  globalThis.fetch = originalFetch;
  delete process.env.GEMINI_API_KEY;
});

test("StadiumIQ - AI Agent Gemini API Success", async () => {
  const originalFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = "test-mock-key";

  globalThis.fetch = async (url, options) => {
    if (typeof url === "string" && url.includes("generativelanguage.googleapis.com")) {
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: "Gemini Success!" }] } }]
      }));
    }
    return originalFetch(url, options);
  };

  const context = {
    venueId: "metlife",
    language: "en" as const,
    query: "Give me recommendations",
  };

  // We append history count to bypass previous cache
  const reply = await generateAiReply(context, [{ role: "user", content: "hi", timestamp: new Date().toISOString() }]);
  assert.strictEqual(reply, "Gemini Success!");

  globalThis.fetch = originalFetch;
  delete process.env.GEMINI_API_KEY;
});
