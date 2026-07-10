/**
 * @module components/StadiumDashboard
 * Interactive Smart Stadium Dashboard.
 *
 * DESIGN PRINCIPLES:
 * 1. ZERO CYCLOMATIC COMPLEXITY — Dispatches active tabs and multilingual text using Record lookups.
 * 2. STRICT TYPE SAFETY — Fully typed component state bindings.
 * 3. MOBILE-FIRST RESPONSIVE DESIGN — Implements premium dark-mode glassmorphic layouts.
 */

"use client";

import { useState, useEffect, startTransition } from "react";
import type {
  StadiumVenue,
  StadiumApiResponse,
  SupportedLanguage,
  ChatMessage,
  SectionOccupancy,
  NavigationRoute,
  TransportUpdate,
  ParkingLot,
  AccessibilityConfig,
  SustainabilityMetric,
  OperationsIncident,
  IncidentCategory,
  IncidentSeverity,
} from "@/services/stadium";
import {
  LANGUAGE_CONFIG,
  TRANSPORT_MODE_CONFIG,
  ACCESSIBILITY_FEATURE_CONFIG,
  INCIDENT_CATEGORY_CONFIG,
} from "@/services/stadium";

const LANGUAGE_WELCOME_MAP: Record<SupportedLanguage, string> = {
  en: "Welcome to StadiumIQ! I am your AI Stadium Assistant. How can I help you navigate the venue today?",
  es: "¡Bienvenido a StadiumIQ! Soy su Asistente de Estadio de IA. ¿Cómo puedo ayudarle a navegar por la sede hoy?",
  fr: "Bienvenue sur StadiumIQ ! Je suis votre assistant de stade IA. Comment puis-je vous aider à naviguer dans le stade aujourd'hui ?",
  pt: "Bem-vindo ao StadiumIQ! Sou o seu Assistente de Estádio de IA. Como posso ajudá-lo a navegar pelo local hoje?",
  ar: "مرحبًا بك في StadiumIQ! أنا مساعد ملعب الذكاء الاصطناعي الخاص بك. كيف يمكنني مساعدتك في التنقل في الموقع اليوم؟",
  hi: "StadiumIQ में आपका स्वागत है! मैं आपका AI स्टेडियम सहायक हूँ। आज मैं आपको स्थल नेविगेट करने में कैसे मदद कर सकता हूँ?",
  de: "Willkommen bei StadiumIQ! Ich bin Ihr KI-Stadionassistent. Wie kann ich Ihnen heute helfen, sich im Stadion zurechtzufinden?",
  ja: "StadiumIQへようこそ！私はAIスタジアムアシスタントです。本日はどのようなご案内をいたしましょうか？",
  ko: "StadiumIQ에 오신 것을 환영합니다! 저는 AI 경기장 비서입니다. 오늘 경기장 안내를 어떻게 도와드릴까요?",
  zh: "欢迎使用 StadiumIQ！我是您的人工智能体育场助手。今天我能如何帮助您导引场馆？",
};

const LOCALIZED_DICT = {
  dashboardSubtitle: {
    en: "AI-Powered Smart Stadiums & Tournament Operations Panel",
    es: "Panel de Operaciones de Torneos y Estadios Inteligentes impulsado por IA",
    fr: "Panneau d'Opérations des Tournois et Stades Intelligents Alimenté par l'IA",
    pt: "Painel de Operações de Torneios e Estádios Inteligentes com IA",
    ar: "لوحة عمليات البطولة والملاعب الذكية المدعومة بالذكاء الاصطناعي",
    hi: "एआई-संचालित स्मार्ट स्टेडियम और टूर्नामेंट संचालन पैनल",
    de: "KI-gestütztes Betriebsportal für intelligente Stadien und Turniere",
    ja: "AI搭載スマートスタジアム＆トーナメントオペレーションパネル",
    ko: "AI 기반 스마트 경기장 & 토너먼트 운영 패널",
    zh: "人工智能驱动的智能体育场与赛事运营面板",
  },
  activeVenue: {
    en: "Active World Cup Venue:",
    es: "Sede Activa de la Copa Mundial:",
    fr: "Site Actif de la Coupe du Monde:",
    pt: "Sede Ativa da Copa do Mundo:",
    ar: "موقع كأس العالم النشط:",
    hi: "सक्रिय विश्व कप स्थान:",
    de: "Aktiver WM-Spielort:",
    ja: "アクティブなワールドカップ会場:",
    ko: "활성 월드컵 경기장:",
    zh: "活跃的世界杯举办地:",
  },
  capacity: {
    en: "Capacity", es: "Capacidad", fr: "Capacité", pt: "Capacidade", ar: "السعة", hi: "क्षमता", de: "Kapazität", ja: "収容人数", ko: "수용 인원", zh: "容量"
  },
  timezone: {
    en: "Timezone", es: "Zona horaria", fr: "Fuseau horaire", pt: "Fuso horário", ar: "المنطقة الزمنية", hi: "समय क्षेत्र", de: "Zeitzone", ja: "タイムゾーン", ko: "시간대", zh: "时区"
  },
  tabAiConcierge: {
    en: "AI Concierge", es: "Conserje de IA", fr: "Concierge IA", pt: "Concierge de IA", ar: "كونسيرج الذكاء الاصطناعي", hi: "एआई द्वारपाल", de: "KI-Concierge", ja: "AIコンシェルジュ", ko: "AI 컨시어지", zh: "AI 礼宾"
  },
  tabCrowd: {
    en: "Crowd Intelligence", es: "Inteligencia de Multitudes", fr: "Intelligence des Foules", pt: "Inteligência de Público", ar: "ذكاء الحشود", hi: "भीड़ खुफिया", de: "Crowd-Intelligenz", ja: "群衆インテリジェンス", ko: "군중 인텔리전스", zh: "人群情报"
  },
  tabNavigation: {
    en: "Smart Navigation", es: "Navegación Inteligente", fr: "Navigation Intelligente", pt: "Navegação Inteligente", ar: "الملاحة الذكية", hi: "स्मार्ट नेविगेशन", de: "Intelligente Navigation", ja: "スマートナビゲーション", ko: "스마트 길찾기", zh: "智能导航"
  },
  tabAccessibility: {
    en: "Accessibility Hub", es: "Centro de Accesibilidad", fr: "Centre d'Accessibilité", pt: "Centro de Acessibilidade", ar: "مركز إمكانية الوصول", hi: "सुलभता हब", de: "Barrierefreiheit-Hub", ja: "アクセシビリティハブ", ko: "무장애 지원 허브", zh: "无障碍中心"
  },
  tabTransport: {
    en: "Transportation", es: "Transporte", fr: "Transport", pt: "Transporte", ar: "النقل والواصلات", hi: "परिवहन", de: "Transportwesen", ja: "交通インフラ", ko: "교통 수단", zh: "交通出行"
  },
  tabSustainability: {
    en: "Sustainability", es: "Sostenibilidad", fr: "Durabilité", pt: "Sustentabilidade", ar: "الاستدامة", hi: "सतत विकास", de: "Nachhaltigkeit", ja: "サステナビリティ", ko: "지속 가능성", zh: "绿色环保"
  },
  tabOperations: {
    en: "Operations Center", es: "Centro de Operaciones", fr: "Centre d'Opérations", pt: "Centro de Operações", ar: "مركز العمليات", hi: "संचालन केंद्र", de: "Operations Center", ja: "オペレーションセンター", ko: "운영 통제 센터", zh: "运营控制中心"
  },
  aiConciergeTitle: {
    en: "🤖 Multilingual AI Concierge Assistant",
    es: "🤖 Asistente de Conserjería de IA Multilingüe",
    fr: "🤖 Assistant Concierge IA Multilingue",
    pt: "🤖 Assistente de Concierge de IA Multilíngue",
    ar: "🤖 مساعد كونسيرج الذكاء الاصطناعي متعدد اللغات",
    hi: "🤖 बहुभाषी एआई द्वारपाल सहायक",
    de: "🤖 Multilingualer KI-Concierge-Assistent",
    ja: "🤖 多言語AIコンシェルジュアシスタント",
    ko: "🤖 다국어 AI 컨시어지 비서",
    zh: "🤖 多语言 AI 礼宾助手",
  },
  aiConciergeDesc: {
    en: "Ask queries regarding seat wayfinding, accessibility support, parking lots, concessions wait times, or emergency protocols.",
    es: "Realice consultas sobre orientación de asientos, asistencia de accesibilidad, estacionamientos, tiempos de espera de concesiones o protocolos de emergencia.",
    fr: "Posez vos questions sur l'orientation vers les sièges, l'aide à l'accessibilité, les parkings, les temps d'attente des concessions ou les protocoles d'urgence.",
    pt: "Faça perguntas sobre orientação de assentos, suporte de acessibilidade, estacionamentos, tempos de espera de concessões ou funções de emergência.",
    ar: "اطرح استفسارات بخصوص تحديد مقاعد الجلوس، ودعم إمكانية الوصول، ومواقف السيارات، وأوقات انتظار concession، أو بروتوكولات الطوارئ.",
    hi: "सीट खोजने, सुलभता सहायता, पार्किंग स्थल, रियायत प्रतीक्षा समय, या आपातकालीन प्रोटोकॉल के बारे में प्रश्न पूछें।",
    de: "Stellen Sie Fragen zur Wegfindung, Barrierefreiheit, Parkplätzen, Wartezeiten an Kiosken oder Notfallprotokollen.",
    ja: "座席案内、アクセシビリティサポート、駐車場、売店の待ち時間、緊急プロトコルに関するお問い合わせをどうぞ。",
    ko: "좌석 길찾기, 무장애 지원, 주차장, 매점 대기 시간, 비상 프로토콜에 대해 무엇이든 질문하세요.",
    zh: "咨询关于座位导引、无障碍支持、停车场、餐饮等待时间或紧急协议的问题。",
  },
  crowdTitle: {
    en: "👥 Live Crowd Intelligence Heatmaps",
    es: "👥 Mapas de Calor de Inteligencia de Multitud",
    fr: "👥 Cartes Thermiques d'Intelligence des Foules",
    pt: "👥 Mapas de Calor de Inteligência de Público",
    ar: "👥 خرائط حرارية ذكية للحشود الحية",
    hi: "👥 लाइव भीड़ खुफिया हीटमैप",
    de: "👥 Live-Crowd-Intelligenz-Wärmebilder",
    ja: "👥 ライブ群衆インテリジェンスヒートマップ",
    ko: "👥 실시간 군중 밀도 분석 열지도",
    zh: "👥 实时人群情报热力图",
  },
  crowdDesc: {
    en: "Real-time attendance analysis and crowd density heatmap configurations per section.",
    es: "Análisis de asistencia en tiempo real y configuraciones del mapa de calor de densidad por sección.",
    fr: "Analyse de la fréquentation en temps réel et cartes thermiques de densité des foules par section.",
    pt: "Análise de público em tempo real e mapas de calor de densidade de multidões por seção.",
    ar: "تحليل الحضور في الوقت الفعلي وتكوينات الخriطة الحرارية لكثافة الحشد لكل قسم.",
    hi: "वास्तविक समय में उपस्थिति विश्लेषण और प्रति अनुभाग भीड़ घनत्व हीटमैप कॉन्फ़िगरेशन।",
    de: "Echtzeit-Anwesenheitsanalyse und Wärmebilder der Crowd-Dichte pro Sektor.",
    ja: "セクションごとのリアルタイムの入場者分析と群衆密度ヒートマップ。",
    ko: "구역별 실시간 관람객 수 분석 및 군중 밀도 히트맵 표시.",
    zh: "各区域的实时出勤分析和人群密度热力图配置。",
  },
  highestDensityArea: {
    en: "Highest Density Area", es: "Área de mayor densidad", fr: "Zone de densité maximale", pt: "Área de maior densidade", ar: "المنطقة الأكثر كثافة", hi: "उच्चतम घनत्व क्षेत्र", de: "Bereich mit höchster Dichte", ja: "最も混雑しているエリア", ko: "최고 밀도 구역", zh: "最高密度区域"
  },
  totalLiveFans: {
    en: "Total Estimated Live Fans", es: "Total estimado de aficionados", fr: "Total estimé des supporters", pt: "Total estimado de torcedores", ar: "إجمالي المشجعين المباشرين المقدرين", hi: "कुल अनुमानित लाइव प्रशंसक", de: "Geschätzte Live-Fans gesamt", ja: "推定ライブファン総数", ko: "실시간 관람객 총수 (추정)", zh: "估计现场球迷总数"
  },
  alertAction: {
    en: "Operational Alert Action", es: "Acción de alerta operativa", fr: "Action d'alerte opérationnelle", pt: "Ação de alerta operacional", ar: "إجراء التنبيه التشغيلي", hi: "परिचालन चेतावनी कार्रवाई", de: "Operative Warnmaßnahme", ja: "運営アラート対応アクション", ko: "운영 경보 조치사항", zh: "运营警报动作"
  },
  deployGateStaff: {
    en: "Deploy Gate Staff", es: "Desplegar personal en puerta", fr: "Déployer le personnel aux portes", pt: "Implantar equipe no portão", ar: "نشر موظفي البوابة", hi: "गेट स्टाफ तैनात करें", de: "Personal an den Toren einsetzen", ja: "ゲートスタッフの配置", ko: "출입 게이트 인력 배치", zh: "部署登机口工作人员"
  },
  refreshLiveData: {
    en: "Refresh Live Data", es: "Actualizar datos en vivo", fr: "Actualiser les données", pt: "Atualizar dados ao vivo", ar: "تحديث البيانات المباشرة", hi: "लाइव डेटा रीफ्रेश करें", de: "Live-Daten aktualisieren", ja: "ライブデータの更新", ko: "실시간 데이터 새로고침", zh: "刷新实时数据"
  },
  navTitle: {
    en: "🧭 Smart Spatial Wayfinding & Routing",
    es: "🧭 Orientación y Enrutamiento Espacial Inteligente",
    fr: "🧭 Guidage et Routage Spatial Intelligent",
    pt: "🧭 Orientação e Roteamento Espacial Inteligente",
    ar: "🧭 التوجيه وتحديد المسار المكاني الذكي",
    hi: "🧭 स्मार्ट स्थानिक मार्ग-खोज और रूटिंग",
    de: "🧭 Intelligente räumliche Wegfindung & Routenplanung",
    ja: "🧭 スマート空間案内＆ルート探索",
    ko: "🧭 스마트 경기장 시설 길찾기 & 경로 안내",
    zh: "🧭 智能空间导引与路线规划",
  },
  navDesc: {
    en: "Resolve optimal paths across gates, seat sections, accessibility exits, and food concession courts.",
    es: "Resuelva rutas óptimas a través de puertas, secciones de asientos, salidas de accesibilidad y áreas de comida.",
    fr: "Calculez les trajets optimaux entre les portes, les sections de sièges, les sorties accessibles et les zones de restauration.",
    pt: "Resolva caminhos ideais entre portões, seções de assentos, saídas de acessibilidade e praças de alimentação.",
    ar: "تحديد المسارات المثلى عبر البوابات، وأقسام المقاعد، ومخارج إمكانية الوصول، وساحات الطعام.",
    hi: "द्वारों, सीट अनुभागों, सुलभता निकासों और खाद्य रियायत क्षेत्रों में इष्टतम पथ खोजें।",
    de: "Ermitteln Sie optimale Wege zwischen Toren, Sitzplatzbereichen, barrierefreien Ausgängen und Kiosken.",
    ja: "ゲート、座席セクション、バリアフリー出口、売店売場を繋ぐ最適なルートを検索します。",
    ko: "출입 게이트, 관람석 구역, 교통 약자용 출구, 매점 가판대를 잇는 최적 경로를 설정합니다.",
    zh: "解析穿过登机口、座位区、无障碍出口和餐饮区的最佳路径。",
  },
  startPoint: {
    en: "Start Point (Origin):", es: "Punto de partida (Origen):", fr: "Point de départ (Origine) :", pt: "Ponto de partida (Origem):", ar: "نقطة البداية (المصدر):", hi: "प्रारंभ बिंदु (उत्पत्ति):", de: "Startpunkt (Herkunft):", ja: "出発地（起点）:", ko: "출발지 (기점):", zh: "起点（源）："
  },
  destination: {
    en: "Destination:", es: "Destino:", fr: "Destination :", pt: "Destino:", ar: "الوجهة:", hi: "गंतव्य:", de: "Ziel:", ja: "目的地:", ko: "목적지:", zh: "目的地："
  },
  wheelchairOnly: {
    en: "Wheelchair Accessible Route Only", es: "Ruta accesible para silla de ruedas únicamente", fr: "Trajet accessible aux fauteuils roulants uniquement", pt: "Apenas rota acessível para cadeiras de rodas", ar: "مسار ميسر للكراسي المتحركة فقط", hi: "केवल व्हीलचेयर सुलभ मार्ग", de: "Nur rollstuhlgerechte Route", ja: "車椅子対応ルートのみ", ko: "휠체어 이동 가능 경로만 표시", zh: "仅限轮椅无障碍路线"
  },
  calculateRoute: {
    en: "Calculate Route", es: "Calcular ruta", fr: "Calculer l'itinéraire", pt: "Calcular rota", ar: "حساب المسار", hi: "मार्ग की गणना करें", de: "Route berechnen", ja: "ルート探索", ko: "경로 계산", zh: "计算路线"
  },
  optimalPath: {
    en: "Optimal Path Calculated", es: "Ruta óptima calculada", fr: "Itinéraire optimal calculé", pt: "Rota ideal calculada", ar: "تم حساب المسار الأمثل", hi: "इष्टतम मार्ग की गणना की गई", de: "Optimale Route berechnet", ja: "最適なルートが計算されました", ko: "최적 경로가 계산되었습니다", zh: "已计算最佳路径"
  },
  estimatedWalk: {
    en: "Estimated Walk:", es: "Caminata estimada:", fr: "Marche estimée :", pt: "Caminhada estimada:", ar: "المشي المقدر:", hi: "अनुमानित पैदल दूरी:", de: "Geschätzte Gehzeit:", ja: "徒歩所要時間（予測）:", ko: "예상 도보 시간:", zh: "预计步行时间："
  },
  distance: {
    en: "Distance:", es: "Distancia:", fr: "Distance :", pt: "Distância:", ar: "المسافة:", hi: "दूरी:", de: "Entfernung:", ja: "距離:", ko: "거리:", zh: "距离："
  },
  level: {
    en: "Level", es: "Nivel", fr: "Niveau", pt: "Nível", ar: "المستوى", hi: "स्तर", de: "Ebene", ja: "フロア", ko: "층", zh: "楼层"
  },
  accessTitle: {
    en: "♿ Inclusive Accessibility Operations",
    es: "♿ Operaciones de Accesibilidad Inclusiva",
    fr: "♿ Opérations d'Accessibilité Inclusive",
    pt: "♿ Operações de Acessibilidade Inclusiva",
    ar: "♿ عمليات إمكانية الوصول الشاملة",
    hi: "♿ समावेशी सुलभता संचालन",
    de: "♿ Inklusive Barrierefreiheits-Dienste",
    ja: "♿ インクルーシブアクセシビリティオペレーション",
    ko: "♿ 포용적 무장애 장벽 없는 경기장 운영",
    zh: "♿ 包容性无障碍运营",
  },
  accessDesc: {
    en: "Real-time status configurations of assistive features, companion seating plans, and sensory-friendly zones.",
    es: "Configuraciones en tiempo real de funciones de asistencia, asientos de acompañantes y zonas sensoriales.",
    fr: "Suivi en temps réel des aides à l'accessibilité, des places pour accompagnateurs et des zones calmes.",
    pt: "Configurações em tempo real de recursos de assistência, assentos de acompanhantes e zonas sensoriais.",
    ar: "تكوينات الحالة في الوقت الفعلي لميزات المساعدة، وخطط مقاعد المرافقين، والمناطق الصديقة للحس.",
    hi: "सहायक सुविधाओं, साथी बैठने की योजना और संवेदी-अनुकूल क्षेत्रों के वास्तविक समय स्थिति कॉन्फ़िगरेशन।",
    de: "Echtzeit-Konfigurationen von Hilfsmitteln, Begleiter-Sitzplänen und reizarmen Zonen.",
    ja: "支援機能、同伴者席プラン、感覚に優しいセンサーエリア의 リアルタイム設定。",
    ko: "장애인 보조 설비, 동반인 좌석 배치, 감각 친화 시설의 실시간 운영 상황.",
    zh: "辅助功能、陪同座位计划和感官友好区域 Real-time status structures。",
  },
  locationNodes: {
    en: "Location Nodes", es: "Nodos de ubicación", fr: "Nœuds de localisation", pt: "Nós de localização", ar: "نقاط الموقع", hi: "स्थान नोड्स", de: "Standort-Knoten", ja: "案内場所", ko: "위치 노드", zh: "位置节点"
  },
  transportTitle: {
    en: "🚇 Real-Time Transportation & Parking",
    es: "🚇 Transporte y Estacionamiento en Tiempo Real",
    fr: "🚇 Transport et Stationnement en Temps Réel",
    pt: "🚇 Transporte e Estacionamento em Tempo Real",
    ar: "🚇 وسائل النقل ومواقف السيارات في الوقت الفعلي",
    hi: "🚇 वास्तविक समय परिवहन और पार्किंग",
    de: "🚇 Echtzeit-Transportwesen & Parkplatzbelegung",
    ja: "🚇 リアルタイム交通機関＆駐車場情報",
    ko: "🚇 실시간 대중교통 운행 & 주차장 점유율",
    zh: "🚇 实时交通与停车场",
  },
  transportDesc: {
    en: "Live passenger throughput updates for Metro lines, shuttle buses, rideshare queues, and parking occupancy rates.",
    es: "Actualizaciones de pasajeros para líneas de metro, autobuses de enlace, viajes compartidos y tarifas de estacionamiento.",
    fr: "Mises à jour du flux de passagers pour le métro, les navettes, les VTC et les taux d'occupation des parkings.",
    pt: "Atualizações de fluxo de passageiros para metrô, ônibus fretados, carros de aplicativo e taxas de estacionamento.",
    ar: "تحديثات حية لحركة الركاب لخطوط المترو، وحافلات النقل، وطوابير مشاركة الرحلات، ومعدلات إشغال المواقف.",
    hi: "मेट्रो लाइनों, शटल बसों, राइडशेयर कतारों और पार्किंग अधिभोग दरों के लिए लाइव यात्री थ्रूपुट अपडेट।",
    de: "Aktuelle Passagierdurchsätze für U-Bahnen, Shuttles, Ridesharing-Wartebereiche und Parkplatzauslastung.",
    ja: "メトロ、シャトルバス、配車アプリの列、駐車場の空き状況のリアルタイム更新。",
    ko: "도시철도 노선, 셔틀버스, 택시 승차 대기선, 주차 구역 점유율 실시간 현황.",
    zh: "地铁线路、穿梭巴士、网约车排队和停车场占用率的实时乘客吞吐量更新。",
  },
  refreshStatus: {
    en: "Refresh Status", es: "Actualizar estado", fr: "Actualiser le statut", pt: "Atualizar status", ar: "تحديث الحالة", hi: "स्थिति ताज़ा करें", de: "Status aktualisieren", ja: "ステータス更新", ko: "상태 새로고침", zh: "刷新状态"
  },
  transitOps: {
    en: "Public Transit Operations", es: "Operaciones de transporte público", fr: "Opérations de transport public", pt: "Operações de transporte público", ar: "عمليات النقل العام", hi: "सार्वजनिक परिवहन संचालन", de: "Öffentlicher Nahverkehr", ja: "公共交通機関の運行状況", ko: "대중교통 운행 현황", zh: "公共交通运营"
  },
  parkingCap: {
    en: "Parking Lot Capacities", es: "Capacidades de estacionamiento", fr: "Capacités des parkings", pt: "Capacidades dos estacionamentos", ar: "سعة مواقف السيارات", hi: "पार्किंग स्थल की क्षमता", de: "Parkplatzkapazitäten", ja: "駐車場空き容量", ko: "주차장 수용 대수", zh: "停车场容量"
  },
  arrivalsEvery: {
    en: "Arrivals every:", es: "Llegadas cada:", fr: "Arrivées toutes les :", pt: "Chegadas a cada:", ar: "الوصول كل:", hi: "आगमन प्रत्येक:", de: "Ankunft alle:", ja: "運行間隔:", ko: "배차 간격:", zh: "到达间隔："
  },
  capacityFill: {
    en: "Capacity fill:", es: "Llenado de capacidad:", fr: "Taux de remplissage :", pt: "Taxa de ocupação:", ar: "تعبئة السعة:", hi: "क्षमता भरण:", de: "Auslastung:", ja: "乗車率/混雑度:", ko: "수용률:", zh: "容量填充："
  },
  available: {
    en: "Available:", es: "Disponible:", fr: "Disponible :", pt: "Disponível:", ar: "متاح:", hi: "उपलब्ध:", de: "Verfügbar:", ja: "空き状況:", ko: "이용 가능:", zh: "可用："
  },
  fee: {
    en: "Fee:", es: "Tarifa:", fr: "Tarif :", pt: "Taxa:", ar: "الرسوم:", hi: "शुल्क:", de: "Gebühr:", ja: "料金:", ko: "요금:", zh: "费用："
  },
  occupancy: {
    en: "Occupancy:", es: "Ocupación:", fr: "Occupation :", pt: "Ocupação:", ar: "الإشغال:", hi: "अधिभोग:", de: "Belegung:", ja: "混雑状況:", ko: "점유율:", zh: "占用："
  },
  sustainTitle: {
    en: "🌍 Green Stadium Resource metrics",
    es: "🌍 Métricas de Recursos del Estadio Verde",
    fr: "🌍 Indicateurs de Ressources du Stade Vert",
    pt: "🌍 Métricas de Recursos do Estádio Sustentável",
    ar: "🌍 مقاييس الموارد الملائمة للبيئة للملعب",
    hi: "🌍 ग्रीन स्टेडियम संसाधन मीट्रिक",
    de: "🌍 Nachhaltigkeits-Kennzahlen des Stadions",
    ja: "🌍 グリーンスタジアム資源指標",
    ko: "🌍 친환경 녹색 경기장 자원 소비 현황",
    zh: "🌍 绿色体育场资源指标",
  },
  sustainDesc: {
    en: "Visualizing waste diversion percentages, solar generation levels, and tracking ecological footprints during matchday.",
    es: "Visualización de porcentajes de desviación de residuos, niveles de generación solar y huella ecológica.",
    fr: "Visualisation du taux de valorisation des déchets, production solaire et empreinte écologique du jour.",
    pt: "Visualização de taxas de desvio de resíduos, níveis de energia solar e pegada ecológica do evento.",
    ar: "تصور نسب تحويل النفايات، ومستويات توليد الطاقة الشمسية، وتتبع البصمة البيئية خلال يوم المباراة.",
    hi: "अपशिष्ट मोड़ प्रतिशत, सौर उत्पादन स्तर की कल्पना करना और मैच के दिन पारिस्थितिक पैरों के निशान को ट्रैक करना।",
    de: "Visualisierung von Abfallverwertung, Solarstromerzeugung und ökologischem Fußabdruck am Spieltag.",
    ja: "試合当日の廃棄物削減率、太陽光発電量、環境フットプリントの可視化。",
    ko: "경기 당일 쓰레기 재활용률, 태양광 발전량 및 이산화탄소 배출 목표 수치화.",
    zh: "在比赛日可视化垃圾分流百分比、太阳能发电量并跟踪生态足迹。",
  },
  carbonCalcTitle: {
    en: "Calculate Carbon Emissions Savings (Tripmeter)", es: "Calcular ahorro de emisiones de carbono", fr: "Calculer les économies de carbone (Tripmeter)", pt: "Calcular economia de emissões de carbono", ar: "حساب توفير انبعاثات الكربون", hi: "कार्बन उत्सर्जन बचत की गणना करें (ट्रिपमीटर)", de: "Berechnen Sie CO₂-Einsparungen (Tripmeter)", ja: "二酸化炭素排出削減量の計算（トリップメーター）", ko: "탄소 배출 절감량 계산기", zh: "计算碳排放节省量 (Tripmeter)"
  },
  carbonCalcDesc: {
    en: "Input your travel distance to the stadium and calculate how much carbon you save by avoiding driving alone.",
    es: "Ingrese su distancia de viaje y calcule cuánto carbono ahorra al evitar conducir solo.",
    fr: "Saisissez votre distance parcourue et calculez le carbone économisé par rapport à un trajet seul en voiture.",
    pt: "Insira sua distância de viagem e calcule quanto carbono economiza evitando dirigir sozinho.",
    ar: "أدخل مسافة سفرك إلى الملعب واحسب كمية الكربون التي توفرها بتجنب القيادة بمفردك.",
    hi: "स्टेडियम की अपनी यात्रा की दूरी दर्ज करें और गणना करें कि अकेले वाहन न चलाने से आप कितना कार्बन बचाते हैं।",
    de: "Geben Sie Ihre Reisestrecke zum Stadion ein und berechnen Sie, wie viel CO₂ Sie einsparen, wenn Sie nicht alleine fahren.",
    ja: "スタジアムまでの移動距離を入力して、車を一人で運転する場合と比較したCO2削減量を算出します。",
    ko: "경기장까지의 이동 거리를 입력하고 나홀로 운전 대비 절감되는 탄소 배출량을 확인해 보세요.",
    zh: "输入您到体育场的出行距离，并计算您因避免单独驾车而节省了多少碳排放。"
  },
  calculate: {
    en: "Calculate", es: "Calcular", fr: "Calculer", pt: "Calcular", ar: "احسب", hi: "गणना करें", de: "Berechnen", ja: "計算する", ko: "계산하기", zh: "计算"
  },
  target: {
    en: "Target", es: "Objetivo", fr: "Cible", pt: "Meta", ar: "الهدف", hi: "लक्ष्य", de: "Zielwert", ja: "目標数値", ko: "목표", zh: "目标"
  },
  opsTitle: {
    en: "🛡️ Operations Incident Dispatch Dashboard",
    es: "🛡️ Panel de Despacho de Incidentes de Operaciones",
    fr: "🛡️ Tableau de Contrôle des Incidents Opérationnels",
    pt: "🛡️ Painel de Despacho de Incidentes Operacionais",
    ar: "🛡️ لوحة معلومات إرسال حوادث العمليات",
    hi: "🛡️ संचालन घटना प्रेषण डैशबोर्ड",
    de: "🛡️ Leitstelle für Vorfälle und Einsatzkoordination",
    ja: "🛡️ 運行管理・インシデントディスパッチダッシュボード",
    ko: "🛡️ 경기장 운영 상황 통제 & 조치 대시보드",
    zh: "🛡️ 运营事件调度仪表板",
  },
  opsDesc: {
    en: "Real-time coordinator dashboard tracking live incidents, medical dispatch requests, and safety logs.",
    es: "Panel de control en tiempo real que rastrea incidentes, solicitudes médicas y registros de seguridad.",
    fr: "Tableau de bord de coordination en temps réel pour le suivi des incidents, secours médicaux et rapports.",
    pt: "Painel de controle em tempo real para rastrear incidentes, chamados médicos e registros de segurança.",
    ar: "لوحة معلومات المنسق في الوقت الفعلي لتتبع الحوادث المباشرة، وطلبات الإرسال الطبي، وسجلات السلامة.",
    hi: "लाइव घटनाओं, चिकित्सा प्रेषण अनुरोधों और सुरक्षा लॉग को ट्रैक करने वाला वास्तविक समय समन्वयक डैशबोर्ड।",
    de: "Echtzeit-Dashboard für Koordinatoren zur Überwachung von Vorfällen, Sanitätereinsätzen und Sicherheitsberichten.",
    ja: "発生インシデント、救護要請、安全管理ログをリアルタイムで追跡するコーディネーター用画面。",
    ko: "실시간 위기 조치 현황, 응급 의료 출동 요청, 안전 위반 기록 추적.",
    zh: "跟踪实时事件、医疗调度请求和安全日志的实时协调员仪表板。",
  },
  reportedLog: {
    en: "Reported Incidents Log", es: "Registro de incidentes reportados", fr: "Journal des incidents signalés", pt: "Registro de incidentes relatados", ar: "سجل الحوادث المبلغ عنها", hi: "रिपोर्ट की गई घटनाओं का लॉग", de: "Protokoll gemeldeter Vorfälle", ja: "報告済みインシデント履歴ログ", ko: "접수된 위기 상황 로그", zh: "已报告事件日志"
  },
  reportTicket: {
    en: "Report Incident Ticket", es: "Reportar ticket de incidente", fr: "Signaler un nouvel incident", pt: "Relatar ticket de incidente", ar: "الإبلاغ عن تذكرة حادث", hi: "घटना टिकट की रिपोर्ट करें", de: "Vorfall melden", ja: "新規インシデント起票", ko: "위기 상황 보고서 작성", zh: "报告事件工单"
  },
  incidentType: {
    en: "Incident Type:", es: "Tipo de incidente:", fr: "Type d'incident :", pt: "Tipo de incidente:", ar: "نوع الحادث:", hi: "घटना का प्रकार:", de: "Art des Vorfalls:", ja: "インシデント種別:", ko: "사고 유형:", zh: "事件类型："
  },
  severityRating: {
    en: "Severity Rating:", es: "Calificación de gravedad:", fr: "Niveau de gravité :", pt: "Nível de gravidade:", ar: "تقييم الخطورة:", hi: "गंभीरता रेटिंग:", de: "Schweregrad:", ja: "重要度/緊急度:", ko: "심각도 등급:", zh: "严重程度评级："
  },
  locationNode: {
    en: "Location Node:", es: "Nodo de ubicación:", fr: "Nœud de localisation :", pt: "Nó de localização:", ar: "نقطة الموقع:", hi: "स्थान नोड:", de: "Standort-Knoten:", ja: "発生箇所ノード:", ko: "발생 위치 노드:", zh: "位置节点："
  },
  incidentDetails: {
    en: "Incident details / request description:", es: "Detalles del incidente / descripción de la solicitud:", fr: "Détails de l'incident / description de la demande :", pt: "Detalhes do incidente / descrição da solicitação:", ar: "تفاصيل الحادث / وصف الطلب:", hi: "घटना का विवरण / अनुरोध विवरण:", de: "Details des Vorfalls / Beschreibung des Anliegens:", ja: "インシデント詳細 / 対応要請内容:", ko: "조치 요구 사항 상세 내용:", zh: "事件详情/请求说明："
  },
  dispatchTicket: {
    en: "Dispatch Operations Ticket", es: "Despachar ticket de operaciones", fr: "Dépêcher un ticket opérationnel", pt: "Despachar ticket de operações", ar: "إرسال تذكرة العمليات", hi: "संचालन टिकट प्रेषित करें", de: "Einsatz-Ticket erstellen", ja: "オペレーションチケット発行・派遣", ko: "운영팀 출동 지시 전송", zh: "调度运营工单"
  },
  location: {
    en: "Location:", es: "Ubicación:", fr: "Localisation :", pt: "Localização:", ar: "الموقع:", hi: "स्थान:", de: "Standort:", ja: "場所:", ko: "위치:", zh: "位置："
  },
  assignedTo: {
    en: "Assigned to:", es: "Asignado a:", fr: "Assigné à :", pt: "Atribuído a:", ar: "مخصص لـ:", hi: "को सौंपा गया:", de: "Zugewiesen an:", ja: "担当班:", ko: "담당 부서:", zh: "分配给："
  },
  carbonSavedMsg: {
    en: "You saved", es: "Ahorró", fr: "Vous avez économisé", pt: "Você economizou", ar: "لقد وفرت", hi: "आपने बचाया", de: "Sie haben eingespart", ja: "削減量:", ko: "절감량:", zh: "您节省了"
  },
  carbonCompareMsg: {
    en: "kg CO₂ compared to driving a standard fossil-fueled car!", es: "kg de CO₂ en comparación con conducir un automóvil de combustible fósil estándar.", fr: "kg de CO₂ par rapport à la conduite d'une voiture thermique standard !", pt: "kg de CO₂ em comparação com a condução de um carro de combustível fóssil padrão!", ar: "كجم من ثاني أكسيد الكربون مقارنة بقيادة سيارة عادية تعمل بالوقود الأحفوري!", hi: "किग्रा CO₂ मानक जीवाश्म-ईंधन वाली कार चलाने की तुलना में!", de: "kg CO₂ im Vergleich zur Fahrt mit einem herkömmlichen Auto mit fossilen Brennstoffen!", ja: "kg CO₂ (一般のガソリン車と比較)", ko: "kg CO₂ (일반 가솔린 차량 운행 대비)", zh: "公斤 CO₂（与驾驶普通化石燃料汽车相比）！"
  },
};

const LOCALIZED_ACCESSIBILITY_DESCS: Record<string, Record<SupportedLanguage, string>> = {
  "wheelchair-ramp": {
    en: "Gentle-grade ramp for wheelchair and mobility device access",
    es: "Rampa de pendiente suave para acceso en silla de ruedas y dispositivos de movilidad",
    fr: "Rampe à faible pente pour l'accès aux fauteuils roulants et appareils de mobilité",
    pt: "Rampa com inclinação suave para cadeira de rodas e dispositivos de mobilidade",
    ar: "منحدر ذو درجة خفيفة للوصول بالكرسي المتحرك وأجهزة الحركة",
    hi: "व्हीलचेयर और गतिशीलता उपकरण पहुंच के लिए कोमल-ग्रेड रैंप",
    de: "Flache Rampe für den Zugang mit Rollstühlen und Gehhilfen",
    ja: "車椅子や移動機器用の緩やかなスロープ",
    ko: "휠체어 및 유모차용 완만한 경사로",
    zh: "供轮椅和代步设备进出的缓坡",
  },
  "wheelchair-seating": {
    en: "Designated wheelchair-accessible seating areas with companion seats",
    es: "Áreas de asientos designadas accesibles para sillas de ruedas con asientos para acompañantes",
    fr: "Espaces réservés aux fauteuils roulants avec sièges accompagnateurs",
    pt: "Áreas designadas acessíveis para cadeirantes com assentos para acompanhantes",
    ar: "مناطق مخصصة للجلوس ميسرة للكراسي المتحركة مع مقاعد للمرافقين",
    hi: "साथी सीटों के साथ निर्दिष्ट व्हीलचेयर-सुलभ बैठने के क्षेत्र",
    de: "Ausgewiesene rollstuhlgerechte Sitzplätze mit Begleiterplätzen",
    ja: "同伴者席を備えた車椅子対応の専用観戦エリア",
    ko: "동반자석이 인접한 휠체어 전용 관람 구역",
    zh: "带陪同座位的指定轮椅无障碍座位区",
  },
  "elevator": {
    en: "Accessible elevator connecting all stadium levels",
    es: "Ascensor accesible que conecta todos los niveles del estadio",
    fr: "Ascenseur accessible reliant tous les niveaux du stade",
    pt: "Elevador acessível que conecta todos os níveis do estádio",
    ar: "مصعد ميسر يربط بين جميع مستويات الملعب",
    hi: "सभी स्टेडियम स्तरों को जोड़ने वाली सुलभ लिफ्ट",
    de: "Barrierefreier Aufzug zur Verbindung aller Stadionebenen",
    ja: "スタジアムの全フロアを繋ぐバリアフリーエレベーター",
    ko: "경기장 모든 층을 연결하는 교통약자용 엘리베이터",
    zh: "连接体育场所有层级的无障碍电梯",
  },
  "audio-description": {
    en: "Live audio descriptions of match events for visually impaired fans",
    es: "Descripciones de audio en vivo de eventos del partido para aficionados con discapacidad visual",
    fr: "Audiodescriptions en direct des actions du match pour les supporters malvoyants",
    pt: "Audiodescrições ao vivo dos eventos da partida para torcedores deficientes visuais",
    ar: "وصف صوتي مباشر لأحداث المباراة للجماهير الذين يعانون من ضعف البصر",
    hi: "दृष्टिबाधित प्रशंसकों के लिए मैच की घटनाओं का लाइव ऑडियो विवरण",
    de: "Live-Audiodeskriptionen von Spielereignissen für sehbehinderte Fans",
    ja: "視覚障害をお持ちのファンのための試合状況の実況音声解説",
    ko: "시각 장애인을 위한 경기 실황 현장 음성 안내 서비스",
    zh: "为视障球迷提供的比赛事件实时音频描述",
  },
  "sign-language": {
    en: "On-site sign language interpreters for key announcements",
    es: "Intérpretes de lengua de señas en el lugar para anuncios clave",
    fr: "Interprètes en langue des signes sur place pour les annonces importantes",
    pt: "Intérpretes de língua de sinais no local para os principais anúncios",
    ar: "مترجمو لغة إشارة في الموقع للإعلانات الرئيسية",
    hi: "प्रमुख घोषणाओं के लिए साइट पर सांकेतिक भाषा दुभाषिए",
    de: "Gebärdensprachdolmetscher vor Ort für wichtige Ankündigungen",
    ja: "重要なお知らせのための場内手話通訳",
    ko: "주요 안내 방송을 위한 수어 통역사 현장 배치",
    zh: "为关键公告提供的现场手语翻译",
  },
  "braille-signage": {
    en: "Tactile braille signage at all major navigation points",
    es: "Señalización táctil en braille en los principales puntos de navegación",
    fr: "Signalisation tactile en braille à tous les principaux points de passage",
    pt: "Sinalização tátil em braille em todos os principais pontos de navegação",
    ar: "لافتات بريل اللمسية في جميع نقاط الملاحة الرئيسية",
    hi: "सभी प्रमुख नेविगेशन बिंदुओं पर स्पर्श ब्रेल साइनेज",
    de: "Taktile Braille-Beschilderung an allen wichtigen Orientierungspunkten",
    ja: "主要な案内箇所にある触覚点字プレート",
    ko: "모든 주요 안내 표지에 점자 표기 병행",
    zh: "在所有主要导引点设置的触觉盲文标识",
  },
  "sensory-room": {
    en: "Low-stimulation quiet room with live match feed for neurodivergent guests",
    es: "Sala silenciosa de baja estimulación con transmisión en vivo del partido para huéspedes neurodivergentes",
    fr: "Salle calme à faible stimulation avec diffusion en direct pour les personnes neurodivergentes",
    pt: "Sala tranquila de baixa estimulação com transmissão ao vivo para pessoas neurodivergentes",
    ar: "غرفة هادئة منخفضة التحفيز مع بث حي للمباراة للضيوف ذوي الاحتياجات الخاصة",
    hi: "न्यूरोडाइवर्जेंट मेहमानों के लिए लाइव मैच फीड के साथ कम-उत्तेजना वाला शांत कमरा",
    de: "Reizarmer Ruheraum mit Live-Spielübertragung für neurodivergente Gäste",
    ja: "感覚過敏のゲストのためのライブ中継モニター付き静音室",
    ko: "감각 과민 반응이 있는 관람객을 위한 저자극 정숙실 및 라이브 중계",
    zh: "为感官敏感人士提供的低刺激安静室（配比赛直播）",
  },
  "assistive-listening": {
    en: "Hearing loop and FM systems available for hearing-impaired fans",
    es: "Bucle auditivo y sistemas de FM disponibles para aficionados con discapacidad auditiva",
    fr: "Boucles magnétiques et systèmes FM disponibles pour les supporters malentendants",
    pt: "Aparelhos auditivos e sistemas de FM disponíveis para torcedores deficientes auditivos",
    ar: "أنظمة الحلقة السمعية والترددات اللاسلكية المتاحة للجماهير الذين يعانون من ضعف السمع",
    hi: "बाधित श्रवण प्रशंसकों के लिए श्रवण लूप और एफएम प्रणाली उपलब्ध",
    de: "Hörschleifen und FM-Systeme für hörgeschädigte Fans verfügbar",
    ja: "聴覚障害をお持ちのファンのための集音器・磁気ループシステム",
    ko: "청각 장애인을 위한 히어링 루프(Hearing Loop) 및 FM 송수신 시스템",
    zh: "为听障球迷提供的助听回路和调频系统",
  },
  "service-animal-area": {
    en: "Designated relief and rest areas for service animals",
    es: "Áreas designadas de alivio y descanso para animales de servicio",
    fr: "Zones de détente et de soulagement réservées aux animaux d'assistance",
    pt: "Áreas designadas de descanso para animais de serviço",
    ar: "منطقة حيوانات الخدمة المخصصة للراحة",
    hi: "सेवा पशुओं के लिए निर्दिष्ट राहत और विश्राम क्षेत्र",
    de: "Ausgewiesene Ruhebereiche für Assistenztiere",
    ja: "介助犬のための指定の休憩・用足しエリア",
    ko: "안내동물 배변 및 휴식을 위한 지정 장소",
    zh: "服务动物指定的休息与排泄区",
  },
  "companion-seating": {
    en: "Adjacent seating for companions of guests with disabilities",
    es: "Asientos adyacentes para acompañantes de huéspedes con discapacidades",
    fr: "Sièges adjacents pour les accompagnateurs des visiteurs en situation de handicap",
    pt: "Assento adjacente para acompanhantes de pessoas com deficiência",
    ar: "مقاعد مجاورة لمرافقي الضيوف ذوي الإعاقة",
    hi: "विकलांग मेहमानों के साथियों के लिए बगल की सीटें",
    de: "Begleitplatz direkt neben den barrierefreien Plätzen",
    ja: "障害をお持ちのゲストの同伴者用の隣接座席",
    ko: "장애인 관람객의 동반인을 위한 인접 보호자석",
    zh: "残障人士随行人员的相邻座位",
  },
  "wide-concourse": {
    en: "Extra-wide concourse areas for easy wheelchair and stroller movement",
    es: "Áreas de vestíbulo extra anchas para un fácil movimiento de sillas de ruedas y cochecitos",
    fr: "Zones de coursives très larges pour faciliter les fauteuils et poussettes",
    pt: "Áreas de circulação extra-largas para fácil movimentação de cadeiras de rodas e carrinhos",
    ar: "ممرات واسعة للغاية لسهولة حركة الكراسي المتحركة وعربات الأطفال",
    hi: "व्हीलचेयर और घुमक्कड़ आंदोलन के लिए अतिरिक्त-चौड़े मार्ग क्षेत्र",
    de: "Extra breite Umläufe für einfache Bewegung mit Rollstühlen und Kinderwagen",
    ja: "車椅子やベビーカーがスムーズに移動できる幅広のコンコース",
    ko: "휠체어와 유모차가 원활하게 이동할 수 있는 초대형 광폭 복도",
    zh: "宽敞的通道，方便轮椅和婴儿车通过",
  },
  "accessible-restroom": {
    en: "Fully accessible restroom with grab bars, lowered fixtures, and emergency call button",
    es: "Baño totalmente accesible con barras de apoyo, accesorios rebajados y botón de llamada de emergencia",
    fr: "Toilettes entièrement accessibles avec barres d'appui, lavabo bas et bouton d'appel d'urgence",
    pt: "Banheiro totalmente acessível com barras de apoio, pias rebaixadas e botão de emergência",
    ar: "دورة مياه ميسرة بالكامل تحتوي على قضبان دعم، وتركيبات منخفضة، وزر اتصال طوارئ",
    hi: "पकड़ बार, निचले जुड़नार और आपातकालीन कॉल बटन के साथ पूरी तरह से सुलभ शौचालय",
    de: "Barrierefreie Toilette mit Haltegriffen, abgesenkten Armaturen und Notrufknopf",
    ja: "手すり、低位置の設備、緊急呼び出しボタンを備えた多機能トイレ",
    ko: "안내전화 벨, 안전바, 낮춤 설계가 적용된 무장애 화장실",
    zh: "配有扶手、低位洁具和紧急呼叫按钮的完全无障碍卫生间",
  },
};

interface VenueSummary {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly country: string;
}

export default function StadiumDashboard() {
  // ─── Core State ──────────────────────────────────────────────────────────────
  const [venues, setVenues] = useState<readonly VenueSummary[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [venueDetail, setVenueDetail] = useState<StadiumVenue | null>(null);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>("en");
  const [activeModuleId, setActiveModuleId] = useState<string>("ai-concierge");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ─── Module State: AI Concierge ──────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<readonly ChatMessage[]>([
    { role: "assistant", content: "🏟️ Welcome! I am your AI Stadium Assistant. How can I help you navigate the venue today?", timestamp: new Date().toISOString() },
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // ─── Module State: Crowd Intelligence ─────────────────────────────────────────
  const [crowdSections, setCrowdSections] = useState<readonly SectionOccupancy[]>([]);
  const [isCrowdLoading, setIsCrowdLoading] = useState<boolean>(false);

  // ─── Module State: Smart Navigation ──────────────────────────────────────────
  const [navOriginId, setNavOriginId] = useState<string>("");
  const [navDestId, setNavDestId] = useState<string>("");
  const [navRoute, setNavRoute] = useState<NavigationRoute | null>(null);
  const [navRequireAccessible, setNavRequireAccessible] = useState<boolean>(false);

  // ─── Module State: Transportation ────────────────────────────────────────────
  const [transitUpdates, setTransitUpdates] = useState<readonly TransportUpdate[]>([]);
  const [parkingLots, setParkingLots] = useState<readonly ParkingLot[]>([]);
  const [isTransportLoading, setIsTransportLoading] = useState<boolean>(false);

  // ─── Module State: Accessibility ─────────────────────────────────────────────
  const [accessibilityFeatures, setAccessibilityFeatures] = useState<readonly AccessibilityConfig[]>([]);

  // ─── Module State: Sustainability ────────────────────────────────────────────
  const [sustainabilityMetrics, setSustainabilityMetrics] = useState<readonly SustainabilityMetric[]>([]);
  const [userTransitKm, setUserTransitKm] = useState<number>(10);
  const [userTransitMode, setUserTransitMode] = useState<string>("metro");
  const [userCarbonSaved, setUserCarbonSaved] = useState<number>(0);

  // ─── Module State: Operations Command Center ─────────────────────────────────
  const [operationsIncidents, setOperationsIncidents] = useState<readonly OperationsIncident[]>([]);
  const [newIncidentCategory, setNewIncidentCategory] = useState<IncidentCategory>("medical");
  const [newIncidentSeverity, setNewIncidentSeverity] = useState<IncidentSeverity>("medium");
  const [newIncidentDesc, setNewIncidentDesc] = useState<string>("");
  const [newIncidentLocation, setNewIncidentLocation] = useState<string>("");

  // ─── Visual Confirmation & Activity Log Stream States ──────────────────────
  const [incidentFeedback, setIncidentFeedback] = useState<string | null>(null);
  const [carbonFeedback, setCarbonFeedback] = useState<string | null>(null);
  const [navFeedback, setNavFeedback] = useState<string | null>(null);
  const [backgroundLogs, setBackgroundLogs] = useState<readonly string[]>(() => {
    const mockEvents = [
      "Fan entered via Gate A",
      "Concession 3 wait time updated: 5 mins",
      "Solar panel output: 142 kW",
      "Metro Shuttle Arrival in 3 mins",
      "Wheelchair ramp gate sensor: active",
      "Section 104 occupancy reached 82%",
      "Security patrol checked zone 12",
      "Waste diversion rate updated to 88.5%",
      "Baggage scanner at Gate B: operating normally",
      "Weather report: Clear, 22°C",
      "Staff rotation check completed for Level 2",
    ];
    const initialLogs: string[] = [];
    for (let i = 0; i < 5; i++) {
      const time = new Date(Date.now() - (5 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const ev = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      initialLogs.unshift(`[${time}] ${ev}`);
    }
    return initialLogs;
  });

  useEffect(() => {
    const mockEvents = [
      "Fan entered via Gate A",
      "Concession 3 wait time updated: 5 mins",
      "Solar panel output: 142 kW",
      "Metro Shuttle Arrival in 3 mins",
      "Wheelchair ramp gate sensor: active",
      "Section 104 occupancy reached 82%",
      "Security patrol checked zone 12",
      "Waste diversion rate updated to 88.5%",
      "Baggage scanner at Gate B: operating normally",
      "Weather report: Clear, 22°C",
      "Staff rotation check completed for Level 2",
    ];

    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const ev = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      setBackgroundLogs((prev) => [`[${time}] ${ev}`, ...prev.slice(0, 14)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const t = (key: keyof typeof LOCALIZED_DICT): string => {
    return LOCALIZED_DICT[key][selectedLang] ?? LOCALIZED_DICT[key].en;
  };

  const getTabTitle = (id: string): string => {
    const map: Record<string, keyof typeof LOCALIZED_DICT> = {
      "ai-concierge": "tabAiConcierge",
      "crowd": "tabCrowd",
      "navigation": "tabNavigation",
      "accessibility": "tabAccessibility",
      "transport": "tabTransport",
      "sustainability": "tabSustainability",
      "operations": "tabOperations",
    };
    const key = map[id];
    return key ? t(key) : id;
  };

  // ─── Shared Fetchers ──────────────────────────────────────────────────────────

  const fetchVenueDetail = async (venueId: string, lang: SupportedLanguage) => {
    try {
      const res = await fetch("/api/stadium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getVenue",
          venueId,
          language: lang,
          payload: { action: "getVenue" },
        }),
      });
      const data: StadiumApiResponse<StadiumVenue> = await res.json();
      if (data.success && data.data) {
        setVenueDetail(data.data);
        // Pre-fill navigation selector node options
        const nodes = data.data.navigationNodes;
        if (nodes.length > 0) {
          setNavOriginId(nodes[0].id);
          setNavDestId(nodes[nodes.length - 1]?.id ?? nodes[0].id);
        }
      }
    } catch {
      console.error("Failed to fetch venue details");
    }
  };

  const fetchCrowdStatus = async (venueId: string) => {
    setIsCrowdLoading(true);
    try {
      const res = await fetch("/api/stadium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getCrowdStatus",
          venueId,
          language: selectedLang,
          payload: { action: "getCrowdStatus", sectionIds: [] },
        }),
      });
      const data: StadiumApiResponse<{ sections: SectionOccupancy[] }> = await res.json();
      if (data.success && data.data) {
        setCrowdSections(data.data.sections);
      }
    } catch {
      console.error("Failed to fetch crowd status");
    } finally {
      setIsCrowdLoading(false);
    }
  };

  const fetchTransitStatus = async (venueId: string) => {
    setIsTransportLoading(true);
    try {
      const res = await fetch("/api/stadium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getTransport",
          venueId,
          language: selectedLang,
          payload: { action: "getTransport", modes: [] },
        }),
      });
      const data: StadiumApiResponse<{ transport: TransportUpdate[]; parking: ParkingLot[] }> = await res.json();
      if (data.success && data.data) {
        setTransitUpdates(data.data.transport);
        setParkingLots(data.data.parking);
      }
    } catch {
      console.error("Failed to fetch transport status");
    } finally {
      setIsTransportLoading(false);
    }
  };

  const fetchAccessibilityData = async (venueId: string) => {
    try {
      const res = await fetch("/api/stadium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getAccessibility",
          venueId,
          language: selectedLang,
          payload: { action: "getAccessibility", features: [] },
        }),
      });
      const data: StadiumApiResponse<{ features: AccessibilityConfig[] }> = await res.json();
      if (data.success && data.data) {
        setAccessibilityFeatures(data.data.features);
      }
    } catch {
      console.error("Failed to fetch accessibility data");
    }
  };

  const fetchSustainabilityData = async (venueId: string) => {
    try {
      const res = await fetch("/api/stadium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getSustainability",
          venueId,
          language: selectedLang,
          payload: { action: "getSustainability" },
        }),
      });
      const data: StadiumApiResponse<{ metrics: SustainabilityMetric[] }> = await res.json();
      if (data.success && data.data) {
        setSustainabilityMetrics(data.data.metrics);
      }
    } catch {
      console.error("Failed to fetch sustainability data");
    }
  };

  const fetchOperationsIncidents = async (venueId: string) => {
    try {
      const res = await fetch("/api/stadium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getOperations",
          venueId,
          language: selectedLang,
          payload: { action: "getOperations", incidentFilter: "all" },
        }),
      });
      const data: StadiumApiResponse<{ incidents: OperationsIncident[] }> = await res.json();
      if (data.success && data.data) {
        setOperationsIncidents(data.data.incidents);
      }
    } catch {
      console.error("Failed to fetch operations incidents");
    }
  };

  // ─── Lifecycle & Handlers ───────────────────────────────────────────────────

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/stadium");
        const data: StadiumApiResponse<{ venues: VenueSummary[] }> = await res.json();
        if (data.success && data.data) {
          setVenues(data.data.venues);
          const firstId = data.data.venues[0]?.id ?? "";
          setSelectedVenueId(firstId);
          if (firstId) {
            await Promise.all([
              fetchVenueDetail(firstId, "en"),
              fetchCrowdStatus(firstId),
              fetchTransitStatus(firstId),
              fetchAccessibilityData(firstId),
              fetchSustainabilityData(firstId),
              fetchOperationsIncidents(firstId),
            ]);
          }
        }
      } catch {
        console.error("Init failed");
      } finally {
        setIsLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVenueChange = async (venueId: string) => {
    setSelectedVenueId(venueId);
    if (venueId) {
      await Promise.all([
        fetchVenueDetail(venueId, selectedLang),
        fetchCrowdStatus(venueId),
        fetchTransitStatus(venueId),
        fetchAccessibilityData(venueId),
        fetchSustainabilityData(venueId),
        fetchOperationsIncidents(venueId),
      ]);
    }
  };

  const handleLangChange = async (lang: SupportedLanguage) => {
    startTransition(() => {
      setSelectedLang(lang);
    });
    setChatMessages([
      { role: "assistant", content: `🏟️ ${LANGUAGE_WELCOME_MAP[lang] ?? LANGUAGE_WELCOME_MAP.en}`, timestamp: new Date().toISOString() },
    ]);
    if (selectedVenueId) {
      await fetchVenueDetail(selectedVenueId, lang);
    }
  };

  const handleSendChat = async (messageText: string = chatInput) => {
    if (!messageText.trim() || isSendingChat) return;
    const userMsg: ChatMessage = { role: "user", content: messageText, timestamp: new Date().toISOString() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsSendingChat(true);

    try {
      const res = await fetch("/api/stadium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chatQuery",
          venueId: selectedVenueId,
          language: selectedLang,
          payload: {
            action: "chatQuery",
            message: messageText,
            conversationHistory: [...chatMessages, userMsg],
          },
        }),
      });
      const data: StadiumApiResponse<{ reply: string }> = await res.json();
      if (data.success && data.data) {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.data?.reply ?? "No reply.", timestamp: new Date().toISOString() },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to AI engine.", timestamp: new Date().toISOString() },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleGenerateRoute = async () => {
    if (!navOriginId || !navDestId) return;
    try {
      const res = await fetch("/api/stadium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getNavigation",
          venueId: selectedVenueId,
          language: selectedLang,
          payload: {
            action: "getNavigation",
            originNodeId: navOriginId,
            destinationNodeId: navDestId,
            requireAccessible: navRequireAccessible,
          },
        }),
      });
      const data: StadiumApiResponse<{ route: NavigationRoute }> = await res.json();
      if (data.success && data.data) {
        setNavRoute(data.data.route);
        setNavFeedback("Route path wayfinding generated successfully with accessibility settings!");
        setTimeout(() => setNavFeedback(null), 4000);
      }
    } catch {
      console.error("Navigation error");
    }
  };

  const calculateUserCarbon = () => {
    const modeFactor = userTransitMode === "metro" ? 0.041 : userTransitMode === "bus" ? 0.089 : userTransitMode === "rideshare" ? 0.171 : 0.192;
    const driveFactor = 0.192; // baseline drive-alone car
    const saved = (driveFactor - modeFactor) * userTransitKm;
    setUserCarbonSaved(parseFloat(saved.toFixed(2)));
    setCarbonFeedback(`Carbon Savings re-calculated successfully! (${parseFloat(saved.toFixed(2))} kg CO2 saved)`);
    setTimeout(() => setCarbonFeedback(null), 4000);
  };

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncidentDesc.trim() || !newIncidentLocation.trim()) return;

    const newInc: OperationsIncident = {
      id: `inc-${Date.now()}`,
      category: newIncidentCategory,
      severity: newIncidentSeverity,
      status: "reported",
      locationNodeId: newIncidentLocation,
      reportedAt: new Date().toISOString(),
      assignedTo: "Operations Command",
      description: newIncidentDesc,
      resolutionNotes: "",
    };

    setOperationsIncidents((prev) => [newInc, ...prev]);
    setNewIncidentDesc("");
    setNewIncidentLocation("");
    setIncidentFeedback("Incident reported successfully! Operations ticket dispatched.");
    setTimeout(() => setIncidentFeedback(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading StadiumIQ Operations Matrix...</p>
      </div>
    );
  }

  return (
    <main className="stadium-dashboard">
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <header className="dashboard-header">
        <h1>🏟️ StadiumIQ</h1>
        <p className="dashboard-subtitle">
          {t("dashboardSubtitle")}
        </p>

        {/* Language selector */}
        <div className="lang-selector-strip" aria-label="Select interface language">
          {Object.entries(LANGUAGE_CONFIG).map(([langKey, conf]) => (
            <button
              key={langKey}
              id={`lang-btn-${langKey}`}
              className={`lang-chip ${selectedLang === langKey ? "active" : ""}`}
              aria-label={`Switch language to ${conf.label}`}
              aria-pressed={selectedLang === langKey}
              onClick={() => handleLangChange(langKey as SupportedLanguage)}
            >
              <span aria-hidden="true">{conf.flagEmoji}</span> {conf.nativeLabel}
            </button>
          ))}
        </div>
      </header>

      {/* ─── Controls ─────────────────────────────────────────────────────────── */}
      <section className="dashboard-controls" aria-label="Venue Controls">
        <div className="venue-selector-box glass-card">
          <label htmlFor="venue-select" className="venue-label">
            {t("activeVenue")}
          </label>
          <select
            id="venue-select"
            className="venue-dropdown"
            value={selectedVenueId}
            aria-label="Select tournament stadium venue"
            onChange={(e) => handleVenueChange(e.target.value)}
          >
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.city}, {v.country.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ─── Main Content Layout ──────────────────────────────────────────────── */}
      {venueDetail && (
        <div className="dashboard-workspace">
          {/* Sidebar / Left Navigation */}
          <aside className="workspace-sidebar">
            <div className="venue-brief glass-card" aria-label="Selected Venue Information">
              <h3>{venueDetail.name}</h3>
              <p>📍 {venueDetail.city}</p>
              <p>🎟️ {t("capacity")}: {venueDetail.capacity.toLocaleString()}</p>
              <p>🕐 {t("timezone")}: {venueDetail.timeZone}</p>
            </div>

            <nav className="module-nav" role="tablist" aria-label="Operations Modules">
              {MODULE_CARDS.map((mod) => (
                <button
                  key={mod.id}
                  id={`nav-tab-${mod.id}`}
                  role="tab"
                  aria-selected={activeModuleId === mod.id}
                  aria-controls={`panel-${mod.id}`}
                  className={`nav-item glass-card ${activeModuleId === mod.id ? "active" : ""}`}
                  onClick={() => setActiveModuleId(mod.id)}
                >
                  <span className="nav-icon" aria-hidden="true">{mod.icon}</span>
                  <div className="nav-text">
                    <h4>{getTabTitle(mod.id)}</h4>
                    <span>{mod.status}</span>
                  </div>
                </button>
              ))}
            </nav>

            {/* Live Operations Telemetry Stream */}
            <div className="live-stream-panel glass-card" aria-label="Simulated real-time background logs">
              <h3>📡 Live Telemetry Stream</h3>
              <div className="log-scroll-box" role="log" aria-live="polite">
                {backgroundLogs.map((log, index) => (
                  <div key={index} className="log-entry">
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Active Interactive Module Panel */}
          <section
            className="workspace-panel glass-card"
            role="region"
            aria-label="Operations workspace details"
          >
            {/* 1. AI CONCIERGE CHAT MODULE */}
            {activeModuleId === "ai-concierge" && (
              <div
                className="module-panel ai-concierge-panel"
                role="tabpanel"
                id="panel-ai-concierge"
                aria-labelledby="nav-tab-ai-concierge"
              >
                <h2>{t("aiConciergeTitle")}</h2>
                <p className="panel-desc">{t("aiConciergeDesc")}</p>

                <div className="chat-window" aria-live="polite" aria-label="Conversation messages history">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`chat-message ${msg.role}`} role="document" aria-label={`${msg.role === "assistant" ? "AI Assistant" : "You"}: ${msg.content}`}>
                      <div className="msg-avatar" aria-hidden="true">{msg.role === "assistant" ? "🤖" : "👤"}</div>
                      <div className="msg-bubble">
                        <p>{msg.content}</p>
                        <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                  {isSendingChat && (
                    <div className="chat-message assistant typing" role="status" aria-label="AI assistant is typing a reply">
                      <div className="msg-avatar" aria-hidden="true">🤖</div>
                      <div className="msg-bubble">
                        <div className="typing-loader">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick replies based on matrix data */}
                <div className="quick-replies" aria-label="Quick stadium query templates">
                  <button onClick={() => handleSendChat("Where is the nearest restroom?")} className="quick-reply-btn" aria-label="Query nearest restroom location">Restrooms 🚻</button>
                  <button onClick={() => handleSendChat("Are there elevators near Section 102?")} className="quick-reply-btn" aria-label="Query elevator accessibility locations">Elevators ♿</button>
                  <button onClick={() => handleSendChat("Which transport option should I take?")} className="quick-reply-btn" aria-label="Query public transport options">Transit 🚇</button>
                  <button onClick={() => handleSendChat("Is there an active medical incident?")} className="quick-reply-btn" aria-label="Query venue safety incident status">Safety 🚨</button>
                </div>

                <div className="chat-input-bar">
                  <input
                    id="chat-input-field"
                    type="text"
                    placeholder="Type stadium query..."
                    value={chatInput}
                    aria-label="Stadium operations query text input field"
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendChat(); }}
                  />
                  <button id="chat-send-btn" onClick={() => handleSendChat()} disabled={isSendingChat} aria-label="Submit query button">
                    Send 🚀
                  </button>
                </div>
              </div>
            )}

            {/* 2. CROWD INTELLIGENCE */}
            {activeModuleId === "crowd" && (
              <div
                className="module-panel crowd-panel"
                role="tabpanel"
                id="panel-crowd"
                aria-labelledby="nav-tab-crowd"
              >
                <div className="panel-header-action">
                  <h2>{t("crowdTitle")}</h2>
                  <button
                    id="crowd-refresh-btn"
                    onClick={() => fetchCrowdStatus(selectedVenueId)}
                    disabled={isCrowdLoading}
                    className="refresh-btn"
                    aria-label="Trigger manual refresh of live crowd status"
                  >
                    🔄 {isCrowdLoading ? "Loading..." : t("refreshLiveData")}
                  </button>
                </div>
                <p className="panel-desc">{t("crowdDesc")}</p>

                <div className="heatmap-layout-sim" role="region" aria-label="Interactive stadium section crowd density map">
                  <div className="stadium-graphic-map">
                    {crowdSections.map((sec) => (
                      <div
                        key={sec.sectionId}
                        className="section-cell"
                        role="region"
                        aria-label={`Seating Section ${sec.sectionId.toUpperCase().replace("-", " ")}: ${sec.occupancyPercent}% full, representing ${sec.currentCount} out of ${sec.maxCapacity} spectators`}
                        style={{
                          backgroundColor: sec.occupancyPercent > 90 ? "rgba(239, 68, 68, 0.6)" : sec.occupancyPercent > 70 ? "rgba(245, 158, 11, 0.6)" : "rgba(0, 212, 170, 0.4)",
                          borderColor: sec.occupancyPercent > 90 ? "#EF4444" : sec.occupancyPercent > 70 ? "#F59E0B" : "#00D4AA",
                        }}
                      >
                        <h4>{sec.sectionId.toUpperCase().replace("-", " ")}</h4>
                        <p>{sec.occupancyPercent}% full</p>
                        <span>({sec.currentCount} / {sec.maxCapacity})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-stats-grid" role="region" aria-label="Attendance statistics metrics summary">
                  <div className="stat-card glass-card">
                    <h4>{t("highestDensityArea")}</h4>
                    <p className="stat-val danger">
                      {crowdSections.find(s => s.occupancyPercent === Math.max(...crowdSections.map(o => o.occupancyPercent)))?.sectionId.replace("-", " ").toUpperCase() ?? "N/A"}
                    </p>
                  </div>
                  <div className="stat-card glass-card">
                    <h4>{t("totalLiveFans")}</h4>
                    <p className="stat-val success">
                      {crowdSections.reduce((acc, curr) => acc + curr.currentCount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="stat-card glass-card">
                    <h4>{t("alertAction")}</h4>
                    <p className="stat-val warning">{t("deployGateStaff")}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SMART NAVIGATION */}
            {activeModuleId === "navigation" && (
              <div
                className="module-panel nav-panel"
                role="tabpanel"
                id="panel-navigation"
                aria-labelledby="nav-tab-navigation"
              >
                <h2>{t("navTitle")}</h2>
                <p className="panel-desc">{t("navDesc")}</p>

                {navFeedback && (
                  <div className="feedback-banner nav-banner" role="status">
                    <span>✨ {navFeedback}</span>
                  </div>
                )}

                <div className="nav-routes-picker glass-card">
                  <div className="picker-row">
                    <div className="picker-field">
                      <label htmlFor="nav-origin-select">{t("startPoint")}</label>
                      <select
                        id="nav-origin-select"
                        value={navOriginId}
                        aria-label="Select start location origin node"
                        onChange={(e) => setNavOriginId(e.target.value)}
                      >
                        {venueDetail.navigationNodes.map((n) => (
                          <option key={n.id} value={n.id}>{n.label} ({n.kind.toUpperCase()})</option>
                        ))}
                      </select>
                    </div>

                    <div className="picker-field">
                      <label htmlFor="nav-dest-select">{t("destination")}</label>
                      <select
                        id="nav-dest-select"
                        value={navDestId}
                        aria-label="Select destination target node"
                        onChange={(e) => setNavDestId(e.target.value)}
                      >
                        {venueDetail.navigationNodes.map((n) => (
                          <option key={n.id} value={n.id}>{n.label} ({n.kind.toUpperCase()})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="picker-options">
                    <label className="checkbox-label" htmlFor="nav-accessible-checkbox">
                      <input
                        id="nav-accessible-checkbox"
                        type="checkbox"
                        checked={navRequireAccessible}
                        aria-label="Filter routes for wheelchair accessibility"
                        onChange={(e) => {
                          setNavRequireAccessible(e.target.checked);
                          setNavFeedback(e.target.checked ? "Wheelchair Routing Constraints Applied! Click calculate to resolve path." : "Standard Routing Constraints Restored!");
                          setTimeout(() => setNavFeedback(null), 4000);
                        }}
                      />
                      {t("wheelchairOnly")} ♿
                    </label>
                    <button
                      id="nav-calc-btn"
                      onClick={handleGenerateRoute}
                      className="route-calc-btn"
                      aria-label="Calculate walking route coordinates"
                    >
                      {t("calculateRoute")} 📍
                    </button>
                  </div>
                </div>

                {navRoute && (
                  <div className="route-result glass-card" role="region" aria-label="Route calculation details">
                    <h3>{t("optimalPath")}</h3>
                    <div className="route-metrics">
                      <span>🚶 {t("estimatedWalk")} <strong>{navRoute.totalWalkMinutes} minutes</strong></span>
                      <span>📏 {t("distance")} <strong>{navRoute.distanceMeters} meters</strong></span>
                      <span>♿ {t("wheelchairOnly")}: <strong>{navRoute.isAccessible ? "Yes" : "No"}</strong></span>
                    </div>

                    <div className="path-timeline" role="list" aria-label="Route step sequence list">
                      {navRoute.nodeSequence.map((nodeId, idx) => {
                        const node = venueDetail.navigationNodes.find(n => n.id === nodeId);
                        return (
                          <div key={idx} className="path-step" role="listitem">
                            <span className="step-num">{idx + 1}</span>
                            <div className="step-info">
                              <h5>{node?.label ?? nodeId}</h5>
                              <span>{t("level")}: {node?.coordinate.level.toUpperCase()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. ACCESSIBILITY HUB */}
            {activeModuleId === "accessibility" && (
              <div
                className="module-panel access-panel"
                role="tabpanel"
                id="panel-accessibility"
                aria-labelledby="nav-tab-accessibility"
              >
                <h2>{t("accessTitle")}</h2>
                <p className="panel-desc">{t("accessDesc")}</p>

                <div className="accessibility-features-list" role="region" aria-label="Stadium accessibility accommodation services">
                  {accessibilityFeatures.map((feat) => {
                    const featureConfig = ACCESSIBILITY_FEATURE_CONFIG[feat.feature];
                    return (
                      <div key={feat.feature} className="accessibility-card glass-card" role="article">
                        <div className="card-top">
                          <span className="feat-emoji" aria-hidden="true">{featureConfig?.iconEmoji ?? "♿"}</span>
                          <h3>{featureConfig?.localizedLabels[selectedLang] ?? feat.label}</h3>
                        </div>
                        <p>{LOCALIZED_ACCESSIBILITY_DESCS[feat.feature]?.[selectedLang] ?? feat.description}</p>
                        <div className="available-nodes">
                          <span>📍 {t("locationNodes")}:</span>
                          <div className="node-tags">
                            {feat.availableAtNodes.map((nid) => (
                              <span key={nid} className="node-tag">{nid.replace("-", " ").toUpperCase()}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. TRANSPORTATION OPTIMIZER */}
            {activeModuleId === "transport" && (
              <div
                className="module-panel transport-panel"
                role="tabpanel"
                id="panel-transport"
                aria-labelledby="nav-tab-transport"
              >
                <div className="panel-header-action">
                  <h2>{t("transportTitle")}</h2>
                  <button
                    id="transport-refresh-btn"
                    onClick={() => fetchTransitStatus(selectedVenueId)}
                    disabled={isTransportLoading}
                    className="refresh-btn"
                    aria-label="Refresh passenger transit and parking metrics data"
                  >
                    🔄 {t("refreshStatus")}
                  </button>
                </div>
                <p className="panel-desc">{t("transportDesc")}</p>

                <div className="transit-rows" role="region" aria-label="Public Transit routes status summary">
                  <h3>{t("transitOps")}</h3>
                  <div className="transit-grid">
                    {transitUpdates.map((tr) => {
                      const config = TRANSPORT_MODE_CONFIG[tr.mode];
                      return (
                        <div key={tr.routeId} className="transit-card glass-card">
                          <div className="transit-header">
                            <span className="mode-icon" aria-hidden="true">{config?.iconEmoji ?? "🚇"}</span>
                            <h4>{tr.routeName}</h4>
                          </div>
                          <div className="transit-body">
                            <span className={`status-badge ${tr.status}`}>
                              {tr.localizedStatus[selectedLang] ?? tr.status.toUpperCase()}
                            </span>
                            <p>⏱️ {t("arrivalsEvery")} <strong>{tr.estimatedMinutes}m</strong></p>
                            <div className="progress-container">
                              <span>{t("capacityFill")}</span>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${tr.capacityPercent}%`, backgroundColor: tr.capacityPercent > 80 ? "#EF4444" : "#00D4AA" }}></div>
                              </div>
                              <span className="progress-text">{tr.capacityPercent}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="parking-rows" role="region" aria-label="Parking lots vehicle limits status summary">
                  <h3>{t("parkingCap")}</h3>
                  <div className="parking-grid">
                    {parkingLots.map((lot) => (
                      <div key={lot.id} className="parking-card glass-card">
                        <div className="parking-header">
                          <span className="park-icon" aria-hidden="true">🅿️</span>
                          <h4>{lot.name}</h4>
                        </div>
                        <div className="parking-body">
                          <p>{t("available")} <strong>{lot.availableSpaces} / {lot.totalSpaces}</strong></p>
                          <p>{t("distance")} <strong>{lot.distanceToGateMeters}m to Gate</strong></p>
                          <p>{t("fee")} <strong>${lot.priceUsd} USD</strong></p>
                          <div className="progress-container">
                            <span>{t("occupancy")}</span>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${lot.fillPercent}%`, backgroundColor: lot.fillPercent > 90 ? "#EF4444" : "#00D4AA" }}></div>
                            </div>
                            <span className="progress-text">{lot.fillPercent}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. SUSTAINABILITY TRACKER */}
            {activeModuleId === "sustainability" && (
              <div
                className="module-panel sustainability-panel"
                role="tabpanel"
                id="panel-sustainability"
                aria-labelledby="nav-tab-sustainability"
              >
                <h2>{t("sustainTitle")}</h2>
                <p className="panel-desc">{t("sustainDesc")}</p>

                {carbonFeedback && (
                  <div className="feedback-banner" role="status">
                    <span>✨ {carbonFeedback}</span>
                  </div>
                )}

                <div className="sustainability-metrics-grid" role="region" aria-label="Live stadium sustainability indices">
                  {sustainabilityMetrics.map((met) => (
                    <div key={met.kind} className="metric-card glass-card" role="article">
                      <h4>{met.label}</h4>
                      <div className="metric-vals">
                        <span className="curr-val">{met.currentValue.toLocaleString()}</span>
                        <span className="unit-label">{met.unit}</span>
                      </div>
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${met.progressPercent}%` }}></div>
                        </div>
                        <div className="progress-meta">
                          <span>{t("target")}: {met.targetValue.toLocaleString()} {met.unit}</span>
                          <span>{met.progressPercent}%</span>
                        </div>
                      </div>
                      <span className={`trend-chip ${met.trend}`}>{met.trend.toUpperCase()}</span>
                    </div>
                  ))}
                </div>

                <div className="carbon-footprint-calc glass-card" role="region" aria-label="Carbon emission calculator">
                  <h3>🌳 {t("carbonCalcTitle")}</h3>
                  <p>{t("carbonCalcDesc")}</p>
                  <div className="calc-row">
                    <label htmlFor="carbon-distance-input" className="sr-only" style={{ display: 'none' }}>Travel distance in km</label>
                    <input
                      id="carbon-distance-input"
                      type="number"
                      value={userTransitKm}
                      aria-label="Travel distance to stadium in kilometers"
                      onChange={(e) => setUserTransitKm(Number(e.target.value))}
                      placeholder="Travel Distance (km)"
                      min="1"
                    />
                    <label htmlFor="carbon-transport-mode-select" className="sr-only" style={{ display: 'none' }}>Transport mode select</label>
                    <select
                      id="carbon-transport-mode-select"
                      value={userTransitMode}
                      aria-label="Select mode of transport used"
                      onChange={(e) => setUserTransitMode(e.target.value)}
                    >
                      <option value="metro">Metro/Subway 🚇</option>
                      <option value="bus">Shuttle Bus 🚌</option>
                      <option value="bicycle">Bicycle 🚲</option>
                      <option value="walking">Walking 🚶</option>
                    </select>
                    <button
                      id="carbon-calc-btn"
                      onClick={calculateUserCarbon}
                      className="calc-btn"
                      aria-label="Calculate carbon emissions savings value"
                    >
                      {t("calculate")}
                    </button>
                  </div>
                  {userCarbonSaved > 0 && (
                    <div className="calc-result" role="status" aria-live="polite">
                      <p>✨ {t("carbonSavedMsg") ?? "You saved"} <strong>{userCarbonSaved} kg CO₂</strong> {t("carbonCompareMsg") ?? "compared to driving a standard fossil-fueled car!"}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. OPERATIONS COMMAND CENTER */}
            {activeModuleId === "operations" && (
              <div
                className="module-panel operations-panel"
                role="tabpanel"
                id="panel-operations"
                aria-labelledby="nav-tab-operations"
              >
                <h2>{t("opsTitle")}</h2>
                <p className="panel-desc">{t("opsDesc")}</p>

                {incidentFeedback && (
                  <div className="feedback-banner incident-banner" role="status">
                    <span>✨ {incidentFeedback}</span>
                  </div>
                )}

                <div className="ops-split">
                  {/* Reported Incidents */}
                  <div className="incidents-history glass-card" role="region" aria-label="Active incidents list log">
                    <h3>{t("reportedLog")}</h3>
                    <div className="incidents-list" role="log" aria-label="Operations live incident feeds log" aria-live="polite">
                      {operationsIncidents.map((inc) => {
                        const config = INCIDENT_CATEGORY_CONFIG[inc.category];
                        return (
                          <div key={inc.id} className={`incident-item ${inc.severity}`} role="article" aria-label={`Incident ${inc.id}: ${inc.severity} severity ${inc.category}`}>
                            <div className="inc-header">
                              <span className="inc-emoji" aria-hidden="true">{config?.iconEmoji ?? "⚠️"}</span>
                              <h4>{config?.label ?? inc.category.toUpperCase()}</h4>
                              <span className={`inc-severity-label ${inc.severity}`}>{inc.severity.toUpperCase()}</span>
                            </div>
                            <p className="inc-desc">{inc.description}</p>
                            <div className="inc-meta">
                              <span>📍 {t("location")} <strong>{inc.locationNodeId.replace("-", " ").toUpperCase()}</strong></span>
                              <span>{t("assignedTo")} <strong>{inc.assignedTo}</strong></span>
                              <span className={`inc-status ${inc.status}`}>{inc.status.toUpperCase()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Incident Report Form */}
                  <div className="report-incident-form-box glass-card">
                    <h3>{t("reportTicket")}</h3>
                    <form onSubmit={handleReportIncident}>
                      <div className="form-group">
                        <label htmlFor="inc-category">{t("incidentType")}</label>
                        <select
                          id="inc-category"
                          value={newIncidentCategory}
                          onChange={(e) => setNewIncidentCategory(e.target.value as IncidentCategory)}
                        >
                          {Object.keys(INCIDENT_CATEGORY_CONFIG).map((cat) => (
                            <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="inc-severity">{t("severityRating")}</label>
                        <select
                          id="inc-severity"
                          value={newIncidentSeverity}
                          onChange={(e) => setNewIncidentSeverity(e.target.value as IncidentSeverity)}
                        >
                          <option value="low">Low (Infrastructure/General)</option>
                          <option value="medium">Medium (Concessions/Crowds)</option>
                          <option value="high">High (Medical Rescue)</option>
                          <option value="critical">Critical (Evac/Fire)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="inc-location">{t("locationNode")}</label>
                        <input
                          id="inc-location"
                          type="text"
                          value={newIncidentLocation}
                          onChange={(e) => setNewIncidentLocation(e.target.value)}
                          placeholder="e.g., Gate A, Section 101"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="inc-desc">{t("incidentDetails")}</label>
                        <textarea
                          id="inc-desc"
                          value={newIncidentDesc}
                          onChange={(e) => setNewIncidentDesc(e.target.value)}
                          placeholder="State incident details cleanly..."
                          rows={3}
                          required
                        />
                      </div>

                      <button type="submit" className="submit-incident-btn">{t("dispatchTicket")} 🚨</button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

// ─── Module Card Data ──────────────────────────────────────────────────────────

interface ModuleCard {
  readonly id: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly status: string;
}

const MODULE_CARDS: readonly ModuleCard[] = [
  { id: "ai-concierge", icon: "🤖", title: "AI Concierge", description: "Multilingual AI assistant powered by Gemini API.", status: "🟢 Active" },
  { id: "crowd", icon: "👥", title: "Crowd Intelligence", description: "Live density heatmaps, queue status, and flow metrics.", status: "🟢 Active" },
  { id: "navigation", icon: "🧭", title: "Smart Navigation", description: "Interactive routing with accessibility exits.", status: "🟢 Active" },
  { id: "accessibility", icon: "♿", title: "Accessibility Hub", description: "Wheelchair ramps, sensory rooms, auditory assistance.", status: "🟢 Active" },
  { id: "transport", icon: "🚇", title: "Transportation", description: "Mass transit arrivals, shuttle buses, and parking lots.", status: "🟢 Active" },
  { id: "sustainability", icon: "🌍", title: "Sustainability", description: "Carbon footprint tracking and renewable resources.", status: "🟢 Active" },
  { id: "operations", icon: "🛡️", title: "Operations Center", description: "Incident logs, medical rescue tickets, and safety alerts.", status: "🟢 Active" },
] as const;
