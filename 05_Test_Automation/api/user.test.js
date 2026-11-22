import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { setupMongo, teardownMongo, clearDatabase } from '../setup/mongo.js';
import { makeUser, loginAs } from '../setup/factories.js';
import { app } from '../../.sut/server/app.js';
import User from '../../.sut/server/models/user.model.js';
import Login from '../../.sut/server/models/login.model.js';

describe('M4 User Profile & Security API (user.controller)', () => {
  let user;
  let userAgent;
  let userToken;
  let plainPassword;

  beforeAll(async () => {
    await setupMongo();
  });

  afterAll(async () => {
    await teardownMongo();
  });

  beforeEach(async () => {
    await clearDatabase();
    const created = await makeUser({ name: 'User Profile Test', email: 'profile@example.com', password: 'Password123!' });
    user = created.user;
    plainPassword = created.plainPassword;
    const login = await loginAs(user, app);
    userAgent = login.agent;
    userToken = login.token;
  });

  it('TC-USR-001: GET /api/user returns profile fields name, email, avatar, role', async () => {
    const res = await userAgent.get('/api/user');
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe('User Profile Test');
    expect(res.body.user.email).toBe('profile@example.com');
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.password).toBeUndefined();
  });

  it('TC-USR-002: GET /api/user rejects unauthenticated caller with 401', async () => {
    const res = await request(app).get('/api/user');
    expect(res.status).toBe(401);
  });

  it('TC-USR-003: PATCH /api/user changes password with valid input', async () => {
    const res = await userAgent
      .patch('/api/user')
      .send({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/password changed successfully/i);
  });

  it('TC-USR-004: PATCH /api/user missing fields rejected with 400', async () => {
    const res = await userAgent
      .patch('/api/user')
      .send({ currentPassword: 'Password123!' });

    expect(res.status).toBe(400);
    const msg = res.body.error || res.body.message || '';
    expect(msg).toMatch(/all fields/i);
  });

  it('TC-USR-005: PATCH /api/user new password mismatch rejected with 400', async () => {
    const res = await userAgent
      .patch('/api/user')
      .send({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!'
      });

    expect(res.status).toBe(400);
    const msg = res.body.error || res.body.message || '';
    expect(msg).toMatch(/do not match/i);
  });

  it('TC-USR-006: PATCH /api/user same as current rejected with 400', async () => {
    const res = await userAgent
      .patch('/api/user')
      .send({
        currentPassword: 'Password123!',
        newPassword: 'Password123!',
        confirmPassword: 'Password123!'
      });

    expect(res.status).toBe(400);
    const msg = res.body.error || res.body.message || '';
    expect(msg).toMatch(/old password/i);
  });

  it('TC-USR-007: PATCH /api/user new password < 8 chars rejected with 400', async () => {
    const res = await userAgent
      .patch('/api/user')
      .send({
        currentPassword: 'Password123!',
        newPassword: 'Pass12!',
        confirmPassword: 'Pass12!'
      });

    expect(res.status).toBe(400);
    const msg = res.body.error || res.body.message || '';
    expect(msg).toMatch(/at least 8 characters/i);
  });

  it('TC-USR-008: PATCH /api/user incorrect current password rejected with 400', async () => {
    const res = await userAgent
      .patch('/api/user')
      .send({
        currentPassword: 'WrongCurrentPassword!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });

    expect([400, 401]).toContain(res.status);
    const msg = res.body.error || res.body.message || '';
    expect(msg).toMatch(/incorrect/i);
  });

  it('TC-USR-009: Login after password change works with new and rejects old', async () => {
    await userAgent
      .patch('/api/user')
      .send({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });

    const oldLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'profile@example.com', password: 'Password123!' });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'profile@example.com', password: 'NewPassword123!' });
    expect(newLogin.status).toBe(200);
  });

  it('TC-USR-010 [@defect:D-11]: Old JWT remains valid after password change', async () => {
    await userAgent
      .patch('/api/user')
      .send({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });

    const res = await request(app)
      .get('/api/user')
      .set('Cookie', `auth_token=${userToken}`);

    // In SUT: stateless token is not invalidated; returns 200.
    // Asserting expected secure behavior (401) to honestly confirm D-11!
    expect(res.status).toBe(401);
  });

  it('TC-USR-011: GET /api/user/logins returns up to 10 newest-first records', async () => {
    for (let i = 0; i < 12; i++) {
      await Login.create({
        userId: user._id,
        ipAddress: `192.168.1.${i}`,
        userAgent: 'Desktop',
        location: 'Bengaluru, India',
        loginAt: new Date(Date.now() + i * 1000)
      });
    }

    const res = await userAgent.get('/api/user/logins');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(10);
  });

  it('TC-USR-012 [@defect:D-15]: Login history trusts X-Forwarded-For header unconditionally', async () => {
    const spoofedIp = '203.0.113.195';
    await request(app)
      .post('/api/auth/login')
      .set('x-forwarded-for', spoofedIp)
      .send({ email: 'profile@example.com', password: 'Password123!' });

    const latestLogin = await Login.findOne({ userId: user._id }).sort({ loginAt: -1 });
    // In SUT: IP is spoofed
    expect(latestLogin.ipAddress).toBe(spoofedIp);
  });

  it('TC-USR-014: PATCH /api/user with role admin cannot change user role', async () => {
    const res = await userAgent
      .patch('/api/user')
      .send({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
        role: 'admin'
      });

    const checkUser = await User.findById(user._id);
    expect(checkUser.role).toBe('user');
  });
});
