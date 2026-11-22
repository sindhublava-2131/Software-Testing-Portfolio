import mongoose from '../../.sut/server/node_modules/mongoose/index.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from '../../.sut/server/config/env.config.js';
import { connectDB, disconnectDB } from '../../.sut/server/config/db.config.js';

let mongod = null;

export async function setupMongo() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URL = uri;
  env.mongo_uri = uri;

  // Reset cached connection in db.config
  if (global.mongoose) {
    global.mongoose.conn = null;
    global.mongoose.promise = null;
  }

  await connectDB();
  return { mongod, uri };
}

export async function teardownMongo() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
}

export async function clearDatabase() {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
}

export { mongoose };
