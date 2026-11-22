import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupMongo, teardownMongo } from '../setup/mongo.js';
import User from '../../.sut/server/models/user.model.js';
import Product from '../../.sut/server/models/product.model.js';
import Upload from '../../.sut/server/models/upload.model.js';
import Login from '../../.sut/server/models/login.model.js';

describe('Model Schemas & Validation Unit Tests', () => {
  beforeAll(async () => {
    await setupMongo();
  });

  afterAll(async () => {
    await teardownMongo();
  });

  it('TC-MOD-001: User model enforces email regex validation', async () => {
    const user = new User({
      name: 'Bad Email User',
      email: 'not_an_email',
      password: 'Password123!'
    });

    let err = null;
    try {
      await user.validate();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it('TC-MOD-002: User model rejects non-whitelisted role enum', async () => {
    const user = new User({
      name: 'Super User',
      email: 'super@example.com',
      password: 'Password123!',
      role: 'superuser'
    });

    let err = null;
    try {
      await user.validate();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.errors.role).toBeDefined();
  });

  it('TC-MOD-003: Product model enforces startingPrice minimum boundary of 1', async () => {
    const prod = new Product({
      itemName: 'Zero Price Item',
      itemDescription: 'Desc',
      itemCategory: 'Art',
      startingPrice: 0,
      seller: '64b1f2a3c9e77b0012345678',
      formId: 'F1',
      itemImage: { public_id: 'p1', url: 'http://img.jpg' }
    });

    let err = null;
    try {
      await prod.validate();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.errors.startingPrice).toBeDefined();
  });

  it('TC-MOD-004: Product model requires itemImage public_id and secure_url', async () => {
    const prod = new Product({
      itemName: 'No Image Item',
      itemDescription: 'Desc',
      itemCategory: 'Art',
      startingPrice: 10,
      seller: '64b1f2a3c9e77b0012345678',
      formId: 'F1',
      itemImage: {}
    });

    let err = null;
    try {
      await prod.validate();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.errors['itemImage.public_id']).toBeDefined();
  });

  it('TC-MOD-005: Upload model enforces status enum pending or used', async () => {
    const upload = new Upload({
      formId: 'F123',
      status: 'invalid_status'
    });

    let err = null;
    try {
      await upload.validate();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.errors.status).toBeDefined();
  });

  it('TC-MOD-006: Upload model specifies unique index on formId', () => {
    const schema = Upload.schema;
    const formIdPath = schema.path('formId');
    expect(formIdPath._index).toBeTruthy();
  });

  it('TC-MOD-007: Login model specifies TTL index with expireAfterSeconds: 15778463', () => {
    const schema = Login.schema;
    const loginAtPath = schema.path('loginAt');
    expect(loginAtPath.options.expires).toBe(15778463);
  });

  it('TC-MOD-008: Product bids subdocument defaults bidTime to Date', () => {
    const prod = new Product({
      itemName: 'Bid Time Item',
      itemDescription: 'Desc',
      itemCategory: 'Art',
      startingPrice: 10,
      seller: '64b1f2a3c9e77b0012345678',
      formId: 'F1',
      itemImage: { public_id: 'p1', url: 'http://img.jpg' },
      bids: [{ bidder: '64b1f2a3c9e77b0012345679', bidAmount: 15 }]
    });

    expect(prod.bids[0].bidTime).toBeDefined();
    expect(prod.bids[0].bidTime instanceof Date).toBe(true);
  });
});
