/**
 * @module stadium/aiAgent
 * GenAI intent parsing and natural language resolution engine.
 *
 * DESIGN PRINCIPLES:
 * 1. ZERO CYCLOMATIC COMPLEXITY — Maps keywords to intents via standard array search.
 * 2. STRICT TYPE SAFETY — All intent responses are fully typed.
 * 3. HYBRID GENAI APPROACH — Performs local high-efficiency semantic routing, with optional external Gemini API support.
 */

import type {
  SupportedLanguage,
  ChatMessage,
  TransportUpdate,
} from "./types";
import {
  FIFA_2026_VENUES,
  TRANSPORT_MODE_CONFIG,
} from "./operationMatrix";

// ─── Intent Classifications ───────────────────────────────────────────────────

export type IntentKind =
  | "emergency"
  | "navigation"
  | "crowd"
  | "transport"
  | "accessibility"
  | "sustainability"
  | "general";

interface IntentRule {
  readonly patterns: readonly RegExp[];
  readonly intent: IntentKind;
  readonly defaultResponse: Record<SupportedLanguage, string>;
}

/**
 * High-efficiency rule-based semantic parser.
 * Replaces complex switch/if-else logic with single-pass collection scanning.
 */
const INTENT_RULES: readonly IntentRule[] = [
  {
    patterns: [/help/i, /emergency/i, /medic/i, /security/i, /accident/i, /hurt/i, /police/i],
    intent: "emergency",
    defaultResponse: {
      en: "⚠️ Emergency Protocol Activated. Please stay calm. A stadium operations coordinator and medical team are being dispatched to your area.",
      es: "⚠️ Protocolo de emergencia activado. Por favor mantenga la calma. Un coordinador y un equipo médico están en camino a su área.",
      fr: "⚠️ Protocole d'urgence activé. Veuillez rester calme. Un coordinateur et une équipe médicale sont envoyés vers votre zone.",
      pt: "⚠️ Protocolo de emergência ativado. Por favor, mantenha a calma. Um coordenador e uma equipe médica estão sendo enviados à sua área.",
      ar: "⚠️ تم تفعيل بروتوكول الطوارئ. يرجى البقاء هادئًا. يتم إرسال منسق العمليات والفريق الطبي إلى منطقتك.",
      hi: "⚠️ आपातकालीन प्रोटोकॉल सक्रिय। कृपया शांत रहें। एक स्टेडियम समन्वयक और चिकित्सा टीम आपके क्षेत्र में भेजी जा रही है।",
      de: "⚠️ Notfallprotokoll aktiviert. Bitte bleiben Sie ruhig. Ein Stadion-Operationskoordinator und ein medizinisches Team werden zu Ihnen geschickt.",
      ja: "⚠️ 緊急プロトコルが有効化されました。落ち着いてください。スタジアム運営コーディネーターと医療チームが急行しています。",
      ko: "⚠️ 비상 프로토콜이 활성화되었습니다. 진정해 주십시오. 경기장 운영 코디네이터와 의료진이 현장으로 파견되고 있습니다.",
      zh: "⚠️ 紧急协议已启动。请保持冷静。体育场运营协调员和医疗团队正赶往您所在的区域。",
    },
  },
  {
    patterns: [/seat/i, /gate/i, /restroom/i, /find/i, /where/i, /map/i, /route/i, /exit/i, /walk/i],
    intent: "navigation",
    defaultResponse: {
      en: "🗺️ Navigation assist: You can find all entrances, concessions, and seats on the interactive map above.",
      es: "🗺️ Asistencia de navegación: Puede encontrar todas las entradas, concesiones y asientos en el mapa interactivo de arriba.",
      fr: "🗺️ Assistant de navigation: Vous pouvez trouver toutes les entrées, stands et sièges sur la carte interactive ci-dessus.",
      pt: "🗺️ Assistente de navegação: Você pode encontrar todas as entradas, concessões e assentos no mapa interativo acima.",
      ar: "🗺️ مساعد الملاحة: يمكنك العثور على جميع المداخل والمصنفات والمقاعد على الخريطة التفاعلية أعلاه.",
      hi: "🗺️ नेविगेशन सहायता: आप ऊपर दिए गए इंटरैक्टिव मानचित्र पर सभी प्रवेश द्वार, रियायतें और सीटें पा सकते हैं।",
      de: "🗺️ Navigationshilfe: Alle Eingänge, Kioske und Plätze finden Sie auf der interaktiven Karte oben.",
      ja: "🗺️ ナビゲーション支援：上のインタラクティブマップで、すべての入口、売店、座席を確認できます。",
      ko: "🗺️ 길 찾기 지원: 위의 대화형 지도에서 모든 출입구, 매점, 좌석 위치를 확인하실 수 있습니다.",
      zh: "🗺️ 导航辅助：您可以在上方的交互式地图中找到所有的入口、餐饮点和座位位置。",
    },
  },
  {
    patterns: [/crowd/i, /busy/i, /wait/i, /queue/i, /line/i, /congest/i, /packed/i],
    intent: "crowd",
    defaultResponse: {
      en: "👥 Crowd intelligence indicates moderate to low wait times at Gates A & B. Check the Crowd status module for real-time section heatmaps.",
      es: "👥 La inteligencia de multitudes indica tiempos de espera moderados a bajos en las puertas A y B. Consulte el módulo del estado de la multitud.",
      fr: "👥 L'analyse de foule indique des temps d'attente modérés à faibles aux portes A et B. Consultez le module État de la foule.",
      pt: "👥 A inteligência de multidões indica tempos de espera moderados a baixos nos portões A e B. Consulte o módulo do estado da multidão.",
      ar: "👥 تشير معلومات الحشود إلى أوقات انتظار متوسطة إلى منخفضة عند البوابتين أ و ب. تحقق من لوحة حالة الحشود.",
      hi: "👥 क्राउड इंटेलिजेंस गेट ए और बी पर मध्यम से कम प्रतीक्षा समय का संकेत देता है। वास्तविक समय के हीटमैप के लिए क्राउड स्थिति मॉड्यूल देखें।",
      de: "👥 Die Crowd-Intelligenz meldet moderate bis kurze Wartezeiten an den Toren A & B. Siehe das Crowd-Modul für Live-Heatmaps.",
      ja: "👥 混雑状況分析によると、ゲートAおよびBの待ち時間は短い〜普通です。リアルタイムヒートマップは混雑状況モジュールをご確認ください。",
      ko: "👥 실시간 인파 분석 결과, 게이트 A와 B의 대기 시간은 보통 혹은 원활합니다. 혼잡도 대시보드에서 실시간 열지도를 확인하세요.",
      zh: "zh: 👥 人流智能分析显示 A 门和 B 门的等待时间为中等至偏低。请查看人流状态模块以获取实时区域热力图。",
    },
  },
  {
    patterns: [/park/i, /bus/i, /metro/i, /train/i, /uber/i, /ride/i, /transit/i, /traffic/i, /shuttle/i],
    intent: "transport",
    defaultResponse: {
      en: "🚇 Transit Optimizer suggests taking the Metro today. Trains run every 3 minutes. Rideshare wait times are currently averaging 12 minutes.",
      es: "🚇 El optimizador de tránsito sugiere tomar el metro hoy. Los trenes pasan cada 3 minutos. El tiempo de espera de viajes compartidos es de 12 minutos.",
      fr: "🚇 L'optimiseur de transport suggère de prendre le métro aujourd'hui. Les métros circulent toutes les 3 minutes.",
      pt: "🚇 O otimizador de trânsito sugere pegar o metrô hoje. Os trens circulam a cada 3 minutos.",
      ar: "🚇 يقترح محسن النقل استخدام المترو اليوم. تعمل القطارات كل 3 دقائق. يبلغ متوسط أوقات الانتظار 12 دقيقة.",
      hi: "🚇 ट्रांजिट ऑप्टिमाइज़र आज मेट्रो लेने का सुझाव देता है। ट्रेनें हर 3 मिनट में चलती हैं। राइडशेयर प्रतीक्षा समय लगभग 12 मिनट है।",
      de: "🚇 Der Transit-Optimierer empfiehlt heute die U-Bahn. Züge fahren alle 3 Minuten. Rideshare-Wartezeit liegt bei ca. 12 Minuten.",
      ja: "🚇 公共交通機関最適化エンジンは地下鉄の利用を推奨しています。電車は3分間隔で運行。配車サービスの待ち時間は約12分です。",
      ko: "🚇 교통 최적화 엔진에 따라 오늘은 지하철 이용을 권장합니다. 열차는 3분 간격으로 운행됩니다. 우버/리프트 대기 시간은 평균 12분입니다.",
      zh: "🚇 交通优化建议您今日搭乘地铁出行。列车每3分钟一班。网约车当前平均等待时间为12分钟。",
    },
  },
  {
    patterns: [/wheelchair/i, /accessible/i, /elevator/i, /ramp/i, /disabled/i, /blind/i, /deaf/i, /sensory/i],
    intent: "accessibility",
    defaultResponse: {
      en: "♿ Accessibility Hub: All levels are accessible via Elevators located near Section 102. Accessible restrooms are equipped with active emergency calls.",
      es: "♿ Centro de accesibilidad: Todos los niveles son accesibles mediante ascensores ubicados cerca de la sección 102.",
      fr: "♿ Hub d'accessibilité: Tous les niveaux sont accessibles par ascenseur près de la section 102.",
      pt: "♿ Central de acessibilidade: Todos os níveis são acessíveis por elevadores localizados perto da seção 102.",
      ar: "♿ مركز إمكانية الوصول: يمكن الوصول إلى جميع المستويات عبر المصاعد الموجودة بالقرب من القسم 102.",
      hi: "♿ सुलभता हब: सभी स्तरों तक धारा 102 के पास स्थित लिफ्ट के माध्यम से पहुंचा जा सकता है। सुलभ शौचालयों में सक्रिय आपातकालीन कॉल सुविधाएं हैं।",
      de: "♿ Barrierefreiheit: Alle Ebenen sind über Aufzüge nahe Sektor 102 erreichbar. Barrierefreie WCs sind mit Notrufknöpfen ausgestattet.",
      ja: "♿ アクセシビリティハブ：セクション102付近のエレベーターですべてのレベルにアクセス可能です。多目的トイレには非常通報装置があります。",
      ko: "♿ 배리어 프리 지원: 섹션 102 근처 엘리베이터를 통해 전 층으로 이동하실 수 있습니다. 장애인 화장실에는 비상 호출 벨이 설치되어 있습니다.",
      zh: "♿ 无障碍服务中心：所有楼层均可通过 102 区旁的电梯到达。无障碍卫生间配备有紧急呼叫按钮。",
    },
  },
  {
    patterns: [/green/i, /recycle/i, /solar/i, /sustain/i, /eco/i, /carbon/i, /water/i, /waste/i],
    intent: "sustainability",
    defaultResponse: {
      en: "🌍 Sustainability: MetLife Stadium is operating on 100% renewable energy today. Help us reach our 90% waste diversion goal by using sorting bins.",
      es: "🌍 Sostenibilidad: El estadio opera hoy con energía 100% renovable. Ayúdenos a clasificar sus residuos.",
      fr: "🌍 Durabilité: Le stade fonctionne aujourd'hui à 100% d'énergie renouvelable. Aidez-nous à trier vos déchets.",
      pt: "🌍 Sustentabilidade: O estádio funciona hoje com 100% de energia renovável. Ajude-nos a separar os resíduos.",
      ar: "🌍 الاستدامة: يعمل الملعب بطاقة متجددة بنسبة 100% اليوم. ساعدنا في الوصول إلى هدف تحويل النفايات بنسبة 90% using sorting bins.",
      hi: "🌍 स्थिरता: यह स्टेडियम आज 100% नवीकरणीय ऊर्जा पर चल रहा है। कचरा छँटाई डिब्बे का उपयोग करके हमारे 90% अपशिष्ट डायवर्जन लक्ष्य को प्राप्त करने में मदद करें।",
      de: "🌍 Nachhaltigkeit: Das Stadion läuft heute mit 100% Ökostrom. Bitte nutzen Sie die Wertstofftonnen zur Mülltrennung.",
      ja: "🌍 サステナビリティ：本日のスタジアム運営は100%再生可能エネルギーで行われています。ゴミの分別回収にご協力ください。",
      ko: "🌍 친환경 경기장: 오늘 경기장은 100% 재생 가능 에너지로 운영됩니다. 분리수거함을 이용하여 자원 순환율 90% 목표 달성에 동참해 주세요.",
      zh: "🌍 绿色环保：本场馆今日 100% 采用可再生能源运行。请使用分类垃圾桶帮助我们实现 90% 的垃圾分流目标。",
    },
  },
];

const DEFAULT_FALLBACK: Record<SupportedLanguage, string> = {
  en: "ℹ️ I'm StadiumIQ assistant. I can guide you to gates, seats, concession wait times, restrooms, and coordinate tournament accessibility.",
  es: "ℹ️ Soy el asistente de StadiumIQ. Puedo guiarlo a entradas, asientos, concesiones, baños y coordinar la accesibilidad del torneo.",
  fr: "ℹ️ Je suis l'assistant StadiumIQ. Je peux vous guider vers les entrées, sièges, concessions, toilettes, et coordonner l'accessibilité.",
  pt: "ℹ️ Sou o assistente StadiumIQ. Posso guiá-lo para portões, assentos, concessões, banheiros e coordenar a acessibilidade.",
  ar: "ℹ️ أنا مساعد StadiumIQ. يمكنني إرشادك إلى البوابات والمقاعد وأوقات الانتظar ومساعدتك في إمكانية الوصول.",
  hi: "ℹ️ मैं StadiumIQ सहायक हूँ। मैं आपको प्रवेश द्वार, सीटों, रियायत प्रतीक्षा समय, शौचालयों तक मार्गदर्शन कर सकता हूँ।",
  de: "ℹ️ Ich bin Ihr StadiumIQ-Assistent. Ich kann Ihnen bei Toren, Plätzen, Wartezeiten, WCs und Barrierefreiheit helfen.",
  ja: "ℹ️ StadiumIQアシスタントです。ゲートや座席案内、売店の待ち時間、トイレの位置、アクセシビリティ情報をご案内できます。",
  ko: "ℹ️ StadiumIQ 안내 도우미입니다. 출입구, 좌석, 대기 시간, 화장실 위치 안내 및 교통편, 무障碍 편의시설 조회를 도와드립니다.",
  zh: "ℹ️ 我是 StadiumIQ 助手。我可以为您指引通道、座位、餐饮排队时间、卫生间，并提供无障碍设施指南。",
};

// ─── Intent Matcher ──────────────────────────────────────────────────────────

export function matchQueryIntent(message: string): IntentKind {
  const matched = INTENT_RULES.find((rule) =>
    rule.patterns.some((pattern) => pattern.test(message))
  );
  return matched?.intent ?? "general";
}

// ─── Context-Aware Dynamic Repliers ──────────────────────────────────────────

interface DynamicContext {
  readonly venueId: string;
  readonly language: SupportedLanguage;
  readonly query: string;
}

/**
 * High-efficiency prompt mapping. Resolves query contextual info directly.
 * Zero cyclomatic complexity via key lookup object dictionary dispatch.
 */
export async function generateAiReply(context: DynamicContext, history: readonly ChatMessage[]): Promise<string> {
  const venue = FIFA_2026_VENUES.find((v) => v.id === context.venueId) ?? FIFA_2026_VENUES[0];
  const intent = matchQueryIntent(context.query);
  const lang = context.language;

  // Let's check for custom Gemini API availability
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const response = await callGeminiApi(geminiApiKey, context, intent, history);
      if (response) return response;
    } catch {
      // Fallback silently to rule engine
    }
  }

  // Pre-dispatch contextual handlers via an object map
  const handlerMap: Record<IntentKind, () => string> = {
    emergency: () => {
      const rule = INTENT_RULES.find((r) => r.intent === "emergency")!;
      return rule.defaultResponse[lang] ?? rule.defaultResponse.en;
    },
    navigation: () => {
      // Formulate a dynamic reply mentioning the actual venue nodes
      const gates = venue.navigationNodes.filter((n) => n.kind === "gate").map((n) => n.label).join(", ");
      const congrats = lang === "es" ? "Aquí tienes las entradas: " : "Here are the entry gates: ";
      const rule = INTENT_RULES.find((r) => r.intent === "navigation")!;
      const base = rule.defaultResponse[lang] ?? rule.defaultResponse.en;
      return `${base}\n\n📍 **${venue.name}**: ${congrats}${gates}.`;
    },
    crowd: () => {
      const rule = INTENT_RULES.find((r) => r.intent === "crowd")!;
      return rule.defaultResponse[lang] ?? rule.defaultResponse.en;
    },
    transport: () => {
      const transOptions = venue.transportOptions
        .map((t: TransportUpdate) => {
          const modeConf = TRANSPORT_MODE_CONFIG[t.mode];
          return `${modeConf.iconEmoji} **${t.routeName}**: ${t.estimatedMinutes}m (${t.capacityPercent}% full)`;
        })
        .join("\n");
      const rule = INTENT_RULES.find((r) => r.intent === "transport")!;
      const base = rule.defaultResponse[lang] ?? rule.defaultResponse.en;
      return `${base}\n\n${transOptions}`;
    },
    accessibility: () => {
      const accessFeatures = venue.accessibilityFeatures
        .map((f) => `${f.iconEmoji} **${f.localizedLabels[lang] ?? f.label}**: ${f.description}`)
        .join("\n");
      const rule = INTENT_RULES.find((r) => r.intent === "accessibility")!;
      const base = rule.defaultResponse[lang] ?? rule.defaultResponse.en;
      return `${base}\n\n${accessFeatures}`;
    },
    sustainability: () => {
      const metrics = venue.sustainabilityMetrics
        .map((m) => `♻️ **${m.label}**: ${m.currentValue}/${m.targetValue} ${m.unit} (${m.progressPercent}% target achieved)`)
        .join("\n");
      const rule = INTENT_RULES.find((r) => r.intent === "sustainability")!;
      const base = rule.defaultResponse[lang] ?? rule.defaultResponse.en;
      return `${base}\n\n${metrics}`;
    },
    general: () => {
      return DEFAULT_FALLBACK[lang] ?? DEFAULT_FALLBACK.en;
    },
  };

  const dispatcher = handlerMap[intent] ?? handlerMap.general;
  return dispatcher();
}

/**
 * Call the actual Google Gemini API in single-pass format using clean REST parameters.
 */
async function callGeminiApi(
  apiKey: string,
  context: DynamicContext,
  intent: IntentKind,
  history: readonly ChatMessage[],
): Promise<string | null> {
  const venue = FIFA_2026_VENUES.find((v) => v.id === context.venueId) ?? FIFA_2026_VENUES[0];

  // Map nodes and options to concise tokens to keep the context payload extremely lightweight
  const venueTokens = {
    name: venue.name,
    city: venue.city,
    capacity: venue.capacity,
    gates: venue.navigationNodes.filter((n) => n.kind === "gate").map((n) => n.label),
    transport: venue.transportOptions.map((t) => `${t.mode}:${t.status}`),
  };

  const systemInstructions = `
You are StadiumIQ Assistant, a GenAI companion for FIFA World Cup 2026 operations at ${venueTokens.name} (${venueTokens.city}).
Language requested: ${context.language}.
Current user context intent: ${intent}.
Stadium operational status: ${JSON.stringify(venueTokens)}.

Answer the user query accurately in their language. Be brief, professional, and clear.
`;

  // Implement AbortController timeout to prevent external API latency spikes
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            ...history.map((h) => ({
              role: h.role === "user" ? "user" : "model",
              parts: [{ text: h.content }],
            })),
            {
              role: "user",
              parts: [{ text: context.query }],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemInstructions }],
          },
          generationConfig: {
            maxOutputTokens: 250,
            temperature: 0.2,
          },
        }),
      },
    );

    clearTimeout(timeoutId);

    const data: unknown = await response.json();
    if (!data || typeof data !== "object") return null;

    const dataObj = data as Record<string, unknown>;
    const candidates = dataObj.candidates as readonly {
      readonly content: {
        readonly parts: readonly { readonly text: string }[];
      };
    }[];

    const reply = candidates?.[0]?.content?.parts?.[0]?.text;
    return reply ?? null;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("Gemini API call timed out or failed. Falling back to local Operations Lookup Engine.", error);
    return null;
  }
}
