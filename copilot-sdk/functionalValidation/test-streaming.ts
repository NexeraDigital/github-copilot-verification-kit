/**
 * GitHub Copilot SDK - Streaming Response Test
 *
 * This script tests streaming responses, which is essential for
 * building a responsive chat UI.
 *
 * Run: npm install && npm run test:streaming
 */

import { CopilotClient } from "@github/copilot-sdk";

async function main() {
    console.log("=".repeat(60));
    console.log("GitHub Copilot SDK - Streaming Test");
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

    const client = new CopilotClient({
        logLevel: "error", // Quieter for streaming output
        cliPath: getCliPath(),
    });

    try {
        console.log("Starting client and creating session...");
        await client.start();

        const session = await client.createSession({
            model: "gpt-4o",
            streaming: true, // Enable streaming
        });

        console.log(`Session created: ${session.sessionId}`);
        console.log();
        console.log("Sending prompt: 'Write a haiku about coding.'");
        console.log();
        console.log("-".repeat(40));
        console.log("Streaming response:");
        console.log("-".repeat(40));

        let fullResponse = "";
        const done = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Response timeout"));
            }, 60000);

            session.on((event) => {
                switch (event.type) {
                    case "assistant.message_delta":
                        // Stream each chunk as it arrives
                        const chunk = event.data.deltaContent || "";
                        process.stdout.write(chunk);
                        fullResponse += chunk;
                        break;

                    case "assistant.message":
                        // Final complete message
                        console.log();
                        console.log("-".repeat(40));
                        break;

                    case "session.idle":
                        clearTimeout(timeout);
                        resolve();
                        break;

                    case "session.error":
                        clearTimeout(timeout);
                        reject(new Error(`Session error: ${JSON.stringify(event.data)}`));
                        break;

                    case "tool.execution_start":
                        console.log(`\n[Tool: ${event.data.toolName} starting...]`);
                        break;

                    case "tool.execution_end":
                        console.log(`[Tool: ${event.data.toolName} completed]`);
                        break;
                }
            });
        });

        await session.send({ prompt: "Write a haiku about coding." });
        await done;

        // Cleanup
        await session.destroy();
        await client.stop();

        console.log();
        console.log("=".repeat(60));
        console.log("✓ Streaming test completed successfully!");
        console.log("=".repeat(60));

    } catch (error) {
        console.error();
        console.error("Error:", error instanceof Error ? error.message : error);

        try {
            await client.stop();
        } catch {
            // Ignore
        }

        process.exit(1);
    }
}

main();
