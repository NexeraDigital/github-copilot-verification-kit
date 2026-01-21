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
2. **GitHub Copilot Subscription** - Active subscription required
3. **GitHub Copilot CLI** - See installation options below

### Installing Node.js

Download and install Node.js 18 or later from: https://nodejs.org/

Verify installation:
```bash
node --version
```

You should see `v18.x.x` or higher (e.g., `v20.11.0`).

### Installing Copilot CLI

**IMPORTANT:** The tests will use the Copilot CLI that comes bundled with the `@github/copilot` npm package (installed automatically via `npm install`). You typically **do not** need to install a separate standalone Copilot CLI.

#### Recommended Setup (Choose One):

**Option 1: VS Code Extension (Recommended)**
- Install the [GitHub Copilot extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) in VS Code
- Sign in with your GitHub account in VS Code
- The extension includes a working Copilot CLI

**Option 2: GitHub CLI Extension**
```bash
# Install GitHub CLI first if you haven't: https://cli.github.com/
gh extension install github/gh-copilot
gh auth login
```

**Option 3: Use Bundled CLI (Default)**
- Just run `npm install` in the test directory
- The tests are pre-configured to use the bundled CLI from `@github/copilot` package
- No additional installation needed

#### Avoid Known Issues:

⚠️ **DO NOT install `@githubnext/github-copilot-cli`** - This older package has authentication issues and may cause infinite loops on Windows.

⚠️ **Windows Users:** If you see "`copilot` is not recognized" or shell integration loops, the tests will automatically fall back to the bundled CLI. No action needed.

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

1. Check if I have Node.js 18+ installed
2. Navigate to copilot-sdk/functionalValidation folder
3. Install dependencies with npm install
4. Run the tests with npm run verify

Note: The tests use the bundled Copilot CLI from @github/copilot package, so no separate CLI installation is needed.

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

### Windows: Shell Integration Loop with `copilot` command
If you see "`Cannot find GitHub Copilot CLI`" repeatedly prompting for installation:
- **DO NOT** manually install `@githubnext/github-copilot-cli`
- This is a known issue with Windows PowerShell shell integration
- The tests will automatically use the bundled CLI from `node_modules/@github/copilot/`
- Simply run: `npm install` then `npm run verify` - it will work without the standalone CLI

### "copilot: command not found" or spawn errors on Windows
The SDK is configured to automatically find the bundled CLI on Windows by using the `npm-loader.js` file directly.

**Solution:**
1. Make sure you ran `npm install` in the `copilot-sdk/functionalValidation` directory
2. The `@github/copilot` package will be installed locally
3. Tests will automatically use `node_modules/@github/copilot/npm-loader.js`
4. No additional CLI installation needed

### Authentication Errors with `@githubnext/github-copilot-cli`
If you see errors like "`getaddrinfo ENOTFOUND next-waitlist.azurewebsites.net`":
- This package is deprecated and has authentication issues
- Uninstall it: `npm uninstall -g @githubnext/github-copilot-cli`
- The verification tests don't need this package
- Use the bundled CLI instead (automatically available after `npm install`)

### "copilot: command not found" (Unix/Mac)
- The bundled CLI should work automatically after running `npm install`
- If issues persist, install via GitHub CLI: `gh extension install github/gh-copilot`
- Or install VS Code GitHub Copilot extension

### Authentication Errors (401/403)
The bundled CLI in `@github/copilot` package handles authentication automatically through:
- VS Code GitHub Copilot extension (if installed)
- GitHub CLI authentication (`gh auth login`)
- Environment variables

**Troubleshooting steps:**
1. If you have VS Code with GitHub Copilot extension: Sign in to GitHub in VS Code
2. If you have GitHub CLI: Run `gh auth login` and follow the prompts
3. Verify: `gh auth status` should show you're logged in

### Timeout Errors
- Check your network connection
- Try increasing the timeout in the test scripts
- Verify you have an active Copilot subscription at https://github.com/settings/copilot

## Reporting Issues

If tests fail after following troubleshooting steps, please provide:

1. **Full Console Output** - Copy everything from the terminal
2. **System Information:**
   - Operating System (e.g., Windows 11, macOS 14.2, Ubuntu 22.04)
   - Node.js version: `node --version`
   - npm version: `npm --version`
3. **Package Verification:**
   - Run: `npm list @github/copilot` in the test directory
   - Include the output showing package version
4. **Authentication Status:**
   - If using GitHub CLI: `gh auth status`
   - If using VS Code: Confirm GitHub Copilot extension is installed and signed in
5. **Network:** Are you behind a corporate proxy or firewall?
6. **Screenshots** of any error dialogs if applicable

### Common Mistakes to Avoid:
- ❌ Installing `@githubnext/github-copilot-cli` globally (causes issues)
- ❌ Trying to run `copilot auth login` before npm install (not needed)
- ❌ Running tests outside the `copilot-sdk/functionalValidation` directory
- ✅ Just run `npm install` then `npm run verify` in the test directory

## Next Steps

Once these tests pass:
1. Your GitHub Copilot SDK environment is verified working
2. You can proceed with integrating the SDK into your application
3. Refer to the official GitHub Copilot SDK documentation for API details
