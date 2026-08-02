# Ew2R3.org web release candidate 0.1.0-rc.3

Date: 2026-08-02
Status: tested public release candidate.

## Reading receipts

- прочитано: `docs/site/ew2r3-public-beta-launch-control-2026-07-30.md`, 6634 із 6634 знаків, 2026-07-31.
- прочитано: `docs/launch/ew2r3-release-gate-v1-2026-07-31.md`, 1906 із 1906 знаків, 2026-07-31.
- прочитано: `docs/analytics/google-analytics-status-2026-06-20.md`, 1357 із 1357 знаків, 2026-07-31.
- прочитано: `claude-opus-5-solar-system-3d/README.md`, 18642 із 18642 знаків, 2026-07-31.

## Checklist and purpose

Checklist: the public package contains the visualization, E calculator,
research programme, FAQ, About, Support, Contact, Privacy, Thanks, 404, robots,
sitemap, consent-gated analytics and regression tests.

Purpose: the package creates a verifiable public path from visualization to
calculation, public preprints, contact and voluntary support. Future paper
titles, credentials and private working material are excluded.

## Automated verification

- P0 categories: 24/24.
- Planet/moon pairs: 24/24.
- Route/language/mobile matrix: 144/144.
- Analytics consent and event contract: passed.
- Physical 1:1 radii and moon-orbit distances: exact within test tolerance.
- Orbital focus/eccentricity checks: passed for all eight planets.

## Deployment boundary

`site/` uses production-root URLs for `https://ew2r3.org/`. The staging deploy
script transforms only the deployed staging copy to `/ew2r3-preview/`; it does
not alter the versioned production artifact.
