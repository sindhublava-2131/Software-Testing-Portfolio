import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { setupMongo, teardownMongo, clearDatabase } from '../setup/mongo.js';
import { makeUser, loginAs } from '../setup/factories.js';
import { app } from '../../.sut/server/app.js';
import Upload from '../../.sut/server/models/upload.model.js';
import { cleanupUnusedUploads } from '../../.sut/server/jobs/cleanupUploads.js';

describe('M6 Upload Session API (cloudinary.controller)', () => {
  let user;
  let userAgent;

  beforeAll(async () => {
    await setupMongo();
  });

  afterAll(async () => {
    await teardownMongo();
  });

  beforeEach(async () => {
    await clearDatabase();
    user = (await makeUser({ name: 'Uploader', email: 'uploader@example.com' })).user;
    userAgent = (await loginAs(user, app)).agent;
  });

  it('TC-UPL-001: GET /api/upload/signature requires authentication', async () => {
    const res = await request(app).get('/api/upload/signature');
    expect(res.status).toBe(401);
  });

  it('TC-UPL-002: GET /api/upload/signature returns valid signed parameters', async () => {
    const res = await userAgent.get('/api/upload/signature');
    expect(res.status).toBe(200);
    const data = res.body.data || res.body;
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('folder');
    expect(data).toHaveProperty('signature');
    expect(data).toHaveProperty('apiKey');
    expect(data).toHaveProperty('cloudName');
    expect(data).toHaveProperty('formId');
  });

  it('TC-UPL-003: Signature is valid SHA1 hash matching Cloudinary spec', async () => {
    const res = await userAgent.get('/api/upload/signature');
    expect(res.status).toBe(200);

    const { timestamp, folder, signature } = res.body.data || res.body;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'testsecret';
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const expectedSig = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    expect(signature).toBe(expectedSig);
  });

  it('TC-UPL-004: GET /api/upload/signature creates unique formId and pending Upload row', async () => {
    const res = await userAgent.get('/api/upload/signature');
    expect(res.status).toBe(200);

    const data = res.body.data || res.body;
    const uploadRow = await Upload.findOne({ formId: data.formId });
    expect(uploadRow).toBeDefined();
    expect(uploadRow.status).toBe('pending');
  });

  it('TC-UPL-005: Upload signature endpoint never leaks CLOUDINARY_API_SECRET', async () => {
    const res = await userAgent.get('/api/upload/signature');
    expect(res.status).toBe(200);
    const data = res.body.data || res.body;
    expect(data.apiSecret).toBeUndefined();
    expect(data.cloudinary_api_secret).toBeUndefined();
  });

  it('TC-UPL-006: Cleanup job purges pending uploads > 10m and preserves used ones', async () => {
    const elevenMinAgo = new Date(Date.now() - 11 * 60 * 1000);
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    const oldPending = await Upload.create({ formId: 'OLD_PENDING_01', status: 'pending', createdAt: elevenMinAgo });
    const freshPending = await Upload.create({ formId: 'FRESH_PENDING_02', status: 'pending', createdAt: fiveMinAgo });
    const oldUsed = await Upload.create({ formId: 'OLD_USED_03', status: 'used', createdAt: elevenMinAgo });

    await cleanupUnusedUploads();

    const checkOldPending = await Upload.findOne({ formId: 'OLD_PENDING_01' });
    const checkFreshPending = await Upload.findOne({ formId: 'FRESH_PENDING_02' });
    const checkOldUsed = await Upload.findOne({ formId: 'OLD_USED_03' });

    expect(checkOldPending).toBeNull();
    expect(checkFreshPending).toBeDefined();
    expect(checkOldUsed).toBeDefined();
  });
});
