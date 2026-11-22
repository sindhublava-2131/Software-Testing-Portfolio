import '../setup/env.js';
import http from 'http';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { setupMongo, teardownMongo, mongoose } from '../setup/mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, '../../.sut/client');

let httpServer = null;
let viteServer = null;

export async function startE2EServers() {
  console.log('[E2E Server] Initializing MongoDB via setupMongo()...');
  await setupMongo();
  console.log('[E2E Server] MongoDB connected.');

  // Seed baseline users & auctions
  await seedE2EData();

  console.log('[E2E Server] Starting HTTP & Socket.IO server on port 3000...');
  const { app } = await import('../../.sut/server/app.js');
  const { initSocket } = await import('../../.sut/server/socket/index.js');
  const {
    authRoutes,
    userRoutes,
    auctionRoutes,
    contactRoutes,
    adminRoutes,
    cloudinaryRoutes,
  } = await import('../../.sut/server/routes/index.js');

  // Client baseURL may be http://localhost:3000 (calling /auth/signup directly)
  // Mount direct non-/api aliases on app so both /auth and /api/auth work seamlessly
  app.use("/auth", authRoutes);
  app.use("/user", userRoutes);
  app.use("/auction", auctionRoutes);
  app.use("/contact", contactRoutes);
  app.use("/admin", adminRoutes);
  app.use("/upload", cloudinaryRoutes);

  httpServer = http.createServer(app);
  initSocket(httpServer);
  await new Promise((resolve) => {
    httpServer.listen(3000, resolve);
  });
  console.log('[E2E Server] Backend listening on http://localhost:3000');

  console.log('[E2E Server] Starting Vite preview server on port 5173...');
  const viteModuleUrl = pathToFileURL(path.join(clientRoot, 'node_modules/vite/dist/node/index.js')).href;
  const { preview } = await import(viteModuleUrl);
  viteServer = await preview({
    root: clientRoot,
    preview: {
      port: 5173,
      host: true
    }
  });
  console.log('[E2E Server] Frontend running on http://localhost:5173');

  return { httpServer, viteServer };
}

export async function stopE2EServers() {
  console.log('[E2E Server] Stopping servers...');
  if (viteServer) {
    await viteServer.close();
    viteServer = null;
  }
  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
    httpServer = null;
  }
  await teardownMongo();
  console.log('[E2E Server] All servers stopped cleanly.');
}

export async function seedE2EData() {
  const { default: bcrypt } = await import('bcryptjs');
  const { default: User } = await import('../../.sut/server/models/user.model.js');
  const { default: Product } = await import('../../.sut/server/models/product.model.js');
  const { default: Login } = await import('../../.sut/server/models/login.model.js');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Admin user
  let admin = await User.findOne({ email: 'admin@example.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin Alice',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    });
  }

  // Seller user
  let seller = await User.findOne({ email: 'seller@example.com' });
  if (!seller) {
    seller = await User.create({
      name: 'Seller Sam',
      email: 'seller@example.com',
      password: hashedPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    });
  }

  // Bidder user
  let bidder = await User.findOne({ email: 'bidder@example.com' });
  if (!bidder) {
    bidder = await User.create({
      name: 'Bidder Bob',
      email: 'bidder@example.com',
      password: hashedPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
    });
  }

  // Add a sample login record for profile testing
  await Login.create({
    userId: bidder._id,
    ip: '127.0.0.1',
    device: 'Desktop Chrome 133.0',
    location: 'Bengaluru, India',
    loginAt: new Date()
  });

  // Seed sample active auction
  let activeAuction = await Product.findOne({ itemName: 'Vintage Leica M3 Rangefinder' });
  if (!activeAuction) {
    activeAuction = await Product.create({
      itemName: 'Vintage Leica M3 Rangefinder',
      itemDescription: 'Classic 35mm rangefinder camera in pristine collector condition with 50mm f/2 lens.',
      itemCategory: 'Electronics',
      startingPrice: 100,
      currentPrice: 100,
      itemStartDate: new Date(Date.now() - 3600000),
      itemEndDate: new Date(Date.now() + 86400000), // 24h future
      seller: seller._id,
      itemImage: {
        public_id: 'auction_system/leica',
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500'
      },
      bids: []
    });
  }

  // Seed ended auction won by bidder
  let endedAuction = await Product.findOne({ itemName: 'Antique Victorian Mantel Clock' });
  if (!endedAuction) {
    endedAuction = await Product.create({
      itemName: 'Antique Victorian Mantel Clock',
      itemDescription: 'Hand-carved mahogany mechanical clock from circa 1880, fully serviced and functional.',
      itemCategory: 'Antiques',
      startingPrice: 50,
      currentPrice: 85,
      itemStartDate: new Date(Date.now() - 7200000),
      itemEndDate: new Date(Date.now() - 1800000), // ended 30m ago
      seller: seller._id,
      winner: bidder._id,
      isSold: true,
      itemImage: {
        public_id: 'auction_system/clock',
        url: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500'
      },
      bids: [
        {
          bidder: bidder._id,
          bidAmount: 85,
          bidTime: new Date(Date.now() - 2000000)
        }
      ]
    });
  }

  return { admin, seller, bidder, activeAuction, endedAuction };
}
