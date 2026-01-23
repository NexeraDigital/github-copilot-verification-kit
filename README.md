# GitHub Copilot Verification Kit

This verification kit provides functional validation tests to ensure GitHub Copilot integrations are working correctly in your environment.

## Getting Started

### Clone the Repository with VS Code

1. Open **VS Code**
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open the Command Palette
3. Type **"Git: Clone"** and select it
4. Paste the repository URL:
   ```
   https://github.com/NexeraDigital/github-copilot-verification-kit.git
   ```
5. Choose a folder to clone into
6. Click **Open** when prompted to open the cloned repository

### Prerequisites

Before running the tests, ensure you have:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **GitHub Copilot Subscription** - Active subscription required
- **Authentication** - Sign in to the GitHub Copilot extension in VS Code

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
npm run verify    # Build and test offline capability
npm start         # Launch app to run Copilot SDK test via UI
```

**📖 Full Documentation:** [docs/electron-app.md](docs/electron-app.md)

The electron-app documentation includes:
- Building and packaging the Electron app
- Testing offline/restricted network capability
- Running Copilot SDK integration test via the app UI
- Troubleshooting build and launch issues

## Contributing

When adding new tests, please:
1. Create a new directory under the repository root (e.g., `new-test-suite/`)
2. Add a detailed markdown file in the `docs/` folder
3. Update this README with a brief description and link to the docs
