export const contactCases = [
  {
    id: 'TC-CNT-001',
    module: 'M6',
    title: 'POST /api/contact sends email notification and acknowledgment',
    technique: 'EP',
    layer: 'api',
    priority: 'P1',
    req: 'FR-CNT-1',
    pre: 'Resend mock initialized',
    input: {
      method: 'POST',
      url: '/api/contact',
      body: {
        name: 'John Inquirer',
        email: 'john@example.com',
        subject: 'General Question',
        message: 'Could you provide more information on buyer protection?'
      }
    },
    expected: { status: 200, rule: 'Contact inquiry processed, Resend batch send invoked with 2 emails' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-CNT-002',
    module: 'M6',
    title: 'POST /api/contact missing name rejected with 400',
    technique: 'EP',
    layer: 'api',
    priority: 'P2',
    req: 'FR-CNT-1',
    pre: 'None',
    input: {
      method: 'POST',
      url: '/api/contact',
      body: { email: 'john@example.com', subject: 'Question', message: 'Hello' }
    },
    expected: { status: 400, rule: 'All fields are required' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-CNT-003',
    module: 'M6',
    title: 'POST /api/contact missing email rejected with 400',
    technique: 'EP',
    layer: 'api',
    priority: 'P2',
    req: 'FR-CNT-1',
    pre: 'None',
    input: {
      method: 'POST',
      url: '/api/contact',
      body: { name: 'John', subject: 'Question', message: 'Hello' }
    },
    expected: { status: 400, rule: 'All fields are required' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-CNT-004',
    module: 'M6',
    title: 'POST /api/contact missing subject rejected with 400',
    technique: 'EP',
    layer: 'api',
    priority: 'P2',
    req: 'FR-CNT-1',
    pre: 'None',
    input: {
      method: 'POST',
      url: '/api/contact',
      body: { name: 'John', email: 'john@example.com', message: 'Hello' }
    },
    expected: { status: 400, rule: 'All fields are required' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-CNT-005',
    module: 'M6',
    title: 'POST /api/contact missing message rejected with 400',
    technique: 'EP',
    layer: 'api',
    priority: 'P2',
    req: 'FR-CNT-1',
    pre: 'None',
    input: {
      method: 'POST',
      url: '/api/contact',
      body: { name: 'John', email: 'john@example.com', subject: 'Question' }
    },
    expected: { status: 400, rule: 'All fields are required' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-CNT-006',
    module: 'M6',
    title: 'POST /api/contact invalid email format rejected with 400',
    technique: 'EP',
    layer: 'api',
    priority: 'P2',
    req: 'FR-CNT-1',
    pre: 'None',
    input: {
      method: 'POST',
      url: '/api/contact',
      body: { name: 'John', email: 'invalid-email', subject: 'Question', message: 'Hello' }
    },
    expected: { status: 400, rule: 'Invalid email address' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-CNT-007',
    module: 'M6',
    title: 'POST /api/contact HTML payload in message is sanitized in email template',
    technique: 'Security',
    layer: 'api',
    priority: 'P1',
    req: 'FR-SEC-10',
    pre: 'Resend mock records sent HTML',
    input: {
      method: 'POST',
      url: '/api/contact',
      body: {
        name: 'Inquirer',
        email: 'inq@example.com',
        subject: 'Inquiry',
        message: '<script>alert("xss")</script>'
      }
    },
    expected: { status: 200, rule: 'HTML tags escaped (&lt;script&gt;) in rendered email body' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-CNT-008',
    module: 'M6',
    title: 'POST /api/contact has no rate limiting allowing contact form spam',
    technique: 'Security',
    layer: 'api',
    priority: 'P2',
    req: 'FR-SEC-11',
    pre: '20 rapid inquiries sent consecutively',
    input: { rapidRequestsCount: 20 },
    expected: { status: 429, rule: 'Too Many Requests rate limit should throttle abusive submissions' },
    ui: false,
    defect: 'D-08'
  }
];
