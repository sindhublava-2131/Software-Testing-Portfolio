import http from 'http';
import { io as ClientIO } from 'socket.io-client';
import { initSocket } from '../../.sut/server/socket/index.js';
import { generateUserToken } from './factories.js';

let serverInstance = null;
let serverPort = null;
const activeSockets = new Set();

export async function startSocketServer(app) {
  if (serverInstance) {
    return { server: serverInstance, port: serverPort };
  }
  serverInstance = http.createServer(app);
  initSocket(serverInstance);

  await new Promise((resolve) => {
    serverInstance.listen(0, () => {
      serverPort = serverInstance.address().port;
      resolve();
    });
  });

  return { server: serverInstance, port: serverPort };
}

export async function stopSocketServer() {
  for (const socket of activeSockets) {
    if (socket.connected) {
      socket.disconnect();
    }
  }
  activeSockets.clear();

  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
    serverInstance = null;
    serverPort = null;
  }
}

export function createSocketClient(userOrToken, port = serverPort) {
  let token = null;
  if (typeof userOrToken === 'string') {
    token = userOrToken;
  } else if (userOrToken && userOrToken._id) {
    token = generateUserToken(userOrToken);
  }

  const options = {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false
  };

  if (token) {
    options.extraHeaders = {
      cookie: `auth_token=${token}`
    };
  }

  const socket = ClientIO(`http://localhost:${port}`, options);
  activeSockets.add(socket);
  return socket;
}

export function waitForEvent(socket, event, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event "${event}" after ${timeout}ms`));
    }, timeout);

    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}
