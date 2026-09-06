# Qpeduli

**Dari Diskusi, Menjadi Aksi.**

Qpeduli is a community-driven crowdfunding platform — a forum where discussion threads about social issues (regional, education, health, disaster relief, hobbies) can be raised into a fully tracked "Aksi Sosial" fundraising campaign, right inside the thread.

Built for PT INI TIKET QUE ([tiketq.com](https://tiketq.com)). Deployed at [qpeduli.com](https://qpeduli.com).

## Core features

- **Ruang Komunitas** — Kaskus-style sub-forums (Regional, Pendidikan, Kesehatan, Bencana Alam, Hobi & Sosial, Lingkungan)
- **Aksi Sosial threads** — any thread can be upgraded into a fundraising campaign with a target, deadline, and donate button
- **Poin Kebaikan** — a karma/reputation system rewarding donations, validation, and consistent campaign updates
- **Milestone-based fund disbursement** — funds sit in escrow and release in stages, gated by community validation + admin review, mirrored on the [Transparansi & Keamanan](/keamanan) page
- **FJB Amal** — a preloved marketplace where proceeds route directly into a chosen campaign's wallet
- **Ksatria Komunitas** — verified badge for official institutions/community leaders who can act as guarantors on campaigns

## Tech stack

- React 19 + TypeScript + Vite
- MUI (Material UI) for components, with a custom blue-gradient glassy theme
- Framer Motion for animation
- React Router for routing

This is currently a frontend prototype running on in-memory mock data (`src/data/mockData.ts`) — no backend, auth, or payment integration yet.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

### Other scripts

```bash
npm run build      # type-check + production build
npm run preview    # preview the production build locally
```
