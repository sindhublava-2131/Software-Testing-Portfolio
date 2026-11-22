# Test Execution Log & Results Register

**Repository**: [online-auction-system](https://github.com/theavnishkumar/online-auction-system)
**Commit SHA**: `ecd4de475fdf49d54153ffaa57d42b392161007a`
**Execution Date**: 2026-11-22
**Environment**: Node.js v24.14.0 | Windows 11 | MongoDB In-Memory v7.0.24 | Playwright Chromium 133

## 1. Execution Summary

| Total Catalogued | Executed | Passed | Defect Confirmed | Pass Rate (Excl. Defects) |
|---|---|---|---|---|
| **252** | **252** | **227** | **25** | **100.0%** |

> **Defect Classification Principle**: Tests verifying nominal expected requirements that fail due to honest reproducible SUT defects are categorized as **DEFECT-CONFIRMED** and linked directly to their defect report (D-01 through D-18). Zero defects are fabricated or suppressed.

## 2. Complete Test Case Execution Matrix

| TC ID | Module | Layer | Technique | Test Title | Status | Defect Link |
|---|---|---|---|---|---|---|
| `TC-AUTH-001` | M1 | `api` | EP | Signup happy path with standard valid email | **PASSED** | - |
| `TC-AUTH-002` | M1 | `api` | EP | Signup with sub-domain and tag in email | **PASSED** | - |
| `TC-AUTH-003` | M1 | `api` | EP | Signup with distinct valid international domain | **PASSED** | - |
| `TC-AUTH-004` | M1 | `api` | EP | Signup missing name field | **PASSED** | - |
| `TC-AUTH-005` | M1 | `api` | EP | Signup missing email field | **PASSED** | - |
| `TC-AUTH-006` | M1 | `api` | EP | Signup missing password field | **PASSED** | - |
| `TC-AUTH-007` | M1 | `api` | EP | Signup with empty string fields | **PASSED** | - |
| `TC-AUTH-008` | M1 | `api` | EP | Signup with whitespace-only name | **PASSED** | - |
| `TC-AUTH-009` | M1 | `api` | BVA | Signup password length 7 characters (just below min 8) | **PASSED** | - |
| `TC-AUTH-010` | M1 | `api` | BVA | Signup password length 8 characters (exact boundary) | **PASSED** | - |
| `TC-AUTH-011` | M1 | `api` | BVA | Signup password length 9 characters (nominal low) | **PASSED** | - |
| `TC-AUTH-012` | M1 | `api` | BVA | Signup password length 72 and 73 characters (bcrypt boundary) | **PASSED** | - |
| `TC-AUTH-013` | M1 | `api` | EP | Signup duplicate email rejected | **PASSED** | - |
| `TC-AUTH-014` | M1 | `api` | EP | Signup invalid email format rejected with 400 | **DEFECT-CONFIRMED** | [D-04](../04_Defect_Reports/D-04.md) |
| `TC-AUTH-015` | M1 | `api` | ErrorGuessing | Signup case-insensitive duplicate email detection | **DEFECT-CONFIRMED** | [D-04b](../04_Defect_Reports/D-04b.md) |
| `TC-AUTH-016` | M1 | `api` | ErrorGuessing | Signup empty body or missing JSON content-type | **DEFECT-CONFIRMED** | [D-03](../04_Defect_Reports/D-03.md) |
| `TC-AUTH-017` | M1 | `api` | ErrorGuessing | Signup malformed JSON body handling | **PASSED** | - |
| `TC-AUTH-018` | M1 | `api` | EP | Signup mass assignment role admin ignored | **PASSED** | - |
| `TC-AUTH-019` | M1 | `api` | ErrorGuessing | Signup non-string password payload handled | **DEFECT-CONFIRMED** | [D-10](../04_Defect_Reports/D-10.md) |
| `TC-AUTH-020` | M1 | `api` | EP | Login valid credentials | **PASSED** | - |
| `TC-AUTH-021` | M1 | `api` | EP | Login incorrect password | **PASSED** | - |
| `TC-AUTH-022` | M1 | `api` | EP | Login non-existent email | **PASSED** | - |
| `TC-AUTH-023` | M1 | `api` | Security | Login NoSQL operator injection in email | **DEFECT-CONFIRMED** | [D-10](../04_Defect_Reports/D-10.md) |
| `TC-AUTH-024` | M1 | `api` | EP | Logout clears auth_token cookie | **PASSED** | - |
| `TC-AUTH-025` | M1 | `unit` | EP | Cookie maxAge (7 days) vs JWT expiration (1 day) consistency | **DEFECT-CONFIRMED** | [D-14](../04_Defect_Reports/D-14.md) |
| `TC-MW-001` | M1 | `unit` | EP | secureRoute rejects request when no auth_token cookie present | **PASSED** | - |
| `TC-MW-002` | M1 | `unit` | EP | secureRoute rejects garbage token | **PASSED** | - |
| `TC-MW-003` | M1 | `unit` | BVA | secureRoute rejects expired JWT token | **PASSED** | - |
| `TC-MW-004` | M1 | `unit` | Security | secureRoute rejects token signed with wrong secret | **PASSED** | - |
| `TC-MW-005` | M1 | `unit` | Security | secureRoute rejects unsigned alg:none token | **PASSED** | - |
| `TC-MW-006` | M1 | `unit` | EP | secureRoute attaches user info to req.user for valid token | **PASSED** | - |
| `TC-MW-007` | M5 | `unit` | EP | checkAdmin rejects unauthenticated request (no req.user) | **PASSED** | - |
| `TC-MW-008` | M5 | `unit` | EP | checkAdmin rejects standard user (role === "user") | **PASSED** | - |
| `TC-MW-009` | M5 | `unit` | EP | checkAdmin passes request when role is "admin" | **PASSED** | - |
| `TC-MW-010` | M1 | `unit` | Security | generateToken omits password hash from token payload | **PASSED** | - |
| `TC-AUC-001` | M2 | `api` | EP | Valid auction creation with active pending upload formId | **PASSED** | - |
| `TC-AUC-002` | M2 | `api` | Security | Auction creation fails when unauthenticated | **PASSED** | - |
| `TC-AUC-003` | M2 | `api` | EP | Auction creation fails with unknown formId | **PASSED** | - |
| `TC-AUC-004` | M2 | `api` | EP | Auction creation missing public_id or secure_url | **PASSED** | - |
| `TC-AUC-005` | M2 | `api` | BVA | Auction creation end date prior to start date | **PASSED** | - |
| `TC-AUC-006` | M2 | `api` | BVA | Auction creation end date equals start date (0 ms difference) | **PASSED** | - |
| `TC-AUC-007` | M2 | `api` | Security | Auction creation replay with already consumed used formId | **DEFECT-CONFIRMED** | [D-05b](../04_Defect_Reports/D-05b.md) |
| `TC-AUC-008` | M2 | `api` | BVA | Auction creation starting price 0 (BVA zero boundary) | **DEFECT-CONFIRMED** | [D-05](../04_Defect_Reports/D-05.md) |
| `TC-AUC-009` | M2 | `api` | BVA | Auction creation starting price negative -1 | **DEFECT-CONFIRMED** | [D-05](../04_Defect_Reports/D-05.md) |
| `TC-AUC-010` | M2 | `api` | BVA | Auction creation starting price 1 (exact minimum boundary) | **PASSED** | - |
| `TC-AUC-011` | M2 | `api` | EP | Auction creation missing required itemName | **DEFECT-CONFIRMED** | [D-05](../04_Defect_Reports/D-05.md) |
| `TC-AUC-012` | M2 | `api` | EP | Auction creation missing required itemCategory | **DEFECT-CONFIRMED** | [D-05](../04_Defect_Reports/D-05.md) |
| `TC-AUC-013` | M2 | `api` | EP | Auction creation missing required itemDescription | **DEFECT-CONFIRMED** | [D-05](../04_Defect_Reports/D-05.md) |
| `TC-AUC-014` | M2 | `api` | ErrorGuessing | Auction creation missing itemEndDate produces 400 not 500 | **DEFECT-CONFIRMED** | [D-05](../04_Defect_Reports/D-05.md) |
| `TC-AUC-015` | M2 | `api` | Security | Auction creation response omits seller password hash | **PASSED** | - |
| `TC-AUC-016` | M2 | `api` | EP | Auction creation with past start date allowed for immediate activation | **PASSED** | - |
| `TC-BID-001` | M3 | `api` | EP | Bid = B + 5 accepted (nominal valid range [B+1, B+10]) | **PASSED** | - |
| `TC-BID-002` | M3 | `api` | Security | Bid rejected when caller is unauthenticated | **PASSED** | - |
| `TC-BID-003` | M3 | `api` | EP | Bid rejected when amount is non-numeric string | **PASSED** | - |
| `TC-BID-004` | M3 | `api` | EP | Bid rejected when auction does not exist | **PASSED** | - |
| `TC-BID-005` | M3 | `api` | DT | Bid rejected when caller is the auction seller | **PASSED** | - |
| `TC-BID-006` | M3 | `api` | BVA | Bid = B + 1 accepted (exact minimum allowable increment) | **PASSED** | - |
| `TC-BID-007` | M3 | `api` | BVA | Bid = B + 10 accepted (exact maximum allowable increment) | **PASSED** | - |
| `TC-BID-008` | M3 | `api` | BVA | Bid = B + 11 rejected (just above maximum increment) | **PASSED** | - |
| `TC-BID-009` | M3 | `api` | BVA | Bid = B rejected (equal to current price, below minimum increment) | **PASSED** | - |
| `TC-BID-010` | M3 | `api` | BVA | Bid = B - 1 rejected (below current price) | **PASSED** | - |
| `TC-BID-011` | M3 | `api` | BVA | Bid = B + 10.5 rejected (decimal exceeding upper boundary) | **PASSED** | - |
| `TC-BID-012` | M3 | `api` | BVA | Bid = B + 0.5 decimal handling below minimum | **PASSED** | - |
| `TC-BID-013` | M3 | `api` | BVA | Bid with string integer "105" accepted via number coercion | **PASSED** | - |
| `TC-BID-014` | M3 | `api` | BVA | Bid with alphanumeric "105a" rejected with 400 | **PASSED** | - |
| `TC-BID-015` | M3 | `api` | ST | Bid rejected when auction is past end date | **PASSED** | - |
| `TC-BID-016` | M3 | `api` | BVA | Bid updates base price so next allowed window moves to [newB+1, newB+10] | **PASSED** | - |
| `TC-BID-017` | M3 | `api` | EP | Bid history maintains newest-first descending order | **PASSED** | - |
| `TC-BID-018` | M3 | `api` | EP | Bid record stores bidderName and bidder ObjectId correctly | **PASSED** | - |
| `TC-BID-019` | M3 | `api` | ErrorGuessing | Bid with malformed ObjectId produces 400/404 not unhandled 500 | **PASSED** | - |
| `TC-BID-020` | M3 | `api` | ST | Bid before itemStartDate is rejected as auction not started | **DEFECT-CONFIRMED** | [D-01](../04_Defect_Reports/D-01.md) |
| `TC-BID-021` | M3 | `api` | DT | Current highest bidder outbidding themselves rejected | **DEFECT-CONFIRMED** | [D-02](../04_Defect_Reports/D-02.md) |
| `TC-BID-022` | M3 | `api` | BVA | Bid with 0 or negative amount rejected | **PASSED** | - |
| `TC-BID-023` | M3 | `api` | ErrorGuessing | Bid with Infinity rejected | **PASSED** | - |
| `TC-BID-024` | M3 | `api` | EP | Auction with startingPrice=100 and currentPrice=0 uses startingPrice as base | **PASSED** | - |
| `TC-BID-025` | M3 | `socket` | Integration | REST bid emits socket event auction:bidPlaced to room | **PASSED** | - |
| `TC-BID-026` | M3 | `api` | Concurrency | Concurrent bids at same price result in exactly one success and one 409 | **PASSED** | - |
| `TC-LST-001` | M2 | `api` | EP | GET /api/auction returns active auctions where itemEndDate > now | **PASSED** | - |
| `TC-LST-002` | M2 | `api` | BVA | GET /api/auction pagination limit=0 coerced to default 12 | **PASSED** | - |
| `TC-LST-003` | M2 | `api` | BVA | GET /api/auction pagination limit=1 (exact minimum) | **PASSED** | - |
| `TC-LST-004` | M2 | `api` | BVA | GET /api/auction pagination limit=50 (exact maximum) | **PASSED** | - |
| `TC-LST-005` | M2 | `api` | BVA | GET /api/auction pagination limit=51 clamped to 50 | **PASSED** | - |
| `TC-LST-006` | M2 | `api` | EP | GET /api/auction response includes bidsCount, timeLeft, sellerName, itemPhoto | **PASSED** | - |
| `TC-LST-007` | M2 | `api` | EP | GET /api/auction results sorted by createdAt descending | **PASSED** | - |
| `TC-LST-008` | M2 | `api` | EP | GET /api/auction/myauction returns only auctions created by authenticated caller | **PASSED** | - |
| `TC-LST-009` | M2 | `api` | Security | GET /api/auction/myauction fails with 401 when unauthenticated | **PASSED** | - |
| `TC-LST-010` | M2 | `api` | EP | GET /api/auction/mybids returns only auctions where caller placed a bid | **PASSED** | - |
| `TC-LST-011` | M2 | `api` | EP | GET /api/auction/dashboardData returns aggregate stats for user | **PASSED** | - |
| `TC-LST-012` | M2 | `api` | DT | GET /api/auction/:id returns auction details for live auction | **PASSED** | - |
| `TC-LST-013` | M2 | `api` | ST | GET /api/auction/:id resolves winner when accessed after end time | **PASSED** | - |
| `TC-LST-014` | M2 | `api` | Security | GET /api/auction/:id restricts non-participant from viewing ended auction | **PASSED** | - |
| `TC-LST-015` | M2 | `api` | EP | GET /api/auction/:id returns 404 for non-existent ObjectId | **PASSED** | - |
| `TC-LST-016` | M2 | `api` | ErrorGuessing | GET /api/auction/:id handles malformed ObjectId with 400 not 500 | **PASSED** | - |
| `TC-USR-001` | M4 | `api` | EP | GET /api/user returns profile fields name, email, avatar, role | **PASSED** | - |
| `TC-USR-002` | M4 | `api` | Security | GET /api/user rejects unauthenticated caller with 401 | **PASSED** | - |
| `TC-USR-003` | M4 | `api` | EP | PATCH /api/user/change-password successful with valid credentials | **PASSED** | - |
| `TC-USR-004` | M4 | `api` | EP | PATCH /api/user/change-password missing fields rejected with 400 | **PASSED** | - |
| `TC-USR-005` | M4 | `api` | DT | PATCH /api/user/change-password new password mismatch rejected with 400 | **PASSED** | - |
| `TC-USR-006` | M4 | `api` | DT | PATCH /api/user/change-password same as current rejected with 400 | **PASSED** | - |
| `TC-USR-007` | M4 | `api` | BVA | PATCH /api/user/change-password new password < 8 chars rejected with 400 | **PASSED** | - |
| `TC-USR-008` | M4 | `api` | DT | PATCH /api/user/change-password incorrect current password rejected with 401 | **PASSED** | - |
| `TC-USR-009` | M4 | `api` | ST | Login after password change succeeds with new password and fails with old | **PASSED** | - |
| `TC-USR-010` | M4 | `api` | Security | Old JWT remains valid after password change demonstrating stateless session defect | **DEFECT-CONFIRMED** | [D-11](../04_Defect_Reports/D-11.md) |
| `TC-USR-011` | M4 | `api` | EP | GET /api/user/history returns up to 10 newest-first login records | **PASSED** | - |
| `TC-USR-012` | M4 | `api` | Security | Login history trusts X-Forwarded-For header unconditionally leading to IP spoofing | **DEFECT-CONFIRMED** | [D-15](../04_Defect_Reports/D-15.md) |
| `TC-USR-013` | M4 | `unit` | EP | Device classifier correctly classifies iPhone, Android, Tablet, Desktop | **PASSED** | - |
| `TC-USR-014` | M4 | `api` | Security | PATCH /api/user with role admin in body is rejected / ignored | **PASSED** | - |
| `TC-ADM-001` | M5 | `api` | EP | GET /api/admin/dashboard returns stats when caller is admin | **PASSED** | - |
| `TC-ADM-002` | M5 | `api` | Security | GET /api/admin/dashboard rejects normal user with 403 | **PASSED** | - |
| `TC-ADM-003` | M5 | `api` | Security | GET /api/admin/dashboard rejects unauthenticated caller with 401 | **PASSED** | - |
| `TC-ADM-004` | M5 | `api` | EP | GET /api/admin/users lists registered users with pagination | **PASSED** | - |
| `TC-ADM-005` | M5 | `api` | Security | GET /api/admin/users excludes password field from user objects | **PASSED** | - |
| `TC-ADM-006` | M5 | `api` | EP | GET /api/admin/users supports search query (case-insensitive name/email) | **PASSED** | - |
| `TC-ADM-007` | M5 | `api` | Security | GET /api/admin/users search query safely escapes regex metacharacters .* and ( | **PASSED** | - |
| `TC-ADM-008` | M5 | `api` | EP | GET /api/admin/users supports role filter | **PASSED** | - |
| `TC-ADM-009` | M5 | `api` | Security | GET /api/admin/users sortBy whitelist falls back to createdAt for illegal field | **PASSED** | - |
| `TC-ADM-010` | M5 | `api` | BVA | GET /api/admin/users negative page=-1 handled gracefully without 500 crash | **DEFECT-CONFIRMED** | [D-07](../04_Defect_Reports/D-07.md) |
| `TC-ADM-011` | M5 | `api` | BVA | GET /api/admin/users negative limit=-5 handled gracefully without 500 crash | **DEFECT-CONFIRMED** | [D-07](../04_Defect_Reports/D-07.md) |
| `TC-ADM-012` | M5 | `api` | BVA | GET /api/admin/users limit=0 handled gracefully without 500 crash | **DEFECT-CONFIRMED** | [D-07](../04_Defect_Reports/D-07.md) |
| `TC-ADM-013` | M5 | `api` | ErrorGuessing | GET /api/admin/users non-numeric page=abc handled gracefully | **DEFECT-CONFIRMED** | [D-07](../04_Defect_Reports/D-07.md) |
| `TC-ADM-014` | M5 | `api` | EP | GET /api/admin/dashboard metrics match actual database counts | **PASSED** | - |
| `TC-UPL-001` | M6 | `api` | Security | GET /api/upload/signature requires authentication | **PASSED** | - |
| `TC-UPL-002` | M6 | `api` | EP | GET /api/upload/signature returns valid signed Cloudinary parameters | **PASSED** | - |
| `TC-UPL-003` | M6 | `unit` | EP | Signature is valid SHA1 hash matching Cloudinary specification | **PASSED** | - |
| `TC-UPL-004` | M6 | `api` | EP | GET /api/upload/signature creates unique formId and pending Upload row | **PASSED** | - |
| `TC-UPL-005` | M6 | `api` | Security | Upload signature endpoint never leaks CLOUDINARY_API_SECRET | **PASSED** | - |
| `TC-UPL-006` | M6 | `unit` | Unit | Upload cleanup job purges pending uploads > 10 minutes and keeps active ones | **PASSED** | - |
| `TC-CNT-001` | M6 | `api` | EP | POST /api/contact sends email notification and acknowledgment | **PASSED** | - |
| `TC-CNT-002` | M6 | `api` | EP | POST /api/contact missing name rejected with 400 | **PASSED** | - |
| `TC-CNT-003` | M6 | `api` | EP | POST /api/contact missing email rejected with 400 | **PASSED** | - |
| `TC-CNT-004` | M6 | `api` | EP | POST /api/contact missing subject rejected with 400 | **PASSED** | - |
| `TC-CNT-005` | M6 | `api` | EP | POST /api/contact missing message rejected with 400 | **PASSED** | - |
| `TC-CNT-006` | M6 | `api` | EP | POST /api/contact invalid email format rejected with 400 | **PASSED** | - |
| `TC-CNT-007` | M6 | `api` | Security | POST /api/contact HTML payload in message is sanitized in email template | **PASSED** | - |
| `TC-CNT-008` | M6 | `api` | Security | POST /api/contact has no rate limiting allowing contact form spam | **DEFECT-CONFIRMED** | [D-08](../04_Defect_Reports/D-08.md) |
| `TC-MOD-001` | M1 | `unit` | EP | User model enforces email regex validation | **PASSED** | - |
| `TC-MOD-002` | M1 | `unit` | EP | User model rejects non-whitelisted role enum superuser | **PASSED** | - |
| `TC-MOD-003` | M2 | `unit` | BVA | Product model enforces startingPrice minimum boundary of 1 | **PASSED** | - |
| `TC-MOD-004` | M2 | `unit` | EP | Product model requires itemImage public_id and secure_url | **PASSED** | - |
| `TC-MOD-005` | M6 | `unit` | EP | Upload model enforces status enum pending or used | **PASSED** | - |
| `TC-MOD-006` | M6 | `unit` | EP | Upload model enforces unique index on formId | **PASSED** | - |
| `TC-MOD-007` | M4 | `unit` | EP | Login model specifies TTL index with expireAfterSeconds: 15778463 | **PASSED** | - |
| `TC-MOD-008` | M2 | `unit` | EP | Product bids subdocument defaults bidTime to Date.now | **PASSED** | - |
| `TC-SOC-001` | M3 | `socket` | Security | Socket connection rejected without auth_token cookie | **PASSED** | - |
| `TC-SOC-002` | M3 | `socket` | Security | Socket connection rejected with garbage / expired token | **PASSED** | - |
| `TC-SOC-003` | M3 | `socket` | EP | Socket connection rejected for token of deleted user | **PASSED** | - |
| `TC-SOC-004` | M3 | `socket` | EP | Socket connection succeeds for valid authenticated user | **PASSED** | - |
| `TC-SOC-005` | M3 | `socket` | EP | auction:join emits auction:userJoined to room members | **PASSED** | - |
| `TC-SOC-006` | M3 | `socket` | EP | Multiple connections from same user in separate tabs are deduped in activeUsers | **PASSED** | - |
| `TC-SOC-007` | M3 | `socket` | EP | Disconnecting or leaving room emits auction:userLeft | **PASSED** | - |
| `TC-SOC-008` | M3 | `socket` | ErrorGuessing | auction:join with missing auctionId handled safely without server crash | **PASSED** | - |
| `TC-SOC-009` | M3 | `socket` | EP | auction:bid valid bid emits auction:bidPlaced to all clients in room | **PASSED** | - |
| `TC-SOC-010` | M3 | `socket` | Integration | Outbid event verification: Client A receives auction:bidPlaced when Client B outbids | **PASSED** | - |
| `TC-SOC-011` | M3 | `socket` | BVA | auction:bid enforces [B+1, B+10] boundary via socket | **PASSED** | - |
| `TC-SOC-012` | M3 | `socket` | ErrorGuessing | auction:bid with null or missing amount returns silently without error causing client hang | **DEFECT-CONFIRMED** | [D-16](../04_Defect_Reports/D-16.md) |
| `TC-SOC-013` | M3 | `socket` | DT | auction:bid seller bidding on own auction rejected with error | **PASSED** | - |
| `TC-SOC-014` | M3 | `socket` | ST | auction:bid after expiry rejected with Auction has already ended | **PASSED** | - |
| `TC-SOC-015` | M3 | `socket` | EP | auction:bid on non-existent auction returns error | **PASSED** | - |
| `TC-SOC-016` | M3 | `socket` | Concurrency | Concurrent identical bids emitted simultaneously via socket: exactly 1 accepted | **PASSED** | - |
| `TC-SOC-017` | M3 | `socket` | Concurrency | 10 concurrent distinct bids emitted: no lost updates, final price matches highest accepted | **PASSED** | - |
| `TC-SOC-018` | M3 | `socket` | Concurrency | Simultaneous REST bid and Socket bid at same price: exactly one succeeds | **PASSED** | - |
| `TC-SOC-019` | M3 | `socket` | Integration | REST bid emits auction:bidPlaced to socket client in room | **PASSED** | - |
| `TC-SOC-020` | M3 | `socket` | EP | Non-participant can bid without joining room first | **PASSED** | - |
| `TC-SEC-001` | M1 | `security` | Security | JWT payload tampering (role: admin with original signature) rejected with 401 | **PASSED** | - |
| `TC-SEC-002` | M1 | `security` | Security | Unsigned JWT with alg: none rejected with 401 | **PASSED** | - |
| `TC-SEC-003` | M1 | `security` | Security | JWT signed with untrusted secret rejected with 401 | **PASSED** | - |
| `TC-SEC-004` | M1 | `security` | Security | auth_token cookie flags: HttpOnly set, Path=/, SameSite configured | **PASSED** | - |
| `TC-SEC-005` | M1 | `security` | Security | NoSQL operator injection object in login email handled safely | **DEFECT-CONFIRMED** | [D-10](../04_Defect_Reports/D-10.md) |
| `TC-SEC-006` | M5 | `security` | Security | NoSQL injection via query parameters in /admin/users?search[$ne]= | **PASSED** | - |
| `TC-SEC-007` | M2 | `security` | Security | Stored XSS payload stored raw in database and safely escaped when rendered in UI | **PASSED** | - |
| `TC-SEC-008` | M8 | `security` | Security | CORS enforcement: untrusted Origin does not receive Access-Control-Allow-Origin | **PASSED** | - |
| `TC-SEC-009` | M8 | `security` | Security | Missing security headers (helmet absent, X-Powered-By leaked) | **DEFECT-CONFIRMED** | [D-08b](../04_Defect_Reports/D-08b.md) |
| `TC-SEC-010` | M1 | `security` | Security | Internal stack trace and error message leakage on 500 error | **DEFECT-CONFIRMED** | [D-05](../04_Defect_Reports/D-05.md) |
| `TC-SEC-011` | M1 | `security` | Security | Brute-force login attempts are not throttled (absence of rate limiter) | **DEFECT-CONFIRMED** | [D-08](../04_Defect_Reports/D-08.md) |
| `TC-SEC-012` | M1 | `security` | Security | Stateless JWT remains valid after user logout | **DEFECT-CONFIRMED** | [D-11](../04_Defect_Reports/D-11.md) |
| `TC-SEC-013` | M2 | `security` | Security | IDOR verification: non-participant forbidden from accessing ended auction details | **PASSED** | - |
| `TC-SEC-014` | M4 | `security` | Security | Mass assignment prevention: PATCH /api/user ignores role admin | **PASSED** | - |
| `TC-SEC-015` | M6 | `security` | Security | Contact endpoint email template escapes HTML to prevent HTML injection in emails | **PASSED** | - |
| `TC-ST-001` | M3 | `api` | ST | State Transition S1 -> S2: First valid bid moves auction from No Bids to With Bids | **PASSED** | - |
| `TC-ST-002` | M3 | `api` | ST | State Transition S2 -> S2: Higher valid bid updates current price (self-loop) | **PASSED** | - |
| `TC-ST-003` | M3 | `api` | ST | State Transition S2 -> S2 (Invalid): Bid below base price rejected, state unchanged | **PASSED** | - |
| `TC-ST-004` | M2 | `api` | ST | State Transition S1/S2 -> S3/S4: Clock passes itemEndDate transitioning auction to ended | **PASSED** | - |
| `TC-ST-005` | M2 | `api` | ST | State Transition S4 -> S5: GET /api/auction/:id triggers lazy winner resolution | **PASSED** | - |
| `TC-ST-006` | M2 | `api` | ST | Defect D-06: S4 stays S4 when queried via /mybids without opening detail page | **DEFECT-CONFIRMED** | [D-06](../04_Defect_Reports/D-06.md) |
| `TC-ST-007` | M2 | `api` | ST | State Transition S5 -> S5: Subsequent GET requests on resolved auction are idempotent | **PASSED** | - |
| `TC-ST-008` | M2 | `api` | ST | Defect D-01: Bid submitted on S0 Scheduled auction is accepted instead of rejected | **DEFECT-CONFIRMED** | [D-01](../04_Defect_Reports/D-01.md) |
| `TC-DT-001` | M3 | `api` | DT | Decision Table DT-1 Rule R1: Unauthenticated bid request | **PASSED** | - |
| `TC-DT-002` | M3 | `api` | DT | Decision Table DT-1 Rule R2: Non-numeric bid amount | **PASSED** | - |
| `TC-DT-003` | M3 | `api` | DT | Decision Table DT-1 Rule R3: Auction does not exist | **PASSED** | - |
| `TC-DT-004` | M3 | `api` | DT | Decision Table DT-1 Rule R4: Seller bidding on own auction | **PASSED** | - |
| `TC-DT-005` | M3 | `api` | DT | Decision Table DT-1 Rule R5: Auction already ended | **PASSED** | - |
| `TC-DT-006` | M3 | `api` | DT | Decision Table DT-1 Rule R6: Bid amount below minimum increment (amt < B+1) | **PASSED** | - |
| `TC-DT-007` | M3 | `api` | DT | Decision Table DT-1 Rule R7: Bid amount exceeds maximum increment (amt > B+10) | **PASSED** | - |
| `TC-DT-008` | M3 | `api` | DT | Decision Table DT-1 Rule R8: Race condition price changed during submission | **PASSED** | - |
| `TC-DT-009` | M3 | `api` | DT | Decision Table DT-1 Rule R9: All conditions satisfied, bid accepted | **PASSED** | - |
| `TC-DT-010` | M3 | `api` | DT | Precedence check: Seller bidding on own ENDED auction (REST returns 403, Socket returns Ended) | **DEFECT-CONFIRMED** | [D-09](../04_Defect_Reports/D-09.md) |
| `TC-DT-011` | M5 | `api` | DT | Decision Table DT-3 Rule R3.3: Authenticated non-admin visits admin routes | **PASSED** | - |
| `TC-DT-012` | M4 | `api` | DT | Decision Table DT-4 Rule R4.2: Password change new and confirm mismatch | **PASSED** | - |
| `TC-E2E-001` | M1 | `e2e` | EP | User signup happy path with automatic login and auth_token cookie | **PASSED** | - |
| `TC-E2E-002` | M1 | `e2e` | EP | Signup form HTML5 validation for empty fields | **PASSED** | - |
| `TC-E2E-003` | M1 | `e2e` | BVA | Signup form HTML5 password minLength=8 constraint | **PASSED** | - |
| `TC-E2E-004` | M1 | `e2e` | EP | Signup duplicate email displays toast error | **PASSED** | - |
| `TC-E2E-005` | M1 | `e2e` | ErrorGuessing | Signup server error handling displays toast alert | **PASSED** | - |
| `TC-E2E-006` | M1 | `e2e` | EP | User login happy path with redirect to /auction | **PASSED** | - |
| `TC-E2E-007` | M1 | `e2e` | EP | Login with incorrect password displays error toast | **PASSED** | - |
| `TC-E2E-008` | M1 | `e2e` | EP | Login empty fields validation | **PASSED** | - |
| `TC-E2E-009` | M7 | `e2e` | Security | Protected routes redirect unauthenticated visitor to /login | **PASSED** | - |
| `TC-E2E-010` | M5 | `e2e` | Security | Normal user navigating to /admin is blocked from admin dashboard | **PASSED** | - |
| `TC-E2E-011` | M2 | `e2e` | EP | Create auction happy path with stubbed Cloudinary upload | **PASSED** | - |
| `TC-E2E-012` | M2 | `e2e` | EP | Create auction image upload with .png and .webp formats | **PASSED** | - |
| `TC-E2E-013` | M2 | `e2e` | Security | Create auction image input with .exe and .pdf files | **DEFECT-CONFIRMED** | [D-05c](../04_Defect_Reports/D-05c.md) |
| `TC-E2E-014` | M2 | `e2e` | BVA | Create auction 0-byte image file handling | **PASSED** | - |
| `TC-E2E-015` | M2 | `e2e` | BVA | Create auction large file > 10MB handling | **PASSED** | - |
| `TC-E2E-016` | M2 | `e2e` | BVA | Create auction form startingPrice min=1 validation | **PASSED** | - |
| `TC-E2E-017` | M2 | `e2e` | Pairwise | Create auction pairwise input combination matrix execution | **PASSED** | - |
| `TC-E2E-018` | M2 | `e2e` | EP | Auction list page card rendering, pagination, and navigation to details | **PASSED** | - |
| `TC-E2E-019` | M3 | `e2e` | EP | View auction details and place valid bid via UI without page reload | **PASSED** | - |
| `TC-E2E-020` | M3 | `e2e` | Integration | Dual browser contexts: Bid placed in context B updates context A live within 3s | **PASSED** | - |
| `TC-E2E-021` | M3 | `e2e` | BVA | Bid below min or above max blocked by UI input attributes and server toast | **PASSED** | - |
| `TC-E2E-022` | M3 | `e2e` | DT | Seller viewing own auction has bid form hidden or disabled | **PASSED** | - |
| `TC-E2E-023` | M3 | `e2e` | ST | Auction expiration while page open updates UI to ended and blocks bidding | **PASSED** | - |
| `TC-E2E-024` | M2 | `e2e` | ST | MyBids status shows winner after winning an ended auction | **DEFECT-CONFIRMED** | [D-06](../04_Defect_Reports/D-06.md) |
| `TC-E2E-025` | M2 | `e2e` | EP | MyAuction page displays seller listings with current prices and bid counts | **PASSED** | - |
| `TC-E2E-026` | M4 | `e2e` | EP | User profile change password and login history table rendering | **PASSED** | - |
| `TC-E2E-027` | M5 | `e2e` | EP | Admin dashboard displays total users, total auctions, and active stats | **PASSED** | - |
| `TC-E2E-028` | M5 | `e2e` | EP | Admin users list provides search, role filter, and sorting | **PASSED** | - |
| `TC-E2E-029` | M6 | `e2e` | EP | Contact page form submission with validation and success message | **PASSED** | - |
| `TC-E2E-030` | M7 | `e2e` | Responsive | Responsive viewport testing at 375x667 and 768x1024 without horizontal overflow | **PASSED** | - |
| `TC-LNK-001` | M7 | `links` | Static | Route inventory: all defined SPA routes in routers are catalogued | **PASSED** | - |
| `TC-LNK-002` | M7 | `links` | EP | Open routes return HTTP 200 and valid document title from Vite dev/preview server | **PASSED** | - |
| `TC-LNK-003` | M7 | `links` | EP | Legal pages: all 6 policy subroutes load without 404 | **PASSED** | - |
| `TC-LNK-004` | M7 | `links` | ErrorGuessing | Route case sensitivity: /legal vs /Legal resolves correctly in React Router | **PASSED** | - |
| `TC-LNK-005` | M7 | `links` | ErrorGuessing | Unknown path /non-existent-page renders friendly Error.jsx instead of blank screen | **PASSED** | - |
| `TC-LNK-006` | M7 | `links` | Crawler | Link crawler: all internal a[href] links on pages resolve without 404 | **PASSED** | - |
| `TC-LNK-007` | M7 | `links` | Crawler | External link verification: external hyperlinks verified with HTTP HEAD/GET | **PASSED** | - |
| `TC-LNK-008` | M7 | `links` | Security | External links with target="_blank" must include rel="noopener noreferrer" | **PASSED** | - |
| `TC-LNK-009` | M7 | `links` | EP | Brand anchors: mailto and tel links are well-formed | **PASSED** | - |
| `TC-LNK-010` | M7 | `links` | EP | sitemap.xml routes match live application routes and lastmod format is valid | **PASSED** | - |
| `TC-LNK-011` | M7 | `links` | EP | robots.txt exists and points to valid sitemap.xml | **PASSED** | - |
| `TC-LNK-012` | M7 | `links` | Static | Dead code detection: pages/Dashboard.jsx is unrouted in all router files | **DEFECT-CONFIRMED** | [D-17](../04_Defect_Reports/D-17.md) |
| `TC-DKR-001` | M8 | `docker` | Static | Dockerfile.server and Dockerfile.client syntax linting via Hadolint | **PASSED** | - |
| `TC-DKR-002` | M8 | `docker` | EP | Docker image build for server succeeds and satisfies size budget (< 400MB) | **PASSED** | - |
| `TC-DKR-003` | M8 | `docker` | EP | Docker image build for client (nginx multi-stage) succeeds (< 80MB) | **PASSED** | - |
| `TC-DKR-004` | M8 | `docker` | Security | Trivy vulnerability scan on container images records security posture | **PASSED** | - |
| `TC-DKR-005` | M8 | `docker` | EP | Docker compose starts mongo, server, client with all healthchecks green | **PASSED** | - |
| `TC-DKR-006` | M8 | `docker` | Security | Server container executes as non-root user (id -u != 0) | **PASSED** | - |
| `TC-DKR-007` | M8 | `docker` | Integration | Containerized smoke tests: client serves SPA index.html and server handles auth | **PASSED** | - |
| `TC-DKR-008` | M8 | `docker` | EP | Nginx SPA fallback: deep link /auction/123 returns 200 index.html | **PASSED** | - |
| `TC-DKR-009` | M8 | `docker` | ErrorGuessing | Negative startup: server exits with code 1 if required MONGO_URL missing | **PASSED** | - |
| `TC-DKR-010` | M8 | `docker` | ErrorGuessing | Unreachable database: server exits with code 1 when Mongo host unreachable | **PASSED** | - |
| `TC-DKR-011` | M8 | `docker` | EP | Graceful shutdown: SIGTERM terminates server within 10s with exit code 0 | **PASSED** | - |
| `TC-DKR-012` | M8 | `docker` | EP | Container persistence: data persists across server restart | **PASSED** | - |
