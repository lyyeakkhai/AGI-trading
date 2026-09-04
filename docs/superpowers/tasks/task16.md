TASK 16 — BINANCE EXCHANGE INTEGRATION FOUNDATION

You are implementing Task 16 of the AGI Trading platform.

Tasks 01–15 are already implemented.

Build ONLY Task 16.

This task introduces the foundation for real Binance connectivity.

IMPORTANT:

Do NOT enable unrestricted live trading.

Do NOT expose API secrets in the frontend.

Do NOT put Binance credentials in localStorage.

Do NOT hardcode credentials.

Do NOT allow Hermes to directly execute orders.

==================================================
1. OBJECTIVE
==================================================

Connect the application architecture to Binance in a secure,
controlled way.

The primary goal of this task is:

Binance Account
→ Secure Credential Configuration
→ Connection Test
→ Account Information
→ Balances
→ Market/Trading Permissions
→ Connection Status

This task establishes the exchange integration layer.

Real order execution is NOT the primary objective of this task.

==================================================
2. ARCHITECTURE
==================================================

Use this architecture:

Frontend
    ↓
Backend API
    ↓
Exchange Adapter
    ↓
Binance API

Never:

Frontend
    ↓
Binance API directly

The frontend must never receive:

API Secret

Private credentials

Signing keys

==================================================
3. EXCHANGE ADAPTER
==================================================

Create a provider abstraction.

Example:

ExchangeAdapter

Methods:

connect()

disconnect()

testConnection()

getAccount()

getBalances()

getMarkets()

getTicker()

getOpenOrders()

getPositions()

getPermissions()

Do not tightly couple the rest of the application directly to Binance.

Future exchanges should be able to implement the same interface.

==================================================
4. BINANCE ADAPTER
==================================================

Create:

BinanceAdapter

Implement the exchange abstraction.

Use the official Binance API integration appropriate for the
application's selected market/environment.

Keep all exchange-specific logic inside:

exchange/binance/

Do not scatter Binance-specific code throughout the application.

==================================================
5. CREDENTIAL MANAGEMENT
==================================================

Create secure server-side credential handling.

Configuration:

BINANCE_API_KEY

BINANCE_API_SECRET

Never expose these to the browser.

Never return the secret through an API response.

Never log the secret.

Never commit credentials to source control.

Provide environment configuration examples only.

Example:

BINANCE_API_KEY=...
BINANCE_API_SECRET=...

Use placeholders.

==================================================
6. CONNECTION STATUS
==================================================

Update:

/settings/exchanges

Show:

Binance

Status:

CONNECTED

or

NOT CONNECTED

or

CONNECTION ERROR

Show:

Last Checked

Permissions

Environment

Example:

Binance

● CONNECTED

Environment:
PAPER / TESTNET

Permissions:
Read

Last Checked:
09:42:18

==================================================
7. SAFE DEFAULT
==================================================

Default environment:

TESTNET / PAPER

depending on the existing application architecture.

Live trading must remain OFF by default.

If the project cannot safely support testnet yet,
keep the integration read-only and clearly label it.

==================================================
8. CONNECTION TEST
==================================================

Implement:

[ Test Connection ]

The backend should verify the configured credentials and return only:

Connected
or
Connection Failed

Do not return secrets.

Show useful error messages.

Example:

Connection failed.

Reason:
Invalid API credentials.

Do not expose sensitive exchange response data unnecessarily.

==================================================
9. ACCOUNT INFORMATION
==================================================

Create account information under:

/settings/exchanges

Show:

Account Status

Exchange

Environment

Permissions

Account Type

Connection Time

Example:

Binance

Account:
Connected

Environment:
Testnet

Permission:
Read

Trading:
Disabled

==================================================
10. BALANCES
==================================================

Create a Binance account balance section.

Show:

Asset

Available

Locked

Total

Example:

USDT
$8,420
$0
$8,420

BTC
0.042
0
0.042

ETH
0.72
0.1
0.82

Only show balances returned by the exchange integration.

If the backend is still mocked:

clearly label:

SIMULATED DATA

Do not mix fake and real balances without labeling.

==================================================
11. ACCOUNT BALANCE RELATIONSHIP
==================================================

The exchange account becomes the future source for:

Portfolio

Positions

Analytics

Risk

Execution

But DO NOT rewrite those systems in this task.

Instead establish the integration boundary.

Future architecture:

Binance
↓
Account Sync
↓
Portfolio
↓
Risk
↓
Execution

==================================================
12. MARKET DATA
==================================================

Add a basic Binance market-data adapter.

Support:

Ticker

Symbol metadata

Exchange information where appropriate

Example:

BTC/USDT

Price

24h Change

Volume

Do not replace the entire existing Markets implementation unless required.

Do not introduce duplicate market-data architecture.

==================================================
13. CONNECTION HEALTH
==================================================

Create:

Exchange Health

Show:

API Connectivity
● HEALTHY

Account Sync
● HEALTHY

Market Data
● HEALTHY

Authentication
● VALID

Last Successful Request
09:42:18

If disconnected:

● ERROR

with:

[ Retry Connection ]

==================================================
14. API RATE LIMIT AWARENESS
==================================================

Create a basic integration status field:

Rate Limit Status

Healthy

or:

Approaching Limit

Do not implement sophisticated rate-limit optimization yet.

If Binance returns rate-limit information,
do not ignore it.

==================================================
15. ERROR HANDLING
==================================================

Handle:

Invalid credentials

Unauthorized request

Network failure

Timeout

Rate limit

Exchange unavailable

Malformed response

Unknown error

Map exchange errors into safe application-level errors.

Example:

BINANCE_AUTH_ERROR

BINANCE_RATE_LIMIT

BINANCE_TIMEOUT

BINANCE_UNAVAILABLE

Do not expose raw secrets or unnecessary internal stack traces.

==================================================
16. RETRY BEHAVIOR
==================================================

Implement safe retry behavior for transient failures.

Do not retry:

Invalid credentials

Unauthorized

Permission errors

Do retry where appropriate:

Timeout

Temporary network failure

Temporary exchange unavailable

Use bounded retries.

Do not create infinite retry loops.

==================================================
17. TIMEOUTS
==================================================

All exchange requests must have explicit timeouts.

Never allow a request to hang indefinitely.

Use the project's existing HTTP infrastructure where available.

==================================================
18. LOGGING
==================================================

Create structured exchange logs.

Example:

09:42:18
BINANCE
GET_ACCOUNT
SUCCESS
84ms

09:42:14
BINANCE
GET_BALANCES
SUCCESS
71ms

09:41:02
BINANCE
TEST_CONNECTION
FAILED
AUTH_ERROR

Never log:

API key

API secret

Authorization headers

Signed request payloads containing secrets

==================================================
19. ACTIVITY INTEGRATION
==================================================

Connect exchange events conceptually to:

/activity

Examples:

Binance connection established

Account synchronization completed

Connection test failed

Market data request failed

Credentials configuration changed

Use the existing Activity architecture.

Do not create a second audit system.

==================================================
20. SETTINGS INTEGRATION
==================================================

Update:

/settings/exchanges

The exchange settings page should now represent the actual integration state.

Show:

Connection

Environment

Permissions

Account

Health

Last Sync

Use:

[ Test Connection ]

[ Refresh Account ]

[ Disconnect ]

IMPORTANT:

Disconnect must not delete credentials from arbitrary places.

Use the project's secure credential handling.

==================================================
21. SECURITY
==================================================

Security is a primary acceptance criterion.

NEVER:

Expose secret to frontend

Store secret in localStorage

Store secret in sessionStorage

Put secret in URL

Put secret in query parameters

Log secret

Commit secret

Render secret

Send secret from browser directly to Binance

Use mock credentials that look like real credentials.

==================================================
22. PERMISSIONS
==================================================

Detect/display available Binance permissions.

Example:

Read
✓

Spot Trading
OFF

Futures
OFF

Withdrawals
OFF

For this MVP:

Trading should remain disabled unless explicitly configured later.

Withdrawals must remain disabled.

==================================================
23. LIVE TRADING SAFETY
==================================================

Live trading must remain disabled.

Create explicit state:

LIVE TRADING

● DISABLED

Do NOT provide a functional:

"Enable Live Trading"

button.

Instead:

[ Live Trading Setup ]

may show:

"Live execution will be enabled in a future controlled deployment."

==================================================
24. HERMES BOUNDARY
==================================================

Hermes must NOT gain direct Binance access.

Correct:

Hermes
→ Trade Proposal
→ Risk
→ Owner Approval
→ Execution Service
→ Binance

Incorrect:

Hermes
→ Binance

This architectural boundary must remain explicit.

==================================================
25. EXECUTION BOUNDARY
==================================================

Create the interface boundary for a future:

ExecutionService

Example:

validateOrder()

submitOrder()

cancelOrder()

getOrderStatus()

But in Task 16:

DO NOT implement real order submission.

Methods may return:

NOT_IMPLEMENTED

or remain behind a disabled feature flag.

==================================================
26. FEATURE FLAGS
==================================================

Create safe flags if the project architecture supports them:

BINANCE_ENABLED

BINANCE_TESTNET_ENABLED

LIVE_TRADING_ENABLED

ORDER_EXECUTION_ENABLED

Recommended defaults:

BINANCE_ENABLED=true

BINANCE_TESTNET_ENABLED=true

LIVE_TRADING_ENABLED=false

ORDER_EXECUTION_ENABLED=false

Never allow frontend state alone to activate live trading.

==================================================
27. ENVIRONMENT SEPARATION
==================================================

Clearly separate:

DEVELOPMENT

TESTNET

PAPER

LIVE

Never allow accidental mixing.

Example:

Environment:
TESTNET

Live Trading:
DISABLED

==================================================
28. DATA NORMALIZATION
==================================================

Normalize Binance responses into internal models.

Example:

Balance:

asset
available
locked
total

Ticker:

symbol
price
change24h
volume24h
timestamp

Account:

status
permissions
environment

Do not allow Binance-specific response structures to leak throughout
the frontend.

==================================================
29. UI
==================================================

Update Settings → Exchanges.

Create:

ExchangeConnectionCard

AccountSummary

BalanceTable

ConnectionHealth

PermissionStatus

SyncStatus

ConnectionTestResult

Use existing Obsidian Intelligence design.

Do not create a new visual style.

==================================================
30. CONNECTION UX
==================================================

Disconnected:

Binance

● NOT CONNECTED

Environment:
TESTNET

[ Configure ]

Connected:

Binance

● CONNECTED

Environment:
TESTNET

[ Refresh ]

[ Disconnect ]

Error:

Binance

● CONNECTION ERROR

[ Retry ]

==================================================
31. SYNC
==================================================

Create:

[ Refresh Account ]

Show:

Syncing...

then:

Account synchronized.

Display:

Last Sync:
09:42:18

Do not continuously poll Binance.

Use explicit/manual refresh for MVP unless the existing architecture
already provides controlled polling.

==================================================
32. MOCK FALLBACK
==================================================

If Binance credentials are not configured:

do NOT fabricate a successful Binance connection.

Show:

Binance

● NOT CONFIGURED

"Configure Binance credentials to connect this workspace."

The application must continue functioning in demo/paper mode.

==================================================
33. DEVELOPMENT EXPERIENCE
==================================================

The application must remain usable without Binance credentials.

Therefore:

No credentials:
Demo mode works.

Testnet credentials:
Real testnet account data works.

Live credentials:
Do NOT enable live trading automatically.

==================================================
34. BACKEND STRUCTURE
==================================================

Follow the project's existing backend architecture.

Conceptually:

/api/exchanges/binance

or equivalent.

Suggested separation:

exchange/
    adapter
    binance
    models
    errors

Do not force this exact directory structure if the existing project
has a better established architecture.

==================================================
35. API ENDPOINTS
==================================================

Create appropriate internal endpoints such as:

GET /api/exchange/binance/status

POST /api/exchange/binance/test

GET /api/exchange/binance/account

GET /api/exchange/binance/balances

GET /api/exchange/binance/health

Use the project's existing API conventions.

Do NOT expose credentials through these endpoints.

==================================================
36. FRONTEND API CLIENT
==================================================

Create a centralized exchange client.

Example:

exchangeApi.getStatus()

exchangeApi.testConnection()

exchangeApi.getAccount()

exchangeApi.getBalances()

exchangeApi.getHealth()

Do not call exchange endpoints directly from individual components.

==================================================
37. TESTING
==================================================

Create tests for:

Credential validation

Connection success

Authentication failure

Timeout

Rate limit

Account normalization

Balance normalization

Status handling

Feature flags

Live trading disabled

No credential leakage

==================================================
38. DO NOT IMPLEMENT
==================================================

Do NOT implement:

Real order placement

Real order cancellation

Real live trading

Automatic live trading

Hermes autonomous execution

Withdrawal functionality

API secret frontend storage

Credential logging

Real emergency stop

Full exchange synchronization engine

Complex portfolio reconciliation

Advanced execution algorithms

Task 17

==================================================
39. ACCEPTANCE CRITERIA
==================================================

Task 16 is complete when:

1. Binance integration architecture exists.

2. Exchange adapter abstraction exists.

3. Binance adapter exists.

4. Credentials are server-side only.

5. Credentials are never exposed to frontend.

6. Credentials are never stored in localStorage.

7. Connection testing works.

8. Account information can be retrieved.

9. Balances can be retrieved.

10. Binance market data can be retrieved where supported.

11. Connection health is visible.

12. Errors are normalized.

13. Timeouts exist.

14. Safe retry behavior exists.

15. Rate-limit errors are handled.

16. Structured logging exists without secrets.

17. Activity integration exists.

18. Settings → Exchanges is integrated.

19. Permissions are visible.

20. Withdrawals remain disabled.

21. Live trading remains disabled.

22. Order execution remains disabled.

23. Hermes cannot directly access Binance.

24. Demo mode works without credentials.

25. Testnet/paper environment is clearly separated.

26. Mock data is never presented as real Binance data.

27. Existing Tasks 01–15 remain functional.

28. No TypeScript/lint/build errors.

29. Security tests pass.

30. No credentials or secrets appear in logs, browser storage,
URLs, API responses, or UI.

==================================================
40. FINAL VERIFICATION
==================================================

Before finishing:

- Run the application.
- Open /settings/exchanges.
- Verify disconnected state without credentials.
- Verify demo mode still works.
- Configure test credentials through secure server configuration.
- Test connection.
- Verify account information.
- Verify balances.
- Verify health.
- Verify permissions.
- Test failed authentication.
- Test timeout handling.
- Test rate-limit handling.
- Test retry behavior.
- Verify Activity events.
- Verify no secret appears in browser.
- Verify no secret appears in logs.
- Verify no secret appears in API responses.
- Verify no secret appears in URLs.
- Verify LIVE_TRADING_ENABLED remains false.
- Verify ORDER_EXECUTION_ENABLED remains false.
- Verify Hermes has no direct Binance access.
- Verify Tasks 01–15 remain functional.
- Run tests.
- Run lint.
- Run type checking.
- Run production build.

STOP after completing Task 16.

DO NOT implement Task 17.