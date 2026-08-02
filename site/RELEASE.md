# Ew2R3.org — web release candidate

Date: 2026-07-31  
Status: local release candidate; not published.

## Reading receipts

- прочитано: `docs/site/ew2r3-public-beta-launch-control-2026-07-30.md`, 6634 із 6634 знаків, 2026-07-31.
- прочитано: `docs/launch/ew2r3-release-gate-v1-2026-07-31.md`, 1906 із 1906 знаків, 2026-07-31.
- прочитано: `docs/analytics/google-analytics-status-2026-06-20.md`, 1357 із 1357 знаків, 2026-07-31.
- прочитано: `claude-opus-5-solar-system-3d/README.md`, 18642 із 18642 знаків, 2026-07-31.

## Purpose versus checklist

Checklist result: a clean static Apache package now contains the visualization, calculator,
research list, FAQ, About, Support, Contact, Privacy, Thanks, 404, robots and sitemap.

Purpose result: the package creates one public path from visualization to reproducible calculation,
research sources, contact and voluntary support. It does not yet prove production analytics,
CDN/DDoS protection or payment conversion because the candidate has not been published.

## Routes

- `/` — interactive visualization.
- `/verify/` — required T and R inputs; E and omega result; no mass or G input.
- `/research/` — three public preprints with DOI links and status boundary.
- `/faq/`, `/about/`, `/contact/`.
- `/support/` — Patreon and direct-card slots; intentionally disabled until exact URLs are approved.
- `/thanks/` — noindex payment-return page.
- `/privacy/`, `/404.html`, `/robots.txt`, `/sitemap.xml`.

## Mobile-first verification

- Browser viewport 360 × 800: document width 360; visualization loaded; no horizontal overflow.
- Browser viewport 390 × 844: document width 390; main controls occupy separate vertical bands.
- Long dimensional/history lines are hidden at <= 640 px; the core formula remains visible.
- WebGL DPR is capped at 1.25 on narrow or constrained devices and at 2 on desktop.
- `/verify/` at 390 × 844: header height 59 px, content width 375 px including scrollbar,
  calculator result for Earth example `1.327130928e+20 m³/s²`.

## Automated checks

- 13 built-in visualization self-tests: passed in the browser.
- Inline JavaScript blocks parsed: 5; syntax errors: 0.
- 13 required local HTTP routes/assets: HTTP 200.
- Private absolute `D:\...` and `file://` paths in public HTML: 0.

## Not yet closed

- Production publish and production rollback test.
- Cloudflare DNS/proxy/cache/Web Analytics.
- GA4 Realtime and custom-event receipt.
- Patreon creator URL.
- Direct-card merchant/legal route.
- German and Spanish interface translations.
- A separate Lite asset/data build; the current first candidate uses automatic mobile render limiting.

## Exact launch sequence

1. Dmitro reviews the local candidate.
2. Confirm production publication explicitly.
3. Obtain the existing Apache hosting access route.
4. Save the current live root as rollback and upload this directory.
5. Verify HTTPS, routes, WebGL, 404 and analytics on `https://ew2r3.org`.
6. Move DNS through Cloudflare only after origin rollback is proven.
7. Add Patreon URL when the creator page exists; add direct payment in a later legal/merchant stage.
