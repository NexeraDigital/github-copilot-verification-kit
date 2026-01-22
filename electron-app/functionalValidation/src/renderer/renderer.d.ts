// Type declaration for window.electronAPI (defined in preload.ts)
interface ElectronAPI {
    healthCheck: () => Promise<{
        status: string;
        timestamp: string;
        platform: string;
        electronVersion: string;
        nodeVersion: string;
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
