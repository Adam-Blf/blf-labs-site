# Product

<!-- impeccable:product-schema 1 -->

> Written on 2026-09-15 from repository evidence, without an interview round. Adam gave carte blanche for the redesign and asked not to be interviewed. Facts below come from `lib/site.ts`, `content/` and the existing pages. Nothing here was invented.

## Platform

web

## Users

- **Primary:** small business owners, independent practitioners and founders in France who need a website, a booking and payment flow, an internal business tool or a mobile app. They usually have no technical team. They arrive from a search engine, a direct recommendation or a prospecting message, often on a phone, and decide whether this studio is trustworthy enough to describe their project to.
- **Secondary:** people reading a prospecting email who click through to check that the proof matches the message (see the long comment in `content/references.ts`).

## Product Purpose

BLF Lab's is the commercial name of Adam Beloucif, an individual entrepreneur registered on 2026-08-04 (SIRET 10838685500010). The studio designs and ships websites and shops, web applications and SaaS, iOS and Android apps, and data and AI tools. Success is a visitor starting the project wizard on `/commander`, booking a call on `/rendez-vous`, or writing to `adam@beloucif.com`.

## Positioning

- The client keeps the code, the domain name and the hosting access, all delivered in their own name. Nothing stays with the provider.
- One person talks to the client from framing to launch. No account manager and no sales layer.
- The studio ships and publishes its own products (Bacchana on the web, iOS and Android). So the store publication path is already mapped, not theoretical.
- Everything happens remotely: the studio is based in Ile-de-France, does not travel and does not host clients.

## Operating Context

- Projects run in four stages: framing, mockup, development, hand-over of the keys (`components/marketing/Methode.tsx`).
- Framing is a 1 to 2 hour video call and produces a written document the client keeps. Every version is online at a private address. Blockers are handled with a video call the same day.
- A reply with a budget and timeline estimate comes within 48 working hours.
- Pricing and timelines are published on `/tarifs` (`content/tarifs.ts`, `content/options.ts`). Timelines are guidance, not contractual commitments.

## Capabilities and Constraints

- Next.js 16 App Router, Tailwind 4, Supabase, deployed on Vercel. Both themes, light and dark, are user-toggled and stored in `localStorage` (`blf-theme`).
- A public marketing site of about 20 routes, plus an `/admin` back office with a 2FA gate, which is not a marketing surface.
- A 5-step order wizard, a monthly newsletter form with explicit unticked consent, and an analytics consent banner shown only when `NEXT_PUBLIC_GA_ID` is set.
- The home page does not contact Google (the map was removed). No third-party font or script CDN.
- Legal: the LCEN mentions (legal name, SIRET, VAT exemption under article 293 B of the CGI) must stay reachable from every page. Keep only the strict legal minimum visible.

## Brand Commitments

- Name: **BLF Lab's**, with the apostrophe.
- Logo: the files supplied by Adam (`public/brand/logo.svg`, `logo-inverse.svg`, `logo.png`). They are Canva bitmap exports and must not be redrawn, recoloured or regenerated.
- Voice: plain French, first person plural "on", concrete and anti-hype. It says what is delivered, never an adjective where a fact fits.
- Typefaces belong to one project at a time in Adam's local font registry. Barlow and Barlow Condensed are registered to `blf-labs-site`; any new face must be free in that registry before it is adopted.

## Evidence on Hand

- Two live references with real screenshots in `public/shots/`: Bacchana (the studio's own product, web plus iOS plus Android) and Ohypnozen (booking, reminders and payment for a hypnotherapy practice).
- Case studies in `content/etudes.ts`, a journal in `content/journal.ts`, free resources in `content/ressources.ts`, a FAQ in `content/faq.ts`.
- **No client reviews.** `content/avis.ts` is empty on purpose and must never be filled with invented text.
- No client logos, no metrics, no awards. None of these may be fabricated.

## Product Principles

1. Prove with work that is live, never with claims.
2. Ownership is the product: every surface should make it obvious that the client leaves with the keys.
3. One voice, one person: the site must feel made by the person the client will talk to, not by an agency template.
4. Legal honesty is visible: the minimum required, stated plainly, never hidden and never inflated.

## Accessibility & Inclusion

WCAG AA as the floor: 4.5:1 contrast for text, 44px touch targets, a skip link, visible focus, and a hydration-safe `prefers-reduced-motion` handling. Keyboard navigation of the wizard and the FAQ must stay intact.
