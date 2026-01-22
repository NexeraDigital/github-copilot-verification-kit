/**
 * Electron Main Process
 *
 * Creates a BrowserWindow with security best practices.
 * Supports --test-mode for headless automated testing.
 * Includes Copilot SDK integration for validation testing.
 */

import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { CopilotClient } from "@github/copilot-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if running in test mode (headless)
const isTestMode = process.argv.includes("--test-mode");

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: !isTestMode, // Hide window in test mode
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });

    // Load the HTML file
    mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));

    // Open DevTools with F12 or Ctrl+Shift+I
    mainWindow.webContents.on("before-input-event", (event, input) => {
        if (input.key === "F12" || (input.control && input.shift && input.key === "I")) {
            mainWindow?.webContents.toggleDevTools();
        }
    });

    // In test mode, output markers for automated testing
    if (isTestMode) {
        mainWindow.webContents.on("did-finish-load", () => {
            console.log("ELECTRON_APP_READY");

            // Give renderer time to initialize, then signal success and exit
            setTimeout(() => {
                console.log("ELECTRON_TEST_SUCCESS");
                app.quit();
            }, 2000);
        });
    }

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

// IPC Handlers
ipcMain.handle("health-check", () => {
    return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        platform: process.platform,
        electronVersion: process.versions.electron,
        nodeVersion: process.versions.node,
    };
});

ipcMain.handle("offline-verify", () => {
    // This handler runs purely locally - no network required
    return {
        verified: true,
        message: "Application running in offline mode",
        localResourcesLoaded: true,
    };
});

ipcMain.handle("get-app-info", () => {
    return {
        appPath: app.getAppPath(),
        isPackaged: app.isPackaged,
        testMode: isTestMode,
    };
});

// Get CLI path for Copilot SDK
function getCliPath(): string {
    if (process.env.COPILOT_CLI_PATH) {
        return process.env.COPILOT_CLI_PATH;
    }

    // Find the npm-loader.js relative to the app
    const basePath = app.isPackaged
        ? path.join(process.resourcesPath, "app.asar.unpacked", "node_modules", "@github", "copilot", "npm-loader.js")
        : path.join(__dirname, "..", "node_modules", "@github", "copilot", "npm-loader.js");

    return basePath;
}

// Copilot SDK test handler
ipcMain.handle("run-copilot-test", async (_event, testPrompt?: string) => {
    const steps: { step: string; status: "success" | "error" | "pending"; message: string }[] = [];
    const prompt = testPrompt || "Say hello in exactly 3 words.";

    const addStep = (step: string, status: "success" | "error" | "pending", message: string) => {
        steps.push({ step, status, message });
    };

    addStep("Initialize", "pending", "Creating CopilotClient...");

    const cliPath = getCliPath();
    const client = new CopilotClient({
        logLevel: "info",
        autoRestart: false,
        cliPath,
    });

    try {
        // Step 1: Create client
        addStep("Initialize", "success", `Client created with CLI: ${cliPath}`);

        // Step 2: Start server
        addStep("Start Server", "pending", "Starting Copilot CLI server...");
        await client.start();
        addStep("Start Server", "success", "CLI server started");

        // Step 3: Ping
        addStep("Ping", "pending", "Pinging server...");
        const pingResult = await client.ping("electron-test");
        addStep("Ping", "success", `Server responded: ${JSON.stringify(pingResult)}`);

        // Step 4: Create session
        addStep("Create Session", "pending", "Creating session...");
        const session = await client.createSession({
            model: "gpt-4o",
            streaming: false,
        });
        addStep("Create Session", "success", `Session ID: ${session.sessionId}`);

        // Step 5: Send message
        addStep("Send Message", "pending", `Sending: "${prompt}"`);

        let response = "";
        const done = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Response timeout after 30 seconds"));
            }, 30000);

            session.on((event) => {
                if (event.type === "assistant.message") {
                    response = event.data.content || "";
                } else if (event.type === "session.idle") {
                    clearTimeout(timeout);
                    resolve();
                } else if (event.type === "session.error") {
                    clearTimeout(timeout);
                    reject(new Error(`Session error: ${JSON.stringify(event.data)}`));
                }
            });
        });

        await session.send({ prompt });
        await done;

        addStep("Send Message", "success", `Response: "${response}"`);

        // Cleanup
        await session.destroy();
        await client.stop();

        return {
            success: true,
            steps: steps.filter(s => s.status !== "pending"),
            response,
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Update the last pending step to error
        const lastPending = steps.findIndex(s => s.status === "pending");
        if (lastPending >= 0) {
            steps[lastPending].status = "error";
            steps[lastPending].message = errorMessage;
        }

        // Cleanup on error
        try {
            await client.stop();
        } catch {
            // Ignore cleanup errors
        }

        return {
            success: false,
            steps: steps.filter(s => s.status !== "pending"),
            error: errorMessage,
        };
    }
});

// App lifecycle
app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// Disable navigation to external URLs (security)
app.on("web-contents-created", (_event, contents) => {
    contents.on("will-navigate", (event, _url) => {
        event.preventDefault();
    });

    contents.setWindowOpenHandler(() => {
        return { action: "deny" };
    });
});
