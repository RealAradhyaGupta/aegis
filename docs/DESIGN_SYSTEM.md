# AEGIS Design System

This document is the single source of truth for all design decisions in the AEGIS platform.
Every teammate should reference this file before building any new screen or component.

---

## Section 1 — Colour Palette

| Name | Hex Code | Usage | Tailwind Class |
|------|----------|-------|----------------|
| aegis-navy | `#0F172A` | Primary background | `bg-aegis-navy` |
| aegis-surface | `#1E293B` | Secondary background, card base | `bg-aegis-surface` |
| aegis-card | `#334155` | Card background, input background | `bg-aegis-card` |
| aegis-text | `#F8FAFC` | Primary text | `text-aegis-text` |
| aegis-muted | `#94A3B8` | Secondary text, labels, placeholders | `text-aegis-muted` |
| aegis-accent | `#3B82F6` | Buttons, links, focus rings, interactive | `bg-aegis-accent` |
| aegis-danger | `#EF4444` | SOS button, high risk, error states | `bg-aegis-danger` |
| aegis-safe | `#22C55E` | Safe zones, resolved status, success | `bg-aegis-safe` |
| aegis-warning | `#F59E0B` | Medium risk, pending status, caution | `bg-aegis-warning` |
| aegis-border | `#475569` | All borders, dividers, outlines | `border-aegis-border` |

---

## Section 2 — Typography

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Heading 1 | 32px | 700 | Page titles |
| Heading 2 | 24px | 600 | Section headings |
| Heading 3 | 18px | 600 | Card headings, sub-sections |
| Body | 16px | 400 | All body text, descriptions |
| Label | 12px | 500 | Uppercase labels, table headers, badge text |

> **Font family:** Inter (loaded from Google Fonts via Next.js `next/font/google`)
> **Letter spacing on Label:** `0.05em`

---

## Section 3 — Risk Score Colours

| Score Range | Colour | Hex | Meaning |
|-------------|--------|-----|---------|
| 0 – 30 | aegis-safe | `#22C55E` | Low risk / Safe |
| 31 – 60 | aegis-warning | `#F59E0B` | Medium risk / Caution |
| 61 – 100 | aegis-danger | `#EF4444` | High risk / Dangerous |

---

## Section 4 — Component Rules

- **Cards:** background `#1E293B`, border `1px solid #475569`, border-radius `12px`, padding `20px`
- **Primary button:** background `#3B82F6`, text white, height `44px`, border-radius `8px`, font-weight `600`, hover background `#2563EB`
- **Danger button:** background `#EF4444`, text white, height `44px`, border-radius `8px`, font-weight `600`, hover background `#DC2626`
- **Form inputs:** background `#334155`, border `1px solid #475569`, border-radius `8px`, height `44px`, text `#F8FAFC`
- **Focus states:** `2px outline #3B82F6` on all interactive elements (buttons, inputs, links)

---

## Section 5 — Spacing Scale

**Only ever use these values:** `4px · 8px · 12px · 16px · 24px · 32px · 48px · 64px`

---

## Section 6 — Status Badges

| Status | Background | Text Colour |
|--------|------------|-------------|
| Pending | `#F59E0B` | `#412402` |
| Reviewing | `#3B82F6` | `#042C53` |
| Resolved | `#22C55E` | `#173404` |
| High Risk | `#EF4444` | `#501313` |

---

## Section 7 — File Locations

| Asset | Location |
|-------|----------|
| Tailwind custom colours (frontend) | `frontend/tailwind.config.ts` |
| Tailwind custom colours (dashboard) | `dashboard/tailwind.config.ts` |
| Shared CSS classes (frontend) | `frontend/app/globals.css` |
| Shared CSS classes (dashboard) | `dashboard/app/globals.css` |
| Inter font (frontend) | `frontend/app/layout.tsx` |
| Inter font (dashboard) | `dashboard/app/layout.tsx` |
