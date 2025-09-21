import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "../../react/react_module/dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "./src/main.jsx"
      },
    },
  },
  plugins: [react()],
})
