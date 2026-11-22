# Decision Table (DT) Test Design

**System Under Test:** `theavnishkumar/online-auction-system` (`ecd4de475fdf49d54153ffaa57d42b392161007a`)  
**Document Reference:** `02_Test_Case_Design/3_Decision_Tables.md`  
**Technique:** Black-box multi-condition logic and decision table testing.

---

## 1. Overview of Decision Table Testing

Decision table testing systematically explores complex business logic where outcomes depend on combinations of conditions (inputs, system states, and business rules). Each column represents a unique combination of conditions (a rule) and specifies the corresponding expected system actions.

---

## 2. Decision Tables by Feature

### 2.1 Decision Table DT-1: Live Bidding Endpoint (`POST /api/auction/:id/bid`)
This table details the multi-condition validation order in the SUT backend. The conditions are evaluated sequentially; the first failing condition determines the output response.

| Rule ID | Authenticated? (C1) | Amount Numeric? (C2) | Auction Exists? (C3) | Caller $\ne$ Seller? (C4) | Not Ended? (C5) | $A \ge B + 1$? (C6) | $A \le B + 10$? (C7) | Price Unchanged / No Race? (C8) | Expected Outcome / HTTP Status | Response Message / Action |
|---|---|---|---|---|---|---|---|---|---|---|
| **R1** | **F** | – | – | – | – | – | – | – | **401 Unauthorized** | "Authentication required" |
| **R2** | **T** | **F** | – | – | – | – | – | – | **400 Bad Request** | "Invalid bid amount" |
| **R3** | **T** | **T** | **F** | – | – | – | – | – | **404 Not Found** | "Auction not found" |
| **R4** | **T** | **T** | **T** | **F** | – | – | – | – | **403 Forbidden** | "You cannot bid on your own auction" |
| **R5** | **T** | **T** | **T** | **T** | **F** | – | – | – | **400 Bad Request** | "Auction has already ended" |
| **R6** | **T** | **T** | **T** | **T** | **T** | **F** | – | – | **400 Bad Request** | "Bid must be at least Rs. {min}" |
| **R7** | **T** | **T** | **T** | **T** | **T** | **T** | **F** | – | **400 Bad Request** | "Bid must be at max Rs. {max}" |
| **R8** | **T** | **T** | **T** | **T** | **T** | **T** | **T** | **F** | **409 Conflict** | "Bid failed - price changed" |
| **R9** | **T** | **T** | **T** | **T** | **T** | **T** | **T** | **T** | **200 OK** | Price updated, bid recorded, event emitted |

#### Multi-Failure Precedence Verification:
- **Test Case:** Seller bids on own *ended* auction.
  - **REST Result:** Hits Rule R4 first $\to$ 403 Forbidden.
  - **Socket.io Result:** SUT socket handler checks expiry *before* seller identity $\to$ "Auction has already ended" (`@defect:D-09` Inconsistent Validation Order).

---

### 2.2 Decision Table DT-2: Auction Detail & State Resolution (`GET /api/auction/:id`)
Determines the dynamic lazy state transition of an auction when fetched by a user.

| Rule ID | Auction Exists? | Expired? (`now > end`) | Caller is Seller? | Caller is High Bidder? | Bids Exist? (`bids.length > 0`) | Winner Already Assigned? | Expected Status | Outcome / Side Effect |
|---|---|---|---|---|---|---|---|---|
| **R2.1** | **F** | – | – | – | – | – | **404 Not Found** | "Auction not found" |
| **R2.2** | **T** | **F** | – | – | – | – | **200 OK** | Live auction details returned |
| **R2.3** | **T** | **T** | **T** | – | **F** | – | **200 OK** | Ended without bids; `isSold: false`, `winner: null` |
| **R2.4** | **T** | **T** | **T** | – | **T** | **F** | **200 OK** | **State Transition:** Highest bidder written as `winner`, `isSold: true` saved to DB |
| **R2.5** | **T** | **T** | **T** | – | **T** | **T** | **200 OK** | Already resolved; returns persisted winner |
| **R2.6** | **T** | **T** | **F** | **T** | **T** | **F** | **200 OK** | **State Transition:** High bidder written as `winner`, `isSold: true` |
| **R2.7** | **T** | **T** | **F** | **F** | **T** | – | **403 Forbidden** | SUT restricts access to ended auction if caller neither seller nor bidder |

---

### 2.3 Decision Table DT-3: Administrative Role-Based Access Control (`/api/admin/*`)

| Rule ID | Token Present? | Token Valid? | User `role === "admin"`? | Expected Status | Action |
|---|---|---|---|---|---|
| **R3.1** | **F** | – | – | **401 Unauthorized** | Reject: "Authentication required" |
| **R3.2** | **T** | **F** | – | **401 Unauthorized** | Reject: "Invalid or expired token" |
| **R3.3** | **T** | **T** | **F** (`"user"`) | **403 Forbidden** | Reject: "Admin access required" |
| **R3.4** | **T** | **T** | **T** (`"admin"`) | **200 OK** | Allow: Access administrative dashboard / data |

---

### 2.4 Decision Table DT-4: Password Change (`PATCH /api/user/change-password`)

| Rule ID | All 3 Fields Present? | New Matches Confirm? | New $\ne$ Current? | New Length $\ge 8$? | Current Password Correct? | Expected Outcome |
|---|---|---|---|---|---|---|
| **R4.1** | **F** | – | – | – | – | **400 Bad Request** ("All fields are required") |
| **R4.2** | **T** | **F** | – | – | – | **400 Bad Request** ("New passwords do not match") |
| **R4.3** | **T** | **T** | **F** | – | – | **400 Bad Request** ("New password must be different") |
| **R4.4** | **T** | **T** | **T** | **F** | – | **400 Bad Request** ("Password must be at least 8 characters") |
| **R4.5** | **T** | **T** | **T** | **T** | **F** | **401 Unauthorized** ("Current password is incorrect") |
| **R4.6** | **T** | **T** | **T** | **T** | **T** | **200 OK** (Password updated with bcrypt hash) |

---

## 3. Decision Table Test Cases Mapping

| Test Case ID | Table | Target Rule | Tested Conditions | Expected Result |
|---|---|---|---|---|
| `TC-DT-001` | DT-1 | Rule R1 | Unauthenticated bid request | 401 Unauthorized |
| `TC-DT-002` | DT-1 | Rule R2 | Bid amount passed as string `"abc"` | 400 Bad Request |
| `TC-DT-003` | DT-1 | Rule R3 | Non-existent auction ObjectId | 404 Not Found |
| `TC-DT-004` | DT-1 | Rule R4 | Seller attempts to bid on own item | 403 Forbidden |
| `TC-DT-005` | DT-1 | Rule R5 | Bid placed after auction end date | 400 Bad Request |
| `TC-DT-006` | DT-1 | Rule R6 | Bid amount below required minimum ($B + 0$) | 400 Bad Request |
| `TC-DT-007` | DT-1 | Rule R7 | Bid amount exceeding maximum increment ($B + 15$) | 400 Bad Request |
| `TC-DT-008` | DT-1 | Rule R8 | Concurrent bid conflict (outdated price version) | 409 Conflict |
| `TC-DT-009` | DT-1 | Rule R9 | All conditions satisfied | 200 OK, Price updated |
| `TC-DT-010` | DT-2 | Rule R2.4 | First GET request on expired auction with bids | 200 OK, `winner` assigned |
| `TC-DT-011` | DT-3 | Rule R3.3 | Authenticated non-admin visits `/api/admin/dashboard` | 403 Forbidden |
| `TC-DT-012` | DT-4 | Rule R4.2 | New password does not match confirmation | 400 Bad Request |
