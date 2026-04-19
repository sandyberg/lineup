# Lineup - Live Sports TV Guide

**What sports are on right now, and where can I watch them?**

Lineup is a TV-first app that shows live and upcoming sports events across your streaming services. Pick which services you subscribe to, and Lineup shows you what's on -- then launches the right app with one click.

## Platforms

| Platform | Technology | Status |
|----------|-----------|--------|
| Android TV / Fire TV | React Native (Expo) | ✅ Built |
| Apple TV (tvOS) | React Native (Expo) | ✅ Built |
| Roku | BrightScript / SceneGraph | ✅ Built |
| iOS / Android (phone) | React Native (Expo) | Bonus (same codebase) |

## Supported Streaming Services

- YouTube TV
- Hulu + Live TV
- ESPN+
- Peacock
- Prime Video
- Apple TV+
- MLB.TV

## Features

- Live and upcoming sports events for today and tomorrow
- 11 sport categories: NFL, NBA, MLB, NHL, Soccer, College Football, College Basketball, MMA, Golf, Tennis, Racing
- Filter by sport or view all sports grouped by category
- Shows which streaming services carry each game
- One-click deep links to launch the right streaming app on your TV
- Live scores and game status indicators
- Dark theme optimized for TV viewing (10-foot UI)
- D-pad / remote navigation with visible focus states
- User preferences saved locally

## Project Structure

```
tv-guide/
├── tv-guide-app/           React Native app (Apple TV + Android TV)
│   ├── src/                  App source code
│   │   ├── app/              Expo Router screens
│   │   ├── components/       UI components
│   │   ├── data/             Channel + service definitions
│   │   ├── hooks/            Custom React hooks
│   │   └── lib/              API client, types, utilities
│   └── server/               Backend API server (Express + TypeScript)
│       ├── index.ts           Server entry point
│       ├── sports-api.ts      ESPN + TheSportsDB clients
│       ├── channel-mapping.ts Channel → service mapping
│       └── cache.ts           In-memory cache
├── roku-app/               Roku channel (BrightScript/SceneGraph)
│   ├── source/               BrightScript source files
│   ├── components/           SceneGraph XML + BRS components
│   ├── images/               Icons and splash screens
│   └── Makefile              Build and deploy
```

## Getting Started

### 1. Start the backend server

```bash
cd tv-guide-app/server
npm install
npm run dev
```

The API server runs on `http://localhost:3001`.

### 2a. Run the React Native app (Android TV)

```bash
cd tv-guide-app
npm install --legacy-peer-deps
npx expo run:android
```

### 2b. Run the Roku app

See [roku-app/README.md](roku-app/README.md) for Roku-specific setup (developer mode, sideloading).

```bash
cd roku-app
make build
ROKU_IP=192.168.1.X ROKU_PASS=yourpassword make deploy
```

## Data Sources

- **ESPN API** (unofficial) -- US league schedules (NFL, NBA, MLB, NHL, MLS, EPL, CFB, CBB, UFC)
- **TheSportsDB API** (free tier) -- Additional sports (Soccer, Golf, Tennis, Fighting, Motorsport) + TV channel lookups

## Architecture

The backend server aggregates data from multiple sports APIs, normalizes it, maps broadcast channels to streaming services, and serves it as a single endpoint. All three client apps (Apple TV, Android TV, Roku) consume the same API.

```
[ESPN API] ──┐
             ├──→ [Backend Server] ──→ /api/events ──→ [TV Apps]
[SportsDB] ──┘        ↑
                 [Channel Mapping]
```

## License

MIT
