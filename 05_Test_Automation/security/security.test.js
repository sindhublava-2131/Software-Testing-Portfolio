import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { setupMongo, teardownMongo, clearDatabase } from '../setup/mongo.js';
import { makeUser, makeAuction, loginAs } from '../setup/factories.js';
import { app } from '../../.sut/server/app.js';
import Product from '../../.sut/server/models/product.model.js';
import User from '../../.sut/server/models/user.model.js';

describe('L4 Security & Penetration Testing Suite', () => {
  let user;
  let admin;

  beforeAll(async () => {
    await setupMongo();
  });

  afterAll(async () => {
    await teardownMongo();
  });

  beforeEach(async () => {
    await clearDatabase();
    user = (await makeUser({ name: 'Sec User', email: 'sec@example.com' })).user;
    admin = (await makeUser({ name: 'Sec Admin', email: 'secadmin@example.com', role: 'admin' })).user;
  });

  it('TC-SEC-001: JWT tampering (role: admin with original user signature) rejected with 401', async () => {
    const validToken = jwt.sign(
      { id: user._id.toString(), role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const [header, payload, sig] = validToken.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ id: user._id.toString(), role: 'admin' })
    ).toString('base64url');

    const tamperedToken = `${header}.${tamperedPayload}.${sig}`;

    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', `auth_token=${tamperedToken}`);

    expect(res.status).toBe(401);
  });

  it('TC-SEC-002: Unsigned JWT with alg: none rejected with 401', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ id: user._id.toString(), role: 'admin' })).toString('base64url');
    const algNoneToken = `${header}.${payload}.`;

    const res = await request(app)
      .get('/api/user')
      .set('Cookie', `auth_token=${algNoneToken}`);

    expect(res.status).toBe(401);
  });

  it('TC-SEC-003: JWT signed with untrusted secret rejected with 401', async () => {
    const forgedToken = jwt.sign(
      { id: user._id.toString(), role: 'admin' },
      'attacker-forged-secret-key-123',
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', `auth_token=${forgedToken}`);

    expect(res.status).toBe(401);
  });

  it('TC-SEC-004: auth_token cookie flags verification', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sec@example.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    const cookie = res.headers['set-cookie'].find(c => c.includes('auth_token'));
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Path=\//i);
  });

  it('TC-SEC-005 [@defect:D-10]: NoSQL operator injection in login email handled safely', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $gt: '' }, password: 'Password123!' });

    // Expect 400 or 401, not 500
    expect([400, 401]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  it('TC-SEC-006: Query parameter NoSQL injection /api/admin/users?search[$ne]=test handled safely', async () => {
    const adminLogin = await loginAs(admin, app);
    const res = await adminLogin.agent.get('/api/admin/users?search[$ne]=test');
    expect([200, 400]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  it('TC-SEC-007: Stored XSS payload stored raw without script execution', async () => {
    const sellerLogin = await loginAs(user, app);
    const auc = await makeAuction(user, {
      itemName: '<img src=x onerror=alert(1)>'
    });

    const res = await sellerLogin.agent.get(`/api/auction/${auc._id}`);
    expect(res.status).toBe(200);
    const item = res.body.auction || res.body;
    expect(item.itemName).toBe('<img src=x onerror=alert(1)>');
  });

  it('TC-SEC-008: CORS enforcement: untrusted origin receives no Access-Control-Allow-Origin', async () => {
    const res = await request(app)
      .get('/api/auction')
      .set('Origin', 'http://malicious-website.com');

    expect(res.headers['access-control-allow-origin']).not.toBe('http://malicious-website.com');
  });

  it('TC-SEC-009 [@defect:D-08b]: Missing security headers (helmet absent, X-Powered-By leaked)', async () => {
    const res = await request(app).get('/api/auction');

    // In SUT: express default leaks X-Powered-By: Express and omits CSP, X-Frame-Options
    // We assert secure posture:
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  it('TC-SEC-011 [@defect:D-08]: Brute-force login attempts are not throttled', async () => {
    const attempts = Array.from({ length: 25 }).map(() =>
      request(app)
        .post('/api/auth/login')
        .send({ email: 'sec@example.com', password: 'WrongPassword999!' })
    );

    const results = await Promise.all(attempts);
    // In SUT: no rate limiter exists, all 25 return 401
    // A secure system throttles with 429
    const has429 = results.some(r => r.status === 429);
    expect(has429).toBe(true);
  });

  it('TC-SEC-012 [@defect:D-11]: Stateless JWT remains valid after user logout', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sec@example.com', password: 'Password123!' });

    const cookieHeader = loginRes.headers['set-cookie'].find(c => c.includes('auth_token'));
    const token = cookieHeader.match(/auth_token=([^;]+)/)[1];

    // User logs out
    await request(app).post('/api/auth/logout');

    // Attempting to access protected resource with prior token
    const protectedRes = await request(app)
      .get('/api/user')
      .set('Cookie', `auth_token=${token}`);

    // If D-11 is present: returns 200 (defect confirmed). Expected secure: 401.
    expect(protectedRes.status).toBe(401);
  });

  it('TC-SEC-013: IDOR verification: non-participant forbidden from accessing ended auction details', async () => {
    const otherUser = (await makeUser({ name: 'Other', email: 'other@example.com' })).user;
    const otherLogin = await loginAs(otherUser, app);

    const endedAuction = await makeAuction(user, {
      itemName: 'Secret Ended Item',
      itemStartDate: new Date(Date.now() - 10000),
      itemEndDate: new Date(Date.now() - 1000),
      bids: [{ bidder: admin._id, bidderName: 'Admin', bidAmount: 110, bidTime: new Date() }]
    });

    const res = await otherLogin.agent.get(`/api/auction/${endedAuction._id}`);
    expect(res.status).toBe(403);
  });

  it('TC-SEC-014: Mass assignment prevention: PATCH /api/user ignores role admin', async () => {
    const userLogin = await loginAs(user, app);
    const res = await userLogin.agent.patch('/api/user').send({ role: 'admin' });
    expect([200, 400]).toContain(res.status);

    const checkUser = await User.findById(user._id);
    expect(checkUser.role).toBe('user');
  });
});
