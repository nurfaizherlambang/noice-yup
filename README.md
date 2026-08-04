# NOICE × YUP — Promo Landing Page

Promo page for the NOICE × YUP partnership, offering **NOICE Premium (30 hari) for
Rp1.000** (from Rp29.000) to new YUP users with the referral code `NOICEPREMIUMYUP`.

Static single-page site. No build step, no dependencies.

## Structure

```
index.html            # the entire page (markup + inline CSS + inline JS)
assets/
  noice-logo.png      # NOICE lockup, 2500x1100
  yup-logo.png        # YUP app icon, 480x480
```

## Local preview

Open `index.html` directly in a browser, or serve it:

```bash
npx serve .
```

## Deploying to Vercel

The site is plain static HTML at the repo root, so no configuration is needed.
In Vercel: **Add New → Project → import this repo**, leave the framework preset as
**Other**, and deploy. There is no build command and no output directory to set.

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
