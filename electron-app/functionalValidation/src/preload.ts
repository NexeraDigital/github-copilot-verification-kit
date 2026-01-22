/**
 * Electron Preload Script
 *
 * Provides a secure bridge between the renderer process and main process.
 * Uses contextBridge to expose only safe APIs.
 */

import { contextBridge, ipcRenderer } from "electron";

// Expose safe APIs to the renderer via electronAPI
contextBridge.exposeInMainWorld("electronAPI", {
    // Health check - verifies IPC communication works
    healthCheck: (): Promise<{
        status: string;
        timestamp: string;
        platform: string;
        electronVersion: string;
        nodeVersion: string;
    }> => ipcRenderer.invoke("health-check"),

    // Offline verification - confirms app runs without network
    offlineVerify: (): Promise<{
        verified: boolean;
        message: string;
        localResourcesLoaded: boolean;
    }> => ipcRenderer.invoke("offline-verify"),

    // Get app information
    getAppInfo: (): Promise<{
        appPath: string;
        isPackaged: boolean;
        testMode: boolean;
    }> => ipcRenderer.invoke("get-app-info"),

    // Run Copilot SDK test
    runCopilotTest: (testPrompt?: string): Promise<{
        success: boolean;
        steps: { step: string; status: "success" | "error"; message: string }[];
        response?: string;
        error?: string;
    }> => ipcRenderer.invoke("run-copilot-test", testPrompt),

    // Platform information (safe to expose)
    platform: process.platform,

    // Versions (safe to expose)
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron,
    },
});

// Type declaration for TypeScript
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
            runCopilotTest: (testPrompt?: string) => Promise<{
                success: boolean;
                steps: { step: string; status: "success" | "error"; message: string }[];
                response?: string;
                error?: string;
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
