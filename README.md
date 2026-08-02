# Ew2R3.org interactive visualization — v0.1.0-rc.2

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21757889.svg)](https://doi.org/10.5281/zenodo.21757889)

Current archived release: [v0.1.0-rc.2](https://doi.org/10.5281/zenodo.21757889).
For citations spanning all software versions, use the concept DOI
[`10.5281/zenodo.21757888`](https://doi.org/10.5281/zenodo.21757888).

This package contains the tested static WebGL visualization, supporting pages,
and browser regression tests published as the first public release candidate.

## Scope

- `site/` — exact static staging artifact;
- `tests/` — browser regression tests used for body pairs, scale transitions,
  orbital focus, responsive layout, routes, and languages;
- `VERSION` — candidate version;
- `CITATION.cff` — software citation metadata;
- `.zenodo.json` and `ZENODO.json` — Zenodo deposit metadata;
- `ASSET-PROVENANCE.md` — redistributed-asset and runtime-dependency audit;
- `LICENSE.md` and `TRADEMARKS.md` — CC BY-NC-ND 4.0 release terms and reserved marks;
- `SHA256SUMS.csv` — generated file inventory and hashes.

The three existing article DOIs identify preprints, not this software. The
software release has its own Zenodo DOI: `10.5281/zenodo.21757889`.

## Reproduce locally

Serve `site/` from a local static HTTP server under `/ew2r3-preview/`, or use
the published staging URL while it remains available. Browser tests require
Node.js, Playwright, and Google Chrome. Example:

```powershell
$env:NODE_PATH='<playwright node_modules path>'
node tests/test_p0_body_categories.js 'http://127.0.0.1:8080/ew2r3-preview/'
node tests/test_p1_routes_languages.js 'http://127.0.0.1:8080/ew2r3-preview/'
```

## Current verification

- P0 category matrix: 24/24;
- modeled planet/moon pair matrix: 24/24;
- P1 route/language/mobile matrix: 64/64;
- scale-cycle, true-scale, card layout, local focus and eight orbital
  eccentricities: passed.

## Public/private boundary

This repository contains only the public software release. Internal research
materials, unpublished paper titles, working plans, credentials, deployment
secrets, and private project history are intentionally excluded.
