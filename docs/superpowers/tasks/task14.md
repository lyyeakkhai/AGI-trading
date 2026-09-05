TASK 14 — SETTINGS & SYSTEM CONFIGURATION

You are implementing Task 14 of the AGI Trading platform.

Tasks 01–13 are already implemented:

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

Build ONLY Task 14.

Do not redesign or rewrite previous tasks unless required for integration.

==================================================
1. PRODUCT CONTEXT
==================================================

AGI Trading is an AI-assisted trading intelligence platform.

Settings is the central configuration workspace.

It controls configuration for:

- Account
- Trading Mode
- Exchanges
- API Connections
- Hermes
- Risk
- Notifications
- Market Data
- Display
- System

IMPORTANT:

This task is FRONTEND ONLY.

Use deterministic mock data.

Do NOT connect to Binance.

Do NOT store real API credentials.

Do NOT enable real trading.

==================================================
2. ROUTE
==================================================

Create:

/settings

Use sub-navigation or tabs:

/settings/general
/settings/trading
/settings/exchanges
/settings/hermes
/settings/risk
/settings/notifications
/settings/market-data
/settings/display
/settings/security

The primary entry remains:

/settings

==================================================
3. DESIGN DIRECTION
==================================================

Use:

OBSIDIAN INTELLIGENCE

Settings should feel:

- professional
- technical
- controlled
- trustworthy
- clear

Avoid:

- generic SaaS settings appearance
- excessive cards
- excessive gradients
- decorative AI effects

Use existing design system.

Semantic colors:

Green = connected / healthy
Red = error / dangerous
Amber = warning
Cyan = intelligence/system
Gray = neutral

==================================================
4. SETTINGS LAYOUT
==================================================

Desktop:

------------------------------------------------
| Settings                                     |
------------------------------------------------
| General        | Account Configuration       |
| Trading        |                              |
| Exchanges      |                              |
| Hermes         |                              |
| Risk           |                              |
| Notifications  |                              |
| Market Data    |                              |
| Display        |                              |
| Security       |                              |
------------------------------------------------

Left navigation:

General
Trading
Exchanges
Hermes
Risk
Notifications
Market Data
Display
Security

Mobile:

Use a settings category list.

Selecting a category opens the full configuration screen.

==================================================
5. GENERAL
==================================================

Create:

General Settings

Fields:

Workspace Name

AGI Trading

Timezone

Asia/Phnom_Penh

Currency

USD

Language

English

Date Format

YYYY-MM-DD

Default Trading Mode

PAPER

Button:

Save Changes

Use local mock state only.

==================================================
6. TRADING MODE
==================================================

Create a prominent:

Trading Environment

Current:

PAPER TRADING

Show:

Paper Trading
ON

Live Trading
OFF

Explain:

"Paper mode allows simulated execution without sending real orders."

Live Trading should appear:

LOCKED

with a warning:

"Live trading is not enabled."

Do NOT implement live trading activation.

==================================================
7. EXCHANGE CONNECTIONS
==================================================

Create:

Exchange Connections

Example:

Binance

Status:
NOT CONNECTED

Paper Trading:
Available

Live Trading:
Disabled

Buttons:

[ Configure ]

[ Test Connection ]

IMPORTANT:

Do not connect to Binance.

Do not request real credentials.

Use safe mock fields only.

==================================================
8. API CONNECTION UI
==================================================

Create a configuration interface.

Fields:

API Key

••••••••••••••••

API Secret

••••••••••••••••

Status:

NOT CONNECTED

IMPORTANT:

These must be visual placeholders only.

Do not persist actual secrets.

Do not log them.

Do not send them anywhere.

If user attempts to save:

show:

"Exchange credentials are unavailable in this frontend-only build."

==================================================
9. HERMES SETTINGS
==================================================

Create:

Hermes Configuration

Show:

Hermes Status
ACTIVE

Monitoring
ON

Opportunity Detection
ON

Research Depth
STANDARD

Proposal Generation
ON

Risk Awareness
ON

Autonomous Execution
OFF

IMPORTANT:

Autonomous Execution must remain OFF.

Explain:

"Hermes can analyze and propose trades but cannot bypass risk controls
or independently execute live trades."

==================================================
10. HERMES OPERATING MODE
==================================================

Options:

Conservative

Balanced

Aggressive

Default:

Balanced

Description:

Conservative:
Higher evidence requirements.

Balanced:
Normal evidence and opportunity thresholds.

Aggressive:
Lower opportunity thresholds.

This is configuration UI only.

==================================================
11. RISK SETTINGS
==================================================

Create:

Risk Configuration

Fields:

Max Risk / Trade
1.0%

Max Portfolio Risk
5.0%

Max Daily Loss
3.0%

Max Open Positions
5

Max Asset Exposure
40%

Max Correlated Exposure
60%

Minimum R:R
1.5R

Trading Lock
OFF

These values should correspond to Task 11 mock values.

Do not create a second risk system.

Settings should represent configuration.

==================================================
12. RISK WARNING
==================================================

Show a prominent warning:

Risk configuration affects future trade validation.

Changes should require confirmation.

For frontend:

Clicking Save:

show confirmation modal:

"Confirm Risk Configuration"

Display changed values.

Buttons:

Cancel

Confirm

After confirmation:

update local mock state.

==================================================
13. MARKET DATA
==================================================

Create:

Market Data Settings

Provider:

Mock Market Data

Status:

CONNECTED

Update Frequency:

1 minute

Markets:

BTC/USDT
ETH/USDT

Default Timeframe:

1H

Data Mode:

SIMULATED

Do not connect to a real market-data provider.

==================================================
14. NOTIFICATIONS
==================================================

Create:

Notification Settings

Channels:

In-App
ON

Email
OFF

Telegram
OFF

Push
OFF

Notification types:

Opportunity Detected
ON

Trade Proposal Created
ON

Risk Rejection
ON

Position Opened
ON

Position Closed
ON

Daily Loss Warning
ON

System Error
ON

Backtest Completed
ON

Allow local toggle interaction.

==================================================
15. NOTIFICATION SEVERITY
==================================================

Create:

Alert Preferences

Critical:
Immediate

Warning:
Immediate

Informational:
In-App

Examples:

Risk limit breach:
Critical

Market data failure:
Critical

New opportunity:
Informational

Backtest completed:
Informational

==================================================
16. DISPLAY SETTINGS
==================================================

Create:

Display

Theme:

Obsidian Intelligence

Appearance:

Dark

Density:

Comfortable

Chart Style:

Candles

Default Chart Interval:

1H

Animations:

Reduced

IMPORTANT:

Respect the existing application theme.

Do not introduce another visual theme.

==================================================
17. SECURITY
==================================================

Create:

Security

Session:

Current Session
Active

Last Login:

Today

Two-Factor Authentication:

Not Configured

API Credential Status:

No credentials connected

Live Trading:

Disabled

Provide:

[ Review Activity ]

→ /activity

==================================================
18. SECURITY RULES
==================================================

Never display:

- real API keys
- API secrets
- passwords
- access tokens
- private credentials

Even mock credentials should be masked.

Example:

API Key:
••••••••••••••••

Never expose a complete credential.

==================================================
19. DANGEROUS ACTIONS
==================================================

Create:

Danger Zone

Actions:

Reset Workspace

Clear Mock Data

Reset Settings

These should require confirmation.

Example modal:

"Reset Settings?"

"This will restore the default frontend configuration."

Buttons:

Cancel

Reset

Do NOT delete real user data.

Do NOT connect to a real database.

==================================================
20. SAVE BEHAVIOR
==================================================

Settings should have:

Save Changes

Cancel

When a value changes:

show:

Unsaved Changes

When saved:

show:

Changes Saved

Use local state only.

No backend persistence.

==================================================
21. UNSAVED CHANGES
==================================================

If user navigates away after modifying settings:

show confirmation:

"Unsaved Changes"

"You have configuration changes that have not been saved."

Buttons:

Stay

Discard Changes

This is frontend behavior only.

==================================================
22. SETTINGS SEARCH
==================================================

Add:

Search settings...

Search:

- setting name
- category
- description

Examples:

risk

returns:

Max Risk / Trade

Max Portfolio Risk

Minimum R:R

==================================================
23. SETTINGS STATUS
==================================================

At the top show:

System Configuration

Configuration Status:

● HEALTHY

Warnings:

0

Unsaved Changes:

0

Example warning:

"Binance is not connected."

Use warning state without making it look like an error.

==================================================
24. CONFIGURATION SUMMARY
==================================================

Create:

Current Configuration

Trading Mode:
PAPER

Exchange:
Not Connected

Hermes:
ACTIVE

Risk:
Configured

Market Data:
SIMULATED

Notifications:
In-App

Live Trading:
DISABLED

This should provide a quick overview.

==================================================
25. AUDIT CONNECTION
==================================================

When settings are changed, show a mock activity event.

Example:

Settings changed

Risk configuration updated.

Changed:

Max Risk / Trade
1.0% → 0.8%

Source:

Owner

This should conceptually connect to:

/activity

Do not build a real audit backend.

==================================================
26. HERMES + RISK BOUNDARY
==================================================

Make this architectural boundary visible:

Hermes:
ANALYZE + PROPOSE

Risk:
VALIDATE

Owner:
APPROVE

Execution:
EXECUTE

Settings may configure these systems.

Settings must NOT allow:

Hermes bypassing Risk.

Risk bypassing Owner Approval.

Owner approval automatically executing live trades.

==================================================
27. MOCK DATA
==================================================

Create centralized deterministic settings state.

Example:

settingsMockData

Include:

general
trading
exchange
hermes
risk
notifications
marketData
display
security

Do not scatter default values throughout components.

==================================================
28. COMPONENTS
==================================================

Create reusable components where useful:

SettingsLayout
SettingsSidebar
SettingsHeader
SettingsSection
SettingRow
SettingToggle
SettingSelect
SettingInput
ConfigurationSummary
ExchangeConnection
HermesSettings
RiskSettings
NotificationSettings
MarketDataSettings
DisplaySettings
SecuritySettings
DangerZone
ConfirmationModal
UnsavedChangesModal

Reuse existing components.

Do not over-abstract.

==================================================
29. RESPONSIVE DESIGN
==================================================

Desktop:

Sidebar + settings content.

Tablet:

Compact sidebar.

Mobile:

Category list → detail screen.

Settings forms:

- full width
- stacked fields
- large touch targets

No page-level horizontal overflow.

==================================================
30. DESIGN RULES
==================================================

Settings should feel less visually dense than Analytics.

Use strong hierarchy:

Category
→ Setting
→ Description
→ Current Value

Avoid excessive cards.

Prefer:

rows
dividers
toggles
selects
small status badges

==================================================
31. TECHNICAL CONSTRAINTS
==================================================

Use the existing project stack.

Reuse:

- routing
- design tokens
- existing components
- buttons
- modals
- badges
- form controls

Do not add:

- backend
- database
- Binance integration
- CCXT
- Redis
- WebSockets
- real credential storage
- authentication backend
- real notification services

==================================================
32. DO NOT IMPLEMENT
==================================================

Do NOT implement:

- real Binance connection
- real API key storage
- real API secret storage
- real authentication
- real 2FA
- real email
- real Telegram
- real push notifications
- real live trading activation
- real trading lock
- real risk engine
- real Hermes backend
- Task 15
- live trading

==================================================
33. ACCEPTANCE CRITERIA
==================================================

Task 14 is complete when:

1. /settings works.

2. Settings navigation works.

3. General settings work.

4. Trading settings work.

5. Exchange settings work.

6. Hermes settings work.

7. Risk settings work.

8. Notification settings work.

9. Market Data settings work.

10. Display settings work.

11. Security settings work.

12. Configuration summary works.

13. Settings search works.

14. Save changes works locally.

15. Cancel changes works.

16. Unsaved changes warning works.

17. Risk confirmation works.

18. Dangerous actions require confirmation.

19. API fields are masked.

20. No credentials are persisted or transmitted.

21. Paper/Live distinction is clear.

22. Live trading remains disabled.

23. Hermes cannot bypass risk controls.

24. Settings changes are represented as activity events.

25. Mock data is centralized.

26. Mock state is deterministic.

27. Responsive layout works.

28. No horizontal page overflow.

29. Existing Tasks 01–13 remain functional.

30. No TypeScript/lint/build errors.

==================================================
34. FINAL VERIFICATION
==================================================

Before finishing:

- Run the application.
- Visit /settings.
- Navigate through every category.
- Test settings search.
- Change a setting.
- Verify unsaved state.
- Cancel changes.
- Change and save a setting.
- Verify confirmation.
- Test risk configuration confirmation.
- Test notification toggles.
- Test Hermes settings.
- Test display settings.
- Test exchange configuration.
- Verify credentials remain masked.
- Verify no credentials are sent anywhere.
- Verify Live Trading remains OFF.
- Verify Trading Lock remains safe.
- Test Danger Zone confirmations.
- Verify Activity connection.
- Test mobile settings.
- Verify no horizontal overflow.
- Verify Tasks 01–13 remain functional.
- Verify no build/lint/type errors.

STOP after completing Task 14.

Do NOT implement Task 15.