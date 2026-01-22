// Type declaration for window.electronAPI (defined in preload.ts)
interface ElectronAPI {
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
}

interface Window {
    electronAPI: ElectronAPI;
}
