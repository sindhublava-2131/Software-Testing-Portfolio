import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { setupMongo, teardownMongo, clearDatabase } from '../setup/mongo.js';
import { makeUser, makeUpload, loginAs } from '../setup/factories.js';
import { app } from '../../.sut/server/app.js';
import Product from '../../.sut/server/models/product.model.js';
import Upload from '../../.sut/server/models/upload.model.js';

describe('M2 Auction Management API (auction.controller)', () => {
  let sellerUser;
  let sellerAgent;
  let sellerToken;

  beforeAll(async () => {
    await setupMongo();
  });

  afterAll(async () => {
    await teardownMongo();
  });

  beforeEach(async () => {
    await clearDatabase();
    const created = await makeUser({ name: 'Seller Sam', email: 'seller@example.com' });
    sellerUser = created.user;
    const login = await loginAs(sellerUser, app);
    sellerAgent = login.agent;
    sellerToken = login.token;
  });

  it('TC-AUC-001: Valid auction creation with active pending upload formId', async () => {
    const upload = await makeUpload({ status: 'pending' });

    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemName: 'Vintage Camera',
        itemDescription: 'Classic 1970 35mm film camera in mint condition',
        itemCategory: 'Electronics',
        startingPrice: 150,
        itemStartDate: new Date(Date.now() - 1000).toISOString(),
        itemEndDate: new Date(Date.now() + 86400000).toISOString(),
        formId: upload.formId,
        public_id: 'auction_system/camera',
        secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
      });

    expect(res.status).toBe(201);
    const auction = res.body.newAuction || res.body.auction;
    expect(auction).toBeDefined();
    expect(auction.currentPrice).toBe(150);
    expect(auction.startingPrice).toBe(150);

    const updatedUpload = await Upload.findOne({ formId: upload.formId });
    expect(updatedUpload.status).toBe('used');
  });

  it('TC-AUC-002: Auction creation fails when unauthenticated', async () => {
    const upload = await makeUpload({ status: 'pending' });
    const res = await request(app)
      .post('/api/auction')
      .send({
        itemName: 'Camera',
        itemDescription: 'Desc',
        itemCategory: 'Electronics',
        startingPrice: 100,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: upload.formId,
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      });

    expect(res.status).toBe(401);
  });

  it('TC-AUC-003: Auction creation fails with unknown formId', async () => {
    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemName: 'Item',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 100,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: 'NON_EXISTENT_FORM_ID_999',
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid upload session/i);
  });

  it('TC-AUC-004: Auction creation missing public_id or secure_url', async () => {
    const upload = await makeUpload({ status: 'pending' });
    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemName: 'Item',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 100,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: upload.formId
      });

    expect(res.status).toBe(400);
  });

  it('TC-AUC-005: Auction creation end date prior to start date', async () => {
    const upload = await makeUpload({ status: 'pending' });
    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemName: 'Item',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 100,
        itemStartDate: new Date(Date.now() + 50000).toISOString(),
        itemEndDate: new Date(Date.now() + 10000).toISOString(),
        formId: upload.formId,
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      });

    expect(res.status).toBe(400);
  });

  it('TC-AUC-006: Auction creation end date equals start date (0 ms)', async () => {
    const upload = await makeUpload({ status: 'pending' });
    const dateStr = '2026-12-01T10:00:00.000Z';
    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemName: 'Item',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 100,
        itemStartDate: dateStr,
        itemEndDate: dateStr,
        formId: upload.formId,
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      });

    expect(res.status).toBe(400);
  });

  it('TC-AUC-007 [@defect:D-05b]: Replay with already consumed used formId', async () => {
    const upload = await makeUpload({ status: 'used' });
    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemName: 'Replay Item',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 100,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: upload.formId,
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      });

    // In SUT: check is only `Upload.findOne({formId})`, without `status: "pending"`, so used formId is reused!
    expect(res.status).toBe(400);
  });

  it('TC-AUC-008 [@defect:D-05]: Starting price 0 returns 400 not 500', async () => {
    const upload = await makeUpload({ status: 'pending' });
    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemName: 'Zero Price Item',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 0,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: upload.formId,
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      });

    expect(res.status).toBe(400);
  });

  it('TC-AUC-009 [@defect:D-05]: Starting price negative -1 returns 400 not 500', async () => {
    const upload = await makeUpload({ status: 'pending' });
    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemName: 'Negative Price Item',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: -1,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: upload.formId,
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      });

    expect(res.status).toBe(400);
  });

  it('TC-AUC-010: Starting price 1 (exact boundary) succeeds', async () => {
    const upload = await makeUpload({ status: 'pending' });
    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemName: 'Min Price Item',
        itemDescription: 'Desc',
        itemCategory: 'Books',
        startingPrice: 1,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: upload.formId,
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      });

    expect(res.status).toBe(201);
  });

  it('TC-AUC-011 [@defect:D-05]: Missing itemName returns 400 not 500', async () => {
    const upload = await makeUpload({ status: 'pending' });
    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemDescription: 'Desc',
        itemCategory: 'Books',
        startingPrice: 10,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: upload.formId,
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      });

    expect(res.status).toBe(400);
  });

  it('TC-AUC-012 [@defect:D-05]: Missing itemCategory returns 400 not 500', async () => {
    const upload = await makeUpload({ status: 'pending' });
    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemName: 'Name',
        itemDescription: 'Desc',
        startingPrice: 10,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: upload.formId,
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      });

    expect(res.status).toBe(400);
  });

  it('TC-AUC-013 [@defect:D-05]: Missing itemDescription returns 400 not 500', async () => {
    const upload = await makeUpload({ status: 'pending' });
    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemName: 'Name',
        itemCategory: 'Art',
        startingPrice: 10,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: upload.formId,
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      });

    expect(res.status).toBe(400);
  });

  it('TC-AUC-014 [@defect:D-05]: Missing itemEndDate produces 400 not 500', async () => {
    const upload = await makeUpload({ status: 'pending' });
    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemName: 'Missing End Date',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 10,
        itemStartDate: new Date().toISOString(),
        formId: upload.formId,
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      });

    expect(res.status).toBe(400);
  });

  it('TC-AUC-015: Auction creation response omits seller password hash', async () => {
    const upload = await makeUpload({ status: 'pending' });
    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemName: 'Item Security',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 50,
        itemStartDate: new Date().toISOString(),
        itemEndDate: new Date(Date.now() + 100000).toISOString(),
        formId: upload.formId,
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      });

    expect(res.status).toBe(201);
    const auction = res.body.newAuction || res.body.auction;
    expect(auction).toBeDefined();
    expect(auction.seller?.password).toBeUndefined();
  });

  it('TC-AUC-016: Auction creation with past start date allowed for immediate activation', async () => {
    const upload = await makeUpload({ status: 'pending' });
    const res = await sellerAgent
      .post('/api/auction')
      .send({
        itemName: 'Immediate Auction',
        itemDescription: 'Desc',
        itemCategory: 'Art',
        startingPrice: 50,
        itemStartDate: new Date(Date.now() - 3600000).toISOString(),
        itemEndDate: new Date(Date.now() + 3600000).toISOString(),
        formId: upload.formId,
        public_id: 'pid',
        secure_url: 'http://img.jpg'
      });

    expect(res.status).toBe(201);
  });
});
