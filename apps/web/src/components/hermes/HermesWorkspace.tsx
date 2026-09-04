"use client";

import React, { useState } from "react";
import { EnvironmentBadge } from "@/components/ui/EnvironmentBadge";
import { Badge } from "@/components/ui/Badge";
import { AIStatusIndicator } from "@/components/ai/AIStatusIndicator";
import { HermesHeroStatus } from "./HermesHeroStatus";
import { HermesInvestigation } from "./HermesInvestigation";
import { HermesEvidence } from "./HermesEvidence";
import { HermesMarketFocus } from "./HermesMarketFocus";
import { HermesToolActivity } from "./HermesToolActivity";
import { HermesAgentTeam } from "./HermesAgentTeam";
import { HermesMemory } from "./HermesMemory";
import { HermesActivityTimeline } from "./HermesActivityTimeline";
import { HermesOpportunityPreview } from "./HermesOpportunityPreview";
import { HermesProposalPreview } from "./HermesProposalPreview";
import { HermesCommandInput } from "./HermesCommandInput";
import {
  HermesVisualState,
  mockHermesInvestigation,
  mockEvidenceItems,
  mockMarketFocusItems,
  mockToolActivities,
  mockAgentTeam,
  mockMemoryContext,
  mockIntelligenceTimeline,
  mockOpportunitiesPreview,
  mockProposalPreview,
} from "@/lib/mockHermesData";
import { Bot, Clock } from "lucide-react";

export function HermesWorkspace() {
  const [currentState, setCurrentState] = useState<HermesVisualState>("monitoring");

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12">
      {/* 1. Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-surface border border-border-color">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-bg-950 border border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono tracking-tight text-gray-100">
                Hermes
              </h1>
              <span className="px-1.5 py-0.2 rounded bg-cyan-dim/30 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold">
                LEAD AGENT
              </span>
            </div>
            <p className="text-xs text-gray-400 font-sans">
              Main Trading Agent • Continuous Autonomous Market Surveillance
            </p>
          </div>
        </div>

        {/* Right Status */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <EnvironmentBadge mode="PAPER" />
          <AIStatusIndicator state="MONITORING" size="sm" />
          <div className="flex items-center gap-1.5 text-gray-400 pl-2 sm:border-l sm:border-border-color">
            <Clock size={12} />
            <span>Updated 12 sec ago</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Section: Visual Core, State Machine & High-Level Telemetry */}
      <HermesHeroStatus
        currentState={currentState}
        onStateChange={setCurrentState}
        currentFocus="BTC/USDT"
        activeTimeframe="1H"
        lastAction="Market structure & CVD delta evaluation"
      />

      {/* 3. Top Split: Current Investigation (Left 8 cols) + Market Focus (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <HermesInvestigation
            investigation={mockHermesInvestigation}
            className="h-full"
          />
        </div>
        <div className="lg:col-span-4">
          <HermesMarketFocus
            markets={mockMarketFocusItems}
            className="h-full"
          />
        </div>
      </div>

      {/* 4. Middle Split: Operational Activity Timeline (Left 5 cols) + Evidence Matrix (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <HermesActivityTimeline
            events={mockIntelligenceTimeline}
            className="h-full"
          />
        </div>
        <div className="lg:col-span-7">
          <HermesEvidence
            evidenceItems={mockEvidenceItems}
            className="h-full"
          />
        </div>
      </div>

      {/* 5. Deep Intelligence Pipeline: Tool Activity (4 cols) + Agent Team (4 cols) + Memory (4 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <HermesToolActivity
          tools={mockToolActivities}
          className="h-full"
        />
        <HermesAgentTeam
          agents={mockAgentTeam}
          className="h-full"
        />
        <HermesMemory
          memory={mockMemoryContext}
          className="h-full"
        />
      </div>

      {/* 6. Opportunities & Proposal Previews: Opportunities (6 cols) + Proposal Preview (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HermesOpportunityPreview
          opportunities={mockOpportunitiesPreview}
          className="h-full"
        />
        <HermesProposalPreview
          proposal={mockProposalPreview}
          className="h-full"
        />
      </div>

      {/* 7. Hermes Command Input Terminal */}
      <HermesCommandInput />
    </div>
  );
}
