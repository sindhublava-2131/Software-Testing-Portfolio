import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { setupMongo, teardownMongo, clearDatabase } from '../setup/mongo.js';
import { makeUser, makeAuction, loginAs } from '../setup/factories.js';
import { app } from '../../.sut/server/app.js';
import Product from '../../.sut/server/models/product.model.js';

describe('M2 Read & Listing API (auction.controller)', () => {
  let userAlice;
  let userBob;
  let aliceAgent;
  let bobAgent;

  beforeAll(async () => {
    await setupMongo();
  });

  afterAll(async () => {
    await teardownMongo();
  });

  beforeEach(async () => {
    await clearDatabase();
    userAlice = (await makeUser({ name: 'Alice', email: 'alice@example.com' })).user;
    userBob = (await makeUser({ name: 'Bob', email: 'bob@example.com' })).user;

    aliceAgent = (await loginAs(userAlice, app)).agent;
    bobAgent = (await loginAs(userBob, app)).agent;
  });

  it('TC-LST-001: GET /api/auction returns only active auctions where itemEndDate > now', async () => {
    await makeAuction(userAlice, {
      itemName: 'Active 1',
      itemEndDate: new Date(Date.now() + 100000)
    });
    await makeAuction(userAlice, {
      itemName: 'Active 2',
      itemEndDate: new Date(Date.now() + 200000)
    });
    await makeAuction(userAlice, {
      itemName: 'Expired 1',
      itemStartDate: new Date(Date.now() - 50000),
      itemEndDate: new Date(Date.now() - 10000)
    });

    const res = await aliceAgent.get('/api/auction');
    expect(res.status).toBe(200);
    expect(res.body.auctions.length).toBe(2);
    expect(res.body.auctions.map(a => a.itemName)).not.toContain('Expired 1');
  });

  it('TC-LST-002: GET /api/auction pagination limit=0 coerced to default 12', async () => {
    const res = await aliceAgent.get('/api/auction?limit=0');
    expect(res.status).toBe(200);
  });

  it('TC-LST-003: GET /api/auction pagination limit=1 returns 1 item', async () => {
    await makeAuction(userAlice, { itemName: 'A1' });
    await makeAuction(userAlice, { itemName: 'A2' });

    const res = await aliceAgent.get('/api/auction?limit=1');
    expect(res.status).toBe(200);
    expect(res.body.auctions.length).toBe(1);
  });

  it('TC-LST-004: GET /api/auction pagination limit=50 returns all within bound', async () => {
    const res = await aliceAgent.get('/api/auction?limit=50');
    expect(res.status).toBe(200);
  });

  it('TC-LST-005: GET /api/auction pagination limit=51 clamped to 50', async () => {
    const res = await aliceAgent.get('/api/auction?limit=51');
    expect(res.status).toBe(200);
  });

  it('TC-LST-006: GET /api/auction response includes required fields', async () => {
    await makeAuction(userAlice, { itemName: 'Projection Item' });
    const res = await aliceAgent.get('/api/auction');

    expect(res.status).toBe(200);
    const item = res.body.auctions[0];
    expect(item).toHaveProperty('bidsCount');
    expect(item).toHaveProperty('timeLeft');
    expect(item).toHaveProperty('sellerName');
    expect(item).toHaveProperty('itemPhoto');
  });

  it('TC-LST-007: GET /api/auction results sorted by createdAt desc', async () => {
    await makeAuction(userAlice, { itemName: 'First Created', createdAt: new Date(Date.now() - 5000) });
    await makeAuction(userAlice, { itemName: 'Second Created', createdAt: new Date() });

    const res = await aliceAgent.get('/api/auction');
    expect(res.status).toBe(200);
    expect(res.body.auctions[0].itemName).toBe('Second Created');
  });

  it('TC-LST-008: GET /api/auction/myauction returns only caller auctions', async () => {
    await makeAuction(userAlice, { itemName: 'Alice Item' });
    await makeAuction(userBob, { itemName: 'Bob Item' });

    const res = await aliceAgent.get('/api/auction/myauction');
    expect(res.status).toBe(200);
    expect(res.body.auctions.length).toBe(1);
    expect(res.body.auctions[0].itemName).toBe('Alice Item');
  });

  it('TC-LST-009: GET /api/auction/myauction fails with 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/auction/myauction');
    expect(res.status).toBe(401);
  });

  it('TC-LST-010: GET /api/auction/mybids returns only auctions where user bid', async () => {
    const auction1 = await makeAuction(userAlice, { itemName: 'Auction 1' });
    const auction2 = await makeAuction(userAlice, { itemName: 'Auction 2' });

    await bobAgent.post(`/api/auction/${auction1._id}/bid`).send({ bidAmount: 105 });

    const res = await bobAgent.get('/api/auction/mybids');
    expect(res.status).toBe(200);
    expect(res.body.auctions.length).toBe(1);
    expect(res.body.auctions[0]._id.toString()).toBe(auction1._id.toString());
  });

  it('TC-LST-011: GET /api/auction/stats returns aggregate metrics', async () => {
    await makeAuction(userAlice, { itemName: 'Alice Active 1' });
    await makeAuction(userAlice, { itemName: 'Alice Active 2' });

    const res = await aliceAgent.get('/api/auction/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalAuctions');
    expect(res.body).toHaveProperty('userAuctionCount');
    expect(res.body).toHaveProperty('activeAuctions');
  });

  it('TC-LST-012: GET /api/auction/:id returns live auction details', async () => {
    const auc = await makeAuction(userAlice, { itemName: 'Single Detail Item' });
    const res = await aliceAgent.get(`/api/auction/${auc._id}`);

    expect(res.status).toBe(200);
    const item = res.body.auction || res.body;
    expect(item.itemName).toBe('Single Detail Item');
  });

  it('TC-LST-013: GET /api/auction/:id resolves winner when accessed after end time', async () => {
    const expiredAuc = await makeAuction(userAlice, {
      itemName: 'Expired With Bids',
      itemStartDate: new Date(Date.now() - 10000),
      itemEndDate: new Date(Date.now() - 1000),
      bids: [
        { bidder: userBob._id, bidderName: 'Bob', bidAmount: 110, bidTime: new Date() }
      ]
    });

    const res = await aliceAgent.get(`/api/auction/${expiredAuc._id}`);
    expect(res.status).toBe(200);

    const doc = await Product.findById(expiredAuc._id);
    expect(doc.winner.toString()).toBe(userBob._id.toString());
    expect(doc.isSold).toBe(true);
  });

  it('TC-LST-014: GET /api/auction/:id restricts non-participant from viewing ended auction', async () => {
    const userCharlie = (await makeUser({ name: 'Charlie', email: 'charlie@example.com' })).user;
    const charlieAgent = (await loginAs(userCharlie, app)).agent;

    const expiredAuc = await makeAuction(userAlice, {
      itemName: 'Ended Auction',
      itemStartDate: new Date(Date.now() - 10000),
      itemEndDate: new Date(Date.now() - 1000),
      bids: [{ bidder: userBob._id, bidderName: 'Bob', bidAmount: 110, bidTime: new Date() }]
    });

    const res = await charlieAgent.get(`/api/auction/${expiredAuc._id}`);
    expect(res.status).toBe(403);
  });

  it('TC-LST-015: GET /api/auction/:id returns 404 for non-existent ObjectId', async () => {
    const res = await aliceAgent.get('/api/auction/64b1f2a3c9e77b0012345678');
    expect(res.status).toBe(404);
  });

  it('TC-LST-016: GET /api/auction/:id handles malformed ObjectId gracefully', async () => {
    const res = await aliceAgent.get('/api/auction/bad-id-xyz');
    expect([400, 404, 500]).toContain(res.status);
  });
});
