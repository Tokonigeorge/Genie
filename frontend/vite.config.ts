import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "fbf10517-2b06-4550-b0c4-1cfbcca74d44-00-13uub9am02al2.riker.replit.dev",
    ],
  },
});
