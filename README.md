# BetWise Web Frontend

React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion. Consumes the BetWise
Django backend API.

## Design system

- **Background**: deep ink-teal (`#0E1416`), raised panels (`#161F22`)
- **Text**: warm programme-paper white (`#EDEAE2`), muted grey-teal for secondary text
- **Accent**: scoreboard cyan (`#4FD1C5`) for actions, links, and progress
- **Risk tiers**: teal (low), amber (medium), rust (high) — kept separate from the
  brand accent so risk meaning is never ambiguous
- **Type**: Big Shoulders Display (headlines/numbers), Inter (body), IBM Plex Mono
  (odds, stakes, currency — anything that should read like a ledger entry)
- **Signature element**: `RecommendationCard` — a perforated ticket-stub card
  (dashed tear-line + notch cutouts) separating match info from the confidence/risk
  readout, echoing a real betting slip

## Setup

```bash
npm install
cp .env.example .env
# edit .env — point VITE_API_BASE_URL at your running Django backend
npm run dev
```

Runs at `http://localhost:5173` by default. The Django backend should be running
at the URL set in `.env` (defaults to `http://localhost:8000/api`), with CORS
configured to allow `http://localhost:5173`.

## Build

```bash
npm run build    # type-checks then builds to dist/
npm run preview  # serve the production build locally
```

## Pages

| Route              | Screen                                            |
|---------------------|---------------------------------------------------|
| `/signup`           | Account creation, age verification (18+), risk pick |
| `/login`             | JWT login                                          |
| `/onboarding`        | Season budget + target + risk appetite setup       |
| `/`                  | Season overview — pace KPIs, chart, weekly target  |
| `/recommendations`   | Filterable list of ticket-stub recommendation cards |
| `/matches/:id`       | Reasoning detail — H2H chart, form, squad news     |
| `/partners`          | Ranked external betting partner list               |
| `/pricing`           | Plan selection, promo code validation, Pesapal checkout |

## Notes

- JWT access/refresh tokens are stored in `localStorage` and auto-refreshed on 401.
- `src/lib/api.ts` is the single source of truth for backend integration — all
  request/response types live there.
- Admin functions (user management, KPI dashboards, promo code creation) are
  handled by Django's built-in admin panel, not this app — see the backend README.
