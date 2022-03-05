import { afterAll, beforeAll, test, expect } from "vitest";
import { ChildProcess, spawn } from "child_process";
import fetch from "node-fetch";
import path from "path";
import kill from "kill-port";

let rakkas: ChildProcess;

beforeAll(async () => {
	rakkas = spawn("npm", ["run", "dev"], {
		stdio: "inherit",
		cwd: path.resolve(__dirname, ".."),
	});

	// Wait until port responds
	await new Promise<void>((resolve) => {
		const interval = setInterval(() => {
			fetch("http://localhost:3000")
				.then((r) => {
					clearInterval(interval);
					resolve();
				})
				.catch(() => {});
		}, 100);
	});
});

test("shows correct title", async () => {
	const response = await fetch("http://localhost:3000");
	const text = await response.text();
	expect(text).toContain("Rakkas Demo App");
});

test("resolves virtual entry", async () => {
	const response = await fetch(
		"http://localhost:3000/virtual:rakkasjs:start-client.js",
	);
	expect(response.status).toBe(200);
	const text = await response.text();
	expect(text).toContain("import");
});

afterAll(async () => {
	await kill(3000, "tcp");
});
