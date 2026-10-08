import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

// A versão exibida na tela de login vem do package.json (campo "version")
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

export default defineConfig({
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Consultech - Gestão de Cozinhas',
        lang: 'pt-BR',
        short_name: 'Consultech',
        description: 'Aplicativo de Auditorias RTO',
        theme_color: '#660c39',
        background_color: '#660c39',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: []
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['renatoft89.ddns.net', '192.168.0.77', 'localhost']
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: ['renatoft89.ddns.net', '192.168.0.77', 'localhost']
  }
})
