export const auctionCases = [
  {
    id: 'TC-AUC-001',
    module: 'M2',
    title: 'Valid auction creation with active pending upload formId',
    technique: 'EP',
    layer: 'api',
    priority: 'P1',
    req: 'FR-AUC-1',
    pre: 'User logged in, Upload record exists with status pending',
    input: {
      method: 'POST',
      url: '/api/auction',
      body: {
        itemName: 'Vintage Camera',
        itemDescription: 'Classic 1970 35mm film camera in mint condition',
        itemCategory: 'Electronics',
        startingPrice: 150,
        itemStartDate: new Date(Date.now() - 1000).toISOString(),
        itemEndDate: new Date(Date.now() + 86400000).toISOString(),
        formId: 'TEST_FORM_ID_001',
        public_id: 'auction_system/camera',
        secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
      }
    },
    expected: { status: 201, rule: 'Auction created, currentPrice equals startingPrice, seller set to req.user.id, upload status used' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-AUC-002',
    module: 'M2',
    title: 'Auction creation fails when unauthenticated',
    technique: 'Security',
    layer: 'api',
    priority: 'P1',
    req: 'FR-AUC-1',
    pre: 'No auth cookie',
    input: { method: 'POST', url: '/api/auction', body: { itemName: 'Item' } },
    expected: { status: 401, rule: 'Authentication required' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-AUC-003',
    module: 'M2',
    title: 'Auction creation fails with unknown formId',
    technique: 'EP',
    layer: 'api',
    priority: 'P2',
    req: 'FR-AUC-1',
    pre: 'formId does not exist in Upload collection',
    input: {
      method: 'POST',
      url: '/api/auction',
      body: {
        itemName: 'Item',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 100,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: 'NON_EXISTENT_FORM_ID',
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      }
    },
    expected: { status: 400, rule: 'Invalid upload session' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-AUC-004',
    module: 'M2',
    title: 'Auction creation missing public_id or secure_url',
    technique: 'EP',
    layer: 'api',
    priority: 'P2',
    req: 'FR-AUC-1',
    pre: 'Valid formId present',
    input: {
      method: 'POST',
      url: '/api/auction',
      body: {
        itemName: 'Item',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 100,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: 'TEST_FORM_ID_002'
      }
    },
    expected: { status: 400, rule: 'Image upload required' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-AUC-005',
    module: 'M2',
    title: 'Auction creation end date prior to start date',
    technique: 'BVA',
    layer: 'api',
    priority: 'P1',
    req: 'FR-AUC-2',
    pre: 'Valid formId',
    input: {
      method: 'POST',
      url: '/api/auction',
      body: {
        itemName: 'Item',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 100,
        itemStartDate: new Date(Date.now() + 50000).toISOString(),
        itemEndDate: new Date(Date.now() + 10000).toISOString(),
        formId: 'TEST_FORM_ID_003',
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      }
    },
    expected: { status: 400, rule: 'End date must be after start date' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-AUC-006',
    module: 'M2',
    title: 'Auction creation end date equals start date (0 ms difference)',
    technique: 'BVA',
    layer: 'api',
    priority: 'P2',
    req: 'FR-AUC-2',
    pre: 'Valid formId',
    input: {
      method: 'POST',
      url: '/api/auction',
      body: {
        itemName: 'Item',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 100,
        itemStartDate: '2026-12-01T10:00:00.000Z',
        itemEndDate: '2026-12-01T10:00:00.000Z',
        formId: 'TEST_FORM_ID_004',
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      }
    },
    expected: { status: 400, rule: 'End date must be strictly after start date' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-AUC-007',
    module: 'M2',
    title: 'Auction creation replay with already consumed used formId',
    technique: 'Security',
    layer: 'api',
    priority: 'P2',
    req: 'FR-AUC-1',
    pre: 'Upload record already has status used',
    input: {
      method: 'POST',
      url: '/api/auction',
      body: {
        itemName: 'Replay Item',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 100,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: 'USED_FORM_ID',
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      }
    },
    expected: { status: 400, rule: 'formId cannot be reused once used' },
    ui: false,
    defect: 'D-05b'
  },
  {
    id: 'TC-AUC-008',
    module: 'M2',
    title: 'Auction creation starting price 0 (BVA zero boundary)',
    technique: 'BVA',
    layer: 'api',
    priority: 'P2',
    req: 'FR-AUC-3',
    pre: 'Valid formId',
    input: {
      method: 'POST',
      url: '/api/auction',
      body: {
        itemName: 'Zero Price',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 0,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: 'TEST_FORM_ID_005',
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      }
    },
    expected: { status: 400, rule: 'Starting price must be at least 1 (min 1)' },
    ui: false,
    defect: 'D-05'
  },
  {
    id: 'TC-AUC-009',
    module: 'M2',
    title: 'Auction creation starting price negative -1',
    technique: 'BVA',
    layer: 'api',
    priority: 'P2',
    req: 'FR-AUC-3',
    pre: 'Valid formId',
    input: {
      method: 'POST',
      url: '/api/auction',
      body: {
        itemName: 'Negative Price',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: -1,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: 'TEST_FORM_ID_006',
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      }
    },
    expected: { status: 400, rule: 'Starting price must be positive integer' },
    ui: false,
    defect: 'D-05'
  },
  {
    id: 'TC-AUC-010',
    module: 'M2',
    title: 'Auction creation starting price 1 (exact minimum boundary)',
    technique: 'BVA',
    layer: 'api',
    priority: 'P1',
    req: 'FR-AUC-3',
    pre: 'Valid formId',
    input: {
      method: 'POST',
      url: '/api/auction',
      body: {
        itemName: 'Min Price Item',
        itemDescription: 'Desc',
        itemCategory: 'Books',
        startingPrice: 1,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: 'TEST_FORM_ID_007',
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      }
    },
    expected: { status: 201, rule: 'Auction created with starting price 1' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-AUC-011',
    module: 'M2',
    title: 'Auction creation missing required itemName',
    technique: 'EP',
    layer: 'api',
    priority: 'P2',
    req: 'FR-AUC-4',
    pre: 'Valid formId',
    input: {
      method: 'POST',
      url: '/api/auction',
      body: {
        itemDescription: 'Desc',
        itemCategory: 'Books',
        startingPrice: 10,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: 'TEST_FORM_ID_008',
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      }
    },
    expected: { status: 400, rule: 'Validation error: itemName required' },
    ui: false,
    defect: 'D-05'
  },
  {
    id: 'TC-AUC-012',
    module: 'M2',
    title: 'Auction creation missing required itemCategory',
    technique: 'EP',
    layer: 'api',
    priority: 'P2',
    req: 'FR-AUC-4',
    pre: 'Valid formId',
    input: {
      method: 'POST',
      url: '/api/auction',
      body: {
        itemName: 'Name',
        itemDescription: 'Desc',
        startingPrice: 10,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: 'TEST_FORM_ID_009',
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      }
    },
    expected: { status: 400, rule: 'Validation error: itemCategory required' },
    ui: false,
    defect: 'D-05'
  },
  {
    id: 'TC-AUC-013',
    module: 'M2',
    title: 'Auction creation missing required itemDescription',
    technique: 'EP',
    layer: 'api',
    priority: 'P2',
    req: 'FR-AUC-4',
    pre: 'Valid formId',
    input: {
      method: 'POST',
      url: '/api/auction',
      body: {
        itemName: 'Name',
        itemCategory: 'Art',
        startingPrice: 10,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: 'TEST_FORM_ID_010',
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      }
    },
    expected: { status: 400, rule: 'Validation error: itemDescription required' },
    ui: false,
    defect: 'D-05'
  },
  {
    id: 'TC-AUC-014',
    module: 'M2',
    title: 'Auction creation missing itemEndDate produces 400 not 500',
    technique: 'ErrorGuessing',
    layer: 'api',
    priority: 'P2',
    req: 'FR-AUC-2',
    pre: 'Valid formId',
    input: {
      method: 'POST',
      url: '/api/auction',
      body: {
        itemName: 'Missing End Date',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 10,
        itemStartDate: new Date().toISOString(),
        formId: 'TEST_FORM_ID_011',
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      }
    },
    expected: { status: 400, rule: 'Handled as 400 Bad Request, no internal 500 leak' },
    ui: false,
    defect: 'D-05'
  },
  {
    id: 'TC-AUC-015',
    module: 'M2',
    title: 'Auction creation response omits seller password hash',
    technique: 'Security',
    layer: 'api',
    priority: 'P1',
    req: 'FR-SEC-3',
    pre: 'Valid auction created',
    input: { inspectResponse: 'seller_object' },
    expected: { status: 201, rule: 'Seller password hash must never be included in response' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-AUC-016',
    module: 'M2',
    title: 'Auction creation with past start date allowed for immediate activation',
    technique: 'EP',
    layer: 'api',
    priority: 'P3',
    req: 'FR-AUC-2',
    pre: 'Valid formId',
    input: {
      method: 'POST',
      url: '/api/auction',
      body: {
        itemName: 'Immediate Auction',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 50,
        itemStartDate: new Date(Date.now() - 3600000).toISOString(),
        itemEndDate: new Date(Date.now() + 3600000).toISOString(),
        formId: 'TEST_FORM_ID_012',
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      }
    },
    expected: { status: 201, rule: 'Auction created and is immediately live' },
    ui: false,
    defect: null
  }
];
