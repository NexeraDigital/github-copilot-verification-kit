/**
 * Electron Renderer Process
 *
 * Uses only local bundled resources - no network calls.
 * Communicates with main process via IPC.
 */

// Make this file a module to allow global augmentation
export {};

// Type reference for window.electronAPI (defined in preload.ts)
declare global {
    interface Window {
        electronAPI: {
            healthCheck: () => Promise<{
                status: string;
                timestamp: string;
                platform: string;
                electronVersion: string;
                nodeVersion: string;
            }>;
            offlineVerify: () => Promise<{
                verified: boolean;
                message: string;
                localResourcesLoaded: boolean;
            }>;
            getAppInfo: () => Promise<{
                appPath: string;
                isPackaged: boolean;
                testMode: boolean;
            }>;
            platform: string;
            versions: {
                node: string;
                chrome: string;
                electron: string;
            };
        };
    }
}

// Helper to update DOM elements safely
function updateElement(id: string, content: string, className?: string): void {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = content;
        if (className) {
            el.className = `status-value ${className}`;
        }
    }
}

// Display version information (synchronous, no network)
function displayVersions(): void {
    const versions = window.electronAPI.versions;
    updateElement("electron-version", versions.electron);
    updateElement("chrome-version", versions.chrome);
    updateElement("node-version", versions.node);
}

// Run offline verification
async function verifyOffline(): Promise<void> {
    try {
        const result = await window.electronAPI.offlineVerify();
        const indicator = document.getElementById("offline-indicator");

        if (result.verified) {
            updateElement("offline-text", "Running offline - all resources local", "status-success");
            indicator?.classList.add("success");
        } else {
            updateElement("offline-text", "Verification failed", "status-error");
        }
    } catch (error) {
        updateElement("offline-text", `Error: ${error}`, "status-error");
    }
}

// Run health check
async function checkHealth(): Promise<void> {
    try {
        const health = await window.electronAPI.healthCheck();
        if (health.status === "healthy") {
            updateElement("health-status", `Healthy - ${health.platform}`, "status-success");
        } else {
            updateElement("health-status", `Unhealthy: ${health.status}`, "status-error");
        }
    } catch (error) {
        updateElement("health-status", `Error: ${error}`, "status-error");
    }
}

// Get app information
async function getAppInfo(): Promise<void> {
    try {
        const info = await window.electronAPI.getAppInfo();
        const status = info.isPackaged ? "Packaged App" : "Development Mode";
        const testMode = info.testMode ? " (Test Mode)" : "";
        updateElement("app-info", `${status}${testMode}`, "status-success");
    } catch (error) {
        updateElement("app-info", `Error: ${error}`, "status-error");
    }
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", async () => {
    // Display versions immediately (no async needed)
    displayVersions();

    // Run async checks in parallel
    await Promise.all([
        verifyOffline(),
        checkHealth(),
        getAppInfo(),
    ]);
});
