# Ew2R3.org interactive visualization — v0.1.0-rc.3

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21757888.svg)](https://doi.org/10.5281/zenodo.21757888)

This package contains the tested static WebGL visualization, supporting pages,
and browser regression tests. Until the rc.3 Zenodo version DOI is minted, cite
the software concept DOI [`10.5281/zenodo.21757888`](https://doi.org/10.5281/zenodo.21757888).
The previous archived version is [rc.2](https://doi.org/10.5281/zenodo.21757889).

## Scope

- `site/` — exact production-root static artifact;
- `tests/` — browser regression tests for body pairs, scale transitions,
  orbital focus, responsive layout, routes, languages and analytics;
- `VERSION`, `CITATION.cff`, `.zenodo.json`, `ZENODO.json` — release metadata;
- `ASSET-PROVENANCE.md` — redistributed-asset and dependency audit;
- `LICENSE.md`, `TRADEMARKS.md` — release terms and reserved marks;
- `SHA256SUMS.csv` — generated public-file inventory and hashes.

The three article DOIs identify public preprints, not this software release.

## Reproduce locally

Serve `site/` from the root of a local static HTTP server. Browser tests require
Node.js, Playwright and Google Chrome. Examples:

```powershell
$env:NODE_PATH='<playwright node_modules path>'
node tests/test_p0_body_categories.js 'http://127.0.0.1:8080/'
node tools/test_p1_routes_languages.js '<absolute-path-to-site>'
```

## Current verification

- P0 category matrix: 24/24;
- modeled planet/moon pair matrix: 24/24;
- P1 route/language/mobile matrix: 144/144;
- analytics consent and event contract: passed;
- scale-cycle, physical 1:1 scale, card layout, local focus and eight orbital
  eccentricities: passed.

## Public/private boundary

This repository contains only the public software release. Internal research
materials, future paper titles, working plans, credentials, deployment secrets
and private project history are intentionally excluded.
