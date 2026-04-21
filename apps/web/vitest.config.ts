import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineProject } from "vitest/config";

export default defineProject({
	plugins: [react()],
	test: {
		name: "web",
		environment: "jsdom",
		setupFiles: ["./src/__tests__/setup.ts"],
		include: ["src/__tests__/**/*.test.{ts,tsx}"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@workspace/ui": path.resolve(__dirname, "../../packages/ui/src"),
		},
	},
});
