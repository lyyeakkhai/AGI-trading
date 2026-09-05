TASK 18 — LIVE TRADING CONTROLS & PRODUCTION SAFETY

You are implementing Task 18 of the AGI Trading platform.

Tasks 01–17 are already implemented:

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
17 Execution Engine & Order Lifecycle

Build ONLY Task 18.

Do not redesign previous tasks unless required for integration.

==================================================
1. OBJECTIVE
==================================================

Build the controlled LIVE TRADING SAFETY layer.

The goal is NOT to make live trading easy.

The goal is to make live trading:

- explicit
- deliberate
- gated
- observable
- auditable
- reversible
- restricted
- difficult to activate accidentally

The system must clearly separate:

DEVELOPMENT
PAPER
TESTNET
LIVE

The default must remain:

LIVE TRADING = OFF

==================================================
2. CORE AUTHORITY MODEL
==================================================

The production architecture is:

Hermes
    ↓
Trade Proposal
    ↓
Risk Engine
    ↓
Owner Approval
    ↓
Execution Engine
    ↓
Binance Adapter
    ↓
Binance

IMPORTANT:

Hermes cannot independently activate live trading.

Risk cannot approve its own bypass.

Frontend cannot independently activate live trading.

A frontend toggle must never be the only protection.

==================================================
3. LIVE TRADING GATES
==================================================

Live trading may be enabled ONLY when all required gates pass.

Create a:

LIVE READINESS CHECK

Required gates:

1. Production environment detected
2. Live Binance credentials configured server-side
3. API key permissions valid
4. Withdrawals disabled
5. IP restriction configured
6. Exchange connectivity healthy
7. Risk configuration valid
8. Execution service healthy
9. Owner authorization present
10. Trading mode explicitly set to LIVE
11. Live execution feature flag enabled
12. Safety lock not active

Every gate must show:

PASS
WARNING
FAIL
BLOCKED

==================================================
4. LIVE READINESS DASHBOARD
==================================================

Create:

/live

or:

/settings/live-trading

Prefer:

/live

with the settings section linking to it.

Page title:

Live Trading

Subtitle:

Production trading controls and safety status.

Top state:

LIVE TRADING
● DISABLED

Do not make the page visually exciting.

It should feel serious.

==================================================
5. LIVE STATUS HEADER
==================================================

Show:

Environment:
LIVE

Trading:
DISABLED

Execution:
LOCKED

Risk:
HEALTHY

Exchange:
CONNECTED / NOT CONNECTED

Owner Authorization:
NOT ACTIVE / ACTIVE

Example:

LIVE

Trading Disabled

Execution Locked

Risk Healthy

==================================================
6. SAFETY SCORE
==================================================

Create:

Production Readiness

Example:

9 / 12 checks passed

Status:

NOT READY

Do NOT use a simple arbitrary percentage as the primary safety decision.

The individual gates are authoritative.

Possible result:

READY

NOT READY

BLOCKED

==================================================
7. LIVE TRADING ACTIVATION
==================================================

If all gates pass, display:

[ Request Live Activation ]

Do NOT immediately enable trading.

Click opens:

Activate Live Trading

Checklist:

Environment:
LIVE

Exchange:
Binance

Withdrawals:
DISABLED

IP Restriction:
ACTIVE

Risk:
VALID

Execution:
HEALTHY

Owner:
CURRENT USER

Then require explicit confirmation.

==================================================
8. MULTI-STEP ACTIVATION
==================================================

Activation should require multiple deliberate steps.

Recommended:

Step 1
Review

Step 2
Confirm safeguards

Step 3
Confirm live environment

Step 4
Activate

Each step should clearly identify consequences.

Do not make this one accidental click.

==================================================
9. EXPLICIT LIVE ACKNOWLEDGEMENT
==================================================

Before activation require the owner to acknowledge:

"I understand that live trading uses real capital."

"I confirm that withdrawals remain disabled."

"I confirm that risk limits are configured."

"I confirm that owner approval is required."

"I understand that this action enables real order execution."

These are acknowledgement checkboxes.

All required acknowledgements must be selected.

==================================================
10. FINAL CONFIRMATION
==================================================

Final confirmation modal:

Enable Live Trading?

This will allow approved trade proposals to proceed to real exchange
execution.

Exchange:
Binance

Mode:
LIVE

Risk Per Trade:
0.50%

Portfolio Risk Limit:
5.0%

Withdrawals:
DISABLED

Buttons:

Cancel

ENABLE LIVE TRADING

The final button should be visually serious.

No celebratory animation.

==================================================
11. LIVE ACTIVATION RESULT
==================================================

After activation:

LIVE TRADING
● ENABLED

Execution:
READY

Record:

Activated By:
Owner

Activated At:
timestamp

Environment:
LIVE

Configuration Version:
vX

Create an Activity event.

==================================================
12. DISABLE LIVE TRADING
==================================================

Create:

[ Disable Live Trading ]

This should be easier than enabling.

Click:

Disable Live Trading?

"New live execution requests will be blocked."

Confirm:

Disable

Afterwards:

LIVE TRADING
● DISABLED

Execution:
LOCKED

==================================================
13. EMERGENCY LOCK
==================================================

Create:

Global Trading Lock

States:

UNLOCKED

LOCKED

This is a production safety control.

IMPORTANT:

The frontend must not be the sole authority.

The backend must enforce the lock.

When locked:

No new execution requests may reach the exchange.

Existing orders/positions may remain visible.

==================================================
14. EMERGENCY STOP
==================================================

If the existing architecture supports a real server-side emergency stop,
expose it as:

EMERGENCY STOP

Otherwise:

DO NOT create a fake functional kill switch.

A non-functional UI mock is not acceptable for a safety feature.

If backend support does not exist:

show:

Emergency Stop
Not Configured

and explain:

"Emergency stop requires a server-side control."

==================================================
15. LIVE POSITION LIMITS
==================================================

Show current production limits:

Risk Per Trade
0.50%

Max Portfolio Risk
5.00%

Max Daily Loss
3.00%

Max Open Positions
5

Max Asset Exposure
40%

Minimum R:R
1.5R

These should reference the existing Risk configuration.

Do NOT create a second risk configuration.

==================================================
16. LIVE CAPITAL
==================================================

Show:

Live Account Equity

Available Capital

Current Exposure

Risk Utilization

Do not display live capital unless the exchange account is genuinely
connected.

Without live data:

"Live account data unavailable."

Never substitute paper balances without clearly labeling them.

==================================================
17. LIVE ACCOUNT STATUS
==================================================

Show:

Binance

Connection:
CONNECTED

Environment:
LIVE

Account:
ACTIVE

Permissions:

Read:
PASS

Spot Trading:
PASS

Withdrawals:
DISABLED

IP Restriction:
PASS

Use data from the exchange adapter.

Do not display secrets.

==================================================
18. API CREDENTIAL SAFETY
==================================================

Never display:

API key

API secret

signature

private credential

token

authorization header

Show only:

Credential Status:
CONFIGURED

Example:

Binance API Credential

● CONFIGURED

Last Verified:
12:42 UTC

Do not show the actual credential.

==================================================
19. IP RESTRICTION
==================================================

Show:

IP Restriction

Status:

ACTIVE

Allowed IP:

MASKED / CONFIGURED

Do not display sensitive infrastructure details unnecessarily.

If not active:

BLOCKED

"Live trading cannot be enabled until IP restrictions are configured."

==================================================
20. WITHDRAWAL PROTECTION
==================================================

This must be a prominent safety check.

Withdrawals:

DISABLED

Status:

PASS

If withdrawals are enabled:

CRITICAL

BLOCK LIVE TRADING

Never provide a way to enable withdrawals through this UI.

==================================================
21. LIVE EXECUTION STATUS
==================================================

Show:

Execution Service

● READY

Possible states:

READY
LOCKED
PAUSED
ERROR

Live execution is allowed only when:

Execution Service = READY

==================================================
22. PROPOSAL → LIVE EXECUTION
==================================================

A live execution request must require:

Proposal:
APPROVED

Risk:
APPROVED

Owner:
APPROVED

Live Mode:
ENABLED

Execution:
READY

Trading Lock:
UNLOCKED

Exchange:
HEALTHY

If any condition fails:

Execution blocked.

==================================================
23. LIVE ORDER CONFIRMATION
==================================================

Before any real live order:

show a final order confirmation.

Example:

LIVE ORDER

BTC/USDT

LONG

Quantity:
0.020 BTC

Estimated Value:
$2,280

Entry:
$114,000

Stop:
$112,500

Target:
$117,000

Risk:
0.50%

R:R:
2.0R

Exchange:
Binance

Environment:
LIVE

Risk:
APPROVED

Owner:
APPROVED

Final action:

[ CANCEL ]

[ CONFIRM LIVE ORDER ]

The UI should require explicit confirmation.

==================================================
24. LIVE ORDER WARNING
==================================================

Before confirmation:

"Real funds will be used."

This must be clear but not alarmist.

No marketing language.

==================================================
25. EXECUTION LOCK DURING INCIDENT
==================================================

Support:

Trading Lock

LOCKED

Reason:

Daily loss limit reached.

or:

Exchange connectivity unhealthy.

or:

Manual safety lock.

When locked:

- disable new live orders
- show reason
- maintain visibility of existing positions

==================================================
26. DAILY LOSS LOCK
==================================================

If daily loss exceeds the configured threshold:

System state:

TRADING LOCKED

Reason:

Daily loss limit exceeded.

Show:

Current Daily Loss
-3.12%

Limit
-3.00%

Status:
CRITICAL

New live execution:
BLOCKED

IMPORTANT:

If this is implemented functionally, the backend must be authoritative.

Do not rely solely on frontend state.

==================================================
27. MAX PORTFOLIO RISK LOCK
==================================================

If current portfolio risk exceeds:

5.0%

show:

TRADING LOCKED

Reason:

Portfolio risk limit exceeded.

New executions:

BLOCKED

==================================================
28. EXCHANGE HEALTH LOCK
==================================================

If Binance connectivity is unhealthy:

Execution:

BLOCKED

Reason:

Exchange connection unavailable.

Do not automatically submit orders after connection recovery.

Require revalidation.

==================================================
29. STALE APPROVAL
==================================================

If a live proposal approval is stale:

Execution:

BLOCKED

Reason:

Approval expired.

Require:

New risk validation

and

New owner approval

==================================================
30. PROPOSAL CHANGE INVALIDATION
==================================================

If any critical proposal parameter changes:

Symbol

Side

Quantity

Entry

Stop

Target

Risk

Then:

Existing approval:

INVALID

Require:

Risk revalidation

Owner reapproval

==================================================
31. LIVE TRADING ACTIVITY
==================================================

Integrate with:

/activity

Record:

Live trading enabled

Live trading disabled

Trading lock activated

Trading lock released

Live order requested

Live order confirmed

Live order submitted

Live order filled

Live order rejected

Live order cancelled

Live execution failed

Never log secrets.

==================================================
32. AUDIT TRAIL
==================================================

Every live safety action must produce an auditable event.

Example:

LIVE_TRADING_ENABLED

Actor:
Owner

Timestamp:
2026-09-04 12:42:18

Environment:
LIVE

Configuration Version:
v1.4

Risk Profile:
standard

Do not expose credentials.

==================================================
33. SESSION / AUTHORIZATION
==================================================

If authentication infrastructure exists:

require an authenticated owner session.

For critical actions, consider requiring recent authentication.

Do NOT invent a fake password system.

Use existing authentication architecture.

==================================================
34. CONFIGURATION SNAPSHOT
==================================================

When live trading is enabled, store/reference a configuration version.

Example:

Live Configuration

Version:
LIVE-CONFIG-004

Risk Profile:
Standard

Max Risk:
0.50%

Max Portfolio Risk:
5.00%

Daily Loss Limit:
3.00%

Exchange:
Binance

Environment:
LIVE

This supports auditability and reproducibility.

==================================================
35. LIVE SAFETY CHECKLIST
==================================================

Create a visual checklist:

Environment
PASS

Exchange
PASS

Credentials
PASS

Permissions
PASS

Withdrawals Disabled
PASS

IP Restriction
PASS

Risk Limits
PASS

Execution Service
PASS

Owner Authorization
PASS

Trading Lock
PASS

Final Status:

READY

Only show READY when every mandatory safety gate passes.

==================================================
36. LIVE DASHBOARD
==================================================

Include:

Live Trading Status
Production Readiness
Safety Checklist
Exchange Status
Risk Status
Execution Status
Current Capital
Current Exposure
Trading Lock
Recent Live Events

Keep it compact.

Do not turn it into another analytics dashboard.

==================================================
37. RESPONSIVE DESIGN
==================================================

Desktop:

------------------------------------------------
| LIVE TRADING               DISABLED          |
------------------------------------------------
| Readiness | Exchange | Risk | Execution     |
------------------------------------------------
| Safety Checklist                            |
------------------------------------------------
| Live Account | Exposure | Capital           |
------------------------------------------------
| Trading Lock                               |
------------------------------------------------
| Recent Live Activity                        |
------------------------------------------------

Mobile:

- status at top
- safety checks stacked
- critical controls easily accessible
- live order confirmation full screen
- no page-level horizontal overflow

==================================================
38. DESIGN LANGUAGE
==================================================

Continue:

Obsidian Intelligence

But LIVE should feel more restrained and serious.

Avoid:

- neon excitement
- celebratory animations
- "GO LIVE!" marketing language
- excessive green

For live state:

Use a controlled high-visibility indicator.

Example:

LIVE
● ENABLED

not:

LIVE!!!
🚀

==================================================
39. COMPONENTS
==================================================

Create reusable components:

LiveTradingStatus
ProductionReadiness
SafetyChecklist
SafetyCheck
LiveExchangeStatus
LiveAccountStatus
LiveRiskStatus
TradingLock
LiveActivationFlow
LiveAcknowledgement
LiveConfirmation
LiveExecutionGate
LiveConfigSnapshot
IncidentState
LiveActivity

Reuse existing:

Risk
Execution
Exchange
Activity
Proposal
Settings
Hermes

components.

==================================================
40. TECHNICAL REQUIREMENTS
==================================================

The backend must remain authoritative for:

- live trading enabled state
- execution lock
- risk enforcement
- owner authorization
- live execution authorization

The frontend is a control surface.

Do not trust frontend flags for security.

==================================================
41. FEATURE FLAGS
==================================================

Existing flags may include:

BINANCE_ENABLED

BINANCE_TESTNET_ENABLED

LIVE_TRADING_ENABLED

ORDER_EXECUTION_ENABLED

Add/use appropriate server-side flags.

Recommended safety defaults:

BINANCE_ENABLED=true

BINANCE_TESTNET_ENABLED=true

LIVE_TRADING_ENABLED=false

ORDER_EXECUTION_ENABLED=false

The application must require deliberate production configuration
to activate live trading.

==================================================
42. DO NOT IMPLEMENT
==================================================

Do NOT implement:

- autonomous live trading
- Hermes direct execution
- withdrawal operations
- automatic risk bypass
- frontend-only kill switch
- fake security checks
- storing credentials in browser
- logging secrets
- automatic order retry after safety lock
- automatic reactivation after incident
- new exchange integrations
- advanced execution algorithms

==================================================
43. ACCEPTANCE CRITERIA
==================================================

Task 18 is complete when:

1. /live works.

2. Live trading status is clearly visible.

3. Live trading defaults to disabled.

4. Production readiness checks exist.

5. Exchange status is visible.

6. Credential status is visible without exposing secrets.

7. Permissions are visible.

8. Withdrawals-disabled check exists.

9. IP restriction check exists.

10. Risk configuration is validated.

11. Execution service status is visible.

12. Owner authorization is required.

13. Multi-step activation flow exists.

14. Explicit live-risk acknowledgement exists.

15. Final activation confirmation exists.

16. Live trading can be disabled.

17. Trading lock exists.

18. Risk-limit lock behavior exists.

19. Exchange-health lock exists.

20. Stale approval invalidation exists.

21. Proposal-change invalidation exists.

22. Live order confirmation exists.

23. Live activity is auditable.

24. Configuration version is represented.

25. Existing Risk system is reused.

26. Existing Execution system is reused.

27. Existing Binance adapter is reused.

28. No secrets are exposed.

29. Frontend cannot bypass backend safety controls.

30. Live trading remains disabled unless every mandatory gate passes.

31. No automatic live execution exists.

32. Responsive design works.

33. No horizontal page overflow.

34. Existing Tasks 01–17 remain functional.

35. No TypeScript/lint/build errors.

==================================================
44. FINAL SECURITY VERIFICATION
==================================================

Before finishing:

- Run the application.
- Visit /live.
- Verify default state is LIVE DISABLED.
- Verify readiness checks.
- Verify missing credentials state.
- Verify permissions.
- Verify withdrawal protection.
- Verify IP restriction.
- Verify risk checks.
- Verify execution service state.
- Test activation flow.
- Verify all acknowledgements are required.
- Verify final confirmation.
- Verify activation cannot occur if any mandatory gate fails.
- Verify live trading can be disabled.
- Test trading lock.
- Test risk-limit lock.
- Test exchange-health lock.
- Test stale approval.
- Change a critical proposal parameter and verify approval invalidation.
- Test live order confirmation.
- Verify Activity events.
- Verify no secrets appear in UI.
- Verify no secrets appear in browser storage.
- Verify no secrets appear in URLs.
- Verify no secrets appear in logs.
- Verify frontend cannot bypass backend safety.
- Verify no automatic order retry after a safety lock.
- Test mobile layout.
- Verify no horizontal overflow.
- Verify Tasks 01–17 remain functional.
- Run tests.
- Run lint.
- Run type checking.
- Run production build.

STOP after completing Task 18.

Do NOT implement any additional task automatically.