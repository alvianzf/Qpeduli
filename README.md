# Qpeduli

**Dari diskusi, menjadi aksi.**

Most donation platforms only show up in your phone when you already know you want to give. Forums like Kaskus show up every day, because people go there to talk. Qpeduli is trying to be both at once: a regular discussion forum — regional, education, health, disaster relief, hobbies — where any thread can be turned into a tracked fundraising campaign without leaving the conversation.

The bet is that a platform people open daily to talk retains users better than one they only open to donate.

## How it works

1. Someone posts in a sub-forum about a problem — a sick neighbor, a flooded school, a shelter that needs repairs.
2. If it needs money, the thread owner flips it into an "Aksi Sosial" campaign: a target amount, a deadline, a donate button, right inside the thread.
3. Donors don't just pay and leave — they stay in the thread, ask questions, and watch the campaign owner post progress updates.
4. Money doesn't move in one lump sum. It's held in escrow and released in stages, each one gated by community sign-off and an admin review.

## Why the fund release matters

This is the part most donation apps get wrong in one of two directions. Hand it entirely to the campaign owner and community, and you get brigading — a handful of accounts can vouch for a fake campaign. Hand it entirely to a central admin team, and every campaign is bottlenecked on staff bandwidth, which kills the "transparent community" pitch the whole platform is built on.

Qpeduli splits the difference: campaigns are broken into milestones up front, each milestone needs both a validation threshold from the community and a document check from an admin, and larger campaigns need a guarantor — a verified "Ksatria Komunitas" (an established institution or community leader) who puts their own reputation behind it. Full writeup is on the `/keamanan` page in the app.

## Reputation

Donating, verifying an update, or posting consistent progress reports earns Poin Kebaikan — the platform's version of Kaskus's cendol. It's not a leaderboard vanity metric; it's what makes a stranger's campaign look trustworthy enough to fund.

## FJB Amal

A secondary marketplace for preloved goods and services, where the entire sale price routes into a campaign wallet the seller picks. It's a second reason to open the app that isn't "I want to donate."

## What this repo is right now

A frontend build — React, TypeScript, Vite, MUI, Framer Motion, React Router — running against in-memory mock data. No backend, auth, or payments are wired up yet. Every screen (forum, campaign pages, FJB Amal, profile, trust & safety) works end to end against fixtures, which made it possible to design the full disbursement and reputation flow before committing to a backend.

Built for PT INI TIKET QUE ([tiketq.com](https://tiketq.com)). Ships at [qpeduli.com](https://qpeduli.com).

## Running it locally

```bash
npm install
npm run dev
```

```bash
npm run build      # type-check + production build
npm run preview    # preview the production build
```
