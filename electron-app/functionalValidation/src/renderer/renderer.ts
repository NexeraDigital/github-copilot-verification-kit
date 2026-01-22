/**
 * Electron Renderer Process
 *
 * Uses only local bundled resources - no network calls.
 * Communicates with main process via IPC.
 */

/// <reference path="./renderer.d.ts" />

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

// Render Copilot test results
function renderTestResults(
    steps: { step: string; status: "success" | "error"; message: string }[],
    success: boolean,
    response?: string,
    error?: string
): void {
    const container = document.getElementById("test-results");
    if (!container) return;

    let html = "";

    // Render each step
    for (const step of steps) {
        const icon = step.status === "success" ? "✓" : "✗";
        html += `
            <div class="step-item">
                <div class="step-icon ${step.status}">${icon}</div>
                <div class="step-content">
                    <div class="step-name">${step.step}</div>
                    <div class="step-message">${step.message}</div>
                </div>
            </div>
        `;
    }

    // Final result
    if (success) {
        html += `
            <div class="final-result success">
                ✓ SUCCESS: Copilot SDK integration test passed!
            </div>
        `;
    } else {
        html += `
            <div class="final-result error">
                ✗ FAILED: ${error || "Unknown error"}
            </div>
        `;
    }

    container.innerHTML = html;
}

// Show loading state
function showTestLoading(): void {
    const container = document.getElementById("test-results");
    if (!container) return;

    container.innerHTML = `
        <div class="step-item">
            <div class="step-icon pending"><span class="spinner">⟳</span></div>
            <div class="step-content">
                <div class="step-name">Running Test...</div>
                <div class="step-message">This may take a few seconds. Testing Copilot SDK connection.</div>
            </div>
        </div>
    `;
}

// Run Copilot test
async function runCopilotTest(): Promise<void> {
    const button = document.getElementById("run-copilot-test") as HTMLButtonElement;
    const promptInput = document.getElementById("copilot-prompt") as HTMLInputElement;

    if (!button || !promptInput) return;

    // Disable button during test
    button.disabled = true;
    button.textContent = "Running...";

    showTestLoading();

    try {
        const prompt = promptInput.value.trim() || undefined;
        const result = await window.electronAPI.runCopilotTest(prompt);

        renderTestResults(
            result.steps,
            result.success,
            result.response,
            result.error
        );
    } catch (err) {
        renderTestResults(
            [],
            false,
            undefined,
            err instanceof Error ? err.message : String(err)
        );
    } finally {
        button.disabled = false;
        button.textContent = "Run Test";
    }
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", async () => {
    // Display versions immediately (no async needed)
    displayVersions();

    // Run health check
    await checkHealth();

    // Set up Copilot test button
    const testButton = document.getElementById("run-copilot-test");
    testButton?.addEventListener("click", runCopilotTest);
});
