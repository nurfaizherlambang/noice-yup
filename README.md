# NOICE × YUP — Promo Landing Page

Promo page for the NOICE × YUP partnership, offering **NOICE Premium (30 hari) for
Rp1.000** (from Rp30.000) to new YUP users with the referral code `YUPNOICE`. The
CTA links to `https://ops.yupindonesia.com/cdws/YUPNOICE`.

Static page plus one small serverless function for server-side conversion tracking.
No build step, no npm dependencies.

## Structure

```
index.html            # the entire page (markup + inline CSS + inline JS)
api/
  capi.js              # Vercel serverless function: forwards events to Meta CAPI
assets/
  noice-logo.png      # NOICE lockup, 2500x1100
  yup-logo.png        # YUP app icon, 480x480
```

## Local preview

Open `index.html` directly in a browser, or serve it:

```bash
npx serve .
```

`npx serve` only serves static files — `/api/capi` (see below) won't respond
locally under it, so during local preview the Pixel still fires but the CAPI
call fails silently (it's fire-and-forget with no visible error). To exercise
the full path locally, use the Vercel CLI instead: `npx vercel dev`.

## Deploying to Vercel

The site is static HTML at the repo root plus one serverless function, so no
build configuration is needed. In Vercel: **Add New → Project → import this
repo**, leave the framework preset as **Other**, and deploy. There is no build
command and no output directory to set — `api/capi.js` is picked up automatically.

## Meta Pixel & Conversions API

Pixel ID `1020300154103051` is wired into `index.html` and fires two standard
events:

| Event      | When                          |
|------------|-------------------------------|
| `PageView` | on page load                  |
| `Lead`     | on click of the main CTA button |

Both events are also sent server-side to the Conversions API from
[`api/capi.js`](api/capi.js), using the **same `event_id`** the browser Pixel
used for that event — Meta dedupes the pair into a single event rather than
counting it twice. This is why `event_id` generation lives in `index.html`
(shared between the `fbq(...)` call and the `fetch('/api/capi', ...)` call),
not in the serverless function.

**Server-side sending requires an access token you generate**, which isn't
something that can be hardcoded into the repo. Without it, the Pixel alone
still tracks normally; CAPI is additive, not required for the Pixel to work.

To turn CAPI on, in **Vercel → Project Settings → Environment Variables**, add:

| Variable                     | Required | Purpose                                                                 |
|-------------------------------|----------|--------------------------------------------------------------------------|
| `META_CAPI_ACCESS_TOKEN`      | yes      | System User access token. Generate in Meta Events Manager → this pixel → Settings → **Conversions API** → **Generate access token**. |
| `META_PIXEL_ID`                | no       | Overrides the default `1020300154103051` if you ever repoint the page.  |
| `META_CAPI_TEST_EVENT_CODE`    | no       | From Events Manager → **Test Events**, while verifying the setup. Remove once confirmed. |

Redeploy after adding the token. Verify events are landing under Events Manager
→ **Test Events** (with the test code set) or the main **Overview** tab, checking
that Pixel and server events for the same action show as one deduped event.

## Layout notes

Responsive with a single breakpoint at **900px**:

- **Below 900px** — single column, sticky CTA pinned to the bottom of the flow.
- **900px and up** — 1040px centred modal in two columns; the offer card sticks
  while the longer steps column scrolls past it.

Two details in the CSS are load-bearing and easy to undo by accident, so both are
commented in place:

1. **`.steps > li` must not be `display: grid`.** Each child element of a grid
   container becomes its own grid item, which pulls inline `<b>`, `<code>` and the
   nested `<ul>` out of the sentence and drops them into the number column. The
   step marker is absolutely positioned with `padding-left` reserving its space
   instead.
2. **The NOICE logo's negative margin is vertical only.** `noice-logo.png` is 50%
   transparent padding vertically, so it is set to `height: 48px` with
   `margin: -12px 0` to make the *visible* mark ~24px, matching the YUP icon. A
   horizontal negative margin shrinks the flex item and squashes the logo.

The hero card artwork is hotlinked from `images.noiceid.cc`. Swap those `src`
values for local files in `assets/` if you'd rather not depend on that host.
