import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.svg'],
      manifest: {
        name: 'Word Wonderland - 单词乐园',
        short_name: '单词乐园',
        description: '一个现代化的英语单词学习应用，随时随地学习英语',
        theme_color: '#8b5cf6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/logo.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/logo.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/logo.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // 运行时缓存策略
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1天
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // 排除 favicon 和 logo，其他图片使用缓存优先策略
            urlPattern: ({ url }) => {
              const pathname = url.pathname;
              // 排除 favicon.svg 和 logo.svg
              if (pathname.includes('favicon.svg') || pathname.includes('logo.svg')) {
                return false;
              }
              return /\.(?:png|jpg|jpeg|svg|gif|webp)$/.test(pathname);
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
              }
            }
          },
          {
            // favicon 和 logo 使用网络优先策略
            urlPattern: ({ url }) => {
              const pathname = url.pathname;
              return pathname.includes('favicon.svg') || pathname.includes('logo.svg');
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'logo-cache',
              networkTimeoutSeconds: 3
            }
          }
        ]
      },
      devOptions: {
        enabled: true // 开发环境也启用 PWA
      }
    })
  ],
  server: {
    host: '0.0.0.0', // 允许内网访问
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
});

