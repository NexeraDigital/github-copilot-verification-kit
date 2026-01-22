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

### For Copilot SDK Test Only
- **GitHub Copilot Subscription** - Active subscription required
- **Authentication** - Via VS Code GitHub Copilot extension or GitHub CLI

## Available Tests

### Test 1: Offline Launch Test (`npm run verify`)

This test verifies the Electron app can run without network access:

```bash
npm run verify
```

**What it does:**
1. Compiles TypeScript source files
2. Runs electron-builder to create an unpacked app
3. Launches the packaged app with `--test-mode`
4. Verifies the app starts and exits cleanly

**Expected output:**
```
SUCCESS: Electron app built successfully!
SUCCESS: Electron app launches correctly!
```

### Test 2: Copilot SDK Integration (`npm run test:copilot`)

This test verifies the Copilot SDK works within an Electron context:

```bash
npm run test:copilot
```

**What it does:**
1. Creates a CopilotClient with the bundled CLI
2. Starts the CLI server
3. Pings the server for connectivity
4. Creates a session and sends a test prompt
5. Verifies a response is received

**Expected output:**
```
SUCCESS: Copilot SDK works in Electron context!
```

## Individual Scripts

| Script | Description |
|--------|-------------|
| `npm run build:ts` | Compile TypeScript only |
| `npm run build:app` | Compile TypeScript + run electron-builder |
| `npm run start` | Run app in development mode |
| `npm run verify` | Build and launch test (offline) |
| `npm run test:launch` | Launch test only (requires prior build) |
| `npm run test:copilot` | Copilot SDK integration test |

## Success Criteria

### Offline Launch Test
- TypeScript compiles without errors
- electron-builder creates unpacked output
- App outputs `ELECTRON_APP_READY` on startup
- App outputs `ELECTRON_TEST_SUCCESS` after initialization
- App exits with code 0

### Copilot SDK Test
- CopilotClient creates successfully
- CLI server starts
- Ping returns valid response
- Session is created
- Test prompt receives a response

## Troubleshooting

### Build fails with TypeScript errors

Ensure you have the correct TypeScript version:
```bash
npm install
npx tsc --version  # Should be 5.3+
```

### electron-builder fails

Check that Electron is installed correctly:
```bash
npx electron --version
```

If on Windows with path issues, try:
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Launch test times out

The test has a 30-second timeout. If it times out:
1. Check the release directory exists: `ls release/`
2. Try running the app manually: `./release/win-unpacked/Electron\ Copilot\ Validation.exe --test-mode`
3. Look for errors in stderr output

### Copilot SDK test fails with auth error

1. Ensure you have an active GitHub Copilot subscription
2. Authenticate via one of these methods:
   - **VS Code**: Install and sign in to the GitHub Copilot extension
   - **GitHub CLI**: Run `gh auth login` followed by `gh extension install github/gh-copilot`
3. Verify at: https://github.com/settings/copilot

### "ENOENT" or "not found" errors

The CLI path couldn't be resolved:
1. Check that `@github/copilot` is installed: `ls node_modules/@github/copilot`
2. Ensure the npm-loader.js file exists: `ls node_modules/@github/copilot/npm-loader.js`

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
├── tsconfig.json         # TypeScript config
├── src/
│   ├── main.ts          # Electron main process
│   ├── preload.ts       # Security bridge
│   └── renderer/
│       ├── index.html   # UI
│       └── renderer.ts  # Renderer logic
├── test-build.ts        # Build verification
├── test-launch.ts       # Launch verification (offline)
├── test-copilot.ts      # SDK integration test
├── dist/                # Compiled JS (generated)
└── release/             # Packaged app (generated)
```

## Manual Verification

To manually verify offline capability:

1. Build the app: `npm run build:app`
2. Disconnect from the network
3. Run the executable from `release/win-unpacked/` (or equivalent)
4. Verify the app loads and displays status information
5. Confirm no network errors appear
