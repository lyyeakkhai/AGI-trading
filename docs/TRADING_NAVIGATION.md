# Trading Navigation

## Current State
The application currently uses a large, permanent left-side navigation panel (`Sidebar.tsx`), which consumes valuable horizontal space necessary for charting and order panels.

## Target Architecture
Implement a compact Top Navigation bar across the entire application.

### Primary Navigation Items
1. **Overview**
2. **Markets**
3. **Trade** (The central workspace)
4. **Intelligence** (Hermes, Research)
5. **Portfolio**
6. **System**

### Dropdown Structure
Hovering or clicking on primary items should reveal sub-sections:

**Trade**
- Spot
- Futures
- Open Orders
- Positions

**Intelligence**
- Hermes Chat
- Trade Proposals
- Research / Backtests

**System**
- Activity Log
- Settings
- Live / Paper Toggle

### Implementation Details
- Remove `Sidebar.tsx`.
- Update `AppShell.tsx` to mount the new Top Navigation component.
- Ensure responsive design (hamburger menu for mobile).
