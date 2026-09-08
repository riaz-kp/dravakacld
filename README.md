# DRAVAKA — Adventure Club website

A static website for Dravaka, built from the handwritten spec in `aaaaaaaaaa/`
(11 notebook pages photographed on a phone). Plain HTML, CSS and JavaScript —
no framework, no build toolchain to install, no server required to view it.

---

## Quick start

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 4173
```

Then visit <http://127.0.0.1:4173>.

---

## Pages

| File | What it is | From the notes |
|---|---|---|
| `index.html` | Home — hero, about, membership pillars, activities, missions, countdown, impact, news, reviews, gallery | Home pages 1 & 2 |
| `about.html` | Who we are, what we do for the coast, how it helps, what you can do, join form | "About us" |
| `adventures.html` | Try Dive, DSD, fun dives, snorkelling, free diving, specialities, Zero-to-Hero course table, six dive locations, trek & camp, "coming soon" cards | "Adventure + Responsibility" |
| `booking.html` | Booking request: programme, person details, medical, liability, insurance | "Booking" |
| `missions.html` | Mission statement, why Dravaka, the six programmes | "Missions" |
| `impact.html` | Impact numbers and four field stories, reviews, volunteer CTA | "Our impact stories" |
| `news.html` | Best time to dive, camping, trekking, equipment, join an adventure — each ending in a shop strip | "News Section" |
| `gallery.html` | Filterable photo/video gallery | "Adventure Gallery" |
| `shop.html` | Products with a per-item clean-up impact figure, checkout, FAQ | "Shop now" |
| `donate.html` | Season target, one-off/monthly donation form, what it buys, act & education | "Donation / Foundation" |
| `join.html` | Three membership tiers, signup form, volunteer signup | "Join the tribe" |
| `contact.html` | Contact desks, base list, message form | "Contact us" |
| `help.html` | Booking/membership/donation FAQ plus the five environment questions from the notes | "Help center" + Q&A |
| `terms.html`, `privacy.html`, `refund.html` | Legal pages | "Terms and conditions" etc. |

---

## Structure

```
index.html … refund.html     the built site (edit via tools/, see below)
assets/
  css/styles.css             one stylesheet, sectioned and commented
  js/main.js                 nav, search, filters, forms, countdown
  js/hero3d.js               the 3D hero scene (home page only)
  img/*.svg                  placeholder artwork — see "Replace the artwork"
tools/
  layout.html                shared shell: head, header, nav, footer
  pages/*.html               page bodies only
  build.py                   assembles pages from layout + bodies
  check_links.py             verifies every internal link, anchor and asset
aaaaaaaaaa/                  the original handwritten spec photos
```

### Editing

Page content lives in `tools/pages/<name>.html`. Each starts with three
front-matter comments:

```html
<!--slug: shop-->
<!--title: Shop — gear that funds the missions-->
<!--desc: Meta description used for search and social cards.-->
```

Anything shared across every page — header, navigation, footer — lives in
`tools/layout.html`. After changing either, rebuild:

```bash
python3 tools/build.py && python3 tools/check_links.py
```

The root `.html` files are generated. Editing them directly works, but the next
build overwrites them.

---

## The 3D hero

The home page hero runs an animated underwater scene in WebGL: an undulating
water surface, drifting light shafts, rising bubbles and suspended particles,
with a parallax that follows the pointer.

- Built with Three.js r128, loaded from cdnjs and pinned to that version.
- Loaded **only on the home page** (`assets/js/hero3d.js`).
- Pauses when the tab is hidden or the hero scrolls out of view.
- Renders a single static frame and stops if the visitor has
  `prefers-reduced-motion` set.
- If the CDN is unreachable or WebGL is unavailable, the hero silently falls
  back to its CSS gradient and lightweight CSS bubbles. Nothing breaks.

To self-host Three.js instead of using the CDN, download
`three.min.js` into `assets/js/` and change the script tag at the bottom of
`tools/pages/index.html`.

---

## Before this goes live

These are deliberate gaps, not oversights. Each one needs a real decision.

**1. Forms have no backend.** Every form validates in the browser and shows a
confirmation panel so the flow can be reviewed end to end, but nothing is sent
anywhere. Point each `<form>` at a real endpoint (your own handler, Formspree,
Netlify Forms, whatever you use) and remove the `data-demo-form` attribute that
triggers the demo behaviour.

**2. Payments are intentionally not collected on this site.** The notes asked
for a payment section on booking, donation and shop. What is built is the step
*before* payment: details are captured, then the visitor is handed to a payment
provider's own secure page. **Do not add card or UPI fields to these pages.**
Collecting card details on a static site would put you in PCI scope and put
customers at real risk. Integrate Razorpay, Stripe or PayU and let their hosted
checkout take the money.

**3. The legal pages are drafts.** `terms.html`, `privacy.html` and
`refund.html` are written to cover the activities described on the site and are
marked as drafts on the page itself. Have an advocate review them against Indian
consumer, tourism, adventure-operator and DPDP Act requirements, then remove the
draft banners.

**4. Placeholder content to replace:**
- **Phone, WhatsApp and email** — currently `+91 99000 00000` and
  `*@dravaka.example` addresses throughout.
- **Social links** — all `href="#"` in the footer and on the donate page.
- **Impact numbers** — 18.4 t, 2,600 mangroves, 340 coral fragments, 4,100
  students, 92 clean-ups, 1,400 divers, and the ₹8,00,000 target with its 61%
  progress bar. These are illustrative. Swap in your real figures before
  publishing, since the whole site argues for publishing honest numbers.
- **Prices, seasons and dive sites** on `adventures.html` — plausible but
  invented.
- **Reviews** on `index.html` and `impact.html` — written as examples. Replace
  with real ones or remove the sections.

**5. Replace the artwork.** `assets/img/*.svg` are illustrated placeholders. The
photos in `aaaaaaaaaa/` are the spec notes themselves, not usable imagery. Drop
real photography in as `.jpg`/`.webp` and update the `src` attributes — the
layout expects roughly 16:10 for cards and 1:1 for shop products. Keep the
`alt` text descriptive.

**6. The gallery's video items are still images** with a play badge. Wire them
to real video when you have it.

---

## Notes on how it is built

- **Accessibility**: skip link, visible focus rings, `aria-current` on the
  active nav item, labelled form fields, `aria-pressed` on filter buttons,
  captions on data tables, and alt text on every image. All motion respects
  `prefers-reduced-motion`.
- **Responsive**: verified with no horizontal overflow on any page down to
  375 px. Tables scroll inside their own container rather than stretching
  the page.
- **No dependencies** other than Google Fonts (Outfit + Inter, with system
  fallbacks) and Three.js on the home page. Both degrade cleanly.
- **Search** is a small client-side index in `assets/js/main.js`
  (`SEARCH_INDEX`). Add entries there when you add pages or sections.
- **The countdown** on the home page rolls itself forward monthly, so it never
  goes stale. The seed date is the `data-countdown` attribute in
  `tools/pages/index.html`.
