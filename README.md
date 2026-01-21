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
