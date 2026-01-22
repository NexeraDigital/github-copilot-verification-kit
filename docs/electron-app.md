# Electron App - Functional Validation Tests

This test suite verifies that:
1. A compiled Electron app can run on machines in restricted network environments
2. The GitHub Copilot SDK can be integrated and used within an Electron app

## Quick Start

```bash
cd electron-app/functionalValidation
npm install
npm run verify
```

## Prerequisites

- **Node.js 18+** - Required by the SDK and Electron
- **npm** - For package management

### For Copilot SDK Test
- **GitHub Copilot Subscription** - Active subscription required
- **Authentication** - Via VS Code GitHub Copilot extension or GitHub CLI

## Running the Tests

### Step 1: Build and Verify Offline Capability

```bash
npm run verify
```

This automated test:
1. Compiles TypeScript source files
2. Runs electron-builder to create an unpacked app
3. Launches the packaged app with `--test-mode`
4. Verifies the app starts and exits cleanly

**Expected output:**
```
SUCCESS: Electron app built successfully!
SUCCESS: Electron app launches correctly!
```

### Step 2: Run the Copilot SDK Integration Test (via UI)

1. Start the app:
   ```bash
   npm start
   ```
   Or run the packaged app:
   ```bash
   "release\win-unpacked\Electron Copilot Validation.exe"
   ```

2. In the Electron app window, you'll see:
   - **Status cards** showing offline verification, health check, app info, and versions
   - **Copilot SDK Integration Test** section at the bottom

3. Enter a test prompt (or use the default) and click **Run Test**

4. The test will:
   - Initialize the CopilotClient
   - Start the CLI server
   - Ping the server for connectivity
   - Create a session
   - Send your prompt and display the response

**Expected result:** Green success message showing "SUCCESS: Copilot SDK integration test passed!"

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run build:ts` | Compile TypeScript only |
| `npm run build:app` | Compile TypeScript + run electron-builder |
| `npm run start` | Run app in development mode |
| `npm run verify` | Build and launch test (offline) |

## Success Criteria

### Offline Launch Test
- TypeScript compiles without errors
- electron-builder creates unpacked output
- App outputs `ELECTRON_APP_READY` on startup
- App outputs `ELECTRON_TEST_SUCCESS` after initialization
- App exits with code 0

### Copilot SDK Test (via UI)
- All status cards show green/success state
- "Run Test" button executes without errors
- All test steps show green checkmarks:
  - Initialize
  - Start Server
  - Ping
  - Create Session
  - Send Message
- Response is received from Copilot

## Troubleshooting

### Build fails with TypeScript errors

Ensure you have the correct TypeScript version:
```bash
npm install
npx tsc --version  # Should be 5.3+
```

### electron-builder fails with signing errors

On Windows, disable code signing (already configured) and clear the cache:
```bash
rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign"
npm run build:app
```

### electron-builder fails with "file in use" error

Close any running Electron app instances first:
```bash
taskkill /f /im "Electron Copilot Validation.exe" 2>nul
taskkill /f /im electron.exe 2>nul
npm run build:app
```

### Copilot SDK test fails with auth error

1. Ensure you have an active GitHub Copilot subscription
2. Authenticate via one of these methods:
   - **VS Code**: Install and sign in to the GitHub Copilot extension
   - **GitHub CLI**: Run `gh auth login` followed by `gh extension install github/gh-copilot`
3. Verify at: https://github.com/settings/copilot

### Status cards stuck on "Checking..."

Open DevTools (F12 or Ctrl+Shift+I) to check for JavaScript errors. Common issues:
- Preload script failed to load
- IPC handlers not registered

## Technical Details

### Why This Works Offline

1. **Bundled Resources**: All HTML, CSS, and JS are compiled into the ASAR package
2. **Content Security Policy**: Blocks loading any external resources
3. **No Network Calls**: Main and renderer processes make no HTTP requests
4. **IPC Only**: All communication is via Electron's IPC (local)

### Security Features

- **Context Isolation**: Renderer process is isolated from Node.js
- **Sandbox Mode**: Renderer runs in Chromium sandbox
- **Preload Script**: Only safe APIs exposed via contextBridge
- **CSP Headers**: Blocks inline scripts and external resources
- **No Navigation**: External URL navigation is blocked

### Directory Structure

```
electron-app/functionalValidation/
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript config (main + renderer)
├── tsconfig.preload.json # TypeScript config (preload - CommonJS)
├── src/
│   ├── main.ts          # Electron main process + Copilot SDK
│   ├── preload.ts       # Security bridge (IPC exposure)
│   └── renderer/
│       ├── index.html   # UI with test controls
│       ├── renderer.ts  # Renderer logic
│       └── renderer.d.ts # Type declarations
├── test-build.ts        # Build verification script
├── test-launch.ts       # Launch verification script
├── dist/                # Compiled JS (generated)
└── release/             # Packaged app (generated)
```

## Manual Offline Verification

To manually verify offline capability:

1. Build the app: `npm run build:app`
2. Disconnect from the network
3. Run the executable from `release/win-unpacked/`
4. Verify the app loads and displays status information
5. Confirm no network errors appear (status cards should show success)

Note: The Copilot SDK test requires network access and will fail when offline.
