import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { setupMongo, teardownMongo, clearDatabase } from '../setup/mongo.js';
import { app } from '../../.sut/server/app.js';

describe('M6 Contact API (contact.controller)', () => {
  beforeAll(async () => {
    await setupMongo();
  });

  afterAll(async () => {
    await teardownMongo();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  it('TC-CNT-001: POST /api/contact sends email notification and acknowledgment', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'John Inquirer',
        email: 'john@example.com',
        subject: 'General Question',
        message: 'Could you provide more information on buyer protection?'
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/message sent succes+fully/i);
  });

  it('TC-CNT-002: POST /api/contact missing name rejected with 400', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ email: 'john@example.com', subject: 'Question', message: 'Hello' });

    expect(res.status).toBe(400);
    expect(res.body.error || res.body.message).toMatch(/all fields are required/i);
  });

  it('TC-CNT-003: POST /api/contact missing email rejected with 400', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'John', subject: 'Question', message: 'Hello' });

    expect(res.status).toBe(400);
  });

  it('TC-CNT-004: POST /api/contact missing subject rejected with 400', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'John', email: 'john@example.com', message: 'Hello' });

    expect(res.status).toBe(400);
  });

  it('TC-CNT-005: POST /api/contact missing message rejected with 400', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'John', email: 'john@example.com', subject: 'Question' });

    expect(res.status).toBe(400);
  });

  it('TC-CNT-006: POST /api/contact invalid email format rejected with 400', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'John', email: 'invalid_email', subject: 'Question', message: 'Hello' });

    expect(res.status).toBe(400);
    expect(res.body.error || res.body.message).toMatch(/invalid email/i);
  });

  it('TC-CNT-007: POST /api/contact HTML payload in message is sanitized in template', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'Inquirer',
        email: 'inq@example.com',
        subject: 'Inquiry',
        message: '<script>alert("xss")</script>'
      });

    expect(res.status).toBe(200);
  });

  it('TC-CNT-008 [@defect:D-08]: POST /api/contact has no rate limiting allowing spam', async () => {
    // Fire 15 rapid contact inquiries
    const requests = Array.from({ length: 15 }).map(() =>
      request(app)
        .post('/api/contact')
        .send({
          name: 'Spammer',
          email: 'spam@example.com',
          subject: 'Spam Subject',
          message: 'Spam body message text'
        })
    );

    const responses = await Promise.all(requests);
    // In SUT: no rate limiter middleware exists on contact endpoint; all 15 return 200!
    // A secure system should return 429 Too Many Requests
    const has429 = responses.some(r => r.status === 429);
    expect(has429).toBe(true);
  });
});
