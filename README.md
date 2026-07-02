# Time2Rate — Researcher web app

Front-end (researcher side) of **Time2Rate**, a platform for running experience-sampling
(EMA/ESM) research studies. Built from the Figma design system. **Mock data only — no backend yet.**

## Tech stack

- **React 19 + TypeScript**
- **Vite** (dev server + build)
- **React Router** for navigation
- **Bootstrap Icons** (matches the Figma icon set)
- Plain CSS with design tokens mapped 1:1 from Figma (`src/styles/tokens.css`)

## Getting started

```bash
npm install
npm run dev      # start dev server → http://localhost:5173
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## What's implemented (high-priority flows)

| Screen | Route |
| --- | --- |
| Login | `/login` |
| I miei studi (My studies) | `/studi` |
| Study creation wizard (7 steps) | `/studi/:id/crea/*` |
| — Dettagli, Pianificazioni (time- & event-contingent), Notifiche, Consenso, Istruzioni, Riepilogo, Attivazione | |
| Dashboard studio | `/studi/:id` |
| Dettagli partecipante | `/studi/:id/partecipanti/:pid` |

Low-priority screens (Profilo, Guida, Avvisi) are stubbed so navigation works.

## Project structure

```
src/
  components/
    ui/         # design-system components (Button, Badge, Field, Modal, Table, …)
    layout/     # TopNav, AppLayout
    shared/     # ShareModal, FileUpload
  context/      # StudiesContext — in-memory store (stands in for the API)
  data/         # types + mock studies/participants
  pages/        # Login, Studies, Wizard, StudyDashboard, ParticipantDetails, Stubs
  styles/       # tokens.css + global.css
  lib/          # formatting helpers
```

## Notes

- State lives in `StudiesContext` (in-memory). Refreshing the page resets to mock data.
  When a backend exists, swap the context methods for API calls.
- Design tokens (colors, spacing, radii, typography) live in `src/styles/tokens.css`
  and come straight from the Figma "Components" page.
