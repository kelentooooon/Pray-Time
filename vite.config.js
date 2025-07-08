import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import withMT from "@material-tailwind/react/utils/withMT"

export default defineConfig(
  withMT({
    plugins: [
      react(),
      tailwindcss(),
    ],
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
    theme: {
      extend: {},
    },
  })
)