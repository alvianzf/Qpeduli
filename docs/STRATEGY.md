# Qpeduli: strategy notes

Directional, not legal or financial advice. Verify regulatory points with counsel.

## Position
Lead with **Modal Usaha** (reward-style micro-business funding). It is the most differentiated vertical, has a clear story, and fits a donation/reward model that avoids securities licensing. Keep **Aksi Sosial** as the emotional funnel that brings in donors. Demote **FJB** (removed from the navbar, kept in footer and route). Add **Mitra** (CSR/B2B) as the first real revenue line.

## Do not build (yet)
- Equity or lending crowdfunding (OJK SCF/P2P licensing).
- Zakat collection (needs BAZNAS/LAZ). Phase 2 via a licensed LAZ partner.

## Biggest risks
1. **Payment rails**: manual transfer plus unique code works for a pilot; move to a gateway (QRIS/Midtrans/Xendit) before scale.
2. **Legal entity for public fundraising (PUB)**: a PT may need a yayasan/fiscal-sponsor partner for donation collection.
3. **Trust claims**: avoid "escrow" wording unless funds are truly held by a regulated party. Use "pencairan bertahap".
4. **Thin margins**: fees eat small tickets; avoid depending on a platform cut alone.

## Revenue
- Optional donor tip (about 5%).
- CSR sponsorship and partner fees via /mitra.
- Paid verification/reporting packages for partners.

## Product changes made
- Donation returns exact transfer amount (unique code) plus reference; `PAYMENT_INSTRUCTIONS` env var supplies bank/QRIS text.
- Modal Usaha requires milestones totalling the target.
- Admin overview shows confirmed donations, average donation, donors, repeat donors, funded campaigns.
- New /mitra page; FJB de-emphasised.

## Next
Set `PAYMENT_INSTRUCTIONS` on the server, pilot with 5 to 10 verified UMKM, measure repeat-donor rate, then decide on a payment gateway and legal wrapper.
