"use client";

import React, { useState } from "react";
import {
  Button,
  IconButton,
  Badge,
  StatusIndicator,
  EnvironmentBadge,
  Metric,
  Surface,
  SectionHeader,
  Tabs,
  TabList,
  TabTrigger,
  TabContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Input,
  Select,
  Dropdown,
  Tooltip,
  Divider,
  EmptyState,
  Spinner,
  Skeleton,
  LoadingState,
  ErrorState,
  Modal,
  useToast,
  ProgressIndicator,
  PriceDisplay,
  PnLDisplay,
  PositionSide,
  RiskBadge,
  ConfidenceIndicator,
  TradingMode,
  OrderStatus,
  ChartContainer,
  AIStatusIndicator,
  AIActivityBadge,
  AIInsightLabel,
  AIState,
} from "@/components";
import {
  Search,
  Filter,
  Play,
  Shield,
  Bot,
  Layers,
  Terminal,
  RefreshCw,
  Bell,
  Check,
  TrendingUp,
} from "lucide-react";

export default function DesignSystemShowcasePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tradingMode, setTradingMode] = useState<"PAPER" | "LIVE" | "DEVELOPMENT">("PAPER");
  const [progressVal, setProgressVal] = useState(72);
  const [inputVal, setInputVal] = useState("");
  const { showToast } = useToast();

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-color">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-dim/40 text-cyan-400 border border-cyan-500/40 text-[10px] font-mono font-bold tracking-wider">
              OBSIDIAN INTELLIGENCE
            </span>
            <span className="text-xs text-gray-500 font-mono">v1.0.0</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-100 mt-1">
            Design System & Shared Component Library
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Institutional trading terminal primitives and AI-native design tokens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TradingMode mode={tradingMode} onModeChange={setTradingMode} interactive />
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Bell size={13} />}
            onClick={() =>
              showToast({
                type: "ai",
                title: "Hermes Inference Triggered",
                message: "Market regimes evaluated across 14 trading pairs.",
              })
            }
          >
            Test AI Toast
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabList variant="pill" className="max-w-fit">
          <TabTrigger value="overview" icon={<Terminal size={14} />}>
            Primitives & Actions
          </TabTrigger>
          <TabTrigger value="trading" icon={<TrendingUp size={14} />}>
            Trading Domain
          </TabTrigger>
          <TabTrigger value="ai" icon={<Bot size={14} />}>
            Hermes Intelligence
          </TabTrigger>
          <TabTrigger value="data" icon={<Layers size={14} />}>
            Tables & Chart Shell
          </TabTrigger>
        </TabList>

        {/* TAB 1: PRIMITIVES & ACTIONS */}
        <TabContent value="overview" className="space-y-8">
          {/* Colors & Tokens Reference */}
          <Surface variant="default" padded="md" className="space-y-3">
            <SectionHeader
              title="Obsidian Intelligence Color Semantics"
              subtitle="Cyan represents AI/system intelligence exclusively. Green/Red represent financial positions and PnL."
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded bg-bg-950 border border-border-color text-center">
                <div className="h-6 w-full rounded bg-bg-950 border border-border-hi mb-1" />
                <span className="text-gray-400">BG-950</span>
                <div className="text-gray-600">#050709</div>
              </div>
              <div className="p-2 rounded bg-bg-900 border border-border-color text-center">
                <div className="h-6 w-full rounded bg-bg-900 border border-border-hi mb-1" />
                <span className="text-gray-400">BG-900</span>
                <div className="text-gray-600">#080C10</div>
              </div>
              <div className="p-2 rounded bg-surface border border-border-color text-center">
                <div className="h-6 w-full rounded bg-surface border border-border-hi mb-1" />
                <span className="text-gray-300">SURFACE</span>
                <div className="text-gray-600">#0F161C</div>
              </div>
              <div className="p-2 rounded bg-surface-2 border border-border-color text-center">
                <div className="h-6 w-full rounded bg-surface-2 border border-border-hi mb-1" />
                <span className="text-gray-300">SURFACE-2</span>
                <div className="text-gray-600">#131C23</div>
              </div>
              <div className="p-2 rounded bg-surface border border-cyan-500/40 text-center">
                <div className="h-6 w-full rounded bg-cyan-500 shadow-[0_0_8px_rgba(0,229,255,0.6)] mb-1" />
                <span className="text-cyan-400 font-bold">CYAN-500</span>
                <div className="text-cyan-600">AI ONLY</div>
              </div>
              <div className="p-2 rounded bg-surface border border-profit/40 text-center">
                <div className="h-6 w-full rounded bg-profit shadow-[0_0_8px_rgba(0,230,118,0.6)] mb-1" />
                <span className="text-profit font-bold">PROFIT / LONG</span>
                <div className="text-emerald-700">FINANCIAL</div>
              </div>
              <div className="p-2 rounded bg-surface border border-loss/40 text-center">
                <div className="h-6 w-full rounded bg-loss shadow-[0_0_8px_rgba(255,59,48,0.6)] mb-1" />
                <span className="text-loss font-bold">LOSS / SHORT</span>
                <div className="text-red-700">FINANCIAL</div>
              </div>
              <div className="p-2 rounded bg-surface border border-warning/40 text-center">
                <div className="h-6 w-full rounded bg-warning shadow-[0_0_8px_rgba(245,158,11,0.6)] mb-1" />
                <span className="text-warning font-bold">WARNING</span>
                <div className="text-amber-700">RISK ENG</div>
              </div>
            </div>
          </Surface>

          {/* Buttons & IconButtons */}
          <Surface variant="default" padded="md" className="space-y-4">
            <SectionHeader
              title="Button System"
              subtitle="Restrained action hierarchy with focus, loading, and disabled states."
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="md">
                Primary (Cyan CTA)
              </Button>
              <Button variant="secondary" size="md">
                Secondary Action
              </Button>
              <Button variant="outline" size="md">
                Outline
              </Button>
              <Button variant="ghost" size="md">
                Ghost Action
              </Button>
              <Button variant="danger" size="md" leftIcon={<Shield size={14} />}>
                Kill Switch / Block
              </Button>
              <Button variant="success" size="md" leftIcon={<Play size={14} />}>
                Execute Order
              </Button>
              <Button variant="primary" size="md" isLoading>
                Submitting
              </Button>
              <Button variant="secondary" size="md" disabled>
                Disabled
              </Button>
            </div>

            <Divider label="Button Sizes & Icon Buttons" />

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="xs">
                Button XS
              </Button>
              <Button variant="secondary" size="sm">
                Button SM
              </Button>
              <Button variant="secondary" size="md">
                Button MD
              </Button>
              <Button variant="secondary" size="lg">
                Button LG
              </Button>

              <div className="h-4 w-px bg-border-color" />

              <IconButton
                icon={<Filter size={13} />}
                aria-label="Filter"
                size="xs"
                variant="secondary"
              />
              <IconButton
                icon={<RefreshCw size={14} />}
                aria-label="Refresh"
                size="sm"
                variant="secondary"
              />
              <IconButton
                icon={<Search size={15} />}
                aria-label="Search"
                size="md"
                variant="primary"
              />
              <IconButton
                icon={<Bell size={16} />}
                aria-label="Notifications"
                size="lg"
                variant="outline"
              />
            </div>
          </Surface>

          {/* Badges & Status Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Surface variant="default" padded="md" className="space-y-3">
              <SectionHeader title="Badge System" subtitle="Informational and semantic chips" />
              <div className="flex flex-wrap gap-2">
                <Badge variant="neutral">NEUTRAL</Badge>
                <Badge variant="cyan" dot pulse>
                  AI ACTIVE
                </Badge>
                <Badge variant="profit" dot>
                  PROFIT +14.2%
                </Badge>
                <Badge variant="loss" dot>
                  LOSS -3.8%
                </Badge>
                <Badge variant="warning" dot>
                  ELEVATED RISK
                </Badge>
                <Badge variant="info">INFO DATA</Badge>
                <Badge variant="outline">OUTLINE</Badge>
              </div>
            </Surface>

            <Surface variant="default" padded="md" className="space-y-3">
              <SectionHeader
                title="System Status Indicators"
                subtitle="High contrast connectivity and engine states"
              />
              <div className="flex flex-wrap items-center gap-4 py-1">
                <StatusIndicator status="online" label="FEED ONLINE" pulse />
                <StatusIndicator status="busy" label="CALCULATING" pulse />
                <StatusIndicator status="ai" label="HERMES REASONING" />
                <StatusIndicator status="warning" label="LATENCY HIGH" />
                <StatusIndicator status="error" label="GATEWAY TIMEOUT" />
                <StatusIndicator status="offline" label="DISCONNECTED" />
              </div>
            </Surface>
          </div>

          {/* Form Controls & Overlays */}
          <Surface variant="default" padded="md" className="space-y-4">
            <SectionHeader
              title="Form Controls & Interactive Overlays"
              subtitle="Inputs, selects, menus, modals, and tooltips"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Pair / Symbol"
                placeholder="BTC/USDT"
                leftIcon={<Search size={14} />}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                mono
                helperText="Type symbol to filter"
              />
              <Select
                label="Execution Strategy"
                options={[
                  { label: "Momentum Breakout v2", value: "strat_1" },
                  { label: "Mean Reversion Alpha", value: "strat_2" },
                  { label: "Statistical Arbitrage", value: "strat_3" },
                ]}
              />
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Quick Actions Menu
                </label>
                <div className="flex items-center gap-2 pt-0.5">
                  <Dropdown
                    trigger={
                      <Button variant="secondary" size="md">
                        Trading Controls...
                      </Button>
                    }
                    items={[
                      {
                        id: "approve",
                        label: "Approve Proposal",
                        icon: <Check size={13} className="text-cyan-400" />,
                        shortcut: "⌘A",
                        onClick: () =>
                          showToast({
                            type: "success",
                            title: "Trade Proposal Approved",
                            message: "Order queued for risk engine verification.",
                          }),
                      },
                      {
                        id: "sync",
                        label: "Force Market Re-sync",
                        icon: <RefreshCw size={13} />,
                        shortcut: "⌘R",
                      },
                      "divider",
                      {
                        id: "abort",
                        label: "Emergency Halt",
                        icon: <Shield size={13} />,
                        danger: true,
                        onClick: () => setIsModalOpen(true),
                      },
                    ]}
                  />

                  <Tooltip content="Deterministic Risk Engine: Active">
                    <div className="px-2.5 py-1.5 rounded bg-surface-2 border border-border-color text-xs font-mono text-gray-300 flex items-center gap-1.5 cursor-help">
                      <Shield size={13} className="text-profit" />
                      <span>RISK ENG</span>
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
              >
                Open Audit Dialog Modal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  showToast({
                    type: "warning",
                    title: "Margin Threshold Alert",
                    message: "Current portfolio leverage reached 2.4x.",
                  })
                }
              >
                Trigger Warning Toast
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() =>
                  showToast({
                    type: "error",
                    title: "Risk Engine Block",
                    message: "Order size exceeds daily maximum drawdown allowance.",
                  })
                }
              >
                Trigger Error Toast
              </Button>
            </div>
          </Surface>
        </TabContent>

        {/* TAB 2: TRADING DOMAIN */}
        <TabContent value="trading" className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Metric
              label="Net Realized PnL"
              value="+$48,290.40"
              change={18.4}
              changePeriod="30D"
              subtext="Win Rate 68.2%"
              badge={<Badge variant="profit">+$4.2k today</Badge>}
            />
            <Metric
              label="Active Capital Exposure"
              value="$124,500.00"
              change={-2.1}
              changePeriod="24h"
              subtext="Max Drawdown 3.2%"
            />
            <Metric
              label="BTC Mark Price"
              value="$112,482.30"
              change={4.82}
              changePeriod="24h"
              subtext="Spread: 0.01%"
            />
            <Metric
              label="Risk Budget Remaining"
              value="84.5%"
              subtext="Daily Loss Limit $5,000"
              badge={<RiskBadge level="LOW" size="sm" />}
            />
          </div>

          {/* Trading Primitives Showcase */}
          <Surface variant="default" padded="md" className="space-y-6">
            <SectionHeader
              title="Trading Domain Primitives"
              subtitle="High precision displays for prices, sides, PnL, risks, and orders"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Price & PnL Displays */}
              <div className="space-y-4 p-4 rounded bg-surface-2 border border-border-color">
                <span className="text-[11px] font-mono uppercase font-semibold text-gray-400">
                  1. Price & PnL Displays
                </span>
                <PriceDisplay
                  symbol="BTC/USDT PERP"
                  price={112482.5}
                  change24h={5.24}
                  size="lg"
                />
                <Divider />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">Unrealized PnL:</span>
                  <PnLDisplay amount={3420.8} percentage={8.42} size="md" layout="inline" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">Hedging Delta:</span>
                  <PnLDisplay amount={-420.15} percentage={-1.12} size="md" layout="inline" />
                </div>
              </div>

              {/* Position Sides & Risk Badges */}
              <div className="space-y-4 p-4 rounded bg-surface-2 border border-border-color">
                <span className="text-[11px] font-mono uppercase font-semibold text-gray-400">
                  2. Sides & Risk Badges
                </span>
                <div className="flex items-center gap-3">
                  <PositionSide side="LONG" size="md" />
                  <PositionSide side="SHORT" size="md" />
                </div>
                <Divider />
                <div className="flex flex-wrap gap-2">
                  <RiskBadge level="LOW" />
                  <RiskBadge level="MEDIUM" />
                  <RiskBadge level="HIGH" />
                  <RiskBadge level="BLOCKED" />
                </div>
              </div>

              {/* Confidence & Environment */}
              <div className="space-y-4 p-4 rounded bg-surface-2 border border-border-color">
                <span className="text-[11px] font-mono uppercase font-semibold text-gray-400">
                  3. Confidence & Environment
                </span>
                <div className="flex items-center gap-4">
                  <ConfidenceIndicator score={92} />
                  <ConfidenceIndicator score={64} />
                  <ConfidenceIndicator score={38} />
                </div>
                <Divider />
                <div className="flex items-center gap-2">
                  <EnvironmentBadge mode="PAPER" />
                  <EnvironmentBadge mode="LIVE" />
                  <EnvironmentBadge mode="DEVELOPMENT" />
                </div>
              </div>
            </div>

            {/* Order Statuses */}
            <div>
              <span className="text-[11px] font-mono uppercase font-semibold text-gray-400 block mb-2">
                4. Order Status States
              </span>
              <div className="flex flex-wrap gap-2">
                <OrderStatus status="PENDING" />
                <OrderStatus status="APPROVED" />
                <OrderStatus status="EXECUTING" />
                <OrderStatus status="FILLED" />
                <OrderStatus status="CANCELLED" />
                <OrderStatus status="REJECTED" />
              </div>
            </div>
          </Surface>

          {/* Progress Indicators */}
          <Surface variant="default" padded="md" className="space-y-4">
            <SectionHeader
              title="Quantitative Progress & Exposure Indicators"
              subtitle="Real-time execution, risk budget, and win rate bars"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ProgressIndicator
                label="Strategy Win Rate"
                value={progressVal}
                variant="profit"
                showValue
              />
              <ProgressIndicator
                label="Portfolio Value At Risk (VaR)"
                value={34}
                variant="warning"
                showValue
              />
              <ProgressIndicator
                label="AI Market Stream Ingestion"
                indeterminate
                variant="cyan"
              />
            </div>
          </Surface>
        </TabContent>

        {/* TAB 3: HERMES INTELLIGENCE */}
        <TabContent value="ai" className="space-y-6">
          <SectionHeader
            title="Hermes AI Intelligence Layer Primitives"
            subtitle="Cyan-driven states representing autonomous inference, market regime analysis, and trade proposals"
          />

          {/* AI State Full Component */}
          <AIState
            state="PROPOSAL READY"
            regime="HIGH VOLATILITY LIQUIDITY SWEEP"
            currentActivity="FORMULATING SHORT PROPOSAL ON ETH/USDT"
            evidenceCount={6}
            lastUpdated="JUST NOW"
          />

          {/* AI Status Indicators */}
          <Surface variant="default" padded="md" className="space-y-4">
            <SectionHeader
              title="All 7 Hermes Operational Lifecycle States"
              subtitle="Auditable progression from market scanning to execution"
            />
            <div className="flex flex-wrap gap-3">
              <AIStatusIndicator state="MONITORING" />
              <AIStatusIndicator state="ANALYZING" />
              <AIStatusIndicator state="RESEARCHING" />
              <AIStatusIndicator state="PROPOSAL READY" />
              <AIStatusIndicator state="AWAITING APPROVAL" />
              <AIStatusIndicator state="EXECUTING" />
              <AIStatusIndicator state="COMPLETED" />
            </div>
          </Surface>

          {/* AI Activity Badges & Insight Labels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Surface variant="default" padded="md" className="space-y-3">
              <SectionHeader
                title="AI Activity Badges"
                subtitle="Live status indicators of current inference tasks"
              />
              <div className="flex flex-col gap-2">
                <AIActivityBadge activity="SCANNING 24 EXCHANGE ORDERBOOKS" />
                <AIActivityBadge activity="CORRELATING BINANCE SPOT VS CME FUTURES" />
                <AIActivityBadge activity="EVALUATING HISTORICAL MONTE CARLO (10,000 RUNS)" />
              </div>
            </Surface>

            <Surface variant="default" padded="md" className="space-y-3">
              <SectionHeader
                title="AI Insight & Evidence Labels"
                subtitle="Chips indicating hypothesis, corroboration, and confidence"
              />
              <div className="flex flex-wrap gap-2">
                <AIInsightLabel label="HERMES CONFIDENCE" confidence={94} type="insight" />
                <AIInsightLabel label="EVIDENCE: CME GAP" type="evidence" />
                <AIInsightLabel label="EVIDENCE: CVD DIVERGENCE" type="evidence" />
                <AIInsightLabel label="HYPOTHESIS: LIQUIDITY SWEEP" type="hypothesis" />
                <AIInsightLabel label="RISK FILTER: HIGH SPREAD" type="risk" />
              </div>
            </Surface>
          </div>
        </TabContent>

        {/* TAB 4: TABLES & CHART SHELL */}
        <TabContent value="data" className="space-y-6">
          {/* Chart Container Primitive */}
          <ChartContainer
            title="Perpetual Futures Chart Primitive"
            symbol="BTC/USDT"
            activeTimeframe="15m"
            onRefresh={() =>
              showToast({
                type: "info",
                title: "Chart Stream Refreshed",
                message: "Fetched latest 500 candlestick bars.",
              })
            }
            footerExtra={<span className="text-gray-400">ENGINE: OBSIDIAN TRADING CORE</span>}
          >
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <span className="font-mono text-sm font-bold text-cyan-400">
                CHART CONTAINER PRIMITIVE READY
              </span>
              <p className="text-xs text-gray-400 max-w-md mt-1 font-sans">
                This container provides timeframe selection, toolbar controls, status
                bar, and container sizing. The full TradingView Lightweight Charts
                engine will be integrated in Task 04.
              </p>
            </div>
          </ChartContainer>

          {/* Professional Dense Data Table */}
          <Surface variant="default" padded="none" className="overflow-hidden">
            <div className="p-4 border-b border-border-color bg-surface-2/60 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-200">
                  Dense Quantitative Data Table
                </h3>
                <p className="text-[11px] text-gray-400">
                  Built for scanning numeric data, alignment, and hover feedback.
                </p>
              </div>
              <Badge variant="cyan" dot>
                REALTIME STREAM
              </Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow interactive={false}>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead align="right">Mark Price</TableHead>
                  <TableHead align="right">Size</TableHead>
                  <TableHead align="right">PnL (Unrealized)</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow selected>
                  <TableCell mono>
                    <span className="font-bold text-gray-100">BTC/USDT</span>
                  </TableCell>
                  <TableCell>
                    <PositionSide side="LONG" size="sm" />
                  </TableCell>
                  <TableCell align="right" mono>
                    $112,480.00
                  </TableCell>
                  <TableCell align="right" mono>
                    1.25 BTC
                  </TableCell>
                  <TableCell align="right">
                    <PnLDisplay amount={4820.5} percentage={3.8} size="sm" layout="inline" />
                  </TableCell>
                  <TableCell>
                    <RiskBadge level="LOW" size="sm" />
                  </TableCell>
                  <TableCell>
                    <OrderStatus status="EXECUTING" size="sm" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell mono>
                    <span className="font-bold text-gray-100">ETH/USDT</span>
                  </TableCell>
                  <TableCell>
                    <PositionSide side="SHORT" size="sm" />
                  </TableCell>
                  <TableCell align="right" mono>
                    $4,120.50
                  </TableCell>
                  <TableCell align="right" mono>
                    14.0 ETH
                  </TableCell>
                  <TableCell align="right">
                    <PnLDisplay amount={-310.2} percentage={-0.8} size="sm" layout="inline" />
                  </TableCell>
                  <TableCell>
                    <RiskBadge level="MEDIUM" size="sm" />
                  </TableCell>
                  <TableCell>
                    <OrderStatus status="FILLED" size="sm" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell mono>
                    <span className="font-bold text-gray-100">SOL/USDT</span>
                  </TableCell>
                  <TableCell>
                    <PositionSide side="LONG" size="sm" />
                  </TableCell>
                  <TableCell align="right" mono>
                    $245.80
                  </TableCell>
                  <TableCell align="right" mono>
                    120 SOL
                  </TableCell>
                  <TableCell align="right">
                    <PnLDisplay amount={1240.0} percentage={5.4} size="sm" layout="inline" />
                  </TableCell>
                  <TableCell>
                    <RiskBadge level="LOW" size="sm" />
                  </TableCell>
                  <TableCell>
                    <OrderStatus status="APPROVED" size="sm" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Surface>

          {/* Empty, Error, and Loading States */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EmptyState
              title="No Pending Proposals"
              description="Hermes is analyzing orderbooks. When an edge meets criteria, a structured proposal will appear."
              action={
                <Button variant="secondary" size="xs">
                  Review Scanner Rules
                </Button>
              }
            />

            <ErrorState
              title="Risk Limit Triggered"
              message="Proposed trade exceeded maximum 2.0% equity exposure threshold."
              code="RISK_EXPOSURE_CAP"
              onRetry={() =>
                showToast({
                  type: "info",
                  title: "Recalculating Risk Metrics",
                  message: "Request sent to risk engine.",
                })
              }
            />

            <Surface variant="default" padded="md" className="flex flex-col justify-center">
              <LoadingState
                message="INGESTING LEVEL 2 BOOK"
                subtext="WebSocket stream: 84 msgs/sec"
              />
              <div className="mt-4 space-y-2">
                <Skeleton height={12} className="w-3/4 mx-auto" />
                <Skeleton height={12} className="w-1/2 mx-auto" />
              </div>
            </Surface>
          </div>
        </TabContent>
      </Tabs>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Emergency Risk Engine Interlock"
        subtitle="Verification required before overriding autonomous controls"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                showToast({
                  type: "error",
                  title: "Emergency Interlock Activated",
                  message: "All proposal execution queued orders suspended.",
                });
              }}
            >
              Confirm Emergency Halt
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-gray-300">
            This action will disconnect Hermes from submitting any new trade proposals
            and signal the execution layer to reject unapproved orders.
          </p>
          <div className="p-3 rounded bg-loss-dim/40 border border-loss/40 text-loss text-xs font-mono">
            WARNING: Open exchange positions will remain in accordance with deterministic
            stop-loss orders on the exchange.
          </div>
        </div>
      </Modal>
    </div>
  );
}
