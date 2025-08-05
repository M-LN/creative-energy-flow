// Test setup file for Vitest
import { vi } from 'vitest'

// Mock browser APIs
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
  timeOrigin: Date.now(),
}

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    onLine: true,
  },
  writable: true,
})

// Mock window event listeners
global.addEventListener = vi.fn()
global.removeEventListener = vi.fn()

// Mock CSS
vi.mock('*.css', () => ({}))