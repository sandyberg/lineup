# Lineup -- Roku Channel

Roku channel (BrightScript/SceneGraph) for **Lineup**, the live sports TV guide. Shows live and upcoming sports events across your streaming services. Companion to the React Native TV app targeting Apple TV and Android TV.

## Prerequisites

- A Roku device with Developer Mode enabled
- The backend API server running (from `../tv-guide-app/server/`)

## Setup

1. **Enable Developer Mode on your Roku:**
   - On the Roku remote, press: Home 3x, Up 2x, Right, Left, Right, Left, Right
   - Note the IP address shown and set a password

2. **API server:**
   - The app points to the production API at `https://lineup-api-31li.onrender.com` by default
   - To use a local server instead, edit `source/utils.brs` and change `GetApiBaseUrl()` to your local IP (e.g., `http://192.168.1.100:3001`)

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
    utils.brs                  -- Utility functions (time formatting, registry)
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
- Press OK on any event to see which streaming services carry it
- Settings screen to select which services you subscribe to
- Preferences saved to device registry
- D-pad remote navigation with visible focus states
- Dark theme optimized for TV viewing

## Streaming Service Channel IDs

| Service       | Roku Channel ID |
|--------------|----------------|
| YouTube TV   | 195316         |
| Hulu         | 46041          |
| ESPN+        | 34376          |
| Peacock      | 593099         |
| Prime Video  | 13             |
| Paramount+   | 31440          |
| Apple TV+    | 551012         |
| MLB.TV       | 46246          |
| NBA League Pass | 86065       |
| NFL+         | 241116         |
| Sunday Ticket | 195316        |

## Roku Store Submission Requirements

The channel works for sideloading and development. To publish to the Roku Channel Store, the following items are required:

### Required Before Submission

1. **App Icons and Splash Screens**
   - Channel poster art: 540x405 HD (required for store listing)
   - Channel icon: 336x210 FHD
   - Splash screen: 1920x1080 FHD
   - Place all images in the `images/` directory and reference in `manifest`

2. **Manifest Changes**
   - Set `bs_const=debug=false` (already set)
   - Add a real `mm_icon_focus_hd` and `mm_icon_focus_fhd` pointing to actual image files
   - Add `splash_screen_hd` and `splash_screen_fhd`

3. **Hosted Backend API**
   - Deploy the backend server to a public host (e.g., Railway, Render, Fly.io, AWS)
   - Update `GetApiBaseUrl()` in `source/utils.brs` with the production URL
   - Ensure HTTPS and reasonable uptime

4. **Privacy Policy**
   - Create a hosted privacy policy page (required by Roku)
   - Must describe data collection practices (the app collects no user data beyond local prefs)

5. **Roku Developer Account**
   - Sign up at https://developer.roku.com
   - Enroll in the Roku Developer Program
   - Pay the one-time developer fee (if applicable)

6. **Static Channel Certification**
   - Roku reviews all channels before publishing
   - Must pass automated and manual testing
   - Common failure reasons: crashes, missing error handling, slow load times
   - Run the Roku Static Analysis tool locally before submitting

### Nice to Have

- **Store Description & Screenshots** -- Write compelling copy and capture screenshots for the store listing
- **Category Selection** -- "Sports" category on the Roku Channel Store
- **Customer Support Email** -- Required for published channels

### Submission Process

1. **Bump** `build_version` (and/or `minor_version`) in `manifest` for each new package you submit. Re-uploading the same version often fails with “incorrectly packaged” or a silent reject.
2. **Sideload** a fresh build: `make build` then `ROKU_IP=… ROKU_PASS=… make deploy`.
3. **Create a signed store package** — the Roku **Developer Dashboard** expects a **`.pkg` signed on your Roku** (a plain `make build` / `lineup.zip` is for sideloading only and will often be rejected for publishing).

   **In the browser (same IP as dev mode):** open **`http://<ROKU_IP>/plugin_package`**

   - **“Invalid Password” on the Packager is usually the wrong password.** The **Packager** form’s **Password** field is **not** your Roku **web developer password** (the one you use for `make deploy` / `curl` / the Installer). It is the **signing / packaging password** you got when you ran **`genkey`** in a **telnet** session to the Roku (port **8080**). If you never saved it, run `genkey` again in telnet, copy the **Password** line, and use that. (Re-running `genkey` issues a new key; store that password safely. You cannot recover a lost `genkey` password.)
   - **App name/version** must be filled in (e.g. `Lineup 1.0.1`) — use your `manifest` title and version, usually `Name major.minor.build`.
   - The **web** login to `plugin_install` / the browser (if it prompts) still uses **`rokudev` + your dev web password** — that is a different password from the Packager **Password** field.

   See Roku’s [Packaging channels](https://developer.roku.com/docs/developer-program/publishing/packaging-channels.md) doc.

4. In [developer.roku.com](https://developer.roku.com) → your channel → **App package** → upload that **`.pkg`**, not the dev zip.
5. Complete store listing, screenshots, **Submit** for certification (often ~1–2 weeks).

**CLI alternative:** [roku-deploy](https://github.com/rokucommunity/roku-deploy) can `deployAndSignPackage` to your Roku and save the signed `.pkg` under `./out` (Node/npm). From `roku-app/`: `npx roku-deploy` with `host` + `password` in `rokudeploy.json` (do not commit secrets).

**Convenience:** from `roku-app/`, `make package` prints the `plugin_package` URL reminder.
