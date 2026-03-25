# FitIn 💪

**Free fitness & meal planning app — no ads, no paywall.**

## Features

- **Weekly Workout Planner** — Default splits (PPL, Upper/Lower, Full Body, Bro Split) with animated exercise demos
- **Exercise Library** — 100+ exercises with Lottie animations, GIFs, and video demos
- **Regional Meal Planner** — Calorie-targeted daily plans for India, Germany, and USA
- **Weight Tracking Dashboard** — Charts, stats, progress ring, and streak counter
- **Cross-Platform** — React (web) + React Native/Expo (Android)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run (Web)

```bash
npm install
npm run dev:web
```

### Run (Android)

```bash
npm run dev:mobile
# Press 'a' to open on Android emulator, or scan QR with Expo Go
```

## Project Structure

```
fitin/
├── packages/core/     # Shared TypeScript: types, workout engine, meal data
├── apps/web/          # React + Vite web app
├── apps/mobile/       # React Native (Expo) Android app
└── marketing/         # Reels & tweets content sub-project
```

## Tech Stack

- **Web:** React 18, Vite, TailwindCSS, shadcn/ui, Recharts
- **Mobile:** React Native, Expo, Expo Router
- **Shared:** TypeScript, Zustand, Lottie
- **Data:** MuscleWiki API, local JSON datasets
- **Storage:** Local-first (localStorage / AsyncStorage)

## License

MIT
