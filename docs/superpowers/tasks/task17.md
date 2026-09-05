TASK 17 — EXECUTION ENGINE & ORDER LIFECYCLE

You are implementing Task 17 of the AGI Trading platform.

Tasks 01–16 are already implemented:

01 App Shell
02 Design System + Shared Components
03 Overview
04 Markets + TradingView Chart
05 Hermes & AI Intelligence
06 Opportunities
07 Trade Proposals
08 Positions & Portfolio
09 Strategies
10 Backtests
11 Risk Management
12 Analytics
13 Activity & Audit
14 Settings
15 Global Polish
16 Binance Integration Foundation

Build ONLY Task 17.

Do not redesign previous tasks unless required for integration.

==================================================
1. OBJECTIVE
==================================================

Build the controlled execution layer between:

Owner Approval

and

Exchange

The intended architecture is:

Hermes
↓
Trade Proposal
↓
Risk Validation
↓
Owner Approval
↓
Execution Engine
↓
Binance Adapter
↓
Exchange

The Execution Engine is responsible for:

- validating execution eligibility
- creating an execution request
- managing order lifecycle
- submitting approved orders
- tracking order state
- handling failures
- reconciling order status
- updating positions
- recording activity

IMPORTANT:

Live trading MUST remain disabled by default.

The system must be safe to run in PAPER/TESTNET mode.

==================================================
2. CRITICAL AUTHORITY BOUNDARY
==================================================

Hermes may:

ANALYZE
INVESTIGATE
PROPOSE

Hermes may NOT:

EXECUTE
BYPASS RISK
BYPASS OWNER APPROVAL

Risk Engine:

VALIDATES

Owner:

APPROVES

Execution Engine:

EXECUTES ONLY AN APPROVED REQUEST

Binance:

FILLS THE ORDER

Never allow:

Hermes → Binance

==================================================
3. ORDER LIFECYCLE
==================================================

Implement this conceptual lifecycle:

DRAFT

↓

RISK_PENDING

↓

RISK_APPROVED

↓

OWNER_PENDING

↓

OWNER_APPROVED

↓

EXECUTION_PENDING

↓

SUBMITTED

↓

PARTIALLY_FILLED

↓

FILLED

or:

REJECTED

FAILED

CANCELLED

EXPIRED

Each transition must be explicit.

==================================================
4. EXECUTION REQUEST
==================================================

Create an internal execution request model.

Example:

ExecutionRequest

id

proposalId

riskDecisionId

approvalId

symbol

side

orderType

quantity

limitPrice

stopPrice

takeProfitPrice

environment

status

createdAt

approvedAt

submittedAt

completedAt

exchangeOrderId

failureReason

==================================================
5. EXECUTION ELIGIBILITY
==================================================

Before execution, validate:

1. Proposal exists.

2. Proposal is approved.

3. Risk validation passed.

4. Owner approval exists.

5. Execution is enabled.

6. Environment is valid.

7. Symbol is valid.

8. Quantity is valid.

9. Order parameters are valid.

10. Live trading flag is enabled ONLY when explicitly allowed.

If any condition fails:

DO NOT execute.

Return a clear reason.

==================================================
6. DOUBLE-EXECUTION PROTECTION
==================================================

Prevent duplicate execution.

If an execution request already exists for:

proposalId

and

approvalId

do not submit another order.

Example:

Execution already exists.

Execution ID:
EXE-0042

Status:
SUBMITTED

This is a critical safety requirement.

==================================================
7. IDEMPOTENCY
==================================================

Create an idempotency key.

Example:

EXEC-PROP-042

Use it to prevent accidental duplicate orders.

The same execution request must not create multiple exchange orders.

==================================================
8. EXECUTION PAGE
==================================================

Create:

/execution

This should become the operational execution workspace.

Header:

Execution

Controlled order execution and lifecycle monitoring.

Environment:

PAPER

Status:

● READY

==================================================
9. EXECUTION SUMMARY
==================================================

Show:

Pending Approval
3

Ready to Execute
2

Submitted
1

Partially Filled
0

Filled Today
4

Failed
0

Cancelled
1

Use existing metric components.

==================================================
10. EXECUTION QUEUE
==================================================

Create:

Execution Queue

Columns:

Proposal
Symbol
Side
Order Type
Quantity
Risk
Approval
Environment
Status
Created
Action

Example:

PROP-042
BTC/USDT
LONG
LIMIT
0.042 BTC
0.8%
APPROVED
PAPER
READY
09:42

Action:

[ Review ]

==================================================
11. EXECUTION DETAIL
==================================================

Selecting an execution request opens:

Execution Detail

Execution ID:
EXE-0042

Proposal:
PROP-042

Symbol:
BTC/USDT

Side:
LONG

Order Type:
LIMIT

Quantity:
0.042 BTC

Limit Price:
$114,000

Risk:
0.8%

Environment:
PAPER

Risk:
APPROVED

Owner:
APPROVED

Execution:
READY

Show complete authorization chain:

Proposal
✓

Risk
✓

Owner
✓

Execution
READY

==================================================
12. APPROVAL CHAIN
==================================================

Create:

Authorization Chain

Trade Proposal
PROP-042
APPROVED

Risk Validation
RISK-042
PASSED

Owner Approval
APR-042
APPROVED

Execution Request
EXE-042
READY

This makes it visually impossible to confuse a proposal with an executable order.

==================================================
13. EXECUTE ACTION
==================================================

For PAPER/TESTNET:

Show:

[ Execute Paper Order ]

Before execution:

Confirmation modal:

Execute Order?

BTC/USDT LONG

Quantity:
0.042 BTC

Price:
$114,000

Risk:
0.8%

Environment:
PAPER

Risk:
APPROVED

Owner:
APPROVED

Buttons:

Cancel

Execute

==================================================
14. LIVE EXECUTION
==================================================

LIVE execution must remain disabled.

If environment is LIVE:

show:

LIVE EXECUTION DISABLED

"Live order execution is not enabled in this deployment."

Do NOT show a functional live execution button.

==================================================
15. ORDER TYPES
==================================================

Support the UI model for:

MARKET

LIMIT

STOP

STOP_LIMIT

But only enable order types supported by the current exchange
adapter/environment.

For unsupported types:

show:

Unsupported in current environment.

==================================================
16. ORDER VALIDATION
==================================================

Before submission validate:

Symbol

Side

Quantity

Price

Order Type

Minimum quantity

Price precision

Quantity precision

Environment

Risk approval

Owner approval

Execution feature flag

Return:

VALID

or:

INVALID

with specific reasons.

==================================================
17. BINANCE ADAPTER INTEGRATION
==================================================

Use the Binance adapter created in Task 16.

Execution Engine should NOT know Binance-specific details.

Correct:

Execution Engine
→ ExchangeAdapter
→ BinanceAdapter

Not:

Execution Engine
→ Binance REST API directly

==================================================
18. PAPER EXECUTION
==================================================

Create a deterministic paper execution mode.

When:

PAPER

is active:

orders are simulated.

Example:

Submitted:
09:42:18

Simulated Fill:
09:42:20

Price:
$114,120

Quantity:
0.042 BTC

Status:
FILLED

Do not use random results.

==================================================
19. TESTNET EXECUTION
==================================================

If Testnet execution is supported by the project:

allow controlled testnet order submission.

Clearly label:

TESTNET

This is NOT production trading.

Use the existing Binance adapter.

Do not automatically enable it.

==================================================
20. ORDER STATUS
==================================================

Support:

READY

SUBMITTING

SUBMITTED

PARTIALLY_FILLED

FILLED

REJECTED

FAILED

CANCELLED

EXPIRED

UNKNOWN

Use consistent status badges.

==================================================
21. ORDER DETAIL
==================================================

For submitted orders show:

Execution ID

Exchange Order ID

Proposal ID

Symbol

Side

Type

Quantity

Requested Price

Average Fill Price

Filled Quantity

Remaining Quantity

Fee

Slippage

Status

Created

Submitted

Updated

==================================================
22. PARTIAL FILLS
==================================================

Support partial-fill UI.

Example:

Requested:
0.100 BTC

Filled:
0.060 BTC

Remaining:
0.040 BTC

Status:

PARTIALLY FILLED

Show fill progress.

Do not assume all orders fill immediately.

==================================================
23. FAILED EXECUTION
==================================================

Example:

Execution Failed

BTC/USDT LONG

Reason:

Exchange rejected order.

Error:

INVALID_QUANTITY

Show:

[ Review Order ]

Do NOT automatically retry dangerous failures.

==================================================
24. RETRY
==================================================

Only allow retry when safe.

Never retry:

Invalid quantity

Invalid price

Permission denied

Insufficient balance

Risk violation

Owner approval missing

Allow controlled retry for:

Temporary network failure

Timeout

Transient exchange availability issue

Before retry:

re-check authorization and idempotency.

==================================================
25. CANCELLATION
==================================================

For supported open orders:

show:

[ Cancel Order ]

Confirmation:

Cancel order?

BTC/USDT

Remaining:
0.042 BTC

Buttons:

Cancel

Keep Order

Cancellation should require an explicit user action.

Do not allow Hermes to cancel orders autonomously.

==================================================
26. EXECUTION HISTORY
==================================================

Create:

Execution History

Columns:

Time
Execution
Proposal
Symbol
Side
Quantity
Average Price
Status
Environment

Example:

09:42
EXE-042
PROP-042
BTC/USDT
LONG
0.042
$114,120
FILLED
PAPER

==================================================
27. EXECUTION TIMELINE
==================================================

For each execution:

Proposal Created
↓

Risk Approved
↓

Owner Approved
↓

Execution Created
↓

Order Submitted
↓

Fill Received
↓

Position Updated

Show timestamps.

This is operational history only.

Do NOT show hidden AI reasoning.

==================================================
28. POSITION INTEGRATION
==================================================

After a successful fill:

Execution

→ Position update

For PAPER mode:

update the existing mock position system.

Do not create a separate portfolio.

Maintain one source of truth.

==================================================
29. ACTIVITY INTEGRATION
==================================================

Every important execution event should appear in:

/activity

Examples:

Execution request created

Owner approval verified

Order submitted

Order partially filled

Order filled

Order rejected

Order cancelled

Execution failed

Position updated

Use the existing Activity system.

Do not create a second audit log.

==================================================
30. RISK INTEGRATION
==================================================

Execution must reference the Risk decision.

Example:

Risk Decision:

RISK-042

Result:

APPROVED

Risk:

0.8%

Execution must reject requests where:

Risk is missing

Risk is failed

Risk approval expired

Proposal changed after approval

==================================================
31. PROPOSAL IMMUTABILITY
==================================================

Once a proposal has been approved:

critical execution parameters must not silently change.

If:

quantity

side

symbol

stop

risk

or

target

changes,

invalidate the approval and require re-validation.

This is a critical safety rule.

==================================================
32. OWNER APPROVAL
==================================================

Execution requires:

Owner Approval = APPROVED

If:

PENDING

show:

Execution blocked.

Waiting for owner approval.

If:

REJECTED

show:

Execution blocked.

Owner rejected proposal.

==================================================
33. EXECUTION LOCK
==================================================

Create a global execution state:

Execution Service

● READY

Possible states:

READY

PAUSED

LOCKED

ERROR

If LOCKED:

No new execution requests may be submitted.

==================================================
34. KILL SWITCH BOUNDARY
==================================================

Do NOT build a real emergency kill switch yet.

You may expose:

Execution Lock:

LOCKED / UNLOCKED

as a controlled frontend/backend feature flag.

Default:

UNLOCKED for PAPER

LOCKED for LIVE

Never allow a frontend-only toggle to bypass backend safety.

==================================================
35. ENVIRONMENT SAFETY
==================================================

Every execution must clearly display:

PAPER

TESTNET

LIVE

Use strong visual separation.

Example:

PAPER

SIMULATED EXECUTION

For LIVE:

LIVE

EXECUTION DISABLED

==================================================
36. EXECUTION METRICS
==================================================

Show:

Orders Today

Filled

Failed

Cancelled

Fill Rate

Average Execution Time

Average Slippage

Fees

These may be deterministic mock values.

==================================================
37. EXECUTION QUALITY
==================================================

For completed orders show:

Requested Price

Average Fill

Slippage

Fee

Execution Time

Example:

Requested:
$114,000

Average Fill:
$114,120

Slippage:
0.105%

Fee:
$2.87

Execution Time:
1.8s

==================================================
38. SEARCH & FILTERS
==================================================

Support:

Search:

Execution ID
Proposal ID
Symbol
Exchange Order ID

Filters:

Status

Environment

Symbol

Side

Date

==================================================
39. MOCK DATA
==================================================

Create centralized deterministic mock data.

Example:

executionRequestsMock

executionHistoryMock

orderFillsMock

executionMetricsMock

Do not scatter mock data throughout components.

==================================================
40. COMPONENTS
==================================================

Create reusable components where useful:

ExecutionHeader
ExecutionSummary
ExecutionQueue
ExecutionDetail
AuthorizationChain
ExecutionTimeline
OrderStatus
OrderValidation
OrderFillProgress
ExecutionHistory
ExecutionMetrics
ExecutionFilters
ExecutionConfirmation
ExecutionError

Reuse existing components.

==================================================
41. RESPONSIVE DESIGN
==================================================

Desktop:

------------------------------------------------
| Execution                     PAPER READY    |
------------------------------------------------
| Summary Metrics                              |
------------------------------------------------
| Execution Queue                              |
------------------------------------------------
| Selected Execution                           |
------------------------------------------------
| Authorization Chain                          |
------------------------------------------------
| Execution Timeline                           |
------------------------------------------------
| Execution History                            |
------------------------------------------------

Mobile:

- execution queue becomes cards
- details become full-screen sections
- critical environment/status always visible
- confirmation actions remain accessible
- no page-level horizontal overflow

==================================================
42. SECURITY RULES
==================================================

Never expose:

API secrets

API keys

signatures

private credentials

authorization headers

raw signed payloads

Do not log credentials.

Do not put credentials in URLs.

==================================================
43. TECHNICAL CONSTRAINTS
==================================================

Use the existing project stack.

Reuse:

- ExchangeAdapter
- BinanceAdapter
- Risk system
- Trade Proposal system
- Activity system
- Position system
- Design system

Do NOT add:

- another exchange abstraction
- another risk system
- another activity log
- another portfolio
- Hermes direct execution
- unrestricted live trading

==================================================
44. DO NOT IMPLEMENT
==================================================

Do NOT implement:

Unrestricted live trading

Automatic live trading

Autonomous Hermes execution

Withdrawals

Real emergency kill switch

Automatic dangerous retries

Credential management UI

New exchange integrations

Advanced execution algorithms

TWAP

VWAP

Iceberg

Smart order routing

Task 18

==================================================
45. ACCEPTANCE CRITERIA
==================================================

Task 17 is complete when:

1. /execution works.

2. Execution queue works.

3. Execution detail works.

4. Authorization chain is visible.

5. Risk approval is required.

6. Owner approval is required.

7. Execution eligibility checks work.

8. Idempotency protection exists.

9. Duplicate execution is prevented.

10. Order validation works.

11. Order lifecycle states work.

12. Paper execution works deterministically.

13. Testnet execution is safely separated if implemented.

14. Live execution remains disabled.

15. Partial fills are represented.

16. Failed executions are represented.

17. Safe retry rules exist.

18. Cancellation flow exists for supported orders.

19. Execution history works.

20. Execution timeline works.

21. Position integration works.

22. Activity integration works.

23. Risk integration works.

24. Proposal immutability is enforced.

25. Execution lock exists.

26. Environment separation is explicit.

27. Search works.

28. Filters work.

29. Mock data is centralized.

30. Mock data is deterministic.

31. No secrets are exposed.

32. Hermes cannot execute directly.

33. No unrestricted live trading exists.

34. Responsive layout works.

35. No page-level horizontal overflow.

36. Existing Tasks 01–16 remain functional.

37. No TypeScript/lint/build errors.

==================================================
46. FINAL VERIFICATION
==================================================

Before finishing:

- Run the application.
- Visit /execution.
- Verify PAPER environment.
- Create/select an approved proposal.
- Verify risk approval.
- Verify owner approval.
- Create an execution request.
- Verify duplicate protection.
- Verify order validation.
- Execute a PAPER order.
- Verify deterministic fill.
- Verify execution timeline.
- Verify Activity event.
- Verify Position update.
- Test partial-fill state.
- Test failed execution.
- Test cancellation.
- Test retry restrictions.
- Change a critical proposal parameter.
- Verify approval becomes invalid.
- Verify execution is blocked.
- Verify execution lock.
- Verify LIVE execution remains disabled.
- Verify no credentials are exposed.
- Verify no secrets appear in logs.
- Test mobile layout.
- Verify no horizontal overflow.
- Verify Tasks 01–16 remain functional.
- Run tests.
- Run lint.
- Run type checking.
- Run production build.

STOP after completing Task 17.

DO NOT implement Task 18.