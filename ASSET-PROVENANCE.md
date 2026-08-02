# Asset and dependency provenance

Inventory date: 2026-07-31.

## Redistributed files

| Component | Origin visible in package | Redistribution status |
|---|---|---|
| `site/index.html` WebGL model, shaders, UI and procedural body textures | Project source; textures are generated at runtime with Canvas2D. The source explicitly states that it uses pure WebGL + Canvas2D without external libraries, CDN assets or network textures. | CC BY-NC-ND 4.0. |
| Static HTML, CSS and JavaScript under `site/` | Project-authored release implementation. | CC BY-NC-ND 4.0. |
| `site/assets/og-cover-source.html` | Project-authored HTML/CSS composition. | CC BY-NC-ND 4.0. |
| `site/assets/og-cover.png` | Raster rendering of the adjacent project-authored HTML/CSS source. | CC BY-NC-ND 4.0; no third-party image is embedded. |
| Browser regression tests under `tests/` | Project-authored test implementation. | CC BY-NC-ND 4.0. |

## Runtime and external references not redistributed

- No third-party JavaScript or CSS library is bundled.
- Google Analytics 4 is configured with measurement ID `G-WT5DD2S88Z`, but its loader is consent-gated: no Google Analytics script is requested until the visitor selects **Allow**. `googletagmanager.com` is therefore an optional runtime service dependency, not a redistributed asset.
- NASA/JPL SSD and SOHO URLs in comments/source notes identify observational data sources. Their pages or media are not copied into this package.
- WarpDrive.RWA.ua and WarpDrive.RWA.bayern are outbound project links, not bundled content.
- System font stacks (`Inter`, `Segoe UI`, `Arial`, monospace fallbacks) do not redistribute font files.

## Open items before public release

1. Keep the CC BY-NC-ND 4.0 notice and trademark reservation in the published package.
2. Confirm the owner is authorized to license the project-authored source and AI-assisted contributions under those terms.
3. Keep observational-data citations in the published documentation even though the data pages are not redistributed.

No unknown image, texture, font file, minified library, or binary dependency was found in the 2026-07-31 release candidate.
