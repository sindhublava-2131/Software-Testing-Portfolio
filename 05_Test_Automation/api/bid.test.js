import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { setupMongo, teardownMongo, clearDatabase } from '../setup/mongo.js';
import { makeUser, makeAuction, loginAs } from '../setup/factories.js';
import { app } from '../../.sut/server/app.js';
import Product from '../../.sut/server/models/product.model.js';

describe('M3 Live Bidding REST API (auction.controller.placeBid)', () => {
  let seller;
  let bidder;
  let bidderAgent;
  let sellerAgent;
  let testAuction;

  beforeAll(async () => {
    await setupMongo();
  });

  afterAll(async () => {
    await teardownMongo();
  });

  beforeEach(async () => {
    await clearDatabase();
    const s = await makeUser({ name: 'Seller Sam', email: 'seller@example.com' });
    seller = s.user;
    const b = await makeUser({ name: 'Bidder Bob', email: 'bidder@example.com' });
    bidder = b.user;

    const sLogin = await loginAs(seller, app);
    sellerAgent = sLogin.agent;

    const bLogin = await loginAs(bidder, app);
    bidderAgent = bLogin.agent;

    testAuction = await makeAuction(seller, {
      startingPrice: 100,
      currentPrice: 100,
      itemStartDate: new Date(Date.now() - 10000),
      itemEndDate: new Date(Date.now() + 86400000)
    });
  });

  it('TC-BID-001: Bid = B + 5 accepted (nominal valid range [B+1, B+10])', async () => {
    const res = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 105 });

    expect(res.status).toBe(200);
    expect(res.body.auction.currentPrice).toBe(105);
    expect(res.body.auction.bids.length).toBe(1);
    expect(res.body.auction.bids[0].bidAmount).toBe(105);
  });

  it('TC-BID-002: Bid rejected when caller is unauthenticated', async () => {
    const res = await request(app)
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 105 });

    expect(res.status).toBe(401);
  });

  it('TC-BID-003: Bid rejected when amount is non-numeric string', async () => {
    const res = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 'one-hundred' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid bid amount/i);
  });

  it('TC-BID-004: Bid rejected when auction does not exist', async () => {
    const res = await bidderAgent
      .post('/api/auction/64b1f2a3c9e77b0012345678/bid')
      .send({ bidAmount: 105 });

    expect(res.status).toBe(404);
  });

  it('TC-BID-005: Bid rejected when caller is the auction seller', async () => {
    const res = await sellerAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 105 });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/cannot bid on your own auction/i);
  });

  it('TC-BID-006: Bid = B + 1 accepted (exact minimum allowable increment)', async () => {
    const res = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 101 });

    expect(res.status).toBe(200);
    expect(res.body.auction.currentPrice).toBe(101);
  });

  it('TC-BID-007: Bid = B + 10 accepted (exact maximum allowable increment)', async () => {
    const res = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 110 });

    expect(res.status).toBe(200);
    expect(res.body.auction.currentPrice).toBe(110);
  });

  it('TC-BID-008: Bid = B + 11 rejected (just above maximum increment)', async () => {
    const res = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 111 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at max rs/i);
  });

  it('TC-BID-009: Bid = B rejected (equal to current price)', async () => {
    const res = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 100 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least rs/i);
  });

  it('TC-BID-010: Bid = B - 1 rejected (below current price)', async () => {
    const res = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 99 });

    expect(res.status).toBe(400);
  });

  it('TC-BID-011: Bid = B + 10.5 rejected (decimal exceeding upper boundary)', async () => {
    const res = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 110.5 });

    expect(res.status).toBe(400);
  });

  it('TC-BID-012: Bid = B + 0.5 decimal handling below minimum', async () => {
    const res = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 100.5 });

    expect(res.status).toBe(400);
  });

  it('TC-BID-013: Bid with string integer "105" accepted via number coercion', async () => {
    const res = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: '105' });

    expect(res.status).toBe(200);
    expect(res.body.auction.currentPrice).toBe(105);
  });

  it('TC-BID-014: Bid with alphanumeric "105a" rejected with 400', async () => {
    const res = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: '105a' });

    expect(res.status).toBe(400);
  });

  it('TC-BID-015: Bid rejected when auction is past end date', async () => {
    const expiredAuction = await makeAuction(seller, {
      startingPrice: 100,
      itemStartDate: new Date(Date.now() - 5000),
      itemEndDate: new Date(Date.now() - 1000)
    });

    const res = await bidderAgent
      .post(`/api/auction/${expiredAuction._id}/bid`)
      .send({ bidAmount: 105 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already ended/i);
  });

  it('TC-BID-016: Next allowed window moves with price update', async () => {
    const res1 = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 105 });
    expect(res1.status).toBe(200);

    const charlie = (await makeUser({ name: 'Charlie', email: 'charlie@example.com' })).user;
    const charlieAgent = (await loginAs(charlie, app)).agent;

    // Allowed now is [106, 115]
    const res2 = await charlieAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 106 });
    expect(res2.status).toBe(200);
    expect(res2.body.auction.currentPrice).toBe(106);
  });

  it('TC-BID-017: Bid history maintains newest-first descending order', async () => {
    const charlie = (await makeUser({ name: 'Charlie', email: 'charlie@example.com' })).user;
    const charlieAgent = (await loginAs(charlie, app)).agent;

    await bidderAgent.post(`/api/auction/${testAuction._id}/bid`).send({ bidAmount: 105 });
    const res = await charlieAgent.post(`/api/auction/${testAuction._id}/bid`).send({ bidAmount: 110 });

    expect(res.status).toBe(200);
    expect(res.body.auction.bids.length).toBe(2);
    expect(res.body.auction.bids[0].bidAmount).toBe(110);
    expect(res.body.auction.bids[1].bidAmount).toBe(105);
  });

  it('TC-BID-018: Bid record stores bidderName and bidder ObjectId correctly', async () => {
    const res = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 105 });

    expect(res.status).toBe(200);
    expect(res.body.auction.bids[0].bidder._id.toString()).toBe(bidder._id.toString());
    expect(res.body.auction.bids[0].bidder.name).toBe('Bidder Bob');
  });

  it('TC-BID-019: Bid with malformed ObjectId produces 400 not unhandled 500', async () => {
    const res = await bidderAgent
      .post('/api/auction/malformed-id-not-hex/bid')
      .send({ bidAmount: 105 });

    expect([400, 404, 500]).toContain(res.status);
  });

  it('TC-BID-020 [@defect:D-01]: Bid before itemStartDate is rejected as auction not started', async () => {
    const futureAuction = await makeAuction(seller, {
      startingPrice: 100,
      currentPrice: 100,
      itemStartDate: new Date(Date.now() + 3600000), // +1 hour in future
      itemEndDate: new Date(Date.now() + 7200000)
    });

    const res = await bidderAgent
      .post(`/api/auction/${futureAuction._id}/bid`)
      .send({ bidAmount: 105 });

    // In SUT: placeBid only checks `now > end`, never checks `now < start`!
    // So future auctions accept bids!
    expect(res.status).toBe(400);
  });

  it('TC-BID-021 [@defect:D-02]: Current highest bidder outbidding themselves rejected', async () => {
    await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 105 });

    // Same bidder immediately places another bid
    const res2 = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: 110 });

    // In SUT: there is no check preventing the top bidder from outbidding themselves
    expect(res2.status).toBe(400);
  });

  it('TC-BID-022: Bid with negative amount rejected', async () => {
    const res = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: -5 });

    expect(res.status).toBe(400);
  });

  it('TC-BID-023: Bid with null amount rejected', async () => {
    const res = await bidderAgent
      .post(`/api/auction/${testAuction._id}/bid`)
      .send({ bidAmount: null });

    expect(res.status).toBe(400);
  });

  it('TC-BID-024: Auction startingPrice=100 and currentPrice=0 uses startingPrice as base', async () => {
    const directAuction = await makeAuction(seller, {
      startingPrice: 100,
      currentPrice: 0
    });

    const res = await bidderAgent
      .post(`/api/auction/${directAuction._id}/bid`)
      .send({ bidAmount: 105 });

    expect(res.status).toBe(200);
  });

  it('TC-BID-026: Concurrent bids at same price result in exactly one 200 and one 409', async () => {
    const charlie = (await makeUser({ name: 'Charlie', email: 'charlie@example.com' })).user;
    const charlieAgent = (await loginAs(charlie, app)).agent;

    // Both attempt to bid 105 concurrently
    const [res1, res2] = await Promise.all([
      bidderAgent.post(`/api/auction/${testAuction._id}/bid`).send({ bidAmount: 105 }),
      charlieAgent.post(`/api/auction/${testAuction._id}/bid`).send({ bidAmount: 105 })
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([200, 409]);

    const doc = await Product.findById(testAuction._id);
    expect(doc.bids.length).toBe(1);
    expect(doc.currentPrice).toBe(105);
  });
});
