/**
 * GitHub Copilot SDK - Authentication & Basic Usage Test
 *
 * This script verifies:
 * 1. Copilot CLI is installed and accessible
 * 2. Authentication works with your GitHub Copilot subscription
 * 3. SDK can create sessions and receive responses
 *
 * Prerequisites:
 * - Node.js >= 18.0.0
 * - GitHub Copilot CLI installed (`copilot` command available in PATH)
 * - Active GitHub Copilot subscription
 *
 * Run: npm install && npm test
 */

import { CopilotClient } from "@github/copilot-sdk";

async function main() {
    console.log("=".repeat(60));
    console.log("GitHub Copilot SDK - Authentication Test");
    console.log("=".repeat(60));
    console.log();

    // Determine CLI path - use the npm-loader.js file directly on Windows
    // The SDK will run .js files via node automatically
    const getCliPath = () => {
        if (process.env.COPILOT_CLI_PATH) return process.env.COPILOT_CLI_PATH;

        // Use the npm-loader.js file directly - SDK detects .js and runs via node
        const loaderPath = new URL("./node_modules/@github/copilot/npm-loader.js", import.meta.url).pathname;
        // Decode URL-encoded characters (e.g., %20 for spaces)
        const decodedPath = decodeURIComponent(loaderPath);
        // On Windows, remove leading slash from /C:/... paths
        const fixedPath = process.platform === "win32" && decodedPath.startsWith("/")
            ? decodedPath.slice(1)
            : decodedPath;
        return fixedPath;
    };

    // Step 1: Create and start the client
    console.log("[1/5] Creating CopilotClient...");
    const cliPath = getCliPath();
    console.log(`      Using CLI path: ${cliPath}`);
    const client = new CopilotClient({
        logLevel: "info",
        autoRestart: false, // Disable auto-restart for cleaner error handling
        cliPath,
    });

    try {
        console.log("[2/5] Starting Copilot CLI server...");
        await client.start();
        console.log("      ✓ CLI server started successfully");

        // Step 2: Ping the server to verify connection
        console.log("[3/5] Pinging server...");
        const pingResult = await client.ping("test");
        console.log(`      ✓ Server responded: ${JSON.stringify(pingResult)}`);

        // Step 3: Create a session
        console.log("[4/5] Creating session...");
        const session = await client.createSession({
            model: "gpt-4o", // Use a valid model
            streaming: false, // Simple non-streaming test first
        });
        console.log(`      ✓ Session created: ${session.sessionId}`);

        // Step 4: Send a test message and wait for response
        console.log("[5/5] Sending test message...");
        console.log('      Prompt: "What is 2+2? Reply with just the number."');
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

        await session.send({ prompt: "What is 2+2? Reply with just the number." });
        await done;

        // Cleanup
        console.log();
        console.log("Cleaning up...");
        await session.destroy();
        await client.stop();

        // Success!
        console.log();
        console.log("=".repeat(60));
        console.log("✓ SUCCESS: Authentication and SDK communication working!");
        console.log("=".repeat(60));
        console.log();
        console.log("Your GitHub Copilot subscription is active and the SDK");
        console.log("can successfully communicate with the Copilot API.");
        console.log();

    } catch (error) {
        console.error();
        console.error("=".repeat(60));
        console.error("✗ ERROR: Test failed");
        console.error("=".repeat(60));
        console.error();

        if (error instanceof Error) {
            console.error("Error:", error.message);

            // Provide helpful troubleshooting tips
            if (error.message.includes("ENOENT") || error.message.includes("not found")) {
                console.error();
                console.error("Troubleshooting:");
                console.error("  - Ensure GitHub Copilot CLI is installed");
                console.error("  - Run 'copilot --version' to verify installation");
                console.error("  - Install via: https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli");
            } else if (error.message.includes("auth") || error.message.includes("401") || error.message.includes("403")) {
                console.error();
                console.error("Troubleshooting:");
                console.error("  - Run 'copilot auth login' to authenticate");
                console.error("  - Verify your GitHub Copilot subscription is active");
                console.error("  - Check: https://github.com/settings/copilot");
            }
        } else {
            console.error("Unknown error:", error);
        }

        // Try to cleanup
        try {
            await client.stop();
        } catch {
            // Ignore cleanup errors
        }

        process.exit(1);
    }
}

main();
