import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    assetsInlineLimit: 0, // 폰트 파일을 인라인하지 않도록 설정
    rollupOptions: {
      output: {
        // 청크 파일명 설정
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  assetsInclude: ['**/*.ttf'], // ttf 파일을 정적 자산으로 처리
  server: {
    // 개발 서버에서 public 폴더의 파일들을 루트에서 제공
    fs: {
      allow: ['..']
    },
    // HMR 설정
    hmr: {
      overlay: false
    }
  },
})