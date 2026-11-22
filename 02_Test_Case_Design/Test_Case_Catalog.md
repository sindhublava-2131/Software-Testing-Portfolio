# Master Test Case Catalog

**System Under Test:** theavnishkumar/online-auction-system (pinned at ecd4de475fdf49d54153ffaa57d42b392161007a)
**Total Test Cases:** 252

| Test Case ID | Module | Technique | Layer | Priority | Requirement | Description / Title | Expected Result | Defect Tag |
|---|---|---|---|---|---|---|---|---|
| TC-AUTH-001 | M1 | EP | api | P1 | FR-AUTH-1 | Signup happy path with standard valid email | User created in DB, bcrypt hash, role user, auth_token cookie set | - |
| TC-AUTH-002 | M1 | EP | api | P1 | FR-AUTH-1 | Signup with sub-domain and tag in email | Account created with valid tagged email | - |
| TC-AUTH-003 | M1 | EP | api | P1 | FR-AUTH-1 | Signup with distinct valid international domain | Account created successfully | - |
| TC-AUTH-004 | M1 | EP | api | P2 | FR-AUTH-1 | Signup missing name field | All fields are required | - |
| TC-AUTH-005 | M1 | EP | api | P2 | FR-AUTH-1 | Signup missing email field | All fields are required | - |
| TC-AUTH-006 | M1 | EP | api | P2 | FR-AUTH-1 | Signup missing password field | All fields are required | - |
| TC-AUTH-007 | M1 | EP | api | P2 | FR-AUTH-1 | Signup with empty string fields | All fields are required | - |
| TC-AUTH-008 | M1 | EP | api | P3 | FR-AUTH-1 | Signup with whitespace-only name | Trimmed name is empty, reject with 400 | - |
| TC-AUTH-009 | M1 | BVA | api | P2 | FR-AUTH-1 | Signup password length 7 characters (just below min 8) | Password must be at least 8 characters | - |
| TC-AUTH-010 | M1 | BVA | api | P1 | FR-AUTH-1 | Signup password length 8 characters (exact boundary) | User created | - |
| TC-AUTH-011 | M1 | BVA | api | P2 | FR-AUTH-1 | Signup password length 9 characters (nominal low) | User created | - |
| TC-AUTH-012 | M1 | BVA | api | P3 | FR-AUTH-1 | Signup password length 72 and 73 characters (bcrypt boundary) | User created | - |
| TC-AUTH-013 | M1 | EP | api | P1 | FR-AUTH-1 | Signup duplicate email rejected | User already exists | - |
| TC-AUTH-014 | M1 | EP | api | P2 | FR-AUTH-1 | Signup invalid email format rejected with 400 | Invalid email address validation error | D-04 |
| TC-AUTH-015 | M1 | ErrorGuessing | api | P2 | FR-AUTH-1 | Signup case-insensitive duplicate email detection | Duplicate account prevented regardless of case | D-04b |
| TC-AUTH-016 | M1 | ErrorGuessing | api | P2 | FR-AUTH-1 | Signup empty body or missing JSON content-type | Handled gracefully without 500 HTML stack trace | D-03 |
| TC-AUTH-017 | M1 | ErrorGuessing | api | P2 | FR-AUTH-1 | Signup malformed JSON body handling | Malformed JSON rejected with 400 | - |
| TC-AUTH-018 | M1 | EP | api | P1 | FR-AUTH-1 | Signup mass assignment role admin ignored | User created but role is user | - |
| TC-AUTH-019 | M1 | ErrorGuessing | api | P2 | FR-AUTH-1 | Signup non-string password payload handled | Non-string password rejected with 400 | D-10 |
| TC-AUTH-020 | M1 | EP | api | P1 | FR-AUTH-2 | Login valid credentials | Login successful, auth_token cookie set, Login record created | - |
| TC-AUTH-021 | M1 | EP | api | P1 | FR-AUTH-2 | Login incorrect password | Invalid email or password | - |
| TC-AUTH-022 | M1 | EP | api | P1 | FR-AUTH-2 | Login non-existent email | Identical generic error message to prevent user enumeration | - |
| TC-AUTH-023 | M1 | Security | api | P1 | FR-AUTH-2 | Login NoSQL operator injection in email | Rejected as invalid email or 401 unauthorized | D-10 |
| TC-AUTH-024 | M1 | EP | api | P2 | FR-AUTH-3 | Logout clears auth_token cookie | auth_token cookie cleared, subsequent protected GET fails with 401 | - |
| TC-AUTH-025 | M1 | EP | unit | P3 | FR-AUTH-4 | Cookie maxAge (7 days) vs JWT expiration (1 day) consistency | Cookie lifetime and JWT expiry are aligned | D-14 |
| TC-MW-001 | M1 | EP | unit | P1 | FR-SEC-1 | secureRoute rejects request when no auth_token cookie present | Authentication required | - |
| TC-MW-002 | M1 | EP | unit | P1 | FR-SEC-1 | secureRoute rejects garbage token | Invalid or expired token | - |
| TC-MW-003 | M1 | BVA | unit | P1 | FR-SEC-1 | secureRoute rejects expired JWT token | Invalid or expired token | - |
| TC-MW-004 | M1 | Security | unit | P1 | FR-SEC-1 | secureRoute rejects token signed with wrong secret | Invalid or expired token | - |
| TC-MW-005 | M1 | Security | unit | P1 | FR-SEC-1 | secureRoute rejects unsigned alg:none token | Invalid or expired token | - |
| TC-MW-006 | M1 | EP | unit | P1 | FR-SEC-1 | secureRoute attaches user info to req.user for valid token | calls next(), req.user has id and role | - |
| TC-MW-007 | M5 | EP | unit | P1 | FR-ADM-1 | checkAdmin rejects unauthenticated request (no req.user) | Admin access required | - |
| TC-MW-008 | M5 | EP | unit | P1 | FR-ADM-1 | checkAdmin rejects standard user (role === "user") | Admin access required | - |
| TC-MW-009 | M5 | EP | unit | P1 | FR-ADM-1 | checkAdmin passes request when role is "admin" | calls next() | - |
| TC-MW-010 | M1 | Security | unit | P1 | FR-SEC-2 | generateToken omits password hash from token payload | Decoded token contains id and role, never password | - |
| TC-AUC-001 | M2 | EP | api | P1 | FR-AUC-1 | Valid auction creation with active pending upload formId | Auction created, currentPrice equals startingPrice, seller set to req.user.id, upload status used | - |
| TC-AUC-002 | M2 | Security | api | P1 | FR-AUC-1 | Auction creation fails when unauthenticated | Authentication required | - |
| TC-AUC-003 | M2 | EP | api | P2 | FR-AUC-1 | Auction creation fails with unknown formId | Invalid upload session | - |
| TC-AUC-004 | M2 | EP | api | P2 | FR-AUC-1 | Auction creation missing public_id or secure_url | Image upload required | - |
| TC-AUC-005 | M2 | BVA | api | P1 | FR-AUC-2 | Auction creation end date prior to start date | End date must be after start date | - |
| TC-AUC-006 | M2 | BVA | api | P2 | FR-AUC-2 | Auction creation end date equals start date (0 ms difference) | End date must be strictly after start date | - |
| TC-AUC-007 | M2 | Security | api | P2 | FR-AUC-1 | Auction creation replay with already consumed used formId | formId cannot be reused once used | D-05b |
| TC-AUC-008 | M2 | BVA | api | P2 | FR-AUC-3 | Auction creation starting price 0 (BVA zero boundary) | Starting price must be at least 1 (min 1) | D-05 |
| TC-AUC-009 | M2 | BVA | api | P2 | FR-AUC-3 | Auction creation starting price negative -1 | Starting price must be positive integer | D-05 |
| TC-AUC-010 | M2 | BVA | api | P1 | FR-AUC-3 | Auction creation starting price 1 (exact minimum boundary) | Auction created with starting price 1 | - |
| TC-AUC-011 | M2 | EP | api | P2 | FR-AUC-4 | Auction creation missing required itemName | Validation error: itemName required | D-05 |
| TC-AUC-012 | M2 | EP | api | P2 | FR-AUC-4 | Auction creation missing required itemCategory | Validation error: itemCategory required | D-05 |
| TC-AUC-013 | M2 | EP | api | P2 | FR-AUC-4 | Auction creation missing required itemDescription | Validation error: itemDescription required | D-05 |
| TC-AUC-014 | M2 | ErrorGuessing | api | P2 | FR-AUC-2 | Auction creation missing itemEndDate produces 400 not 500 | Handled as 400 Bad Request, no internal 500 leak | D-05 |
| TC-AUC-015 | M2 | Security | api | P1 | FR-SEC-3 | Auction creation response omits seller password hash | Seller password hash must never be included in response | - |
| TC-AUC-016 | M2 | EP | api | P3 | FR-AUC-2 | Auction creation with past start date allowed for immediate activation | Auction created and is immediately live | - |
| TC-BID-001 | M3 | EP | api | P1 | FR-BID-1 | Bid = B + 5 accepted (nominal valid range [B+1, B+10]) | currentPrice updated to 105, bids length incremented | - |
| TC-BID-002 | M3 | Security | api | P1 | FR-BID-1 | Bid rejected when caller is unauthenticated | Authentication required | - |
| TC-BID-003 | M3 | EP | api | P2 | FR-BID-1 | Bid rejected when amount is non-numeric string | Invalid bid amount | - |
| TC-BID-004 | M3 | EP | api | P2 | FR-BID-1 | Bid rejected when auction does not exist | Auction not found | - |
| TC-BID-005 | M3 | DT | api | P1 | FR-BID-2 | Bid rejected when caller is the auction seller | You cannot bid on your own auction | - |
| TC-BID-006 | M3 | BVA | api | P1 | FR-BID-3 | Bid = B + 1 accepted (exact minimum allowable increment) | currentPrice updated to 101 | - |
| TC-BID-007 | M3 | BVA | api | P1 | FR-BID-3 | Bid = B + 10 accepted (exact maximum allowable increment) | currentPrice updated to 110 | - |
| TC-BID-008 | M3 | BVA | api | P1 | FR-BID-3 | Bid = B + 11 rejected (just above maximum increment) | Bid must be at max Rs. 110 | - |
| TC-BID-009 | M3 | BVA | api | P1 | FR-BID-3 | Bid = B rejected (equal to current price, below minimum increment) | Bid must be at least Rs. 101 | - |
| TC-BID-010 | M3 | BVA | api | P1 | FR-BID-3 | Bid = B - 1 rejected (below current price) | Bid must be at least Rs. 101 | - |
| TC-BID-011 | M3 | BVA | api | P2 | FR-BID-3 | Bid = B + 10.5 rejected (decimal exceeding upper boundary) | Exceeds maximum allowable bid | - |
| TC-BID-012 | M3 | BVA | api | P2 | FR-BID-3 | Bid = B + 0.5 decimal handling below minimum | Bid must be at least Rs. 101 | - |
| TC-BID-013 | M3 | BVA | api | P2 | FR-BID-3 | Bid with string integer "105" accepted via number coercion | Coerced to number 105 and accepted | - |
| TC-BID-014 | M3 | BVA | api | P2 | FR-BID-3 | Bid with alphanumeric "105a" rejected with 400 | Invalid bid amount | - |
| TC-BID-015 | M3 | ST | api | P1 | FR-BID-4 | Bid rejected when auction is past end date | Auction has already ended | - |
| TC-BID-016 | M3 | BVA | api | P1 | FR-BID-3 | Bid updates base price so next allowed window moves to [newB+1, newB+10] | 106 is valid for new price 105 | - |
| TC-BID-017 | M3 | EP | api | P2 | FR-BID-5 | Bid history maintains newest-first descending order | bids array ordered by bidTime descending | - |
| TC-BID-018 | M3 | EP | api | P2 | FR-BID-5 | Bid record stores bidderName and bidder ObjectId correctly | bids[0].bidder matches Bob id, bidderName is Bob | - |
| TC-BID-019 | M3 | ErrorGuessing | api | P2 | FR-BID-1 | Bid with malformed ObjectId produces 400/404 not unhandled 500 | CastError caught and returned as client error | - |
| TC-BID-020 | M3 | ST | api | P1 | FR-BID-4 | Bid before itemStartDate is rejected as auction not started | Auction has not started yet | D-01 |
| TC-BID-021 | M3 | DT | api | P2 | FR-BID-2 | Current highest bidder outbidding themselves rejected | You are already the highest bidder | D-02 |
| TC-BID-022 | M3 | BVA | api | P2 | FR-BID-3 | Bid with 0 or negative amount rejected | Invalid bid amount | - |
| TC-BID-023 | M3 | ErrorGuessing | api | P3 | FR-BID-3 | Bid with Infinity rejected | Invalid bid amount | - |
| TC-BID-024 | M3 | EP | api | P1 | FR-BID-3 | Auction with startingPrice=100 and currentPrice=0 uses startingPrice as base | B = max(current, starting) = 100, so 105 accepted | - |
| TC-BID-025 | M3 | Integration | socket | P1 | FR-SOC-2 | REST bid emits socket event auction:bidPlaced to room | Socket receives auction:bidPlaced event with updated price | - |
| TC-BID-026 | M3 | Concurrency | api | P1 | FR-BID-6 | Concurrent bids at same price result in exactly one success and one 409 | One 200 OK, one 409 Conflict (price changed) | - |
| TC-LST-001 | M2 | EP | api | P1 | FR-LST-1 | GET /api/auction returns active auctions where itemEndDate > now | Only auctions with itemEndDate > now returned | - |
| TC-LST-002 | M2 | BVA | api | P2 | FR-LST-2 | GET /api/auction pagination limit=0 coerced to default 12 | Limit clamped to default 12 | - |
| TC-LST-003 | M2 | BVA | api | P2 | FR-LST-2 | GET /api/auction pagination limit=1 (exact minimum) | Exactly 1 auction returned | - |
| TC-LST-004 | M2 | BVA | api | P2 | FR-LST-2 | GET /api/auction pagination limit=50 (exact maximum) | Up to 50 auctions returned | - |
| TC-LST-005 | M2 | BVA | api | P2 | FR-LST-2 | GET /api/auction pagination limit=51 clamped to 50 | Limit clamped to max 50 | - |
| TC-LST-006 | M2 | EP | api | P1 | FR-LST-3 | GET /api/auction response includes bidsCount, timeLeft, sellerName, itemPhoto | Each auction item includes all required projection fields | - |
| TC-LST-007 | M2 | EP | api | P2 | FR-LST-4 | GET /api/auction results sorted by createdAt descending | First item is the most recently created | - |
| TC-LST-008 | M2 | EP | api | P1 | FR-LST-5 | GET /api/auction/myauction returns only auctions created by authenticated caller | Returns exactly the 2 auctions owned by Alice | - |
| TC-LST-009 | M2 | Security | api | P1 | FR-SEC-1 | GET /api/auction/myauction fails with 401 when unauthenticated | Authentication required | - |
| TC-LST-010 | M2 | EP | api | P1 | FR-LST-6 | GET /api/auction/mybids returns only auctions where caller placed a bid | Returns Auction 1, excludes Auction 2 | - |
| TC-LST-011 | M2 | EP | api | P2 | FR-LST-7 | GET /api/auction/dashboardData returns aggregate stats for user | Stats payload with totalAuctions, userAuctionCount, activeAuctions | - |
| TC-LST-012 | M2 | DT | api | P1 | FR-AUC-5 | GET /api/auction/:id returns auction details for live auction | Returns complete auction object | - |
| TC-LST-013 | M2 | ST | api | P1 | FR-AUC-6 | GET /api/auction/:id resolves winner when accessed after end time | DB updated: winner set to highest bidder, isSold set to true | - |
| TC-LST-014 | M2 | Security | api | P2 | FR-SEC-4 | GET /api/auction/:id restricts non-participant from viewing ended auction | Forbidden access to non-participants on ended auction | - |
| TC-LST-015 | M2 | EP | api | P2 | FR-AUC-5 | GET /api/auction/:id returns 404 for non-existent ObjectId | Auction not found | - |
| TC-LST-016 | M2 | ErrorGuessing | api | P2 | FR-AUC-5 | GET /api/auction/:id handles malformed ObjectId with 400 not 500 | CastError caught gracefully | - |
| TC-USR-001 | M4 | EP | api | P1 | FR-USR-1 | GET /api/user returns profile fields name, email, avatar, role | User profile returned, password hash excluded | - |
| TC-USR-002 | M4 | Security | api | P1 | FR-SEC-1 | GET /api/user rejects unauthenticated caller with 401 | Authentication required | - |
| TC-USR-003 | M4 | EP | api | P1 | FR-USR-2 | PATCH /api/user/change-password successful with valid credentials | Password updated, bcrypt hash persisted | - |
| TC-USR-004 | M4 | EP | api | P2 | FR-USR-2 | PATCH /api/user/change-password missing fields rejected with 400 | All fields are required | - |
| TC-USR-005 | M4 | DT | api | P2 | FR-USR-2 | PATCH /api/user/change-password new password mismatch rejected with 400 | New passwords do not match | - |
| TC-USR-006 | M4 | DT | api | P2 | FR-USR-2 | PATCH /api/user/change-password same as current rejected with 400 | New password must be different from current password | - |
| TC-USR-007 | M4 | BVA | api | P2 | FR-USR-2 | PATCH /api/user/change-password new password < 8 chars rejected with 400 | Password must be at least 8 characters | - |
| TC-USR-008 | M4 | DT | api | P1 | FR-USR-2 | PATCH /api/user/change-password incorrect current password rejected with 401 | Current password is incorrect | - |
| TC-USR-009 | M4 | ST | api | P1 | FR-USR-2 | Login after password change succeeds with new password and fails with old | Old password returns 401, new password returns 200 | - |
| TC-USR-010 | M4 | Security | api | P1 | FR-SEC-5 | Old JWT remains valid after password change demonstrating stateless session defect | Tokens should be invalidated on credential change | D-11 |
| TC-USR-011 | M4 | EP | api | P2 | FR-USR-3 | GET /api/user/history returns up to 10 newest-first login records | Returns max 10 records sorted by loginAt descending | - |
| TC-USR-012 | M4 | Security | api | P2 | FR-SEC-6 | Login history trusts X-Forwarded-For header unconditionally leading to IP spoofing | Client IP recorded should be validated against trusted proxies | D-15 |
| TC-USR-013 | M4 | EP | unit | P3 | FR-USR-4 | Device classifier correctly classifies iPhone, Android, Tablet, Desktop | Device type mapped to Mobile, Tablet, Desktop | - |
| TC-USR-014 | M4 | Security | api | P1 | FR-SEC-7 | PATCH /api/user with role admin in body is rejected / ignored | User role remains user (mass assignment prevented) | - |
| TC-ADM-001 | M5 | EP | api | P1 | FR-ADM-1 | GET /api/admin/dashboard returns stats when caller is admin | Returns totalUsers, totalAuctions, recentUsers, recentAuctions | - |
| TC-ADM-002 | M5 | Security | api | P1 | FR-ADM-1 | GET /api/admin/dashboard rejects normal user with 403 | Admin access required | - |
| TC-ADM-003 | M5 | Security | api | P1 | FR-ADM-1 | GET /api/admin/dashboard rejects unauthenticated caller with 401 | Authentication required | - |
| TC-ADM-004 | M5 | EP | api | P1 | FR-ADM-2 | GET /api/admin/users lists registered users with pagination | Returns array of users with pagination metadata | - |
| TC-ADM-005 | M5 | Security | api | P1 | FR-SEC-8 | GET /api/admin/users excludes password field from user objects | Password hash field strictly excluded from all user objects | - |
| TC-ADM-006 | M5 | EP | api | P2 | FR-ADM-2 | GET /api/admin/users supports search query (case-insensitive name/email) | Returns Alice, excludes Bob | - |
| TC-ADM-007 | M5 | Security | api | P2 | FR-ADM-2 | GET /api/admin/users search query safely escapes regex metacharacters .* and ( | Does not crash server with Regex SyntaxError | - |
| TC-ADM-008 | M5 | EP | api | P2 | FR-ADM-2 | GET /api/admin/users supports role filter | Returns only admin users | - |
| TC-ADM-009 | M5 | Security | api | P2 | FR-ADM-2 | GET /api/admin/users sortBy whitelist falls back to createdAt for illegal field | Sort falls back to safe field createdAt | - |
| TC-ADM-010 | M5 | BVA | api | P2 | FR-ADM-2 | GET /api/admin/users negative page=-1 handled gracefully without 500 crash | Invalid pagination handled or clamped to page 1 | D-07 |
| TC-ADM-011 | M5 | BVA | api | P2 | FR-ADM-2 | GET /api/admin/users negative limit=-5 handled gracefully without 500 crash | Invalid limit handled or clamped to default | D-07 |
| TC-ADM-012 | M5 | BVA | api | P2 | FR-ADM-2 | GET /api/admin/users limit=0 handled gracefully without 500 crash | Zero limit clamped to default | D-07 |
| TC-ADM-013 | M5 | ErrorGuessing | api | P2 | FR-ADM-2 | GET /api/admin/users non-numeric page=abc handled gracefully | Non-numeric page handled gracefully | D-07 |
| TC-ADM-014 | M5 | EP | api | P1 | FR-ADM-1 | GET /api/admin/dashboard metrics match actual database counts | Returned metrics match seeded database totals | - |
| TC-UPL-001 | M6 | Security | api | P1 | FR-UPL-1 | GET /api/upload/signature requires authentication | Authentication required | - |
| TC-UPL-002 | M6 | EP | api | P1 | FR-UPL-2 | GET /api/upload/signature returns valid signed Cloudinary parameters | Returns timestamp, folder, signature, apiKey, cloudName, formId | - |
| TC-UPL-003 | M6 | EP | unit | P1 | FR-UPL-2 | Signature is valid SHA1 hash matching Cloudinary specification | SHA1 matches expected hash of folder & timestamp | - |
| TC-UPL-004 | M6 | EP | api | P1 | FR-UPL-3 | GET /api/upload/signature creates unique formId and pending Upload row | Upload row created with status pending and formId | - |
| TC-UPL-005 | M6 | Security | api | P1 | FR-SEC-9 | Upload signature endpoint never leaks CLOUDINARY_API_SECRET | apiKey is returned; apiSecret must never be present | - |
| TC-UPL-006 | M6 | Unit | unit | P2 | FR-UPL-4 | Upload cleanup job purges pending uploads > 10 minutes and keeps active ones | Old pending deleted from DB, used and fresh kept | - |
| TC-CNT-001 | M6 | EP | api | P1 | FR-CNT-1 | POST /api/contact sends email notification and acknowledgment | Contact inquiry processed, Resend batch send invoked with 2 emails | - |
| TC-CNT-002 | M6 | EP | api | P2 | FR-CNT-1 | POST /api/contact missing name rejected with 400 | All fields are required | - |
| TC-CNT-003 | M6 | EP | api | P2 | FR-CNT-1 | POST /api/contact missing email rejected with 400 | All fields are required | - |
| TC-CNT-004 | M6 | EP | api | P2 | FR-CNT-1 | POST /api/contact missing subject rejected with 400 | All fields are required | - |
| TC-CNT-005 | M6 | EP | api | P2 | FR-CNT-1 | POST /api/contact missing message rejected with 400 | All fields are required | - |
| TC-CNT-006 | M6 | EP | api | P2 | FR-CNT-1 | POST /api/contact invalid email format rejected with 400 | Invalid email address | - |
| TC-CNT-007 | M6 | Security | api | P1 | FR-SEC-10 | POST /api/contact HTML payload in message is sanitized in email template | HTML tags escaped (&lt;script&gt;) in rendered email body | - |
| TC-CNT-008 | M6 | Security | api | P2 | FR-SEC-11 | POST /api/contact has no rate limiting allowing contact form spam | Too Many Requests rate limit should throttle abusive submissions | D-08 |
| TC-MOD-001 | M1 | EP | unit | P2 | FR-MOD-1 | User model enforces email regex validation | Mongoose ValidationError thrown | - |
| TC-MOD-002 | M1 | EP | unit | P2 | FR-MOD-1 | User model rejects non-whitelisted role enum superuser | Enum validator rejects superuser | - |
| TC-MOD-003 | M2 | BVA | unit | P1 | FR-MOD-2 | Product model enforces startingPrice minimum boundary of 1 | startingPrice min validator triggers on 0 | - |
| TC-MOD-004 | M2 | EP | unit | P2 | FR-MOD-2 | Product model requires itemImage public_id and secure_url | Validation fails when public_id is absent | - |
| TC-MOD-005 | M6 | EP | unit | P2 | FR-MOD-3 | Upload model enforces status enum pending or used | Enum validator rejects unknown status | - |
| TC-MOD-006 | M6 | EP | unit | P1 | FR-MOD-3 | Upload model enforces unique index on formId | E11000 duplicate key error thrown | - |
| TC-MOD-007 | M4 | EP | unit | P2 | FR-MOD-4 | Login model specifies TTL index with expireAfterSeconds: 15778463 | TTL index configured for ~6 month session lifecycle | - |
| TC-MOD-008 | M2 | EP | unit | P2 | FR-MOD-2 | Product bids subdocument defaults bidTime to Date.now | bidTime is automatically populated with current Date | - |
| TC-SOC-001 | M3 | Security | socket | P1 | FR-SOC-1 | Socket connection rejected without auth_token cookie | Authentication required | - |
| TC-SOC-002 | M3 | Security | socket | P1 | FR-SOC-1 | Socket connection rejected with garbage / expired token | Invalid or expired token | - |
| TC-SOC-003 | M3 | EP | socket | P2 | FR-SOC-1 | Socket connection rejected for token of deleted user | User not found | - |
| TC-SOC-004 | M3 | EP | socket | P1 | FR-SOC-1 | Socket connection succeeds for valid authenticated user | Socket connects, socket.user populated | - |
| TC-SOC-005 | M3 | EP | socket | P1 | FR-SOC-2 | auction:join emits auction:userJoined to room members | Members receive auction:userJoined with activeUsers list | - |
| TC-SOC-006 | M3 | EP | socket | P2 | FR-SOC-2 | Multiple connections from same user in separate tabs are deduped in activeUsers | activeUsers list contains Alice exactly once | - |
| TC-SOC-007 | M3 | EP | socket | P2 | FR-SOC-2 | Disconnecting or leaving room emits auction:userLeft | Remaining members receive auction:userLeft | - |
| TC-SOC-008 | M3 | ErrorGuessing | socket | P2 | FR-SOC-2 | auction:join with missing auctionId handled safely without server crash | Safely ignored or error returned without crashing server | - |
| TC-SOC-009 | M3 | EP | socket | P1 | FR-SOC-3 | auction:bid valid bid emits auction:bidPlaced to all clients in room | All clients receive auction:bidPlaced with new price and bidder | - |
| TC-SOC-010 | M3 | Integration | socket | P1 | FR-SOC-3 | Outbid event verification: Client A receives auction:bidPlaced when Client B outbids | Alice receives update with new high bid 110 | - |
| TC-SOC-011 | M3 | BVA | socket | P1 | FR-SOC-3 | auction:bid enforces [B+1, B+10] boundary via socket | 100 & 111 trigger auction:error, 101 & 110 succeed | - |
| TC-SOC-012 | M3 | ErrorGuessing | socket | P2 | FR-SOC-3 | auction:bid with null or missing amount returns silently without error causing client hang | Invalid bid amount | D-16 |
| TC-SOC-013 | M3 | DT | socket | P1 | FR-SOC-3 | auction:bid seller bidding on own auction rejected with error | You cannot bid on your own auction | - |
| TC-SOC-014 | M3 | ST | socket | P1 | FR-SOC-3 | auction:bid after expiry rejected with Auction has already ended | Auction has already ended | - |
| TC-SOC-015 | M3 | EP | socket | P2 | FR-SOC-3 | auction:bid on non-existent auction returns error | Auction not found | - |
| TC-SOC-016 | M3 | Concurrency | socket | P1 | FR-SOC-4 | Concurrent identical bids emitted simultaneously via socket: exactly 1 accepted | Exactly one client receives auction:bidPlaced, the other gets error | - |
| TC-SOC-017 | M3 | Concurrency | socket | P1 | FR-SOC-4 | 10 concurrent distinct bids emitted: no lost updates, final price matches highest accepted | Final price equals max accepted bid, no lost updates | - |
| TC-SOC-018 | M3 | Concurrency | socket | P1 | FR-SOC-4 | Simultaneous REST bid and Socket bid at same price: exactly one succeeds | One succeeds with 200/bidPlaced, other fails with 409/error | - |
| TC-SOC-019 | M3 | Integration | socket | P1 | FR-SOC-2 | REST bid emits auction:bidPlaced to socket client in room | Socket client in room receives event with bidderId | - |
| TC-SOC-020 | M3 | EP | socket | P2 | FR-SOC-3 | Non-participant can bid without joining room first | Bid accepted; room join only needed for receiving broadcasts | - |
| TC-SEC-001 | M1 | Security | security | P1 | FR-SEC-1 | JWT payload tampering (role: admin with original signature) rejected with 401 | Signature mismatch causes 401 Invalid or expired token | - |
| TC-SEC-002 | M1 | Security | security | P1 | FR-SEC-1 | Unsigned JWT with alg: none rejected with 401 | Unsigned token rejected | - |
| TC-SEC-003 | M1 | Security | security | P1 | FR-SEC-1 | JWT signed with untrusted secret rejected with 401 | Verification failure causes 401 | - |
| TC-SEC-004 | M1 | Security | security | P1 | FR-SEC-2 | auth_token cookie flags: HttpOnly set, Path=/, SameSite configured | Set-Cookie includes HttpOnly, Path=/, SameSite=Lax (or None in prod) | - |
| TC-SEC-005 | M1 | Security | security | P1 | FR-SEC-3 | NoSQL operator injection object in login email handled safely | Object in email field rejected or 401 unauthorized | D-10 |
| TC-SEC-006 | M5 | Security | security | P1 | FR-SEC-3 | NoSQL injection via query parameters in /admin/users?search[$ne]= | Express 5 simple query parser treats as literal string or handles safely | - |
| TC-SEC-007 | M2 | Security | security | P1 | FR-SEC-4 | Stored XSS payload stored raw in database and safely escaped when rendered in UI | API stores raw string; React UI escapes it as text without script execution | - |
| TC-SEC-008 | M8 | Security | security | P1 | FR-SEC-5 | CORS enforcement: untrusted Origin does not receive Access-Control-Allow-Origin | Access-Control-Allow-Origin header is not set for untrusted origin | - |
| TC-SEC-009 | M8 | Security | security | P2 | FR-SEC-6 | Missing security headers (helmet absent, X-Powered-By leaked) | CSP, X-Frame-Options, X-Content-Type-Options should be present; X-Powered-By suppressed | D-08b |
| TC-SEC-010 | M1 | Security | security | P2 | FR-SEC-7 | Internal stack trace and error message leakage on 500 error | Errors should return generic JSON, not HTML stack traces or Mongoose internals | D-05 |
| TC-SEC-011 | M1 | Security | security | P2 | FR-SEC-8 | Brute-force login attempts are not throttled (absence of rate limiter) | Too Many Requests rate limit should throttle brute force | D-08 |
| TC-SEC-012 | M1 | Security | security | P2 | FR-SEC-9 | Stateless JWT remains valid after user logout | Logged out token should be revoked on server side | D-11 |
| TC-SEC-013 | M2 | Security | security | P1 | FR-SEC-10 | IDOR verification: non-participant forbidden from accessing ended auction details | 403 Forbidden returned, preventing unauthorized auction inspection | - |
| TC-SEC-014 | M4 | Security | security | P1 | FR-SEC-11 | Mass assignment prevention: PATCH /api/user ignores role admin | Profile updated but user role remains user | - |
| TC-SEC-015 | M6 | Security | security | P2 | FR-SEC-12 | Contact endpoint email template escapes HTML to prevent HTML injection in emails | HTML sanitized or escaped before template interpolation | - |
| TC-ST-001 | M3 | ST | api | P1 | FR-ST-1 | State Transition S1 -> S2: First valid bid moves auction from No Bids to With Bids | Transition to S2: currentPrice=105, bids.length=1 | - |
| TC-ST-002 | M3 | ST | api | P1 | FR-ST-2 | State Transition S2 -> S2: Higher valid bid updates current price (self-loop) | Remains in S2: currentPrice=112, bids.length=2 | - |
| TC-ST-003 | M3 | ST | api | P2 | FR-ST-2 | State Transition S2 -> S2 (Invalid): Bid below base price rejected, state unchanged | Rejected, auction remains in S2 with currentPrice=105 | - |
| TC-ST-004 | M2 | ST | api | P1 | FR-ST-3 | State Transition S1/S2 -> S3/S4: Clock passes itemEndDate transitioning auction to ended | Auction has already ended | - |
| TC-ST-005 | M2 | ST | api | P1 | FR-ST-4 | State Transition S4 -> S5: GET /api/auction/:id triggers lazy winner resolution | Transition to S5: DB updated with winner=highestBidder, isSold=true | - |
| TC-ST-006 | M2 | ST | api | P1 | FR-ST-4 | Defect D-06: S4 stays S4 when queried via /mybids without opening detail page | Winner should be resolved, but SUT leaves winner null and isSold false | D-06 |
| TC-ST-007 | M2 | ST | api | P2 | FR-ST-4 | State Transition S5 -> S5: Subsequent GET requests on resolved auction are idempotent | Remains in S5, returns persisted winner, no re-writes | - |
| TC-ST-008 | M2 | ST | api | P1 | FR-ST-5 | Defect D-01: Bid submitted on S0 Scheduled auction is accepted instead of rejected | Should reject with Auction not yet started, but SUT accepts bid | D-01 |
| TC-DT-001 | M3 | DT | api | P1 | FR-DT-1 | Decision Table DT-1 Rule R1: Unauthenticated bid request | 401 Authentication required | - |
| TC-DT-002 | M3 | DT | api | P2 | FR-DT-1 | Decision Table DT-1 Rule R2: Non-numeric bid amount | 400 Invalid bid amount | - |
| TC-DT-003 | M3 | DT | api | P2 | FR-DT-1 | Decision Table DT-1 Rule R3: Auction does not exist | 404 Auction not found | - |
| TC-DT-004 | M3 | DT | api | P1 | FR-DT-1 | Decision Table DT-1 Rule R4: Seller bidding on own auction | 403 You cannot bid on your own auction | - |
| TC-DT-005 | M3 | DT | api | P1 | FR-DT-1 | Decision Table DT-1 Rule R5: Auction already ended | 400 Auction has already ended | - |
| TC-DT-006 | M3 | DT | api | P1 | FR-DT-1 | Decision Table DT-1 Rule R6: Bid amount below minimum increment (amt < B+1) | 400 Bid must be at least Rs. 101 | - |
| TC-DT-007 | M3 | DT | api | P1 | FR-DT-1 | Decision Table DT-1 Rule R7: Bid amount exceeds maximum increment (amt > B+10) | 400 Bid must be at max Rs. 110 | - |
| TC-DT-008 | M3 | DT | api | P1 | FR-DT-1 | Decision Table DT-1 Rule R8: Race condition price changed during submission | 409 Bid failed - price changed | - |
| TC-DT-009 | M3 | DT | api | P1 | FR-DT-1 | Decision Table DT-1 Rule R9: All conditions satisfied, bid accepted | 200 OK, price updated, bid recorded, event emitted | - |
| TC-DT-010 | M3 | DT | api | P2 | FR-DT-2 | Precedence check: Seller bidding on own ENDED auction (REST returns 403, Socket returns Ended) | Inconsistent validation precedence between REST and Socket | D-09 |
| TC-DT-011 | M5 | DT | api | P1 | FR-ADM-1 | Decision Table DT-3 Rule R3.3: Authenticated non-admin visits admin routes | 403 Admin access required | - |
| TC-DT-012 | M4 | DT | api | P2 | FR-USR-2 | Decision Table DT-4 Rule R4.2: Password change new and confirm mismatch | 400 New passwords do not match | - |
| TC-E2E-001 | M1 | EP | e2e | P1 | FR-E2E-1 | User signup happy path with automatic login and auth_token cookie | Redirects to authenticated area, navbar shows user name | - |
| TC-E2E-002 | M1 | EP | e2e | P2 | FR-E2E-1 | Signup form HTML5 validation for empty fields | Browser displays required field validation | - |
| TC-E2E-003 | M1 | BVA | e2e | P2 | FR-E2E-1 | Signup form HTML5 password minLength=8 constraint | Browser displays minLength constraint error | - |
| TC-E2E-004 | M1 | EP | e2e | P2 | FR-E2E-1 | Signup duplicate email displays toast error | Toast displays "User already exists" | - |
| TC-E2E-005 | M1 | ErrorGuessing | e2e | P2 | FR-E2E-1 | Signup server error handling displays toast alert | Toast notification displays error message | - |
| TC-E2E-006 | M1 | EP | e2e | P1 | FR-E2E-2 | User login happy path with redirect to /auction | Redirected to /auction, auth state active | - |
| TC-E2E-007 | M1 | EP | e2e | P1 | FR-E2E-2 | Login with incorrect password displays error toast | Toast shows "Invalid email or password" | - |
| TC-E2E-008 | M1 | EP | e2e | P2 | FR-E2E-2 | Login empty fields validation | Validation prevents form submission | - |
| TC-E2E-009 | M7 | Security | e2e | P1 | FR-E2E-3 | Protected routes redirect unauthenticated visitor to /login | All protected routes redirect to /login | - |
| TC-E2E-010 | M5 | Security | e2e | P1 | FR-E2E-4 | Normal user navigating to /admin is blocked from admin dashboard | Access restricted, redirected away, no admin data fetched | - |
| TC-E2E-011 | M2 | EP | e2e | P1 | FR-E2E-5 | Create auction happy path with stubbed Cloudinary upload | Auction created, success toast, appears in My Auctions | - |
| TC-E2E-012 | M2 | EP | e2e | P2 | FR-E2E-5 | Create auction image upload with .png and .webp formats | Image preview rendered and upload succeeds | - |
| TC-E2E-013 | M2 | Security | e2e | P2 | FR-E2E-5 | Create auction image input with .exe and .pdf files | Client rejects non-image or records lack of MIME verification | D-05c |
| TC-E2E-014 | M2 | BVA | e2e | P3 | FR-E2E-5 | Create auction 0-byte image file handling | Rejects 0-byte file gracefully | - |
| TC-E2E-015 | M2 | BVA | e2e | P3 | FR-E2E-5 | Create auction large file > 10MB handling | Upload rejected or throttled | - |
| TC-E2E-016 | M2 | BVA | e2e | P2 | FR-E2E-5 | Create auction form startingPrice min=1 validation | Native HTML5 min=1 prevents submission | - |
| TC-E2E-017 | M2 | Pairwise | e2e | P2 | FR-E2E-5 | Create auction pairwise input combination matrix execution | All pairwise combinations pass or fail as expected | - |
| TC-E2E-018 | M2 | EP | e2e | P1 | FR-E2E-6 | Auction list page card rendering, pagination, and navigation to details | Cards render with photo, price, time left; click navigates to /auction/:id | - |
| TC-E2E-019 | M3 | EP | e2e | P1 | FR-E2E-7 | View auction details and place valid bid via UI without page reload | Price and bid list update reactively without full page reload | - |
| TC-E2E-020 | M3 | Integration | e2e | P1 | FR-E2E-8 | Dual browser contexts: Bid placed in context B updates context A live within 3s | Context A page reflects new price via Socket.io broadcast within 3 seconds | - |
| TC-E2E-021 | M3 | BVA | e2e | P2 | FR-E2E-7 | Bid below min or above max blocked by UI input attributes and server toast | Input min/max prevents submit; evaluate submit triggers toast | - |
| TC-E2E-022 | M3 | DT | e2e | P2 | FR-E2E-7 | Seller viewing own auction has bid form hidden or disabled | Bid submission form is not available to seller | - |
| TC-E2E-023 | M3 | ST | e2e | P2 | FR-E2E-7 | Auction expiration while page open updates UI to ended and blocks bidding | UI transitions to ended state; bid button disabled | - |
| TC-E2E-024 | M2 | ST | e2e | P1 | FR-E2E-9 | MyBids status shows winner after winning an ended auction | Status displays won/winner badge | D-06 |
| TC-E2E-025 | M2 | EP | e2e | P2 | FR-E2E-10 | MyAuction page displays seller listings with current prices and bid counts | Table renders user auctions and statistics | - |
| TC-E2E-026 | M4 | EP | e2e | P2 | FR-E2E-11 | User profile change password and login history table rendering | Password change completes, login history shows IP and device | - |
| TC-E2E-027 | M5 | EP | e2e | P1 | FR-E2E-12 | Admin dashboard displays total users, total auctions, and active stats | Summary analytics cards render matching database counts | - |
| TC-E2E-028 | M5 | EP | e2e | P2 | FR-E2E-13 | Admin users list provides search, role filter, and sorting | Users table filters interactively | - |
| TC-E2E-029 | M6 | EP | e2e | P2 | FR-E2E-14 | Contact page form submission with validation and success message | Form submits, success banner or toast displayed | - |
| TC-E2E-030 | M7 | Responsive | e2e | P2 | FR-E2E-15 | Responsive viewport testing at 375x667 and 768x1024 without horizontal overflow | No horizontal overflow (scrollWidth <= innerWidth) | - |
| TC-LNK-001 | M7 | Static | links | P1 | FR-LNK-1 | Route inventory: all defined SPA routes in routers are catalogued | Inventory contains all open, protected, and admin routes | - |
| TC-LNK-002 | M7 | EP | links | P1 | FR-LNK-2 | Open routes return HTTP 200 and valid document title from Vite dev/preview server | All public routes load with title and no console errors | - |
| TC-LNK-003 | M7 | EP | links | P2 | FR-LNK-3 | Legal pages: all 6 policy subroutes load without 404 | Each legal page renders document content | - |
| TC-LNK-004 | M7 | ErrorGuessing | links | P2 | FR-LNK-4 | Route case sensitivity: /legal vs /Legal resolves correctly in React Router | Case sensitivity matches router specification | - |
| TC-LNK-005 | M7 | ErrorGuessing | links | P2 | FR-LNK-5 | Unknown path /non-existent-page renders friendly Error.jsx instead of blank screen | Friendly 404 Error page rendered | - |
| TC-LNK-006 | M7 | Crawler | links | P1 | FR-LNK-6 | Link crawler: all internal a[href] links on pages resolve without 404 | Zero broken internal links | - |
| TC-LNK-007 | M7 | Crawler | links | P3 | FR-LNK-6 | External link verification: external hyperlinks verified with HTTP HEAD/GET | External links documented with status in links.json | - |
| TC-LNK-008 | M7 | Security | links | P2 | FR-LNK-7 | External links with target="_blank" must include rel="noopener noreferrer" | rel attribute includes noopener and noreferrer | - |
| TC-LNK-009 | M7 | EP | links | P3 | FR-LNK-8 | Brand anchors: mailto and tel links are well-formed | All contact anchors well-formed | - |
| TC-LNK-010 | M7 | EP | links | P2 | FR-LNK-9 | sitemap.xml routes match live application routes and lastmod format is valid | Every <loc> exists in route inventory | - |
| TC-LNK-011 | M7 | EP | links | P2 | FR-LNK-9 | robots.txt exists and points to valid sitemap.xml | Robots.txt references Sitemap directive | - |
| TC-LNK-012 | M7 | Static | links | P3 | FR-LNK-10 | Dead code detection: pages/Dashboard.jsx is unrouted in all router files | Identified as dead/unrouted code | D-17 |
| TC-DKR-001 | M8 | Static | docker | P2 | FR-DKR-1 | Dockerfile.server and Dockerfile.client syntax linting via Hadolint | No critical Hadolint rule violations | - |
| TC-DKR-002 | M8 | EP | docker | P1 | FR-DKR-2 | Docker image build for server succeeds and satisfies size budget (< 400MB) | Server image built successfully | - |
| TC-DKR-003 | M8 | EP | docker | P1 | FR-DKR-2 | Docker image build for client (nginx multi-stage) succeeds (< 80MB) | Client image built successfully | - |
| TC-DKR-004 | M8 | Security | docker | P2 | FR-DKR-3 | Trivy vulnerability scan on container images records security posture | Trivy JSON report generated | - |
| TC-DKR-005 | M8 | EP | docker | P1 | FR-DKR-4 | Docker compose starts mongo, server, client with all healthchecks green | All 3 containers healthy | - |
| TC-DKR-006 | M8 | Security | docker | P1 | FR-DKR-5 | Server container executes as non-root user (id -u != 0) | Runs under node unprivileged user | - |
| TC-DKR-007 | M8 | Integration | docker | P1 | FR-DKR-6 | Containerized smoke tests: client serves SPA index.html and server handles auth | Client 8080 and Server 3000 respond correctly | - |
| TC-DKR-008 | M8 | EP | docker | P1 | FR-DKR-7 | Nginx SPA fallback: deep link /auction/123 returns 200 index.html | Nginx try_files serves index.html | - |
| TC-DKR-009 | M8 | ErrorGuessing | docker | P1 | FR-DKR-8 | Negative startup: server exits with code 1 if required MONGO_URL missing | Fatal missing env logged, container exits with 1 | - |
| TC-DKR-010 | M8 | ErrorGuessing | docker | P1 | FR-DKR-8 | Unreachable database: server exits with code 1 when Mongo host unreachable | Error starting server logged, exits with 1 | - |
| TC-DKR-011 | M8 | EP | docker | P1 | FR-DKR-9 | Graceful shutdown: SIGTERM terminates server within 10s with exit code 0 | Server shut down gracefully logged | - |
| TC-DKR-012 | M8 | EP | docker | P1 | FR-DKR-10 | Container persistence: data persists across server restart | User can log in after container restart | - |
