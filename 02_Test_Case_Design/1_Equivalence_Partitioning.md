# Equivalence Partitioning (EP) Test Design

**System Under Test:** `theavnishkumar/online-auction-system` (`ecd4de475fdf49d54153ffaa57d42b392161007a`)  
**Document Reference:** `02_Test_Case_Design/1_Equivalence_Partitioning.md`  
**Technique:** Black-box input partitioning into valid and invalid classes.

---

## 1. Overview of Equivalence Partitioning

Equivalence Partitioning divides the input domain into distinct classes of data from which test cases can be derived. An equivalence class represents a set of valid or invalid states for an input condition. Tests are designed such that every valid partition is covered by at least one test case and each invalid partition is tested independently to prevent defect masking.

---

## 2. Partition Specifications by Module

### 2.1 Module M1: User Authentication & Profile
| Input Field | Valid Equivalence Partitions (VP) | Invalid Equivalence Partitions (IP) | SUT Code Anchor & Enforcement Rule |
|---|---|---|---|
| **Email Address** (Signup / Login) | **VP1.1:** Standard format `name@domain.com`<br>**VP1.2:** Subdomain/tag `first.last+tag@sub.domain.co` | **IP1.1:** Empty string `""` / missing field<br>**IP1.2:** Missing `@` symbol (`userdomain.com`)<br>**IP1.3:** Missing domain dot (`user@domaincom`)<br>**IP1.4:** Contains whitespace (`user @domain.com`)<br>**IP1.5:** Consecutive `@` (`user@@domain.com`)<br>**IP1.6:** NoSQL Injection Object `{"$ne": null}`<br>**IP1.7:** Non-string primitive (number / boolean / array) | `user.model.js`: Regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` |
| **Password** (Signup) | **VP1.3:** Length $\ge 8$ characters (alphanumeric & symbols) | **IP1.8:** Empty string `""` / missing<br>**IP1.9:** Length 1 to 7 characters<br>**IP1.10:** Non-string type (number `12345678`, object `{}`) | `auth.controller.js`: Explicit check `password.length < 8` |
| **Full Name** (Signup) | **VP1.4:** Standard string (1–100 chars, e.g., "John Doe")<br>**VP1.5:** Unicode / accented characters ("Éléonore Müller") | **IP1.11:** Empty string `""`<br>**IP1.12:** Missing field<br>**IP1.13:** Whitespace-only string `"   "` | `user.model.js`: `required: true, trim: true` |
| **User Role** (Signup Body) | **VP1.6:** Standard user role implicit default | **IP1.14:** Malicious role injection `{"role": "admin"}` (must be ignored) | `auth.controller.js`: `role` must always default to `"user"` |
| **Authentication Token** (`auth_token` Cookie) | **VP1.7:** Valid, unexpired JWT signed with server `JWT_SECRET` | **IP1.15:** Missing cookie<br>**IP1.16:** Malformed / garbage string<br>**IP1.17:** Expired JWT timestamp<br>**IP1.18:** Tampered signature (wrong secret / `alg: "none"`) | `auth.middleware.js`: `jwt.verify(token, process.env.JWT_SECRET)` |

### 2.2 Module M2: Auction Management
| Input Field | Valid Equivalence Partitions (VP) | Invalid Equivalence Partitions (IP) | SUT Code Anchor & Enforcement Rule |
|---|---|---|---|
| **Item Name & Category** | **VP2.1:** Standard non-empty string | **IP2.1:** Empty string `""` / whitespace-only<br>**IP2.2:** Missing field<br>**IP2.3:** Non-string payload | `product.model.js`: `required: true` |
| **Starting Price** | **VP2.2:** Positive integer $\ge 1$ (e.g., 100, 500) | **IP2.4:** Zero (`0`)<br>**IP2.5:** Negative value (`-50`)<br>**IP2.6:** Non-numeric string (`"abc"`, `NaN`)<br>**IP2.7:** Missing / null | `product.model.js`: `min: 1` |
| **Auction Duration Dates** | **VP2.3:** `itemEndDate > itemStartDate` | **IP2.8:** `itemEndDate < itemStartDate`<br>**IP2.9:** `itemEndDate === itemStartDate`<br>**IP2.10:** Invalid date format / unparseable string<br>**IP2.11:** Missing `itemEndDate` | `auction.controller.js`: `new Date(end) <= new Date(start)` check |
| **Upload Session (`formId`)** | **VP2.4:** Valid `formId` in database with `status: "pending"` | **IP2.12:** Non-existent `formId`<br>**IP2.13:** Missing `formId` in payload<br>**IP2.14:** Already consumed `formId` (`status: "used"`) | `upload.model.js` & `auction.controller.js` |
| **Cloudinary Image Payload** | **VP2.5:** Valid `public_id` and `secure_url` strings | **IP2.15:** Missing `public_id`<br>**IP2.16:** Missing `secure_url` | `auction.controller.js`: Verification before DB creation |

### 2.3 Module M3: Live Bidding (REST & Socket.io)
| Input Parameter | Valid Equivalence Partitions (VP) | Invalid Equivalence Partitions (IP) | SUT Code Anchor & Enforcement Rule |
|---|---|---|---|
| **Bid Amount ($A$)** relative to base price $B = \max(current, starting)$ | **VP3.1:** $B + 1 \le A \le B + 10$ | **IP3.1:** $A < B + 1$ (under minimum allowable increment)<br>**IP3.2:** $A > B + 10$ (exceeds maximum allowable increment)<br>**IP3.3:** Non-numeric string (`"one-hundred"`, `"11a"`)<br>**IP3.4:** Null, undefined, or missing amount<br>**IP3.5:** Negative number ($-10$) or zero ($0$) | `auction.controller.js` & `auction.handler.js`: Range check $[B+1, B+10]$ |
| **Bidder Identity** | **VP3.2:** Authenticated user where `userId !== sellerId` | **IP3.6:** Unauthenticated user (no token)<br>**IP3.7:** User is the auction seller (`userId === sellerId`) | `auction.controller.js`: Seller bidding restriction |
| **Auction Lifecycle State** | **VP3.3:** Auction is currently active (`now < itemEndDate`) | **IP3.8:** Auction expired (`now >= itemEndDate`)<br>**IP3.9:** Auction scheduled in the future (`now < itemStartDate`) | `auction.controller.js`: Expiration validation |

### 2.4 Module M5 & M6: Admin & Contact
| Input / Action | Valid Equivalence Partitions (VP) | Invalid Equivalence Partitions (IP) | SUT Code Anchor & Enforcement Rule |
|---|---|---|---|
| **Admin Route Access** | **VP5.1:** Authenticated user with `role === "admin"` | **IP5.1:** Unauthenticated request<br>**IP5.2:** Authenticated user with `role === "user"` | `auth.middleware.js`: `checkAdmin` |
| **Pagination `page` & `limit`** | **VP5.2:** `page >= 1`, $1 \le \text{limit} \le 50$ | **IP5.3:** Negative page / limit (`page=-1`, `limit=-10`)<br>**IP5.4:** Zero (`limit=0`)<br>**IP5.5:** Non-numeric strings (`page="first"`) | `admin.controller.js` & `auction.controller.js` |
| **Contact Message** | **VP6.1:** Non-empty string $\le 10,000$ characters | **IP6.1:** Empty string / missing `message`<br>**IP6.2:** Payload exceeding Express JSON body cap (> 100 KB) | `contact.controller.js` |

---

## 3. Equivalence Partitioning Test Case Mapping

| Test Case ID | Target Module | Input Condition Tested | Equivalence Partition | Expected Result | Defect Tag |
|---|---|---|---|---|---|
| `TC-AUTH-001` | M1 Auth | Standard valid signup: `alice@example.com` | VP1.1, VP1.3, VP1.4 | 201 Created, `auth_token` cookie set | - |
| `TC-AUTH-002` | M1 Auth | Subdomain/tagged signup: `bob+test@sub.domain.co` | VP1.2 | 201 Created, `auth_token` cookie set | - |
| `TC-AUTH-004` | M1 Auth | Missing name in signup payload | IP1.12 | 400 Bad Request ("All fields are required") | - |
| `TC-AUTH-005` | M1 Auth | Missing email in signup payload | IP1.1 | 400 Bad Request ("All fields are required") | - |
| `TC-AUTH-006` | M1 Auth | Missing password in signup payload | IP1.8 | 400 Bad Request ("All fields are required") | - |
| `TC-AUTH-014` | M1 Auth | Malformed email without `@`: `aliceexample.com` | IP1.2 | 400 Bad Request (Validation error) | `@defect:D-04` |
| `TC-AUTH-015` | M1 Auth | Case-insensitive duplicate email `ALICE@example.com` | IP1.1 / VP1.1 | 400 Bad Request ("User already exists") | `@defect:D-04b` |
| `TC-AUTH-018` | M1 Auth | Signup payload containing `{"role": "admin"}` | IP1.14 | 201 Created with persisted `role: "user"` | - |
| `TC-AUTH-019` | M1 Auth | Password provided as number `12345678` | IP1.10 | 400 Bad Request (Type error) | `@defect:D-10` |
| `TC-AUTH-023` | M1 Auth | Login email containing NoSQL operator `{"$ne": null}` | IP1.6 | 400 Bad Request / 401 Unauthorized | `@defect:D-10` |
| `TC-AUC-001` | M2 Auction | Valid auction creation with active `formId` | VP2.1, VP2.2, VP2.3, VP2.4 | 201 Created, `Upload.status` set to "used" | - |
| `TC-AUC-003` | M2 Auction | Unknown / invalid `formId` | IP2.12 | 400 Bad Request ("Invalid upload session") | - |
| `TC-AUC-007` | M2 Auction | Replay already consumed `formId` | IP2.14 | 400 Bad Request ("Upload already used") | `@defect:D-05b` |
| `TC-AUC-010` | M2 Auction | Auction end date prior to start date | IP2.8 | 400 Bad Request ("End date must be after start") | - |
| `TC-BID-001` | M3 Bidding | Valid bid at $B + 5$ | VP3.1, VP3.2, VP3.3 | 200 OK, `currentPrice` updated | - |
| `TC-BID-004` | M3 Bidding | Bid below minimum increment ($B + 0$) | IP3.1 | 400 Bad Request ("at least") | - |
| `TC-BID-005` | M3 Bidding | Bid exceeding max increment ($B + 11$) | IP3.2 | 400 Bad Request ("at max") | - |
| `TC-BID-013` | M3 Bidding | Seller bids on own auction | IP3.7 | 403 Forbidden ("own auction") | - |
| `TC-BID-020` | M3 Bidding | Bid on future scheduled auction ($now < start$) | IP3.9 | 400 Bad Request ("Auction not yet started") | `@defect:D-01` |
| `TC-ADM-001` | M5 Admin | Admin user accesses `/api/admin/dashboard` | VP5.1 | 200 OK with analytics payload | - |
| `TC-ADM-002` | M5 Admin | Non-admin user accesses `/api/admin/dashboard` | IP5.2 | 403 Forbidden ("Admin access required") | - |
| `TC-ADM-007` | M5 Admin | Admin queries users with negative `limit=-5` | IP5.3 | Clamped to default or 400 Bad Request | `@defect:D-07` |
