import { vi } from 'vitest'

// Mock Supabase before any tests run
vi.mock('../app/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null }))
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test.com/image.png' } }))
      }))
    }
  }
}))
