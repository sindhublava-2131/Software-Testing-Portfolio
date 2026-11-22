# Software Test Plan: Online Auction System

**System Under Test (SUT):** `theavnishkumar/online-auction-system`  
**Pinned Git Commit:** `ecd4de475fdf49d54153ffaa57d42b392161007a`  
**Repository:** [Software-Testing-Portfolio](https://github.com/sindhublava-2131/Software-Testing-Portfolio)  
**Academic Year:** 2026–2027 | **Semester & Section:** 7th Semester "B" Section  
**Subject:** Software Testing  
**Faculty Guide:** Mrs. Pushpalatha Nidagal  
**Team Members:**
- Omprakash Panda (1MS24IS411)
- Sindhu BL (1MS24IS413)
- Vittal GB (1MS23IS151)

---

## 1. Introduction & Application Understanding

The Online Auction System is a modern full-stack web application facilitating real-time auction listings, dynamic competitive bidding, user account management, and administrative oversight. The frontend client is built with React 19, Vite 6, Redux Toolkit (`authSlice`, `auctionSlice`), React Router 7, `@tanstack/react-query`, and `socket.io-client`. The backend service is constructed on Node.js 22 LTS with Express 5 REST APIs (`/api/auth`, `/api/user`, `/api/auction`, `/api/contact`, `/api/admin`, `/api/upload`) paired with Socket.io 4 for low-latency bidirectional real-time bidding events.

Persistence is handled by MongoDB (Mongoose 8) through four core models: `User` (credentials, role), `Product` (auction details with embedded `bids[]`), `Login` (audit trail with a ~6-month TTL index), and `Upload` (tracks signed media uploads). In production, media uploads leverage direct signed uploads to Cloudinary; contact form submissions trigger notifications via the Resend API; user logins perform IP geolocation via `ip-api.com`; and a scheduled `node-cron` background worker runs daily at 00:00 to prune orphaned uploads older than 10 minutes.

### System Architecture Diagram

```mermaid
graph TD
    subgraph Client["Client Tier (React 19 + Vite 6 + Tailwind CSS)"]
        UI[React Router 7 SPA Pages]
        Redux[Redux Toolkit: authSlice, auctionSlice]
        RQ[React Query Hooks & API Client]
        SIO_Client[Socket.io Client 4.x]
    end

    subgraph Server["Server Tier (Node.js 22 + Express 5)"]
        MW[Auth Middleware & Cookie Parser]
        REST[REST API Endpoints: /api/auth, /api/auction, /api/user, /api/admin, /api/upload, /api/contact]
        SIO_Server[Socket.io Server: /socket.io - auctionHandler]
        Cron[Node-Cron: Daily Unused Uploads Cleanup]
    end

    subgraph Data["Database Tier (MongoDB 7 + Mongoose 8)"]
        UserCol[(User Collection)]
        ProductCol[(Product Collection with embedded bids[])]
        LoginCol[(Login Collection with TTL Index)]
        UploadCol[(Upload Collection: pending/used)]
    end

    subgraph External["External Services (Mocked in Test Harness)"]
        Cloudinary[Cloudinary CDN: Signed Direct Uploads]
        Resend[Resend API: Contact Notification Emails]
        IP_API[ip-api.com: IP Geolocation Provider]
    end

    UI --> Redux
    UI --> RQ
    UI --> SIO_Client
    RQ -->|HTTP / JSON + Cookie| MW
    MW --> REST
    SIO_Client -->|WebSockets + Cookie| SIO_Server
    REST --> UserCol
    REST --> ProductCol
    REST --> LoginCol
    REST --> UploadCol
    SIO_Server --> ProductCol
    Cron --> UploadCol
    REST -.->|Signed params| Cloudinary
    REST -.->|Batch send| Resend
    REST -.->|Geo query| IP_API
```

---

## 2. Test Scope & Module Inventory

### 2.1 Modules In-Scope
| Module ID | Module Name | Server Entry Points | Client Entry Points |
|---|---|---|---|
| **M1** | User Authentication & RBAC | `auth.routes.js`, `auth.controller.js`, `auth.middleware.js`, `jwt.js`, `cookies.util.js` | `Login.jsx`, `Signup.jsx`, `authSlice.js`, `InitAuth.jsx`, router guards |
| **M2** | Auction Lifecycle Management | `auction.controller.js` (`createAuction`, `showAuction`, `auctionById`, `myAuction`, `dashboardData`), `upload.controller.js` | `CreateAuction.jsx`, `AuctionList.jsx`, `MyAuction.jsx`, `auctionSlice.js` |
| **M3** | Real-Time Live Bidding | `auction.controller.js` (`placeBid`), `socket/index.js`, `socket/auction.handler.js` | `ViewAuction.jsx`, `useSocket.js`, `MyBids.jsx` |
| **M4** | User Profile & Security Settings | `user.controller.js` (`handleGetUser`, `handleChangePassword`, `getLoginHistory`) | `Profile.jsx`, `Privacy.jsx` |
| **M5** | Administration & Moderation | `admin.routes.js`, `admin.controller.js`, `checkAdmin` middleware | `AdminDashboard.jsx`, `UsersList.jsx`, `AdminLayout.jsx` |
| **M6** | Contact & Inquiries | `contact.controller.js` (Resend integration) | `Contact.jsx` |
| **M7** | Navigation, Static Pages & Routing | N/A (Client SPA routes, static assets, sitemap) | `Landing.jsx`, `About.jsx`, `Legal/*` (6 policy pages), `Error.jsx`, `sitemap.xml`, `robots.txt` |
| **M8** | Platform, Build & Containerization | `server.js` (startup, graceful shutdown), `env.config.js` | Dockerfile, nginx SPA rewrite, environment validation |

### 2.2 Out-of-Scope Items
1. Live outbound network calls to external third-party paid APIs: Cloudinary CDN asset hosting, Resend production mail gateways, and live `ip-api.com` web service queries (all stubbed or mocked in test harnesses).
2. Production cloud deployment infrastructure (AWS EC2 / Vercel cloud hosting).
3. Extreme high-concurrency stress testing (> 50 simultaneous users).
4. Cross-browser validation outside the primary automated target (Chromium via Playwright).

---

## 3. Testing Techniques & Test Design

The test suite exercises black-box and grey-box methodologies strictly from outside the SUT source tree:
1. **Equivalence Partitioning (EP):** Partitioning inputs into valid and invalid equivalence classes for email schemas, password complexity, auction prices, date ranges, upload signatures, and RBAC roles.
2. **Boundary Value Analysis (BVA):** Precision testing at allowable extremes including bid increments $[B+1, B+10]$, password character limits (0, 7, 8, 9, 72, 73), auction starting prices (0, 1, 2), pagination limits, and JSON payload caps (100 KB).
3. **Decision Table Testing (DT):** Explicit multi-condition evaluation matrices for `POST /api/auction/:id/bid` (9 evaluation rules verifying authentication, numeric bounds, seller restrictions, expiry, and race handling), auction state resolution on `GET`, and admin authorization.
4. **State Transition Testing (ST):** Tracking auction entity states from $S_0$ Scheduled $\to S_1$ Live without bids $\to S_2$ Live with bids $\to S_3$ Ended without bids $\to S_4$ Ended unsettled $\to S_5$ Closed/Sold, with special verification of the SUT's lazy evaluation mechanism.
5. **Concurrency & Race Condition Analysis:** High-concurrency socket and REST race verification to validate MongoDB optimistic locking (`findOneAndUpdate` on `currentPrice`).

---

## 4. Test Levels & Tool Matrix

| Layer | Level | Primary Tools | Scope & Responsibilities |
|---|---|---|---|
| **L0** | Static Code Analysis & Supply Chain | ESLint 9, npm audit, SonarQube, gitleaks | Linting syntax, dependency vulnerabilities, static code smells, secret leaks |
| **L1** | Unit Testing | Vitest | Mongoose schema validators, JWT helpers, cookie builders, geo utility fallbacks |
| **L2** | API Integration Testing | Vitest + Supertest | REST endpoints across all controllers against MongoDB instance |
| **L3** | WebSocket / Real-Time Testing | Vitest + socket.io-client | Real Socket.io connection, room join/leave, bid broadcasts, concurrent bid races |
| **L4** | Security & Penetration Testing | Vitest + Supertest | JWT tampering, NoSQL injection, Stored XSS reflection, CORS enforcement, security headers |
| **L5** | End-to-End (E2E) UI Testing | Playwright (Chromium) | User journeys: signup, login, auction creation, real-time bid sync across dual browser contexts |
| **L6** | Links & Route Crawling | Playwright + Axios | HTTP route validation, case-sensitivity (`/legal` vs `/Legal`), link integrity, sitemap verification |
| **L7** | Containerization Testing | Docker, Docker Compose, Hadolint | Dockerfile linting, container builds, healthchecks, negative startup tests, graceful SIGTERM |
| **L8** | Mutation Testing (Additional Activity) | Stryker Mutator + Vitest Runner | Systematic mutant injection into controllers and middleware to calculate mutation survival score |
| **L9** | Performance Testing | Autocannon | Baseline throughput (req/sec), p50/p95/p99 response latency on listing and login endpoints |

---

## 5. Test Environment & Configuration

- **Operating System:** Windows 11 Professional (x64)
- **Node.js Runtime:** v24.14.0 LTS
- **Package Manager:** npm v11.9.0
- **Database Engine:** MongoDB 7.x (local instance / `mongodb-memory-server` isolation harness)
- **Automation Runner:** Vitest v3.x, Playwright v1.50+
- **Container Engine:** Docker Engine v29.4.3 / Docker Desktop

---

## 6. Entry and Exit Criteria

### Entry Criteria
1. SUT source code successfully fetched and pinned at commit `ecd4de475fdf49d54153ffaa57d42b392161007a`.
2. Both `.sut/server` and `.sut/client` dependencies installed cleanly without critical missing peer conflicts.
3. MongoDB database connection verified and operational.
4. Test harness environment variables initialized (`PORT`, `ORIGIN`, `MONGO_URL`, `JWT_SECRET`, dummy Cloudinary/Resend keys).

### Exit Criteria
1. 100% of planned test cases in the catalog executed.
2. Zero unexplained/unclassified test failures (all failures must correspond to pre-registered defect hypotheses `@defect:D-xx`).
3. Overall statement/line coverage on core server controllers, middleware, and utilities $\ge 80\%$.
4. Mutation score measured via Stryker with key boundary operators verified killed.
5. All confirmed defects comprehensively documented with exact steps to reproduce, expected vs. actual outcomes, and screenshot evidence.
