import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.{js,jsx}"],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/**",
        "src/hooks/usePets.js",
        "src/components/ConfirmModal.jsx",
      ],
    },
  },
});
