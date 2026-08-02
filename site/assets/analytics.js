(() => {
  const config = window.EW2R3_CONFIG || {};
  const provider = String(config.analyticsProvider || "").toLowerCase();
  const productionHosts = new Set(["ew2r3.org", "www.ew2r3.org"]);
  const allowedHosts = new Set([...productionHosts, "claude.rwa.bayern", "localhost", "127.0.0.1"]);
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const params = new URLSearchParams(location.search);
  const incoming = {};
  utmKeys.forEach((key) => {
    const value = params.get(key);
    if (value) incoming[key] = value.slice(0, 160);
  });
  if (Object.keys(incoming).length) sessionStorage.setItem("ew2r3:utm", JSON.stringify(incoming));
  let storedUtm = {};
  try { storedUtm = JSON.parse(sessionStorage.getItem("ew2r3:utm") || "{}"); } catch (_) {}

  const commonContext = () => ({
    ...storedUtm,
    language: (document.documentElement.lang || "en").toLowerCase(),
    referrer_host: (() => { try { return document.referrer ? new URL(document.referrer).hostname : ""; } catch (_) { return ""; } })(),
    viewport_class: innerWidth < 600 ? "mobile" : innerWidth < 1024 ? "tablet" : "desktop",
    schema_version: 1,
  });

  window.EW2R3_ANALYTICS_DEBUG = [];
  window.ewTrack = (name, params = {}) => {
    const safe = { ...params, page_path: location.pathname };
    window.dispatchEvent(new CustomEvent("ew2r3:event", { detail: { name, params: safe } }));
  };
  window.addEventListener("ew2r3:event", (event) => {
    const detail = event.detail || {};
    const payload = { ...commonContext(), ...(detail.params || {}) };
    window.EW2R3_ANALYTICS_DEBUG.push({ name: detail.name, params: payload });
    if (window.EW2R3_ANALYTICS_DEBUG.length > 50) window.EW2R3_ANALYTICS_DEBUG.shift();
    if (provider === "ga4" && typeof window.gtag === "function") window.gtag("event", detail.name, payload);
    if (provider === "posthog" && window.posthog && typeof window.posthog.capture === "function") window.posthog.capture(detail.name, payload);
    if (provider === "umami" && window.umami && typeof window.umami.track === "function") window.umami.track(detail.name, payload);
  });

  const queued = Array.isArray(window.EW2R3_EVENT_QUEUE) ? window.EW2R3_EVENT_QUEUE.splice(0) : [];
  window.EW2R3_ANALYTICS_READY = true;
  queued.forEach(({ name, params }) => window.ewTrack(name, params));
  window.ewTrack("page_view", { page_title: document.title });

  if (!provider || !allowedHosts.has(location.hostname)) return;

  const consentKey = "ew2r3:analytics-consent";
  const consentCopy = {
    en: ["Anonymous visit statistics", "Allow anonymous analytics so we can see which links and pages work. No advertising profiles.", "Allow", "Decline"],
    uk: ["Анонімна статистика відвідувань", "Дозволити анонімну аналітику, щоб бачити, які посилання та сторінки працюють. Без рекламних профілів.", "Дозволити", "Відхилити"],
    de: ["Anonyme Besuchsstatistik", "Anonyme Analysen erlauben, damit wir sehen, welche Links und Seiten funktionieren. Keine Werbeprofile.", "Erlauben", "Ablehnen"],
    es: ["Estadísticas anónimas de visitas", "Permita análisis anónimos para saber qué enlaces y páginas funcionan. Sin perfiles publicitarios.", "Permitir", "Rechazar"],
    fr: ["Statistiques de visite anonymes", "Autorisez les mesures anonymes pour savoir quels liens et pages fonctionnent. Aucun profil publicitaire.", "Autoriser", "Refuser"],
    it: ["Statistiche anonime sulle visite", "Consenti analisi anonime per capire quali link e pagine funzionano. Nessun profilo pubblicitario.", "Consenti", "Rifiuta"],
    pt: ["Estatísticas anónimas de visitas", "Permita análises anónimas para sabermos quais links e páginas funcionam. Sem perfis publicitários.", "Permitir", "Recusar"],
    ar: ["إحصاءات زيارة مجهولة", "اسمح بتحليلات مجهولة لمعرفة الروابط والصفحات الفعالة. لا ملفات إعلانية.", "سماح", "رفض"],
    ja: ["匿名の訪問統計", "どのリンクやページが役立つかを確認するため、匿名解析を許可してください。広告プロファイルは作成しません。", "許可", "拒否"],
  };

  const loadProvider = () => {
    if (provider === "ga4" && config.gaMeasurementId && !window.EW2R3_GA_LOADED) {
      window.EW2R3_GA_LOADED = true;
      const id = config.gaMeasurementId;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", id, { anonymize_ip: true, send_page_view: false });
      window.gtag("event", "page_view", { ...commonContext(), page_path: location.pathname, page_title: document.title });
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
      document.head.appendChild(script);
    }
  };

  const consent = localStorage.getItem(consentKey);
  if (consent === "granted") { loadProvider(); return; }
  if (consent === "denied") return;

  const showConsent = () => {
    if (document.getElementById("ew2r3-consent")) return;
    const lang = (document.documentElement.lang || "en").toLowerCase().split("-")[0];
    const copy = consentCopy[lang] || consentCopy.en;
    const box = document.createElement("aside");
    box.id = "ew2r3-consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", copy[0]);
    box.style.cssText = "position:fixed;z-index:100000;left:max(12px,env(safe-area-inset-left));right:max(12px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));margin:auto;max-width:720px;padding:16px 18px;border:1px solid #344055;border-radius:14px;background:#0d1420f2;color:#e9eef8;font:15px/1.45 system-ui,sans-serif;box-shadow:0 18px 55px #000b";
    box.innerHTML = `<strong>${copy[0]}</strong><div style="margin:6px 0 12px;color:#b7c2d6">${copy[1]}</div><div style="display:flex;gap:8px;justify-content:flex-end"><button data-consent="denied">${copy[3]}</button><button data-consent="granted">${copy[2]}</button></div>`;
    box.querySelectorAll("button").forEach((button) => {
      button.style.cssText = "padding:9px 14px;border:1px solid #41516b;border-radius:9px;background:#172238;color:#fff;cursor:pointer";
      button.addEventListener("click", () => {
        const value = button.dataset.consent;
        localStorage.setItem(consentKey, value);
        box.remove();
        if (value === "granted") loadProvider();
      });
    });
    document.body.appendChild(box);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showConsent, { once: true });
  else showConsent();

  /* Provider loading is deliberately consent-gated above. */
  if (false && provider === "ga4" && config.gaMeasurementId) {
    const id = config.gaMeasurementId;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(script);
  }
  // PostHog and Umami are not used in release v0.1.0.
})();
