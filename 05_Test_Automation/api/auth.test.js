import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { setupMongo, teardownMongo, clearDatabase } from '../setup/mongo.js';
import { makeUser, makeUpload } from '../setup/factories.js';
import { app } from '../../.sut/server/app.js';
import User from '../../.sut/server/models/user.model.js';
import bcrypt from 'bcryptjs';

describe('M1 Authentication API (auth.controller)', () => {
  beforeAll(async () => {
    await setupMongo();
  });

  afterAll(async () => {
    await teardownMongo();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  it('TC-AUTH-001: Signup happy path with standard valid email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice Test', email: 'alice@example.com', password: 'Password123!' });

    expect(res.status).toBe(201);
    expect(res.headers['set-cookie']).toBeDefined();
    const cookie = res.headers['set-cookie'].find(c => c.includes('auth_token'));
    expect(cookie).toBeDefined();

    const dbUser = await User.findOne({ email: 'alice@example.com' });
    expect(dbUser).toBeDefined();
    expect(dbUser.role).toBe('user');
    expect(dbUser.password).not.toBe('Password123!');
    expect(await bcrypt.compare('Password123!', dbUser.password)).toBe(true);
  });

  it('TC-AUTH-002: Signup with sub-domain and tag in email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Bob Sub', email: 'bob+test@sub.example.co', password: 'Password123!' });

    expect(res.status).toBe(201);
  });

  it('TC-AUTH-003: Signup with distinct valid international domain', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Charlie Org', email: 'charlie@domain.org', password: 'Password123!' });

    expect(res.status).toBe(201);
  });

  it('TC-AUTH-004: Signup missing name field', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'noname@example.com', password: 'Password123!' });

    expect(res.status).toBe(400);
    const msg = res.body.error || res.body.message || '';
    expect(msg).toMatch(/all fields are required/i);
  });

  it('TC-AUTH-005: Signup missing email field', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'No Email', password: 'Password123!' });

    expect(res.status).toBe(400);
    const msg = res.body.error || res.body.message || '';
    expect(msg).toMatch(/all fields are required/i);
  });

  it('TC-AUTH-006: Signup missing password field', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'No Pass', email: 'nopass@example.com' });

    expect(res.status).toBe(400);
    const msg = res.body.error || res.body.message || '';
    expect(msg).toMatch(/all fields are required/i);
  });

  it('TC-AUTH-007: Signup with empty string fields', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: '', email: '', password: '' });

    expect(res.status).toBe(400);
    const msg = res.body.error || res.body.message || '';
    expect(msg).toMatch(/all fields are required/i);
  });

  it('TC-AUTH-008: Signup with whitespace-only name', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: '   ', email: 'spaces@example.com', password: 'Password123!' });

    expect([201, 400]).toContain(res.status);
  });

  it('TC-AUTH-009: Signup password length 7 characters (just below min 8)', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Short Pass', email: 'short7@example.com', password: 'Pass12!' });

    expect(res.status).toBe(400);
    const msg = res.body.error || res.body.message || '';
    expect(msg).toMatch(/at least 8 characters/i);
  });

  it('TC-AUTH-010: Signup password length 8 characters (exact boundary)', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Exact Pass', email: 'exact8@example.com', password: 'Pass123!' });

    expect(res.status).toBe(201);
  });

  it('TC-AUTH-011: Signup password length 9 characters (nominal low)', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Pass Nine', email: 'pass9@example.com', password: 'Pass1234!' });

    expect(res.status).toBe(201);
  });

  it('TC-AUTH-012: Signup password length 72 and 73 characters (bcrypt boundary)', async () => {
    const longPass = 'A'.repeat(72) + '!';
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Long Pass', email: 'long72@example.com', password: longPass });

    expect(res.status).toBe(201);
  });

  it('TC-AUTH-013: Signup duplicate email rejected', async () => {
    await makeUser({ email: 'alice@example.com' });
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice Clone', email: 'alice@example.com', password: 'Password123!' });

    expect(res.status).toBe(400);
    const msg = res.body.error || res.body.message || '';
    expect(msg).toMatch(/already exists/i);
  });

  it('TC-AUTH-014 [@defect:D-04]: Signup invalid email format rejected with 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Bad Email', email: 'alice_at_example_dot_com', password: 'Password123!' });

    // SUT defect: Mongoose ValidationError causes 500 Server error instead of 400
    expect(res.status).toBe(400);
  });

  it('TC-AUTH-015 [@defect:D-04b]: Signup case-insensitive duplicate email detection', async () => {
    await makeUser({ email: 'alice@example.com' });
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice Upper', email: 'ALICE@EXAMPLE.COM', password: 'Password123!' });

    // SUT defect: Emails are not normalized lowercase; allows duplicate registration with status 201
    expect(res.status).toBe(400);
  });

  it('TC-AUTH-016 [@defect:D-03]: Signup empty body or missing JSON content-type', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .set('Content-Type', 'text/plain')
      .send('');

    // SUT defect: Destructuring undefined req.body outside try produces 500 HTML stack trace
    expect(res.status).toBe(400);
  });

  it('TC-AUTH-017: Signup malformed JSON body handling', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .set('Content-Type', 'application/json')
      .send('{invalid-json');

    expect(res.status).toBe(400);
  });

  it('TC-AUTH-018: Signup mass assignment role admin ignored', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Attacker', email: 'attacker@example.com', password: 'Password123!', role: 'admin' });

    expect(res.status).toBe(201);
    const user = await User.findOne({ email: 'attacker@example.com' });
    expect(user.role).toBe('user');
  });

  it('TC-AUTH-019 [@defect:D-10]: Signup non-string password payload handled', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Type Confused', email: 'type@example.com', password: 12345678 });

    // SUT defect: password.length on number causes TypeError 500
    expect(res.status).toBe(400);
  });

  it('TC-AUTH-020: Login valid credentials', async () => {
    const { plainPassword } = await makeUser({ email: 'alice@example.com' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: plainPassword });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.body.message).toMatch(/login successful/i);
  });

  it('TC-AUTH-021: Login incorrect password', async () => {
    await makeUser({ email: 'alice@example.com' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'WrongPassword999!' });

    expect(res.status).toBe(401);
    const msg = res.body.error || res.body.message || '';
    expect(msg).toMatch(/invalid email or password/i);
  });

  it('TC-AUTH-022: Login non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: 'Password123!' });

    expect(res.status).toBe(401);
    const msg = res.body.error || res.body.message || '';
    expect(msg).toMatch(/invalid email or password/i);
  });

  it('TC-AUTH-023 [@defect:D-10]: Login NoSQL operator injection in email', async () => {
    const { plainPassword } = await makeUser({ email: 'known@example.com' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $ne: null }, password: plainPassword });

    // In SUT: { $ne: null } logs in as the first user in DB! Status is 200.
    // Expected secure behavior: 400 or 401.
    expect([400, 401]).toContain(res.status);
  });

  it('TC-AUTH-024: Logout clears auth_token cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    const cookie = res.headers['set-cookie']?.find(c => c.includes('auth_token'));
    expect(cookie).toMatch(/auth_token=;/);
  });

  it('TC-AUTH-025 [@defect:D-14]: Cookie maxAge vs JWT expiration consistency', async () => {
    const { plainPassword } = await makeUser({ email: 'cookie_test@example.com' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cookie_test@example.com', password: plainPassword });

    const cookieHeader = res.headers['set-cookie'].find(c => c.includes('auth_token'));
    // In SUT: cookie maxAge is hardcoded to 7d (Max-Age=604800), while JWT_EXPIRES_IN=1d (86400)
    expect(cookieHeader).toMatch(/Max-Age=86400/);
  });
});
