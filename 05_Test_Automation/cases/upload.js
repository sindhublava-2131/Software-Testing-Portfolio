export const uploadCases = [
  {
    id: 'TC-UPL-001',
    module: 'M6',
    title: 'GET /api/upload/signature requires authentication',
    technique: 'Security',
    layer: 'api',
    priority: 'P1',
    req: 'FR-UPL-1',
    pre: 'No auth cookie',
    input: { method: 'GET', url: '/api/upload/signature' },
    expected: { status: 401, rule: 'Authentication required' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-UPL-002',
    module: 'M6',
    title: 'GET /api/upload/signature returns valid signed Cloudinary parameters',
    technique: 'EP',
    layer: 'api',
    priority: 'P1',
    req: 'FR-UPL-2',
    pre: 'User logged in',
    input: { method: 'GET', url: '/api/upload/signature' },
    expected: {
      status: 200,
      rule: 'Returns timestamp, folder, signature, apiKey, cloudName, formId'
    },
    ui: false,
    defect: null
  },
  {
    id: 'TC-UPL-003',
    module: 'M6',
    title: 'Signature is valid SHA1 hash matching Cloudinary specification',
    technique: 'EP',
    layer: 'unit',
    priority: 'P1',
    req: 'FR-UPL-2',
    pre: 'Payload parameters from signature endpoint',
    input: { action: 'verify_signature_hash' },
    expected: { status: 200, rule: 'SHA1 matches expected hash of folder & timestamp' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-UPL-004',
    module: 'M6',
    title: 'GET /api/upload/signature creates unique formId and pending Upload row',
    technique: 'EP',
    layer: 'api',
    priority: 'P1',
    req: 'FR-UPL-3',
    pre: 'User logged in',
    input: { method: 'GET', url: '/api/upload/signature' },
    expected: { status: 200, rule: 'Upload row created with status pending and formId' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-UPL-005',
    module: 'M6',
    title: 'Upload signature endpoint never leaks CLOUDINARY_API_SECRET',
    technique: 'Security',
    layer: 'api',
    priority: 'P1',
    req: 'FR-SEC-9',
    pre: 'Signature response received',
    input: { inspectResponse: 'secrets' },
    expected: { status: 200, rule: 'apiKey is returned; apiSecret must never be present' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-UPL-006',
    module: 'M6',
    title: 'Upload cleanup job purges pending uploads > 10 minutes and keeps active ones',
    technique: 'Unit',
    layer: 'unit',
    priority: 'P2',
    req: 'FR-UPL-4',
    pre: 'Pending uploads older than 10m, newer than 10m, and used status seeded',
    input: { action: 'trigger_cleanup_unused_uploads' },
    expected: { status: 200, rule: 'Old pending deleted from DB, used and fresh kept' },
    ui: false,
    defect: null
  }
];
