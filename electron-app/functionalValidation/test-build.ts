/**
 * Test: Build the Electron App
 *
 * This script:
 * 1. Compiles TypeScript to JavaScript
 * 2. Runs electron-builder to create an unpacked app
 * 3. Verifies the output files exist
 *
 * Run: npm run build:app
 * Or directly: npx tsx test-build.ts
 */

import { spawn } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function runCommand(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${command} ${args.join(" ")}`);

        const proc = spawn(command, args, {
            cwd: __dirname,
            stdio: "inherit",
            shell: true,
        });

        proc.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}

async function main(): Promise<void> {
    console.log("=".repeat(60));
    console.log("Electron App Build Test");
    console.log("=".repeat(60));
    console.log();

    try {
        // Step 1: Compile TypeScript
        console.log("[1/3] Compiling TypeScript...");
        await runCommand("npx", ["tsc"]);
        console.log("      TypeScript compilation complete");
        console.log();

        // Verify TypeScript output
        const distMain = join(__dirname, "dist", "main.js");
        const distPreload = join(__dirname, "dist", "preload.js");
        const distRenderer = join(__dirname, "dist", "renderer", "renderer.js");

        if (!existsSync(distMain)) {
            throw new Error("dist/main.js not found after compilation");
        }
        if (!existsSync(distPreload)) {
            throw new Error("dist/preload.js not found after compilation");
        }
        if (!existsSync(distRenderer)) {
            throw new Error("dist/renderer/renderer.js not found after compilation");
        }
        console.log("      Verified: dist/main.js exists");
        console.log("      Verified: dist/preload.js exists");
        console.log("      Verified: dist/renderer/renderer.js exists");
        console.log();

        // Step 2: Copy HTML file to dist (not handled by tsc)
        console.log("[2/3] Copying static files...");
        const srcHtml = join(__dirname, "src", "renderer", "index.html");
        const distHtml = join(__dirname, "dist", "renderer", "index.html");

        // Use Node.js fs to copy the file
        const { copyFileSync, mkdirSync } = await import("fs");
        mkdirSync(join(__dirname, "dist", "renderer"), { recursive: true });
        copyFileSync(srcHtml, distHtml);
        console.log("      Copied index.html to dist/renderer/");
        console.log();

        // Step 3: Run electron-builder
        console.log("[3/3] Running electron-builder...");
        await runCommand("npx", ["electron-builder", "--dir"]);
        console.log("      electron-builder complete");
        console.log();

        // Verify electron-builder output
        const platform = process.platform;
        let expectedPath: string;

        if (platform === "win32") {
            expectedPath = join(__dirname, "release", "win-unpacked");
        } else if (platform === "darwin") {
            expectedPath = join(__dirname, "release", "mac");
        } else {
            expectedPath = join(__dirname, "release", "linux-unpacked");
        }

        if (!existsSync(expectedPath)) {
            throw new Error(`Expected release directory not found: ${expectedPath}`);
        }
        console.log(`      Verified: ${expectedPath} exists`);
        console.log();

        // Success
        console.log("=".repeat(60));
        console.log("SUCCESS: Electron app built successfully!");
        console.log("=".repeat(60));
        console.log();
        console.log(`Output directory: ${expectedPath}`);
        console.log();

    } catch (error) {
        console.error();
        console.error("=".repeat(60));
        console.error("FAILURE: Build test failed");
        console.error("=".repeat(60));
        console.error();

        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error:", error);
        }

        process.exit(1);
    }
}

main();
