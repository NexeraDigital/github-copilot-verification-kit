# GitHub Copilot Verification Kit

This verification kit provides functional validation tests to ensure GitHub Copilot integrations are working correctly in your environment.

## Available Tests

### GitHub Copilot SDK
Functional validation tests for the GitHub Copilot SDK that verify authentication, API communication, and streaming capabilities.

**Quick Start:**
```bash
cd copilot-sdk/functionalValidation
npm install
npm run verify
```

**📖 Full Documentation:** [docs/copilot-sdk.md](docs/copilot-sdk.md)

The copilot-sdk documentation includes:
- Prerequisites and installation instructions
- Detailed troubleshooting for common issues (especially Windows)
- Expected output and success criteria
- Tips for using GitHub Copilot Chat to help run tests

### Electron App (Restricted Network)
Functional validation tests that verify a compiled Electron app can run in restricted network environments, and that the Copilot SDK can be integrated within Electron apps.

**Quick Start:**
```bash
cd electron-app/functionalValidation
npm install
npm run verify          # Test offline capability (no network required)
npm run test:copilot    # Test SDK integration (requires auth)
```

**📖 Full Documentation:** [docs/electron-app.md](docs/electron-app.md)

The electron-app documentation includes:
- Building and packaging the Electron app
- Testing offline/restricted network capability
- Copilot SDK integration in Electron context
- Troubleshooting build and launch issues

## Prerequisites

- **Node.js 18+** - Required by the SDK
- **GitHub Copilot Subscription** - Active subscription required
- **Authentication** - Via VS Code GitHub Copilot extension or GitHub CLI

## Contributing

When adding new tests, please:
1. Create a new directory under the repository root (e.g., `new-test-suite/`)
2. Add a detailed markdown file in the `docs/` folder
3. Update this README with a brief description and link to the docs
