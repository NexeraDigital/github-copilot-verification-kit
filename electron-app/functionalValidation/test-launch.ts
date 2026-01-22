/**
 * Test: Launch Packaged Electron App (Offline)
 *
 * This script:
 * 1. Finds the platform-specific executable
 * 2. Launches it with --test-mode flag
 * 3. Waits for ELECTRON_APP_READY and ELECTRON_TEST_SUCCESS markers
 * 4. Verifies clean exit (code 0)
 *
 * This test does NOT require network access - it verifies the app
 * can run in a restricted/offline environment.
 *
 * Prerequisites: Run `npm run build:app` first
 * Run: npm run test:launch
 */

import { spawn } from "child_process";
import { existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TIMEOUT_MS = 30000; // 30 second timeout

function findExecutable(): string {
    const platform = process.platform;
    const releaseDir = join(__dirname, "release");

    if (!existsSync(releaseDir)) {
        throw new Error(
            "Release directory not found. Run 'npm run build:app' first."
        );
    }

    if (platform === "win32") {
        const winUnpacked = join(releaseDir, "win-unpacked");
        if (!existsSync(winUnpacked)) {
            throw new Error("win-unpacked directory not found");
        }

        // Find the .exe file
        const files = readdirSync(winUnpacked);
        const exe = files.find((f) => f.endsWith(".exe"));
        if (!exe) {
            throw new Error("No .exe found in win-unpacked");
        }
        return join(winUnpacked, exe);
    } else if (platform === "darwin") {
        const macDir = join(releaseDir, "mac");
        if (!existsSync(macDir)) {
            // Try mac-arm64 or mac-x64
            const dirs = readdirSync(releaseDir);
            const macVariant = dirs.find((d) => d.startsWith("mac"));
            if (!macVariant) {
                throw new Error("No mac directory found in release");
            }
            const appDir = join(releaseDir, macVariant);
            const apps = readdirSync(appDir);
            const app = apps.find((a) => a.endsWith(".app"));
            if (!app) {
                throw new Error("No .app found in mac directory");
            }
            return join(appDir, app, "Contents", "MacOS", app.replace(".app", ""));
        }
        const apps = readdirSync(macDir);
        const app = apps.find((a) => a.endsWith(".app"));
        if (!app) {
            throw new Error("No .app found in mac directory");
        }
        return join(macDir, app, "Contents", "MacOS", app.replace(".app", ""));
    } else {
        // Linux
        const linuxUnpacked = join(releaseDir, "linux-unpacked");
        if (!existsSync(linuxUnpacked)) {
            throw new Error("linux-unpacked directory not found");
        }

        // Find the executable (usually matches the product name)
        const files = readdirSync(linuxUnpacked);
        // Look for the main executable (no extension, not a .so file)
        const exe = files.find(
            (f) => !f.includes(".") || (!f.endsWith(".so") && !f.includes(".so."))
        );
        if (!exe) {
            throw new Error("No executable found in linux-unpacked");
        }
        return join(linuxUnpacked, exe);
    }
}

async function main(): Promise<void> {
    console.log("=".repeat(60));
    console.log("Electron App Launch Test (Offline)");
    console.log("=".repeat(60));
    console.log();

    try {
        // Step 1: Find executable
        console.log("[1/3] Finding executable...");
        const execPath = findExecutable();
        console.log(`      Found: ${execPath}`);
        console.log();

        // Step 2: Launch with --test-mode
        console.log("[2/3] Launching app with --test-mode...");
        console.log("      (No network required - testing offline capability)");
        console.log();

        let appReady = false;
        let testSuccess = false;
        let output = "";

        const proc = spawn(execPath, ["--test-mode"], {
            cwd: __dirname,
            stdio: ["ignore", "pipe", "pipe"],
        });

        // Collect stdout
        proc.stdout.on("data", (data: Buffer) => {
            const text = data.toString();
            output += text;
            process.stdout.write(`      [stdout] ${text}`);

            if (text.includes("ELECTRON_APP_READY")) {
                appReady = true;
            }
            if (text.includes("ELECTRON_TEST_SUCCESS")) {
                testSuccess = true;
            }
        });

        // Collect stderr
        proc.stderr.on("data", (data: Buffer) => {
            const text = data.toString();
            // Filter out common Electron warnings that aren't errors
            if (!text.includes("Gtk-WARNING") && !text.includes("GLib-GIO-WARNING")) {
                process.stderr.write(`      [stderr] ${text}`);
            }
        });

        // Wait for process to exit with timeout
        const exitCode = await new Promise<number>((resolve, reject) => {
            const timeout = setTimeout(() => {
                proc.kill();
                reject(new Error(`Timeout after ${TIMEOUT_MS / 1000} seconds`));
            }, TIMEOUT_MS);

            proc.on("close", (code) => {
                clearTimeout(timeout);
                resolve(code ?? 1);
            });

            proc.on("error", (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });

        console.log();

        // Step 3: Verify results
        console.log("[3/3] Verifying test results...");

        if (!appReady) {
            throw new Error("ELECTRON_APP_READY marker not received");
        }
        console.log("      ELECTRON_APP_READY received");

        if (!testSuccess) {
            throw new Error("ELECTRON_TEST_SUCCESS marker not received");
        }
        console.log("      ELECTRON_TEST_SUCCESS received");

        if (exitCode !== 0) {
            throw new Error(`App exited with code ${exitCode} (expected 0)`);
        }
        console.log(`      Exit code: ${exitCode} (clean exit)`);
        console.log();

        // Success
        console.log("=".repeat(60));
        console.log("SUCCESS: Electron app launches correctly!");
        console.log("=".repeat(60));
        console.log();
        console.log("The packaged Electron app:");
        console.log("  - Starts successfully without network access");
        console.log("  - Loads local bundled resources");
        console.log("  - IPC communication works");
        console.log("  - Exits cleanly");
        console.log();

    } catch (error) {
        console.error();
        console.error("=".repeat(60));
        console.error("FAILURE: Launch test failed");
        console.error("=".repeat(60));
        console.error();

        if (error instanceof Error) {
            console.error("Error:", error.message);

            if (error.message.includes("not found")) {
                console.error();
                console.error("Troubleshooting:");
                console.error("  - Run 'npm run build:app' first to build the app");
                console.error("  - Check the release/ directory for built output");
            }
        } else {
            console.error("Error:", error);
        }

        process.exit(1);
    }
}

main();
