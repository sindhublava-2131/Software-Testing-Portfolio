import { authCases } from './auth.js';
import { middlewareCases } from './middleware.js';
import { auctionCases } from './auction.js';
import { bidCases } from './bid.js';
import { listCases } from './list.js';
import { userCases } from './user.js';
import { adminCases } from './admin.js';
import { uploadCases } from './upload.js';
import { contactCases } from './contact.js';
import { modelCases } from './models.js';
import { socketCases } from './socket.js';
import { securityCases } from './security.js';
import { stateCases } from './state.js';
import { dtCases } from './dt.js';
import { e2eCases } from './e2e.js';
import { linkCases } from './links.js';
import { dockerCases } from './docker.js';

export const allCases = [
  ...authCases,
  ...middlewareCases,
  ...auctionCases,
  ...bidCases,
  ...listCases,
  ...userCases,
  ...adminCases,
  ...uploadCases,
  ...contactCases,
  ...modelCases,
  ...socketCases,
  ...securityCases,
  ...stateCases,
  ...dtCases,
  ...e2eCases,
  ...linkCases,
  ...dockerCases
];

export {
  authCases,
  middlewareCases,
  auctionCases,
  bidCases,
  listCases,
  userCases,
  adminCases,
  uploadCases,
  contactCases,
  modelCases,
  socketCases,
  securityCases,
  stateCases,
  dtCases,
  e2eCases,
  linkCases,
  dockerCases
};

export default allCases;
