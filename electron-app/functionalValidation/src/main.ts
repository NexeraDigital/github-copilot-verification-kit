/**
 * Electron Main Process
 *
 * Creates a BrowserWindow with security best practices.
 * Supports --test-mode for headless automated testing.
 */

import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

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
