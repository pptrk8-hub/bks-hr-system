import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // ขยายเพดานการแจ้งเตือนเป็น 1000kb (1MB) เพื่อปิดแถบสีเหลือง
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // เทคนิคหั่นไฟล์ใหญ่ๆ ออกเป็นชิ้นย่อย (Code Splitting) ให้โหลดไวขึ้น
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
})