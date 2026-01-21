# GitHub Copilot Verification Kit

This verification kit helps you test that the GitHub Copilot SDK is working correctly in your environment.

## Quick Start

```bash
cd copilot-sdk/functionalValidation
npm install
npm run verify
```

## Prerequisites

1. **Node.js 18+** - Required by the SDK
2. **GitHub Copilot CLI** - Must be installed and in PATH
3. **GitHub Copilot Subscription** - Active subscription required

### Installing Node.js

Download and install Node.js 18 or later from: https://nodejs.org/

Verify installation:
```bash
node --version
```

You should see `v18.x.x` or higher (e.g., `v20.11.0`).

### Installing Copilot CLI

Follow the official guide: https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli

Verify installation:
```bash
copilot --version
```

### Authentication

Login to Copilot CLI:
```bash
copilot auth login
```

## Using GitHub Copilot in VS Code

If you have GitHub Copilot installed in VS Code, you can use Copilot Chat to help install prerequisites and run the tests.

### Open this project in VS Code

1. Clone this repository
2. Open the folder in VS Code
3. Open Copilot Chat (Ctrl+Shift+I or Cmd+Shift+I)

### Use this prompt to get started

Copy and paste this prompt into Copilot Chat:

```
Help me run the GitHub Copilot SDK verification tests in this project.

1. First, check if I have Node.js 18+ installed. If not, tell me how to install it.
2. Check if I have the GitHub Copilot CLI installed. If not, help me install it.
3. Help me authenticate with `copilot auth login`
4. Navigate to the copilot-sdk/functionalValidation folder
5. Install dependencies with npm install
6. Run the tests with npm run verify

Guide me through each step and let me know if anything fails.
```

Copilot will walk you through each step and help troubleshoot any issues.

## Running the Tests

### Navigate to the test directory
```bash
cd copilot-sdk/functionalValidation
```

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm run verify
```

Or run tests individually:
- **Basic Authentication Test:** `npm test`
- **Streaming Test:** `npm run test:streaming`

## Success Criteria

The verification is successful when you see:
- `✓ SUCCESS: Authentication and SDK communication working!` from the auth test
- `✓ Streaming test completed successfully!` from the streaming test

Both tests must pass for your environment to be considered properly configured.

## Expected Output

### Successful Test
```
============================================================
GitHub Copilot SDK - Authentication Test
============================================================

[1/5] Creating CopilotClient...
[2/5] Starting Copilot CLI server...
      ✓ CLI server started successfully
[3/5] Pinging server...
      ✓ Server responded: {"message":"pong","timestamp":...}
[4/5] Creating session...
      ✓ Session created: session-xxx
[5/5] Sending test message...
      Prompt: "What is 2+2? Reply with just the number."

      Response received:
      "4"

Cleaning up...

============================================================
✓ SUCCESS: Authentication and SDK communication working!
============================================================
```

## Troubleshooting

### "copilot: command not found" or spawn errors on Windows
The SDK has been configured to automatically find the CLI on Windows by using the `npm-loader.js` file directly.

If you still encounter issues:
1. Ensure `@github/copilot` is installed (either globally or locally in this project)
2. The tests are configured to use the local installation at `node_modules/@github/copilot/npm-loader.js`
3. If needed, set `COPILOT_CLI_PATH` environment variable to the full path of your copilot installation

### "copilot: command not found" (Unix/Mac)
- Install Copilot CLI: https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli
- Ensure it's in your PATH

### Authentication Errors (401/403)
- Run `copilot auth login`
- Verify your subscription: https://github.com/settings/copilot

### Timeout Errors
- Check your network connection
- Try increasing the timeout in the test scripts

## Reporting Issues

If tests fail after following troubleshooting steps, please provide:

1. **Full Console Output** - Copy everything from the terminal
2. **System Information:**
   - Operating System (e.g., Windows 11, macOS 14.2, Ubuntu 22.04)
   - Node.js version: `node --version`
   - Copilot CLI version: `copilot --version`
3. **Authentication Status:** Output of `copilot auth status`
4. **Network:** Are you behind a corporate proxy or firewall?
5. **Screenshots** of any error dialogs if applicable

## Next Steps

Once these tests pass:
1. Your GitHub Copilot SDK environment is verified working
2. You can proceed with integrating the SDK into your application
3. Refer to the official GitHub Copilot SDK documentation for API details
