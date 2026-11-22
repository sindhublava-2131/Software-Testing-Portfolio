export const userCases = [
  {
    id: 'TC-USR-001',
    module: 'M4',
    title: 'GET /api/user returns profile fields name, email, avatar, role',
    technique: 'EP',
    layer: 'api',
    priority: 'P1',
    req: 'FR-USR-1',
    pre: 'User logged in',
    input: { method: 'GET', url: '/api/user' },
    expected: { status: 200, rule: 'User profile returned, password hash excluded' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-USR-002',
    module: 'M4',
    title: 'GET /api/user rejects unauthenticated caller with 401',
    technique: 'Security',
    layer: 'api',
    priority: 'P1',
    req: 'FR-SEC-1',
    pre: 'No auth cookie',
    input: { method: 'GET', url: '/api/user' },
    expected: { status: 401, rule: 'Authentication required' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-USR-003',
    module: 'M4',
    title: 'PATCH /api/user/change-password successful with valid credentials',
    technique: 'EP',
    layer: 'api',
    priority: 'P1',
    req: 'FR-USR-2',
    pre: 'User current password is Password123!',
    input: {
      method: 'PATCH',
      url: '/api/user/change-password',
      body: {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmNewPassword: 'NewPassword123!'
      }
    },
    expected: { status: 200, rule: 'Password updated, bcrypt hash persisted' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-USR-004',
    module: 'M4',
    title: 'PATCH /api/user/change-password missing fields rejected with 400',
    technique: 'EP',
    layer: 'api',
    priority: 'P2',
    req: 'FR-USR-2',
    pre: 'User logged in',
    input: {
      method: 'PATCH',
      url: '/api/user/change-password',
      body: { currentPassword: 'Password123!' }
    },
    expected: { status: 400, rule: 'All fields are required' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-USR-005',
    module: 'M4',
    title: 'PATCH /api/user/change-password new password mismatch rejected with 400',
    technique: 'DT',
    layer: 'api',
    priority: 'P2',
    req: 'FR-USR-2',
    pre: 'User logged in',
    input: {
      method: 'PATCH',
      url: '/api/user/change-password',
      body: {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmNewPassword: 'DifferentPassword123!'
      }
    },
    expected: { status: 400, rule: 'New passwords do not match' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-USR-006',
    module: 'M4',
    title: 'PATCH /api/user/change-password same as current rejected with 400',
    technique: 'DT',
    layer: 'api',
    priority: 'P2',
    req: 'FR-USR-2',
    pre: 'User logged in with Password123!',
    input: {
      method: 'PATCH',
      url: '/api/user/change-password',
      body: {
        currentPassword: 'Password123!',
        newPassword: 'Password123!',
        confirmNewPassword: 'Password123!'
      }
    },
    expected: { status: 400, rule: 'New password must be different from current password' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-USR-007',
    module: 'M4',
    title: 'PATCH /api/user/change-password new password < 8 chars rejected with 400',
    technique: 'BVA',
    layer: 'api',
    priority: 'P2',
    req: 'FR-USR-2',
    pre: 'User logged in',
    input: {
      method: 'PATCH',
      url: '/api/user/change-password',
      body: {
        currentPassword: 'Password123!',
        newPassword: 'Pass12!',
        confirmNewPassword: 'Pass12!'
      }
    },
    expected: { status: 400, rule: 'Password must be at least 8 characters' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-USR-008',
    module: 'M4',
    title: 'PATCH /api/user/change-password incorrect current password rejected with 401',
    technique: 'DT',
    layer: 'api',
    priority: 'P1',
    req: 'FR-USR-2',
    pre: 'User real password is Password123!',
    input: {
      method: 'PATCH',
      url: '/api/user/change-password',
      body: {
        currentPassword: 'WrongCurrentPassword!',
        newPassword: 'NewPassword123!',
        confirmNewPassword: 'NewPassword123!'
      }
    },
    expected: { status: 401, rule: 'Current password is incorrect' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-USR-009',
    module: 'M4',
    title: 'Login after password change succeeds with new password and fails with old',
    technique: 'ST',
    layer: 'api',
    priority: 'P1',
    req: 'FR-USR-2',
    pre: 'Password successfully changed',
    input: { testOldAndNew: true },
    expected: { status: 200, rule: 'Old password returns 401, new password returns 200' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-USR-010',
    module: 'M4',
    title: 'Old JWT remains valid after password change demonstrating stateless session defect',
    technique: 'Security',
    layer: 'api',
    priority: 'P1',
    req: 'FR-SEC-5',
    pre: 'User changes password, holds prior issued JWT token',
    input: { reuseOldToken: true },
    expected: { status: 401, rule: 'Tokens should be invalidated on credential change' },
    ui: false,
    defect: 'D-11'
  },
  {
    id: 'TC-USR-011',
    module: 'M4',
    title: 'GET /api/user/history returns up to 10 newest-first login records',
    technique: 'EP',
    layer: 'api',
    priority: 'P2',
    req: 'FR-USR-3',
    pre: 'User has multiple login events recorded',
    input: { method: 'GET', url: '/api/user/history' },
    expected: { status: 200, rule: 'Returns max 10 records sorted by loginAt descending' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-USR-012',
    module: 'M4',
    title: 'Login history trusts X-Forwarded-For header unconditionally leading to IP spoofing',
    technique: 'Security',
    layer: 'api',
    priority: 'P2',
    req: 'FR-SEC-6',
    pre: 'User logs in with X-Forwarded-For: 203.0.113.195',
    input: { headers: { 'x-forwarded-for': '203.0.113.195' } },
    expected: { status: 200, rule: 'Client IP recorded should be validated against trusted proxies' },
    ui: false,
    defect: 'D-15'
  },
  {
    id: 'TC-USR-013',
    module: 'M4',
    title: 'Device classifier correctly classifies iPhone, Android, Tablet, Desktop',
    technique: 'EP',
    layer: 'unit',
    priority: 'P3',
    req: 'FR-USR-4',
    pre: 'User agents matrix',
    input: { userAgents: ['iPhone', 'iPad', 'Android Mobile', 'Windows Desktop'] },
    expected: { status: 200, rule: 'Device type mapped to Mobile, Tablet, Desktop' },
    ui: false,
    defect: null
  },
  {
    id: 'TC-USR-014',
    module: 'M4',
    title: 'PATCH /api/user with role admin in body is rejected / ignored',
    technique: 'Security',
    layer: 'api',
    priority: 'P1',
    req: 'FR-SEC-7',
    pre: 'Standard user profile',
    input: { method: 'PATCH', url: '/api/user', body: { role: 'admin' } },
    expected: { status: 200, rule: 'User role remains user (mass assignment prevented)' },
    ui: false,
    defect: null
  }
];
