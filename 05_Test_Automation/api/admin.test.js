import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { setupMongo, teardownMongo, clearDatabase } from '../setup/mongo.js';
import { makeUser, makeAuction, loginAs } from '../setup/factories.js';
import { app } from '../../.sut/server/app.js';
import User from '../../.sut/server/models/user.model.js';

describe('M5 Administration API (admin.controller)', () => {
  let adminUser;
  let normalUser;
  let adminAgent;
  let normalAgent;

  beforeAll(async () => {
    await setupMongo();
  });

  afterAll(async () => {
    await teardownMongo();
  });

  beforeEach(async () => {
    await clearDatabase();
    adminUser = (await makeUser({ name: 'Admin Adam', email: 'admin@example.com', role: 'admin' })).user;
    normalUser = (await makeUser({ name: 'Normal Ned', email: 'ned@example.com', role: 'user' })).user;

    adminAgent = (await loginAs(adminUser, app)).agent;
    normalAgent = (await loginAs(normalUser, app)).agent;
  });

  it('TC-ADM-001: GET /api/admin/dashboard returns stats when caller is admin', async () => {
    await makeAuction(normalUser, { itemName: 'Auction 1' });

    const res = await adminAgent.get('/api/admin/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats).toHaveProperty('totalUsers');
    expect(res.body.stats).toHaveProperty('totalAuctions');
  });

  it('TC-ADM-002: GET /api/admin/dashboard rejects normal user with 403', async () => {
    const res = await normalAgent.get('/api/admin/dashboard');
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/admin access required/i);
  });

  it('TC-ADM-003: GET /api/admin/dashboard rejects unauthenticated caller with 401', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });

  it('TC-ADM-004: GET /api/admin/users lists registered users with pagination', async () => {
    const res = await adminAgent.get('/api/admin/users?page=1&limit=10');
    expect(res.status).toBe(200);
    const users = res.body.data?.users || res.body.users;
    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThanOrEqual(2);
  });

  it('TC-ADM-005: GET /api/admin/users excludes password field from user objects', async () => {
    const res = await adminAgent.get('/api/admin/users');
    expect(res.status).toBe(200);
    const users = res.body.data?.users || res.body.users;
    for (const u of users) {
      expect(u.password).toBeUndefined();
    }
  });

  it('TC-ADM-006: GET /api/admin/users supports search query', async () => {
    const res = await adminAgent.get('/api/admin/users?search=adam');
    expect(res.status).toBe(200);
    const users = res.body.data?.users || res.body.users;
    expect(users.some(u => u.name.includes('Adam'))).toBe(true);
  });

  it('TC-ADM-007: GET /api/admin/users safely handles regex metacharacters .* and (', async () => {
    const res = await adminAgent.get('/api/admin/users?search=.*(');
    expect([200, 400]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  it('TC-ADM-008: GET /api/admin/users supports role filter', async () => {
    const res = await adminAgent.get('/api/admin/users?role=admin');
    expect(res.status).toBe(200);
    const users = res.body.data?.users || res.body.users;
    for (const u of users) {
      expect(u.role).toBe('admin');
    }
  });

  it('TC-ADM-009: GET /api/admin/users sortBy falls back to safe field for illegal sort', async () => {
    const res = await adminAgent.get('/api/admin/users?sortBy=password');
    expect(res.status).toBe(200);
  });

  it('TC-ADM-010 [@defect:D-07]: Negative page=-1 produces 400 or clamped page, not 500 crash', async () => {
    const res = await adminAgent.get('/api/admin/users?page=-1');
    // In SUT: negative skip in Mongoose causes 500 error instead of clamping to 1 or returning 400
    expect([200, 400]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  it('TC-ADM-011 [@defect:D-07]: Negative limit=-5 produces 400 or clamped limit, not 500 crash', async () => {
    const res = await adminAgent.get('/api/admin/users?limit=-5');
    // In SUT: negative limit causes Mongoose error 500
    expect([200, 400]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  it('TC-ADM-012 [@defect:D-07]: Limit=0 handled gracefully without 500', async () => {
    const res = await adminAgent.get('/api/admin/users?limit=0');
    expect([200, 400]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  it('TC-ADM-013 [@defect:D-07]: Non-numeric page=abc handled gracefully without 500', async () => {
    const res = await adminAgent.get('/api/admin/users?page=abc');
    expect([200, 400]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  it('TC-ADM-014: GET /api/admin/dashboard metrics match database totals', async () => {
    const totalUsersInDb = await User.countDocuments();
    const res = await adminAgent.get('/api/admin/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.stats.totalUsers).toBe(totalUsersInDb);
  });
});
