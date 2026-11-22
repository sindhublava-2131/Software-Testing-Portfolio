// This runs before any SUT code is imported
process.env.PORT = '3000';
process.env.ORIGIN = 'http://localhost:5173';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-please-change-ultra-secure-key-12345';
process.env.JWT_EXPIRES_IN = '1d';
process.env.CLOUDINARY_CLOUD_NAME = 'demo';
process.env.CLOUDINARY_API_KEY = '123456';
process.env.CLOUDINARY_API_SECRET = 'testsecret';
process.env.RESEND_API_KEY = 're_test_dummy_key';
// Initial dummy mongo url until MongoMemoryServer attaches
if (!process.env.MONGO_URL) {
  process.env.MONGO_URL = 'mongodb://127.0.0.1:27017/auction_test';
}
