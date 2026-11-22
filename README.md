# Software Testing Portfolio: Online Auction System

[![Test Suite](https://github.com/sindhublava-2131/Software-Testing-Portfolio/actions/workflows/test.yml/badge.svg)](https://github.com/sindhublava-2131/Software-Testing-Portfolio/actions/workflows/test.yml)

## Student & Academic Information

- **Institution**: Ramaiah Institute of Technology, Bengaluru
- **Department**: Information Science and Engineering
- **Subject**: Software Testing (7th Semester, Section "B")
- **Faculty Guide**: Mrs. Pushpalatha Nidagal
- **Project Team**:
  - **Omprakash Panda** ([@Omprakash-p06](https://github.com/Omprakash-p06) / `omprakash11273@gmail.com`) — `1MS24IS411`
  - **Sindhu BL** ([@sindhublava-2131](https://github.com/sindhublava-2131) / `sindhublava3105@gmail.com`) — `1MS24IS413`
  - **Vittal GB** ([@Vittalgb-05](https://github.com/Vittalgb-05) / `vittalgb2005@gmail.com`) — `1MS23IS151`

## System Under Test (SUT)

- **Target Repository**: [theavnishkumar/online-auction-system](https://github.com/theavnishkumar/online-auction-system)
- **Pinned Commit SHA**: `ecd4de475fdf49d54153ffaa57d42b392161007a`
- **Architecture**: Full-stack MERN with Socket.IO real-time bidding, Cloudinary direct image upload signatures, and Tailwind CSS.

## Test Portfolio Architecture & Directory Layout

```text
Software-Testing-Portfolio/
├── 01_Test_Plan/
│   ├── Test_Plan.md                 # IEEE 829 test plan & quality strategy
│   └── architecture.mmd             # System architecture & test boundaries
├── 02_Test_Case_Design/
│   ├── 1_Equivalence_Partitioning.md# EP input class derivations
│   ├── 2_Boundary_Value_Analysis.md # BVA 2-value & 3-value boundary test designs
│   ├── 3_Decision_Tables.md         # Multi-condition decision logic rules
│   ├── 4_State_Transition.md        # State machine transition matrices & diagrams
│   └── Test_Case_Catalog.md         # Comprehensive 252 test case catalogue
├── 03_Test_Execution/
│   ├── Execution_Log.md             # Execution audit trail with status for every TC
│   └── raw/                         # Raw machine outputs (vitest.json, playwright.json, audit, logs)
├── 04_Defect_Reports/
│   ├── Defects.md                   # Complete index of 18 confirmed defects
│   └── D-01.md .. D-18.md           # Individual defect dossiers with reproduction steps
├── 05_Test_Automation/
│   ├── api/                         # Supertest API suites for Auth, Auction, Bid, Admin, User, etc.
│   ├── unit/                        # Middleware and Mongoose schema unit tests
│   ├── socket/                      # Socket.IO concurrency and race condition tests
│   ├── security/                    # Penetration, NoSQL injection, and JWT security tests
│   ├── e2e/                         # Playwright E2E UI automation with screenshot captures
│   └── docker/                      # Containerization verification configs
├── 06_Test_Reports/
│   ├── Summary.md                   # Comprehensive metric analysis & pass rates
│   └── coverage/                    # LCOV and HTML V8 code coverage reports
├── 07_Screenshots/                  # 42 high-resolution E2E step screenshots
├── docs/
│   └── ST_OtherComponent.docx       # Populated academic Word submission document
├── README.md                        # Portfolio overview and setup instructions
└── Conclusion.md                    # Retrospective, limitations, and future enhancements
```

## How to Execute the Suite

```powershell
# 1. Install dependencies
cd 05_Test_Automation
npm install
npx playwright install chromium

# 2. Run all API, Unit, Socket, and Security test suites with coverage
npm run coverage

# 3. Run Playwright E2E UI tests and capture screenshots
npx playwright test

# 4. Run Route and Link Crawler
npm run test:links
```
