import path from 'node:path'
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_* vars to the client, so PORT is read explicitly here.
  const port = Number(loadEnv(mode, process.cwd(), '').PORT) || 3630

  return {
    plugins: [
      tailwindcss(),
      { enforce: 'pre', ...mdx({ jsxImportSource: 'react' }) },
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: { port },
    preview: { port },
  }
})
