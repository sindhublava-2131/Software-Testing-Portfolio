import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import User from '../../.sut/server/models/user.model.js';
import Product from '../../.sut/server/models/product.model.js';
import Upload from '../../.sut/server/models/upload.model.js';
import { generateToken } from '../../.sut/server/utils/jwt.js';

export async function makeUser(overrides = {}) {
  const plainPassword = overrides.password || 'Password123!';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const uniqueSuffix = Math.random().toString(36).substring(2, 8);
  const email = overrides.email || `user_${uniqueSuffix}@example.com`;

  const user = await User.create({
    name: overrides.name || `Test User ${uniqueSuffix}`,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: overrides.role || 'user',
    avatar: overrides.avatar || 'https://example.com/avatar.png'
  });

  return { user, plainPassword };
}

export function generateUserToken(user) {
  return generateToken(user._id ? user._id.toString() : user.id, user.role || 'user');
}

export async function loginAs(user, app) {
  const token = generateUserToken(user);
  const agent = request.agent(app);
  agent.set('Cookie', `auth_token=${token}`);
  return { agent, token, cookieHeader: `auth_token=${token}` };
}

export async function makeUpload(overrides = {}) {
  const uniqueFormId = overrides.formId || `FORM_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const upload = await Upload.create({
    formId: uniqueFormId,
    status: overrides.status || 'pending',
    createdAt: overrides.createdAt || new Date()
  });
  return upload;
}

export async function makeAuction(seller, overrides = {}) {
  const upload = await makeUpload({ status: 'used' });
  const start = overrides.itemStartDate || new Date(Date.now() - 1000);
  const end = overrides.itemEndDate || new Date(Date.now() + 86400000);
  const startingPrice = overrides.startingPrice !== undefined ? overrides.startingPrice : 100;
  const currentPrice = overrides.currentPrice !== undefined ? overrides.currentPrice : startingPrice;

  const auction = await Product.create({
    itemName: overrides.itemName || 'Test Auction Item',
    itemDescription: overrides.itemDescription || 'Detailed test auction description',
    itemCategory: overrides.itemCategory || 'Antiques',
    startingPrice,
    currentPrice,
    itemStartDate: start,
    itemEndDate: end,
    seller: seller._id || seller,
    formId: upload.formId,
    itemImage: {
      public_id: overrides.public_id || 'auction_system/sample_item',
      url: overrides.url || overrides.secure_url || 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
    },
    bids: overrides.bids || [],
    winner: overrides.winner || null,
    isSold: overrides.isSold || false
  });

  return auction;
}
