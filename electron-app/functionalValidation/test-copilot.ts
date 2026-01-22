/**
 * Test: Copilot SDK Integration in Electron Context
 *
 * This script verifies that the Copilot SDK can be used within
 * an Electron application context. It tests:
 * 1. CopilotClient can be created with bundled CLI
 * 2. CLI server starts successfully
 * 3. Session creation and communication works
 *
 * IMPORTANT: This test REQUIRES network access and GitHub Copilot authentication.
 * It tests SDK integration, not offline capability.
 *
 * Prerequisites:
 * - GitHub Copilot subscription
 * - Authenticated via VS Code Copilot extension OR GitHub CLI
 *
 * Run: npm run test:copilot
 */

import { CopilotClient } from "@github/copilot-sdk";
import { fileURLToPath } from "url";

// Get CLI path using same pattern as copilot-sdk tests
function getCliPath(): string {
    if (process.env.COPILOT_CLI_PATH) {
        return process.env.COPILOT_CLI_PATH;
    }

    // Use the npm-loader.js file directly - SDK detects .js and runs via node
    const loaderPath = new URL(
        "./node_modules/@github/copilot/npm-loader.js",
        import.meta.url
    ).pathname;

    // Decode URL-encoded characters (e.g., %20 for spaces)
    const decodedPath = decodeURIComponent(loaderPath);

    // On Windows, remove leading slash from /C:/... paths
    const fixedPath =
        process.platform === "win32" && decodedPath.startsWith("/")
            ? decodedPath.slice(1)
            : decodedPath;

    return fixedPath;
}

async function main(): Promise<void> {
    console.log("=".repeat(60));
    console.log("Copilot SDK Integration Test (Electron Context)");
    console.log("=".repeat(60));
    console.log();
    console.log("NOTE: This test requires network access and authentication.");
    console.log();

    // Step 1: Create CopilotClient
    console.log("[1/5] Creating CopilotClient...");
    const cliPath = getCliPath();
    console.log(`      Using CLI path: ${cliPath}`);

    const client = new CopilotClient({
        logLevel: "info",
        autoRestart: false,
        cliPath,
    });

    try {
        // Step 2: Start CLI server
        console.log("[2/5] Starting Copilot CLI server...");
        await client.start();
        console.log("      CLI server started successfully");

        // Step 3: Ping server
        console.log("[3/5] Pinging server...");
        const pingResult = await client.ping("electron-test");
        console.log(`      Server responded: ${JSON.stringify(pingResult)}`);

        // Step 4: Create session
        console.log("[4/5] Creating session...");
        const session = await client.createSession({
            model: "gpt-4o",
            streaming: false,
        });
        console.log(`      Session created: ${session.sessionId}`);

        // Step 5: Send test message
        console.log("[5/5] Sending test message...");
        console.log('      Prompt: "Say hello in exactly 3 words."');
        console.log();

        let response = "";
        const done = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Response timeout after 30 seconds"));
            }, 30000);

            session.on((event) => {
                if (event.type === "assistant.message") {
                    response = event.data.content || "";
                    console.log("      Response received:");
                    console.log(`      "${response}"`);
                } else if (event.type === "session.idle") {
                    clearTimeout(timeout);
                    resolve();
                } else if (event.type === "session.error") {
                    clearTimeout(timeout);
                    reject(new Error(`Session error: ${JSON.stringify(event.data)}`));
                }
            });
        });

        await session.send({ prompt: "Say hello in exactly 3 words." });
        await done;

        // Cleanup
        console.log();
        console.log("Cleaning up...");
        await session.destroy();
        await client.stop();

        // Success
        console.log();
        console.log("=".repeat(60));
        console.log("SUCCESS: Copilot SDK works in Electron context!");
        console.log("=".repeat(60));
        console.log();
        console.log("The Copilot SDK successfully:");
        console.log("  - Started CLI server from bundled package");
        console.log("  - Established connection and received ping response");
        console.log("  - Created a session with the Copilot API");
        console.log("  - Sent a prompt and received a response");
        console.log();
        console.log("This confirms the SDK can be integrated into Electron apps.");
        console.log();

    } catch (error) {
        console.error();
        console.error("=".repeat(60));
        console.error("FAILURE: Copilot SDK test failed");
        console.error("=".repeat(60));
        console.error();

        if (error instanceof Error) {
            console.error("Error:", error.message);

            if (
                error.message.includes("ENOENT") ||
                error.message.includes("not found")
            ) {
                console.error();
                console.error("Troubleshooting:");
                console.error("  - Ensure dependencies are installed: npm install");
                console.error("  - Check that @github/copilot is in node_modules");
            } else if (
                error.message.includes("auth") ||
                error.message.includes("401") ||
                error.message.includes("403")
            ) {
                console.error();
                console.error("Troubleshooting:");
                console.error("  - Authenticate via VS Code GitHub Copilot extension");
                console.error("  - Or run: gh auth login && gh extension install github/gh-copilot");
                console.error("  - Verify your GitHub Copilot subscription is active");
            }
        } else {
            console.error("Error:", error);
        }

        // Cleanup on error
        try {
            await client.stop();
        } catch {
            // Ignore cleanup errors
        }

        process.exit(1);
    }
}

main();
