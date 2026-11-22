import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { secureRoute } from '../../.sut/server/middleware/auth.middleware.js';
import { checkAdmin } from '../../.sut/server/middleware/auth.middleware.js';
import { generateToken } from '../../.sut/server/utils/jwt.js';

describe('M1 Middleware & JWT Unit Tests', () => {
  it('TC-MW-001: secureRoute rejects request when no auth_token cookie present', async () => {
    const req = { cookies: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    await secureRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Unauthorized' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-MW-002: secureRoute rejects garbage token', async () => {
    const req = { cookies: { auth_token: 'garbage.jwt.token' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    await secureRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid or expired token' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-MW-003: secureRoute rejects expired JWT token', async () => {
    const expiredToken = jwt.sign(
      { id: 'u123', role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );
    const req = { cookies: { auth_token: expiredToken } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    await secureRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-MW-004: secureRoute rejects token signed with wrong secret', async () => {
    const wrongToken = jwt.sign(
      { id: 'u123', role: 'user' },
      'wrong-secret-key-attacker',
      { expiresIn: '1h' }
    );
    const req = { cookies: { auth_token: wrongToken } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    await secureRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-MW-005: secureRoute rejects unsigned alg:none token', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ id: 'u123', role: 'admin' })).toString('base64url');
    const algNoneToken = `${header}.${payload}.`;

    const req = { cookies: { auth_token: algNoneToken } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    await secureRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-MW-006: secureRoute attaches user info to req.user for valid token', async () => {
    const validToken = jwt.sign(
      { id: 'u123', role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const req = { cookies: { auth_token: validToken } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    await secureRoute(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('u123');
    expect(req.user.role).toBe('user');
  });

  it('TC-MW-007: checkAdmin rejects unauthenticated request (no req.user)', () => {
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    checkAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/admin/i) }));
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-MW-008: checkAdmin rejects standard user (role === "user")', () => {
    const req = { user: { id: 'u1', role: 'user' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    checkAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/admin/i) }));
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-MW-009: checkAdmin passes request when role is "admin"', () => {
    const req = { user: { id: 'admin1', role: 'admin' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    checkAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('TC-MW-010: generateToken payload format validation', () => {
    const token = generateToken('u123', 'user');
    const decoded = jwt.decode(token);
    expect(decoded.id).toBe('u123');
    expect(decoded.role).toBe('user');
    expect(decoded.password).toBeUndefined();
  });
});
