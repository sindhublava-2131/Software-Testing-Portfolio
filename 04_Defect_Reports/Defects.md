# Defect Reports Register (D-01 through D-18)

This directory documents all **18 reproducible defects** identified during independent verification of the Online Auction System.

## Defect Inventory Summary

| Defect ID | Severity | Priority | Module | CWE | Defect Title | Associated Test Cases |
|---|---|---|---|---|---|---|
| [D-01](./D-01.md) | **Critical** | `P1` | M3 Live Bidding | `CWE-840` | Bidding permitted on future auctions before itemStartDate has elapsed | `TC-BID-020`, `TC-BVA-012`, `TC-ST-004` |
| [D-02](./D-02.md) | **High** | `P2` | M3 Live Bidding | `CWE-840` | Current highest bidder permitted to outbid themselves repeatedly | `TC-BID-021`, `TC-DT-004` |
| [D-03](./D-03.md) | **High** | `P1` | M1 Authentication | `CWE-209` | Body-less POST requests trigger unhandled TypeError resulting in HTTP 500 HTML stack dump | `TC-AUTH-010`, `TC-EP-008` |
| [D-04](./D-04.md) | **Medium** | `P2` | M1 Authentication | `CWE-388` | Signup validation failure returns HTTP 500 Internal Server Error instead of HTTP 400 | `TC-AUTH-014`, `TC-EP-005` |
| [D-04b](./D-04b.md) | **High** | `P2` | M1 Authentication | `CWE-178` | User signup duplicate detection is case-sensitive, permitting duplicate account collision | `TC-AUTH-015`, `TC-EP-006` |
| [D-05](./D-05.md) | **Medium** | `P2` | M2 Auction Management | `CWE-388` | Auction creation with invalid parameters returns HTTP 500 instead of HTTP 400 | `TC-AUC-008`, `TC-AUC-009`, `TC-AUC-011`, `TC-AUC-012`, `TC-AUC-013`, `TC-AUC-014`, `TC-BVA-007`, `TC-EP-015` |
| [D-05b](./D-05b.md) | **High** | `P1` | M2 Auction Management | `CWE-294` | Upload session formId replay vulnerability permits duplicate auction instantiation | `TC-AUC-007`, `TC-ST-008` |
| [D-06](./D-06.md) | **Medium** | `P3` | M2 Auction Management | `CWE-840` | MyBids listing does not resolve winning status on expired auctions unless individual page is visited | `TC-E2E-024`, `TC-ST-006` |
| [D-07](./D-07.md) | **Medium** | `P2` | M5 Administration | `CWE-1284` | Admin users pagination with negative page or limit triggers unhandled MongoDB BSON error 500 | `TC-ADM-010`, `TC-BVA-019` |
| [D-08](./D-08.md) | **High** | `P1` | M1 Auth & M6 Contact | `CWE-799` | Absence of rate limiting across authentication and public contact endpoints | `TC-CNT-008`, `TC-SEC-011` |
| [D-08b](./D-08b.md) | **Medium** | `P2` | M7 Architecture | `CWE-200` | Absence of HTTP security headers and sensitive technology disclosure (X-Powered-By) | `TC-SEC-009` |
| [D-09](./D-09.md) | **Low** | `P3` | M3 Live Bidding | `CWE-698` | Validation order divergence between REST API and Socket.IO for expired seller bidding | `TC-DT-008`, `TC-SOC-014` |
| [D-10](./D-10.md) | **High** | `P1` | M1 Authentication | `CWE-943` | NoSQL operator injection vulnerability in login authentication query | `TC-SEC-005`, `TC-AUTH-019` |
| [D-11](./D-11.md) | **High** | `P1` | M1 Auth & M4 Profile | `CWE-613` | Stateless JWT tokens remain active and valid following password modification and logout | `TC-USR-010`, `TC-SEC-012` |
| [D-12](./D-12.md) | **Medium** | `P3` | M7 Tooling | `CWE-1068` | ESLint 9 crash due to missing eslint.config.js flat configuration file | `TC-BL-001` |
| [D-13](./D-13.md) | **High** | `P2` | M7 Security | `CWE-1395` | High and Critical severity vulnerabilities in third-party dependency tree | `TC-BL-003` |
| [D-14](./D-14.md) | **Low** | `P3` | M1 Authentication | `CWE-1068` | Inconsistency between Cookie Max-Age (7 days) and JWT Expiration (1 day) | `TC-AUTH-025` |
| [D-15](./D-15.md) | **Medium** | `P2` | M4 Profile & Auditing | `CWE-290` | Spoofed X-Forwarded-For IP address unconditionally trusted for security audit logging | `TC-USR-013` |
| [D-16](./D-16.md) | **Medium** | `P2` | M3 Live Bidding | `CWE-754` | WebSocket bid with null or missing amount returns early without emitting auction:error | `TC-SOC-012` |
| [D-17](./D-17.md) | **Low** | `P4` | M7 Frontend Architecture | `CWE-1164` | Dead unreferenced component pages/Dashboard.jsx in client repository | `TC-LNK-003` |
| [D-18](./D-18.md) | **Low** | `P4` | M7 Frontend Architecture | `CWE-400` | Production Vite bundle generated as single monolithic 595.17 kB chunk exceeding chunk threshold | `TC-BL-002` |
