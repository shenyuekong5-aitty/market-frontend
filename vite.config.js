import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    hmr: {
      host: '127.0.0.1'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:8088',
        changeOrigin: true
      },
      '/products': {
        target: 'http://localhost:8088',
        changeOrigin: true
      },
      '/images': {
        target: 'http://localhost:8088',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:8088',
        ws: true,
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src')
    }
  },
  build: {
    // 收入图表仅在统计页按路由加载；543 KB 的独立 ECharts 块不影响首屏。
    chunkSizeWarningLimit: 600
  }
})
