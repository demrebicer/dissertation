import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { coverageConfigDefaults } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.hdr"],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      exclude: ['src/main.jsx', ...coverageConfigDefaults.exclude],
    }
  },
});
