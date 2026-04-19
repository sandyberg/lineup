# Lineup -- Roku Channel

Roku channel (BrightScript/SceneGraph) for **Lineup**, the live sports TV guide. Shows live and upcoming sports events across your streaming services. Companion to the React Native TV app targeting Apple TV and Android TV.

## Prerequisites

- A Roku device with Developer Mode enabled
- The backend API server running (from `../tv-guide-app/server/`)

## Setup

1. **Enable Developer Mode on your Roku:**
   - On the Roku remote, press: Home 3x, Up 2x, Right, Left, Right, Left, Right
   - Note the IP address shown and set a password

2. **Configure the API server URL:**
   - Edit `source/utils.brs` and replace `YOUR_SERVER_IP` in `GetApiBaseUrl()` with your computer's local IP address (e.g., `192.168.1.100`)

3. **Start the backend server:**
   ```bash
   cd ../tv-guide-app/server && npm run dev
   ```

## Build & Deploy

```bash
# Build the .zip package
make build

# Deploy to your Roku (set your device IP and password)
ROKU_IP=192.168.1.X ROKU_PASS=yourpassword make deploy
```

## Project Structure

```
roku-app/
  manifest                     -- App metadata, icons, splash screen
  source/
    main.brs                   -- Entry point, screen setup
    utils.brs                  -- Utility functions (time formatting, ECP, registry)
    config.brs                 -- Streaming service definitions, sport filters, prefs
  components/
    screens/
      MainScene.xml            -- Root scene layout
      MainScene.brs            -- Main scene logic (filtering, display, navigation)
    tasks/
      EventFetchTask.xml       -- Background task definition
      EventFetchTask.brs       -- API fetch + JSON parsing (runs off main thread)
    ui/
      EventCard.xml            -- Event card component layout
      EventCard.brs            -- Event card rendering logic
      EventCardNode.xml        -- Content node schema for event data
      ServiceBadge.xml         -- Streaming service badge component
      ServiceBadge.brs         -- Badge rendering
  images/                      -- Icons, splash screens, spinner
  Makefile                     -- Build and deploy commands
```

## Features

- Fetches live sports data from the shared backend API
- Groups events by sport (All Sports view) or by time (single sport view)
- Shows live scores, game times, broadcast channels
- Displays which streaming services carry each game
- Press OK on any event to launch the streaming app directly on Roku
- Settings screen to select which services you subscribe to
- Preferences saved to device registry
- D-pad remote navigation with visible focus states
- Dark theme optimized for TV viewing

## Streaming Service Channel IDs

| Service      | Roku Channel ID |
|-------------|----------------|
| YouTube TV  | 195316         |
| Hulu        | 46041          |
| ESPN        | 34376          |
| Peacock     | 593099         |
| Prime Video | 13             |
| Apple TV+   | 551012         |
| MLB.TV      | 46246          |
