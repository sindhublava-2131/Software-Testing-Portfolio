# Boundary Value Analysis (BVA) Test Design

**System Under Test:** `theavnishkumar/online-auction-system` (`ecd4de475fdf49d54153ffaa57d42b392161007a`)  
**Document Reference:** `02_Test_Case_Design/2_Boundary_Value_Analysis.md`  
**Technique:** Black-box boundary value testing on allowable parameter ranges.

---

## 1. Overview of Boundary Value Analysis

Boundary Value Analysis tests values at the extreme edges of equivalence partitions: precisely at the minimum, just below the minimum, just above the minimum, nominal, just below the maximum, at the maximum, and just above the maximum. Software defects are disproportionately concentrated at operational boundaries due to off-by-one errors, conditional operator mismatches (`<` vs. `<=`), and unexpected type coercion.

---

## 2. Key Mathematical Boundaries in SUT

### 2.1 Live Bidding Increments
The SUT specifies that a valid bid $A$ must fall strictly within the range:
$$\text{allowedBid} \in [B + 1, B + 10]$$
where $B = \max(\text{currentPrice}, \text{startingPrice})$.

For an auction with current base price $B = 100$:
- $\text{Lower Boundary}: B + 1 = 101$
- $\text{Upper Boundary}: B + 10 = 110$

| Boundary Point | Concrete Test Value | Classification | Expected Result | Actual Behavior & Notes |
|---|---|---|---|---|
| $B - 1$ | 99 | Invalid (Below base) | 400 Bad Request | Rejection: "Bid must be at least Rs. 101" |
| $B$ | 100 | Invalid (Equal to base) | 400 Bad Request | Rejection: "Bid must be at least Rs. 101" |
| **$B + 1$** | **101** | **Valid (Exact Min)** | **200 OK** | **Accepted:** Price moves to 101 |
| $B + 2$ | 102 | Valid (Nominal Low) | 200 OK | Accepted |
| $B + 9$ | 109 | Valid (Nominal High) | 200 OK | Accepted |
| **$B + 10$** | **110** | **Valid (Exact Max)** | **200 OK** | **Accepted:** Price moves to 110 |
| $B + 11$ | 111 | Invalid (Above Max) | 400 Bad Request | Rejection: "Bid must be at max Rs. 110" |
| $B + 0.5$ | 100.5 | Invalid / Decimal | 400 Bad Request | Non-integer rejected / truncated |
| $B + 10.5$ | 110.5 | Invalid (Above Max) | 400 Bad Request | Rejection: Exceeds upper boundary |
| $\text{Zero}$ | 0 | Invalid (Extreme Low) | 400 Bad Request | Rejection |
| $\text{Negative}$ | -1 | Invalid (Negative) | 400 Bad Request | Rejection |
| $\text{String Form}$ | `"110"` | Valid (Type Coercion) | 200 OK | Accepted: Coerced to Number 110 |
| $\text{Malformed}$ | `"110a"` | Invalid (NaN) | 400 Bad Request | Rejection: "Invalid bid amount" |

---

### 2.2 Password Length Constraints
Password validation rules require a minimum length of 8 characters:
$$\text{len}(\text{password}) \ge 8$$
Note: bcrypt algorithms also have a known 72-byte truncation boundary.

| Test Point | Length (chars) | Concrete Input String | Expected Outcome | Technical Note |
|---|---|---|---|---|
| Lower Invalid | 0 | `""` | 400 Bad Request | Empty field detected |
| Just Below Min | 7 | `"Pass12!"` | 400 Bad Request | "Password must be at least 8 characters" |
| **Exact Minimum** | **8** | **`"Pass123!"`** | **201 Created** | **Account created successfully** |
| Just Above Min | 9 | `"Pass1234!"` | 201 Created | Account created successfully |
| Nominal | 16 | `"A_Strong_P@ssw0rd!"`| 201 Created | Nominal length accepted |
| Bcrypt Boundary | 72 | 72-character ASCII string | 201 Created | Full hash calculation |
| Bcrypt Truncate | 73 | 73-character ASCII string | 201 Created | Bcrypt ignores 73rd byte |
| Stress Length | 1,000 | 1,000-character ASCII string | 201 Created | Verified no denial of service |

---

### 2.3 Starting Price Constraints
Mongoose schema enforces: `min: 1`.

| Boundary Point | Value | Classification | Expected Result | Defect Hypothesis |
|---|---|---|---|---|
| Below Min | -1 | Invalid | 400 Bad Request | Schema validation failure |
| Zero | 0 | Invalid | 400 Bad Request | `@defect:D-05` (SUT returns 500) |
| Non-integer | 0.99 | Invalid | 400 Bad Request | Sub-integer rejected |
| **Exact Min** | **1** | **Valid** | **201 Created** | **Auction created with starting price 1** |
| Just Above Min | 2 | Valid | 201 Created | Nominal valid starting price |
| Large Integer | $10^9$ | Valid | 201 Created | High value accepted |
| Extreme Bound | `MAX_SAFE_INT` | Edge Case | 201 Created | JavaScript Number limit |

---

### 2.4 Auction Expiration & Time Offsets
Let $T_{\text{end}}$ be `itemEndDate`.

| Test Scenario | Time of Bid Submission | Expected Result | Actual Behavior |
|---|---|---|---|
| End $- 2\text{ s}$ | Valid active window | 200 OK | Bid accepted |
| End $- 50\text{ ms}$ | Valid active window (racing close) | 200 OK | Bid accepted |
| **Exact End** | $t = T_{\text{end}}$ | 400 Bad Request | "Auction has already ended" |
| End $+ 50\text{ ms}$ | Past expiration | 400 Bad Request | "Auction has already ended" |
| End $+ 2\text{ s}$ | Past expiration | 400 Bad Request | "Auction has already ended" |

---

### 2.5 Pagination Limit Boundaries (`/api/auction`, `/api/admin/users`)

| Query Parameter | Value | Expected Server Response | SUT Status |
|---|---|---|---|
| `limit` (falsy) | 0 | Coerced to default 12 | Handled in `showAuction`, bug in `getAllUsers` |
| `limit` (minimum) | 1 | Exactly 1 item returned | 200 OK |
| `limit` (default) | 12 | Up to 12 items returned | 200 OK |
| `limit` (maximum) | 50 | Up to 50 items returned | 200 OK |
| `limit` (over max) | 51 | Clamped to 50 items | Clamped in `showAuction` |
| `limit` (negative)| -5 | Handled gracefully / 400 | `@defect:D-07` in `getAllUsers` (500 crash) |
| `page` (negative) | -1 | Handled gracefully / 400 | `@defect:D-07` in `getAllUsers` (500 crash) |

---

## 3. Boundary Value Analysis Test Case Mapping

| Test Case ID | Target Feature | Boundary Condition | Input Value | Expected Result |
|---|---|---|---|---|
| `TC-AUTH-009` | Password | Just below minimum | Length 7 | 400 Bad Request |
| `TC-AUTH-010` | Password | Exact minimum boundary | Length 8 | 201 Created |
| `TC-AUTH-011` | Password | Just above minimum | Length 9 | 201 Created |
| `TC-AUC-012` | Starting Price | Zero starting price | `startingPrice: 0` | 400 Bad Request (`@defect:D-05`) |
| `TC-AUC-013` | Starting Price | Exact minimum | `startingPrice: 1` | 201 Created |
| `TC-BID-006` | Bid Increment | Exact lower boundary | $B + 1$ | 200 OK |
| `TC-BID-007` | Bid Increment | Exact upper boundary | $B + 10$ | 200 OK |
| `TC-BID-008` | Bid Increment | Just above upper boundary | $B + 11$ | 400 Bad Request |
| `TC-BID-009` | Bid Increment | Just below lower boundary | $B$ | 400 Bad Request |
| `TC-BID-010` | Bid Increment | Decimal bid value | $B + 10.5$ | 400 Bad Request |
| `TC-BID-015` | Time Boundary | Bid post-expiration | $T_{\text{end}} + 1\text{ s}$ | 400 Bad Request |
| `TC-ADM-010` | Pagination | Negative page boundary | `page: -1` | Clamped / 400 (`@defect:D-07`) |
