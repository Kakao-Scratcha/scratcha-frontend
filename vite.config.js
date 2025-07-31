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
  },
  assetsInclude: ['**/*.ttf'], // ttf 파일을 정적 자산으로 처리
})