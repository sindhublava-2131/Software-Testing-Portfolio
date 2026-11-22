import { vi } from 'vitest';

// Mock node-cron to avoid keeping event loop open or running midnight cleanup unexpectedly
vi.mock('node-cron', () => {
  return {
    default: {
      schedule: vi.fn(() => ({ stop: vi.fn(), start: vi.fn() }))
    },
    schedule: vi.fn(() => ({ stop: vi.fn(), start: vi.fn() }))
  };
});

// Mock axios to prevent real external geo queries to ip-api.com
vi.mock('axios', () => {
  return {
    default: {
      get: vi.fn(async (url) => {
        if (typeof url === 'string' && url.includes('ip-api.com')) {
          return {
            data: {
              status: 'success',
              country: 'IN',
              regionName: 'KA',
              city: 'Bengaluru',
              isp: 'TestISP'
            }
          };
        }
        return { data: {} };
      }),
      post: vi.fn(async () => ({ data: {} })),
      put: vi.fn(async () => ({ data: {} })),
      delete: vi.fn(async () => ({ data: {} }))
    }
  };
});

// Mock resend
vi.mock('resend', () => {
  return {
    Resend: class {
      constructor() {
        this.batch = {
          send: vi.fn(async (emails) => ({ data: [{ id: 'mock_resend_id' }] }))
        };
        this.emails = {
          send: vi.fn(async () => ({ data: { id: 'mock_single_email_id' } }))
        };
      }
    }
  };
});
