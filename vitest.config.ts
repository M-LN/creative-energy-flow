import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
  resolve: {
    alias: {
      '@': '/src',
      '@/core': '/src/core',
      '@/features': '/src/features',
      '@/shared': '/src/shared',
      '@/tests': '/src/tests'
    }
  }
})