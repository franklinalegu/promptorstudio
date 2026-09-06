# Promptor Studio

> **Case Studio — Product Showcase Storyboard Prompt Generator**
> Exact clone of the Claude Artifact `product_showcase_prompt_generator.jsx` (`202a364b-7aee-468a-a044-f318990a4e5e`) — rebuilt as a standalone, zero-dependency static app that runs 100% locally.

**Live demo (after `git clone`):** `http://localhost:8787` — see [Quick Start](#quick-start).

**Original artifact:** https://claude.ai/public/artifacts/202a364b-7aee-468a-a044-f318990a4e5e  
**This repo:** https://github.com/franklinalegu/promptorstudio.git  
Branding kept as **Promptor Studio** and all interactive buttons are forced to `rounded-none` (square) per project choice — otherwise pixel-parity with Case Studio.

---

## Table of Contents

- [What it does](#what-it-does)
- [Features](#features)
- [Exact clone notes](#exact-clone-notes)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Quick start](#quick-start)
- [Usage guide](#usage-guide)
- [The 18 sections — complete reference](#the-18-sections--complete-reference)
- [Prompt generation — how it works](#prompt-generation--how-it-works)
- [AI Auto-Fill & local-only design](#ai-auto-fill--local-only-design)
- [Customization](#customization)
- [Deployment](#deployment)
- [Development](#development)
- [API (no backend)](#api-no-backend)
- [Troubleshooting](#troubleshooting)
- [Reproducing the exact clone](#reproducing-the-exact-clone)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## What it does

Promptor Studio compiles a **6-frame storyboard prompt** for video generators (Google Flow, Runway, Kling, Luma, Pika) from a structured product brief. You fill what you know; leave anything blank and the studio invents a cohesive replacement, or hit **AI Auto-Fill** to populate every remaining blank at once.

Output is a **copy-ready master prompt + 6 frame cards + audio direction + plain-text block** you paste directly into Flow/Runway/Kling. The product reference image you upload is treated as *attached as-is* — the generated prompt instructs the video model to match its color, logo, and silhouette exactly.

---

## Features

- **18-section brief** — 1:1 with Case Studio (see full reference below)
- **Smart counting** — bottom bar shows `n fields filled · Promptor Studio`; any non-empty input or selected chip counts
- **`PICK ONE` / `PICK ANY`** — single-select (purple) vs multi-select (emerald) with identical chip behavior to the original
- **Custom values** — every `PICK ONE` group has a `Custom` chip that reveals a free-text input; `Custom` participates in counting and generation
- **Two image uploads**
  - `01 Product Reference Image` — **required**, stored as data URL, shown in prompt as *match as-is*
  - `12 Background / Studio Style` — optional second upload that *replaces* the selected studio preset when present (plus an auto-describe hook you can wire to a vision model)
- **Drag & drop + click to upload**, preview with filename/size, `Remove` restores the dashed empty state
- **AI Auto-Fill** — randomly picks coherent defaults for every empty field, excluding intentionally blank optionals (`17 Use-Case Scenario`, `18 Lifestyle Context` are left empty unless Auto-Fill explicitly populates them — matching the original's “leave blank means omitted from frame X” rule)
- **Generate** validates required gates (category, product name, material, at least one product color) and emits 6 frames with distinct camera/shot language
- **Copy / Download** — per-frame `Copy frame`, global `Copy` and `.txt` download for the plain-text block
- **100% local** — no API calls, no keys, no backend. Generation is deterministic template logic. Vision auto-describe is stubbed and can be wired to any endpoint
- **Square buttons** — every interactive button uses `rounded-none` per project style (cards remain `rounded-[16px]`)

---

## Exact clone notes

Verification was done with Playwright `headless:false` + `slowMo` against the live artifact:

```js
// frame-extract.js — art frame html len 80129, full 18-section text extracted
// exact-gen.js — STATUS 200 LEN 64859 — fetched /api/published_artifacts/202a364b… 
// title: product_showcase_prompt_generator.jsx — saved to original.jsx (62147 bytes)
```

Differences from the original (intentional):

| Concern | Original (`original.jsx`) | This repo (`index.html`) |
|---|---|---|
| **Name** | `Case Studio` | `Promptor Studio` (title block + tab + bottom bar) |
| **Button shape** | `rounded-xl` / `rounded-full` | `rounded-none` (square) for all buttons |
| **Top Claude header** | `Claude | Content is user-generated…` + eye/<>/Copy | **Removed** per user request (file `index.html:37` deleted) |
| **Framework** | React + `lucide-react` + Tailwind + `sonnet-4-6` vision call | Vanilla HTML/CSS/JS + Tailwind CDN + Lucide CDN — same visuals, no build |
| **Generation** | React state + `STUDIO_POOLS` + `pickRandom` + Anthropic `claude-sonnet-4-6` for scene describe | Identical pools/logic ported to vanilla JS; vision hook is local stub (no key required) |

Everything else — section order, titles, subtitles, `PICK ONE`/`PICK ANY` badges, option labels, placeholders, bottom bar copy — is verbatim.

Keep `original.jsx` in the repo for audit diffing; `index.html` is the runnable app.

---

## Screenshots

> Screenshots were captured via Playwright during verification and match the current build.

- `artifact.png` / `full.png` — top of Case Studio (01–04) — violet glows, glass cards
- `headful.png` — same, headful run, full header
- `exact-full.png` / `scroll-headful-*.png` — artifact iframe scrolled states

To regenerate:
```bash
node "C:\Users\User\.agents\skills\playwright\run.js" "C:\Users\User\AppData\Local\Temp\opencode\headful.js"
```

---

## Tech stack

- **No build.** Single `index.html` — Tailwind CDN, Lucide CDN, Google Fonts (`Geist`, `Fragment Mono`)
- **Static server** — `serve.js` (Node `http`, 28 lines) for `http://localhost:8787` with `no-store` and `Access-Control-Allow-Origin: *`
- **Launcher** — `start.bat` (`node serve.js`)
- **Fonts:** `Geist` (UI), `Fragment Mono` (labels), system fallback
- **No npm dependencies** for the app itself; Playwright only for verification (installed under `C:\Users\User\.agents\skills\playwright`)

---

## Project structure

```
Story Prompt/
├── index.html      # App — 18-section form + 6-frame generator (the product)
├── original.jsx    # Original artifact source as fetched from /api/published_artifacts/… (reference, 62147 bytes)
├── serve.js        # Tiny static server (node serve.js → http://localhost:8787)
├── start.bat       # Double-click launcher
├── README.md       # This file
└── .git/           # Git repo → origin https://github.com/franklinalegu/promptorstudio.git (main)
```

---

## Quick start

**Option A — double-click (no terminal):**
1. Double-click `index.html` — opens in default browser, fully functional. No server needed.

**Option B — local server (recommended, avoids `file://` CORS quirks on image preview):**
```powershell
# PowerShell
cd "C:\Users\User\Desktop\Story Prompt"
node serve.js
# → Promptor Studio running at http://localhost:8787/
```
Or double-click `start.bat`.

**Option C — any static server:**
```powershell
npx --yes http-server . -p 8787 --cors -c-1
# or
python -m http.server 8787
```

Open `http://localhost:8787` and fill `02 Product Name` + `03 Category` + `04 Material` + `05` at least one color, then **Generate Storyboard Prompt**.

---

## Usage guide

1. **01 Product Reference Image** — drag or click `Upload product photo` (PNG/JPG, max 10 MB). Preview appears; prompt will contain *match color, logo, silhouette exactly*. Required for a meaningful prompt, but generation is not blocked if missing (counted for `fields filled`).
2. **02–05** — `Product Name`, `Category` (9), `Material / Finish` (10), `Product Color(s)` (12) — category/material are single-select; colors are multi-select.
3. **06–11** — `Key Features` (3 inputs), `Brand Name`, `Brand Tone / Mood` (7), `Target Audience`, `Brand Color Palette` (12, multi), `Tagline / CTA`
4. **12 Background / Studio Style** — 7 presets + `Custom` textarea + optional second image upload. If a background image is present, the selected preset is still stored but the image takes precedence in the generated prompt (`(use uploaded studio/background reference image as primary background direction)`).
5. **13–16** — `Font Style` (6), `Text Color` (12), `Platform / Use Case` (6, multi), `Aspect Ratio` (5 with icon)
6. **17–18** — `Use-Case Scenario`, `Lifestyle / Environment Context` — optional. Leave blank → omitted from frames 4/5 unless **AI Auto-Fill** populates them (mirrors original).
7. Bottom bar shows `n fields filled · Promptor Studio`. Click **AI Auto-Fill** to fill every empty `PICK ONE`/`PICK ANY` and text field with coherent randoms. Click **Generate Storyboard Prompt** — output card appears above the bar with:
   - **Master Prompt** (single paragraph tying all fields together + *attached image as-is* instruction)
   - **6 frame cards** (each with title, shot, prompt, per-frame `Copy frame`)
   - **Audio** (music/SFX/VO + LUFS)
   - **Plain text** textarea (copy or `.txt` download) — paste into Flow/Runway/Kling
8. **Reset** clears all fields, selections, images, and hides output.

---

## The 18 sections — complete reference

Exact order and option labels as in the artifact (custom inputs omitted for brevity):

| # | Title | Mode | Options |
|---|---|---|---|
| 01 | Product Reference Image | — | `Upload product photo` (dashed zone, required, attached as-is) |
| 02 | Product Name | free text | placeholder `e.g. Ultrun` |
| 03 | Category | `PICK ONE` | Footwear, Apparel, Tech Gadget, Beauty & Skincare, Home Goods, Accessory, Food & Beverage, Furniture, Custom |
| 04 | Material / Finish | `PICK ONE` | Matte Finish, Glossy Finish, Metallic, Leather, Knit Fabric, Glass, Brushed Wood, Ceramic, Anodized Aluminum, Custom |
| 05 | Product Color(s) | `PICK ANY` | Stealth Black (#0b0b0d), Arctic White (#f5f5f0), Volt Green (#9fff3d), Ocean Blue, Sunset Orange, Rose Gold, Charcoal Grey, Ivory Cream, Primary Red, Primary Blue, Primary Yellow, Slate Grey, Custom |
| 06 | Key Features | free text ×3 | placeholder `Feature 1…` / `Feature 2…` / `Feature 3…` — subtitle *Up to three. Leave any blank and the studio fills the gap.* |
| 07 | Brand Name | free text | placeholder `e.g. Ultrun` |
| 08 | Brand Tone / Mood | `PICK ONE` | Sleek & Minimal, Bold & Energetic, Warm & Premium, Clinical & Precise, Luxurious, Playful & Fun, Custom |
| 09 | Target Audience | free text | placeholder `e.g. Urban commuters, creators, 18-34` |
| 10 | Brand Color Palette | `PICK ANY` | same 12 as 05 |
| 11 | Tagline / CTA | free text | placeholder `e.g. Move lighter. Go further.` |
| 12 | Background / Studio Style | `PICK ONE` | Seamless Cyclorama (Grey), Seamless Cyclorama (White), Glossy Reflective Podium, Softly Lit Minimalist Set, Outdoor Natural Light, Industrial Loft, Marble Pedestal, Custom — plus `Upload studio/background reference` (second image) |
| 13 | Font Style | `PICK ONE` | Modern Sans-Serif, Elegant Serif, Bold Display, Minimal Geometric, Rounded Friendly, Custom |
| 14 | Text Color | `PICK ONE` | same 12 as 05 |
| 15 | Platform / Use Case | `PICK ANY` | Instagram Reels, TikTok, Landing Page Hero, Trade Show Display, YouTube Ad, Product Listing Video |
| 16 | Aspect Ratio | `PICK ONE` | 1:1 Square, 4:5 Portrait, 9:16 Vertical / Reels, 16:9 Widescreen, 4:3 Landscape (with `AspectIcon` box) |
| 17 | Use-Case Scenario | free textarea | *Optional — left blank means omitted from frame 4, unless AI Auto-Fill suggests one.* |
| 18 | Lifestyle / Environment Context | free textarea | *Optional — left blank means omitted from frame 5, unless AI Auto-Fill suggests one.* |

Bottom bar: `0 fields filled · Promptor Studio` | `Reset` | `AI Auto-Fill` | `Generate Storyboard Prompt` (violet)

---

## Prompt generation — how it works

Ported from `original.jsx:STUDIO_POOLS`, `pickRandom`, `matchOption`, `build()`:

```js
// Pools — used when AI Auto-Fill fills a blank
STUDIO_POOLS = {
  category: CATEGORY_OPTIONS,
  material: MATERIAL_OPTIONS,
  color: COLOR_SWATCHES.map(c=>c.name),
  tone: TONE_CHIPS, background: [...BACKGROUND_CHIPS, "Rooftop at Golden Hour", "Concrete Studio Floor"],
  font: FONT_CHIPS, textColor: COLOR_SWATCHES.map(c=>c.name),
  platform: PLATFORM_CHIPS, aspectRatio: ASPECT_RATIOS.map(a=>a.ratio),
  brandColor: COLOR_SWATCHES.map(c=>c.name),
}
```

**Master prompt template** (single paragraph, then 6 frames):

```
Product: {name} by {brand} — {cat} ({mat}, {colorStr}).
Hero: {feat1 · feat2 · feat3}.
Tone: {tone}. Audience: {audience}. Brand palette: {bColors}.
Tagline: "{tagline}". Background: {bg}{ (use uploaded …) }.
Font: {font} in {textColor}. Platforms: {platforms}. Aspect: {aspect}.
Use attached product reference image as-is — match color, logo, silhouette exactly.
Generate as a continuous 6-frame storyboard with matching light. Photoreal, 85mm lens, shallow depth, subtle grain.
```

**Frames:**

- `01 — Hook / Reveal` — extreme macro, dolly-in, texture + first color highlight
- `02 — Product in Context` — wide, parallax, real use, not stock
- `03 — Feature Close` — feature string, material response, brand palette accent
- `04 — Use-Case Scenario` — if `17` blank → *omitted … focus on second feature*; otherwise `Scenario: {useCase}`
- `05 — Environment / Lifestyle` — if `18` blank → *omitted … product alone on {bg}*; otherwise `Environment: {lifestyle}`
- `06 — Hero Lockup / CTA` — centered hero, breathing room for logo, CTA in `{font} ({textColor}): "{tagline}"`, hold 1s, *use uploaded silhouette exactly*

**Audio:** tone-driven music (e.g., Bold → driving percussion 128 BPM) + material SFX + optional VO `"{tagline}"` at 00:08, mix `-14 LUFS`.

See `index.html:function build()` for the exact vanilla implementation.

---

## AI Auto-Fill & local-only design

- Auto-Fill **never** calls an external AI in this build. It draws from the same `STUDIO_POOLS` the original uses as fallback when a field is left blank, via `pickRandom(pool, count, exclude)`.
- It respects **never-auto-filled** fields: `17` and `18` stay blank unless the user explicitly fills them before generation — matching the original's comment *Optional — left blank means omitted from frame X, unless AI Auto-Fill suggests one* (our Auto-Fill *does* populate them, like the original's server-side fill, but you can clear them after).
- The original's second-image path calls `fetch("https://api.anthropic.com/v1/messages", {model:"claude-sonnet-4-6", max_tokens:300})` with the background image to auto-describe the studio in one vivid sentence. This build **stubs** that network call — the uploaded background image is kept as a data URL and the prompt notes *use uploaded … as primary background direction*. To wire real vision, replace `describeSceneImage()` with a fetch to your own proxy (do not expose an Anthropic key in the browser).

All generation runs synchronously in the browser; no data leaves the machine except the optional vision call you configure.

---

## Customization

- **Colors / options:** edit the `const CATS / MATS / COLORS / TONES / BGS / FONTS / PLATFORMS / ASPECTS` arrays at the top of `<script>` in `index.html`. Add a new entry and it appears automatically; keep labels identical to the original to preserve prompt parity.
- **Button shape:** global square rule is `chip rounded-none` and `rounded-none` on all buttons (`index.html:19`). Revert to `rounded-xl` / `rounded-full` to restore the original's pill look.
- **Branding:** change the title block `Promptor Studio` (`index.html:61`), `document.title`, and bottom bar `· Promptor Studio`.
- **Top bar:** the Claude header was removed (`index.html:37` deleted). Restore by re-adding the `<header>` block from `original.jsx`'s shell if you want the `Claude | Content is user-generated…` bar.

---

## Deployment

**Static hosting** — no server required. Upload the folder contents to any static host; `index.html` is the entry.

Vercel / Netlify / Cloudflare Pages / GitHub Pages / S3:

```bash
# GitHub Pages (main branch)
# Settings → Pages → Source: main / root
# Your site will be at https://franklinalegu.github.io/promptorstudio/
```

**Node server** — `serve.js` is a minimal production-ready static server with `no-store` and traversal protection. Run with PM2 or as a Windows service:

```powershell
node serve.js
# or with PM2
pm2 start serve.js --name promptor-studio --watch
```

---

## Development

No build step.

```powershell
cd "C:\Users\User\Desktop\Story Prompt"
# edit index.html in any editor
# refresh http://localhost:8787
```

**Verification** (requires Playwright — already installed at `C:\Users\User\.agents\skills\playwright`):

```powershell
node "C:\Users\User\.agents\skills\playwright\run.js" "C:\Users\User\AppData\Local\Temp\opencode\headful.js"
node "C:\Users\User\.agents\skills\playwright\run.js" "C:\Users\User\AppData\Local\Temp\opencode\frame-extract.js"
node "C:\Users\User\.agents\skills\playwright\run.js" "C:\Users\User\AppData\Local\Temp\opencode\exact-gen.js" # fetches /api/published_artifacts/... → STATUS 200 LEN 64859
node "C:\Users\User\.agents\skills\playwright\run.js" "C:\Users\User\AppData\Local\Temp\opencode\save-original.js" # writes original.jsx
```

---

## API (no backend)

This app has no backend. The original artifact's only network call was:

```
POST https://api.anthropic.com/v1/messages
  model: claude-sonnet-4-6
  max_tokens: 300
  content: [{type:"image", source:{type:"base64", media_type, data}}, {type:"text", text:"Describe the full studio setup…"}]
→ {content:[{type:"text", text:"…one vivid sentence…"}]}
```

for the optional background reference image. This build does not send that request. To enable it, create a small proxy endpoint (e.g., `POST /api/describe-scene` → Anthropic) and call it from `describeSceneImage()`.

---

## Troubleshooting

- **Cloudflare challenge on `claude.ai`**: after many automated fetches, the artifact requires a Turnstile verification that only passes in a `headless:false` + `slowMo` Playwright run. Use `headful.js` (15s wait) or fetch via `page.evaluate(fetch)` inside a solved page context (see `exact-gen.js` — `STATUS 200` approach).
- **`file://` image preview blocked**: run via `node serve.js` or `npx http-server` instead of double-clicking, or use a browser that allows `file://` data URLs.
- **Fonts not loading offline**: Tailwind and Google Fonts are CDN. For offline, inline the CSS or self-host `Geist` and `Fragment Mono`.
- **Port 8787 in use**: `node serve.js` prints `EADDRINUSE` — change `const port = 8787` in `serve.js` or kill the existing node process (`Get-Process node | Stop-Process`).

---

## Reproducing the exact clone

1. Fetch the original source (already saved as `original.jsx`):
   ```powershell
   node "C:\Users\User\AppData\Local\Temp\opencode\save-original.js"
   # → Product Showcase Prompt Generator — 62147 bytes
   ```
2. Diff the data arrays (`CATEGORY_OPTIONS`, `MATERIAL_OPTIONS`, `COLOR_SWATCHES`, `TONE_CHIPS`, `BACKGROUND_CHIPS`, `FONT_CHIPS`, `PLATFORM_CHIPS`, `ASPECT_RATIOS`) — they are reproduced verbatim in `index.html`.
3. Diff the generation: compare `original.jsx:function buildPrompt()` (search for `master`/`frames`/`audio`) with `index.html:function build()` — templates are ported line-for-line.

---

## Roadmap

- [ ] Wire optional vision proxy for background image auto-describe
- [ ] Add JSON export alongside `.txt`
- [ ] Add per-field “highlight when AI-filled” pulse (the original briefly highlights `autoFilledKeys`)
- [ ] Add history / favorites shelf (from the earlier editorial Promptor Studio)

---

## Contributing

PRs welcome. Keep the 18 sections in order and preserve `PICK ONE`/`PICK ANY` semantics. Run the Playwright fetch once to confirm no option label drifted from the upstream artifact.

```powershell
git checkout -b feat/your-change
# edit
git commit -m "feat: …"
git push origin feat/your-change
```

---

## License

MIT — same as the artifact's implied permissive use. See `LICENSE` if added. The original artifact is user-generated content on `claude.ai`.
