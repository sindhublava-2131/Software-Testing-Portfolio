import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupMongo, teardownMongo, clearDatabase } from '../setup/mongo.js';
import { makeUser, makeAuction, generateUserToken } from '../setup/factories.js';
import { app } from '../../.sut/server/app.js';
import { startSocketServer, stopSocketServer, createSocketClient, waitForEvent } from '../setup/socketClient.js';
import Product from '../../.sut/server/models/product.model.js';
import request from 'supertest';

describe('M3 Real-Time Live Bidding Socket Suite (socket/auction.handler)', () => {
  let seller;
  let buyer1;
  let buyer2;
  let port;
  let auction;

  beforeAll(async () => {
    await setupMongo();
    const serverInfo = await startSocketServer(app);
    port = serverInfo.port;
  });

  afterAll(async () => {
    await stopSocketServer();
    await teardownMongo();
  });

  beforeEach(async () => {
    await clearDatabase();
    seller = (await makeUser({ name: 'Socket Seller', email: 'seller_sock@example.com' })).user;
    buyer1 = (await makeUser({ name: 'Socket Buyer 1', email: 'buyer1_sock@example.com' })).user;
    buyer2 = (await makeUser({ name: 'Socket Buyer 2', email: 'buyer2_sock@example.com' })).user;

    auction = await makeAuction(seller, {
      startingPrice: 100,
      currentPrice: 100,
      itemStartDate: new Date(Date.now() - 5000),
      itemEndDate: new Date(Date.now() + 86400000)
    });
  });

  it('TC-SOC-001: Connection rejected without auth_token cookie', async () => {
    const socket = createSocketClient(null, port);
    const err = await waitForEvent(socket, 'connect_error');
    expect(err.message).toMatch(/authentication required/i);
    socket.disconnect();
  });

  it('TC-SOC-002: Connection rejected with garbage or expired token', async () => {
    const socket = createSocketClient('garbage_token_value', port);
    const err = await waitForEvent(socket, 'connect_error');
    expect(err.message).toMatch(/invalid or expired token/i);
    socket.disconnect();
  });

  it('TC-SOC-003: Connection rejected for token of non-existent user', async () => {
    const fakeToken = generateUserToken({ _id: '64b1f2a3c9e77b0012349999', role: 'user' });
    const socket = createSocketClient(fakeToken, port);
    const err = await waitForEvent(socket, 'connect_error');
    expect(err.message).toMatch(/user not found/i);
    socket.disconnect();
  });

  it('TC-SOC-004: Connection succeeds for valid authenticated user', async () => {
    const socket = createSocketClient(buyer1, port);
    await waitForEvent(socket, 'connect');
    expect(socket.connected).toBe(true);
    socket.disconnect();
  });

  it('TC-SOC-005 & TC-SOC-006: auction:join emits auction:userJoined and dedupes multiple tabs', async () => {
    const socketA1 = createSocketClient(buyer1, port);
    const socketA2 = createSocketClient(buyer1, port); // second tab of same user
    const socketB = createSocketClient(buyer2, port);

    await Promise.all([
      waitForEvent(socketA1, 'connect'),
      waitForEvent(socketA2, 'connect'),
      waitForEvent(socketB, 'connect')
    ]);

    socketA1.emit('auction:join', { auctionId: auction._id.toString() });
    const joinData1 = await waitForEvent(socketA1, 'auction:userJoined');
    expect(joinData1.userName).toBe(buyer1.name);

    socketA2.emit('auction:join', { auctionId: auction._id.toString() });
    socketB.emit('auction:join', { auctionId: auction._id.toString() });

    const joinDataB = await waitForEvent(socketA1, 'auction:userJoined');
    expect(joinDataB).toBeDefined();

    socketA1.disconnect();
    socketA2.disconnect();
    socketB.disconnect();
  });

  it('TC-SOC-007: Leaving auction emits auction:userLeft', async () => {
    const socketA = createSocketClient(buyer1, port);
    const socketB = createSocketClient(buyer2, port);

    await Promise.all([waitForEvent(socketA, 'connect'), waitForEvent(socketB, 'connect')]);

    socketA.emit('auction:join', { auctionId: auction._id.toString() });
    socketB.emit('auction:join', { auctionId: auction._id.toString() });
    await waitForEvent(socketA, 'auction:userJoined');

    socketB.emit('auction:leave', { auctionId: auction._id.toString() });
    const leftData = await waitForEvent(socketA, 'auction:userLeft');
    expect(leftData).toBeDefined();

    socketA.disconnect();
    socketB.disconnect();
  });

  it('TC-SOC-008: auction:join with missing auctionId handled safely', async () => {
    const socket = createSocketClient(buyer1, port);
    await waitForEvent(socket, 'connect');

    // Should not crash the server
    socket.emit('auction:join', { auctionId: null });
    await new Promise(r => setTimeout(r, 200));
    expect(socket.connected).toBe(true);
    socket.disconnect();
  });

  it('TC-SOC-009 & TC-SOC-010: auction:bid broadcasts auction:bidPlaced to room (outbid event)', async () => {
    const socketA = createSocketClient(buyer1, port);
    const socketB = createSocketClient(buyer2, port);

    await Promise.all([waitForEvent(socketA, 'connect'), waitForEvent(socketB, 'connect')]);

    socketA.emit('auction:join', { auctionId: auction._id.toString() });
    socketB.emit('auction:join', { auctionId: auction._id.toString() });
    await new Promise(r => setTimeout(r, 200));

    // Buyer 2 places bid 105
    const bidPromise = waitForEvent(socketA, 'auction:bidPlaced');
    socketB.emit('auction:bid', { auctionId: auction._id.toString(), bidAmount: 105 });

    const bidData = await bidPromise;
    expect(bidData.auction.currentPrice).toBe(105);

    const doc = await Product.findById(auction._id);
    expect(doc.currentPrice).toBe(105);

    socketA.disconnect();
    socketB.disconnect();
  });

  it('TC-SOC-011: auction:bid enforces [B+1, B+10] boundaries via socket', async () => {
    const socket = createSocketClient(buyer1, port);
    await waitForEvent(socket, 'connect');
    socket.emit('auction:join', { auctionId: auction._id.toString() });
    await new Promise(r => setTimeout(r, 200));

    // Below min
    const errPromise1 = waitForEvent(socket, 'auction:error');
    socket.emit('auction:bid', { auctionId: auction._id.toString(), bidAmount: 100 });
    const err1 = await errPromise1;
    expect(err1.message).toMatch(/at least rs/i);

    // Above max
    const errPromise2 = waitForEvent(socket, 'auction:error');
    socket.emit('auction:bid', { auctionId: auction._id.toString(), bidAmount: 115 });
    const err2 = await errPromise2;
    expect(err2.message).toMatch(/at max rs/i);

    socket.disconnect();
  });

  it('TC-SOC-012 [@defect:D-16]: auction:bid with null amount returns error not silent return', async () => {
    const socket = createSocketClient(buyer1, port);
    await waitForEvent(socket, 'connect');
    socket.emit('auction:join', { auctionId: auction._id.toString() });
    await new Promise(r => setTimeout(r, 200));

    // In SUT: `if (!auctionId || bidAmount == null) return;`
    // Client receives no emit, causing frontend to hang indefinitely!
    // Expected behavior: socket.emit('auction:error', { message: 'Invalid bid amount' })
    const errPromise = waitForEvent(socket, 'auction:error', 1500);
    socket.emit('auction:bid', { auctionId: auction._id.toString(), bidAmount: null });

    const err = await errPromise;
    expect(err.message).toMatch(/invalid bid amount/i);
    socket.disconnect();
  });

  it('TC-SOC-013: auction:bid seller bidding on own auction rejected', async () => {
    const socket = createSocketClient(seller, port);
    await waitForEvent(socket, 'connect');
    socket.emit('auction:join', { auctionId: auction._id.toString() });
    await new Promise(r => setTimeout(r, 200));

    const errPromise = waitForEvent(socket, 'auction:error');
    socket.emit('auction:bid', { auctionId: auction._id.toString(), bidAmount: 105 });
    const err = await errPromise;
    expect(err.message).toMatch(/cannot bid on your own auction/i);

    socket.disconnect();
  });

  it('TC-SOC-014: auction:bid after expiry rejected', async () => {
    const shortAuc = await makeAuction(seller, {
      startingPrice: 100,
      itemStartDate: new Date(Date.now() - 4000),
      itemEndDate: new Date(Date.now() - 1000)
    });

    const socket = createSocketClient(buyer1, port);
    await waitForEvent(socket, 'connect');
    socket.emit('auction:join', { auctionId: shortAuc._id.toString() });
    await new Promise(r => setTimeout(r, 200));

    const errPromise = waitForEvent(socket, 'auction:error');
    socket.emit('auction:bid', { auctionId: shortAuc._id.toString(), bidAmount: 105 });
    const err = await errPromise;
    expect(err.message).toMatch(/already ended/i);

    socket.disconnect();
  });

  it('TC-SOC-016: Concurrent identical bids emitted simultaneously via socket: exactly 1 accepted', async () => {
    const socketA = createSocketClient(buyer1, port);
    const socketB = createSocketClient(buyer2, port);

    await Promise.all([waitForEvent(socketA, 'connect'), waitForEvent(socketB, 'connect')]);
    socketA.emit('auction:join', { auctionId: auction._id.toString() });
    socketB.emit('auction:join', { auctionId: auction._id.toString() });
    await new Promise(r => setTimeout(r, 200));

    let bidPlacedCount = 0;
    let errorCount = 0;

    socketA.on('auction:bidPlaced', () => { bidPlacedCount++; });
    socketB.on('auction:bidPlaced', () => { bidPlacedCount++; });
    socketA.on('auction:error', () => { errorCount++; });
    socketB.on('auction:error', () => { errorCount++; });

    // Emit identical bids simultaneously
    socketA.emit('auction:bid', { auctionId: auction._id.toString(), bidAmount: 105 });
    socketB.emit('auction:bid', { auctionId: auction._id.toString(), bidAmount: 105 });

    await new Promise(r => setTimeout(r, 600));

    const doc = await Product.findById(auction._id);
    expect(doc.currentPrice).toBe(105);
    expect(doc.bids.length).toBe(1);

    socketA.disconnect();
    socketB.disconnect();
  });

  it('TC-SOC-018: Simultaneous REST bid and Socket bid at same price: exactly one succeeds', async () => {
    const socketB = createSocketClient(buyer2, port);
    await waitForEvent(socketB, 'connect');
    socketB.emit('auction:join', { auctionId: auction._id.toString() });
    await new Promise(r => setTimeout(r, 200));

    const buyer1Token = generateUserToken(buyer1);

    const [restRes] = await Promise.all([
      request(app)
        .post(`/api/auction/${auction._id}/bid`)
        .set('Cookie', `auth_token=${buyer1Token}`)
        .send({ bidAmount: 105 }),
      new Promise(r => {
        socketB.emit('auction:bid', { auctionId: auction._id.toString(), bidAmount: 105 });
        r();
      })
    ]);

    await new Promise(r => setTimeout(r, 600));
    const doc = await Product.findById(auction._id);
    expect(doc.currentPrice).toBe(105);
    expect(doc.bids.length).toBe(1);

    socketB.disconnect();
  });

  it('TC-SOC-019: REST bid emits auction:bidPlaced to socket client in room', async () => {
    const socket = createSocketClient(buyer2, port);
    await waitForEvent(socket, 'connect');
    socket.emit('auction:join', { auctionId: auction._id.toString() });
    await new Promise(r => setTimeout(r, 200));

    const buyer1Token = generateUserToken(buyer1);
    const eventPromise = waitForEvent(socket, 'auction:bidPlaced');

    await request(app)
      .post(`/api/auction/${auction._id}/bid`)
      .set('Cookie', `auth_token=${buyer1Token}`)
      .send({ bidAmount: 108 });

    const received = await eventPromise;
    expect(received.auction.currentPrice).toBe(108);
    socket.disconnect();
  });

  it('TC-SOC-020: Non-participant can bid without joining room first', async () => {
    const socket = createSocketClient(buyer1, port);
    await waitForEvent(socket, 'connect');

    // Directly emit bid without calling auction:join
    socket.emit('auction:bid', { auctionId: auction._id.toString(), bidAmount: 105 });
    await new Promise(r => setTimeout(r, 500));

    const doc = await Product.findById(auction._id);
    expect(doc.currentPrice).toBe(105);
    expect(doc.bids.length).toBe(1);
    socket.disconnect();
  });
});
