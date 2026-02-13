import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Use the user-provided key as a fallback if VITE_GEMINI_API_KEY is not set in the environment
  const apiKey = env.VITE_GEMINI_API_KEY || "AIzaSyA-Tr8qsgqTspBOqqafVd24bz5HiTiKKfQ";

  return {
    plugins: [react()],
    define: {
      // Define process.env.API_KEY globally for the client build
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
  };
});