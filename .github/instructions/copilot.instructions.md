---
applyTo: '**'
---

# GitHub Copilot Verification Kit - AI Assistant Instructions

## Project Overview
This repository contains functional validation tests for the GitHub Copilot SDK. The tests verify that developers can successfully integrate and use the Copilot SDK in their applications.

## Critical Setup Instructions

When helping users run the verification tests, follow these guidelines to avoid common pitfalls:

### ✅ Correct Approach

1. **Check Node.js version** (must be 18+)
   ```bash
   node --version
   ```

2. **Navigate to test directory**
   ```bash
   cd copilot-sdk/functionalValidation
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```
   This installs the bundled Copilot CLI from the `@github/copilot` package automatically.

4. **Run tests**
   ```bash
   npm run verify
   ```

That's it! No separate CLI installation or authentication is needed.

### ❌ Common Mistakes to AVOID

**DO NOT** suggest installing `@githubnext/github-copilot-cli`:
- This package is deprecated and has authentication issues
- It causes infinite shell integration loops on Windows
- It tries to connect to unavailable endpoints (next-waitlist.azurewebsites.net)
- The tests don't need this package at all

**DO NOT** tell users to run `copilot auth login`:
- Not necessary for these tests
- Can cause shell integration loops on Windows PowerShell
- The bundled CLI authenticates automatically through VS Code or GitHub CLI

**DO NOT** suggest hardcoding `COPILOT_CLI_PATH` environment variable:
- The tests auto-detect the bundled CLI when this variable is not set
- Setting it can cause spawn errors with .cmd files
- Let the test code handle path detection automatically

### Known Issues and Solutions

#### Issue 1: Windows Shell Integration Loop
**Symptoms:** Running `copilot` command shows repeated "Cannot find GitHub Copilot CLI" prompts

**Why it happens:** Windows PowerShell has shell integration hooks that interfere with the standalone copilot command

**Solution:** Don't try to fix it! The bundled CLI works without the standalone command. Just run `npm run verify` directly.

#### Issue 2: Path Encoding with Spaces
**Symptoms:** Error: `Cannot find module 'C:\...\New%20folder\...'`

**Why it happens:** Using `new URL().pathname` creates URL-encoded paths with `%20` instead of spaces

**Solution:** Already fixed in test files using `decodeURIComponent()`. If you see this in user code, add:
```typescript
const decodedPath = decodeURIComponent(loaderPath);
```

#### Issue 3: Authentication Errors (401/403)
**Symptoms:** Tests fail with authentication/authorization errors

**Why it happens:** User is not authenticated with GitHub in VS Code or GitHub CLI

**Solution:** User must have GitHub Copilot extension in VS Code and be signed in, OR have GitHub CLI authenticated (`gh auth login`)

#### Issue 4: Spawn EINVAL Error
**Symptoms:** `Error: spawn EINVAL` when trying to start CLI

**Why it happens:** Trying to spawn a .cmd file directly, or path has issues

**Solution:** Ensure tests use the bundled npm-loader.js, not the .cmd wrapper. Clear any COPILOT_CLI_PATH environment variables.

### Test File Architecture

The tests in `copilot-sdk/functionalValidation/` use this approach:

1. **Auto-detect CLI path**: Check `COPILOT_CLI_PATH` env var, otherwise use bundled `node_modules/@github/copilot/npm-loader.js`
2. **Handle Windows paths**: Remove leading slash from `/C:/...` style paths
3. **Decode URL encoding**: Use `decodeURIComponent()` to handle spaces in directory names
4. **Let SDK handle execution**: The SDK knows how to run .js files via node automatically

### Package.json Scripts

The npm scripts should NOT hardcode `COPILOT_CLI_PATH`:

```json
"scripts": {
  "verify": "npm run test && npm run test:streaming",
  "test": "npx tsx test-auth.ts",
  "test:streaming": "npx tsx test-streaming.ts"
}
```

**Not this:**
```json
"scripts": {
  "test": "cross-env COPILOT_CLI_PATH=copilot npx tsx test-auth.ts"  ❌
}
```

### Troubleshooting Workflow

When users encounter issues, follow this diagnostic sequence:

1. **Verify Node.js version**: Must be 18+
2. **Check current directory**: Must be in `copilot-sdk/functionalValidation`
3. **Verify npm install ran**: Check that `node_modules/@github/copilot` exists
4. **Clear environment variables**: `Remove-Item Env:\COPILOT_CLI_PATH` (PowerShell)
5. **Check authentication**: User must be signed into GitHub in VS Code or have run `gh auth login`
6. **Run tests**: `npm run verify`

### Success Indicators

When tests pass, you'll see:
```
✓ SUCCESS: Authentication and SDK communication working!
✓ Streaming test completed successfully!
```

Both tests must complete without errors.

### Dependencies

The project uses:
- `@github/copilot` - Bundled Copilot CLI (automatically installed)
- `@github/copilot-sdk` - SDK for integrating Copilot
- `tsx` - TypeScript execution
- `cross-env` - Cross-platform environment variables (legacy, no longer used in scripts)

### When Making Changes

If modifying test files or documentation:

1. **Test on Windows**: Most issues occur on Windows due to path handling
2. **Test with spaces in path**: Ensure paths with spaces work (use `decodeURIComponent()`)
3. **Don't assume CLI in PATH**: Always use bundled CLI via relative path
4. **Verify both tests pass**: Run `npm run verify` after changes

### Key Takeaway

The simplest path to success is:
1. Have Node.js 18+
2. Have GitHub Copilot extension in VS Code (signed in)
3. Run `npm install` in the test directory
4. Run `npm run verify`

Don't overcomplicate it by installing extra packages or trying to set up standalone CLIs. The bundled approach works reliably across all platforms.