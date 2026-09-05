"use client";

import React, { useState, useMemo } from "react";
import { ProposalSummaryHeader } from "./ProposalSummaryHeader";
import { ProposalFilters, ProposalFilterState } from "./ProposalFilters";
import { TradeProposalTable } from "./TradeProposalTable";
import { TradeProposalDetail } from "./TradeProposalDetail";
import { ApprovalModal } from "./ApprovalModal";
import { RejectModal } from "./RejectModal";
import { useToast } from "@/components/ui/Toast";
import {
  mockTradeProposals,
  TradeProposalItem,
  ProposalSummaryMetrics,
} from "@/lib/mockTradeProposalsData";

const defaultFilters: ProposalFilterState = {
  search: "",
  status: "All",
  asset: "All",
  direction: "All",
  timeframe: "All",
  strategy: "All",
  sortBy: "default",
};

interface TradeProposalsWorkspaceProps {
  initialProposalId?: string;
}

export function TradeProposalsWorkspace({
  initialProposalId,
}: TradeProposalsWorkspaceProps) {
  const { showToast } = useToast();

  // Local state initialized from deterministic mock proposals
  const [proposals, setProposals] = useState<TradeProposalItem[]>(mockTradeProposals);
  const [filters, setFilters] = useState<ProposalFilterState>(defaultFilters);

  // Selected proposal for detailed inspection
  const initialSelected = useMemo(() => {
    if (initialProposalId) {
      return proposals.find((p) => p.id === initialProposalId) || proposals[0];
    }
    return proposals[0] || null;
  }, [initialProposalId, proposals]);

  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(
    initialSelected ? initialSelected.id : null
  );

  // Modal dialog states
  const [proposalToApprove, setProposalToApprove] = useState<TradeProposalItem | null>(null);
  const [proposalToReject, setProposalToReject] = useState<TradeProposalItem | null>(null);

  // Re-compute summary metrics dynamically from local proposals state
  const currentMetrics: ProposalSummaryMetrics = useMemo(() => {
    const pending = proposals.filter((p) => p.status === "Awaiting Approval").length;
    const approvedRisk = proposals.filter((p) => p.riskDecision === "APPROVED").length;
    const underReview = proposals.filter((p) => p.status === "Under Review").length;
    const rejected = proposals.filter((p) => p.status === "Rejected").length;
    const avgConf =
      proposals.length > 0
        ? Math.round(
            proposals.reduce((acc, p) => acc + p.confidence, 0) / proposals.length
          )
        : 76;

    return {
      pendingApprovalCount: pending,
      riskApprovedCount: approvedRisk,
      underReviewCount: underReview,
      rejectedCount: rejected,
      averageConfidence: avgConf,
    };
  }, [proposals]);

  // Filtered & Sorted proposal list
  const filteredProposals = useMemo(() => {
    let list = [...proposals];

    // 1. Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.symbol.toLowerCase().includes(q) ||
          p.strategy.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q)
      );
    }

    // 2. Status
    if (filters.status !== "All") {
      list = list.filter((p) => p.status === filters.status);
    }

    // 3. Asset
    if (filters.asset !== "All") {
      list = list.filter((p) => p.symbol === filters.asset);
    }

    // 4. Direction
    if (filters.direction !== "All") {
      list = list.filter((p) => p.direction === filters.direction);
    }

    // 5. Timeframe
    if (filters.timeframe !== "All") {
      list = list.filter((p) => p.timeframe === filters.timeframe);
    }

    // 6. Strategy
    if (filters.strategy !== "All") {
      list = list.filter((p) => p.strategy === filters.strategy);
    }

    // 7. Sorting
    list.sort((a, b) => {
      switch (filters.sortBy) {
        case "default": {
          const aPriority = a.status === "Awaiting Approval" ? 1 : 0;
          const bPriority = b.status === "Awaiting Approval" ? 1 : 0;
          if (aPriority !== bPriority) return bPriority - aPriority;
          return b.confidence - a.confidence;
        }
        case "confidence-desc":
          return b.confidence - a.confidence;
        case "rr-desc": {
          const aRR = parseFloat(a.riskReward);
          const bRR = parseFloat(b.riskReward);
          return bRR - aRR;
        }
        case "newest":
          return b.createdTimestamp - a.createdTimestamp;
        case "risk":
          return a.riskPercent - b.riskPercent;
        default:
          return b.confidence - a.confidence;
      }
    });

    return list;
  }, [proposals, filters]);

  const activeSelectedProposal = useMemo(() => {
    return proposals.find((p) => p.id === selectedProposalId) || null;
  }, [proposals, selectedProposalId]);

  // Handle Approve Confirmation
  const handleConfirmApproval = () => {
    if (!proposalToApprove) return;

    const timeString = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalToApprove.id) {
          return {
            ...p,
            status: "Approved",
            ownerApprovalStatus: "APPROVED",
            approvalTimestamp: `${timeString} UTC`,
            lifecycleStage: "execution",
          };
        }
        return p;
      })
    );

    showToast({
      title: "Proposal Authorized",
      message: `${proposalToApprove.symbol} ${proposalToApprove.direction} authorized by owner. Execution bridge unlocked.`,
      type: "success",
    });

    setProposalToApprove(null);
  };

  // Handle Reject Confirmation
  const handleConfirmRejection = (reason: string) => {
    if (!proposalToReject) return;

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalToReject.id) {
          return {
            ...p,
            status: "Rejected",
            ownerApprovalStatus: "REJECTED",
            rejectionReason: reason,
          };
        }
        return p;
      })
    );

    showToast({
      title: "Proposal Declined",
      message: `${proposalToReject.symbol} proposal declined by owner.`,
      type: "warning",
    });

    setProposalToReject(null);
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12">
      {/* 1. Page Header Strip & Metrics */}
      <ProposalSummaryHeader metrics={currentMetrics} />

      {/* 2. Search, Filter & Sort Controls */}
      <ProposalFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
        resultCount={filteredProposals.length}
        totalCount={proposals.length}
      />

      {/* 3. Table & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Proposals Table: 7 cols if detail selected, or full 12 cols */}
        <div
          className={`${
            activeSelectedProposal ? "lg:col-span-7" : "lg:col-span-12"
          } transition-all duration-200`}
        >
          <TradeProposalTable
            proposals={filteredProposals}
            selectedProposalId={activeSelectedProposal?.id}
            onSelectProposal={(p) => setSelectedProposalId(p.id)}
            onResetFilters={() => setFilters(defaultFilters)}
          />
        </div>

        {/* Selected Proposal Detail: 5 cols on lg */}
        {activeSelectedProposal && (
          <div className="lg:col-span-5 w-full sticky top-4">
            <TradeProposalDetail
              proposal={activeSelectedProposal}
              onClose={() => setSelectedProposalId(null)}
              onRequestApprove={(p) => setProposalToApprove(p)}
              onRequestReject={(p) => setProposalToReject(p)}
              className="rounded-lg border border-border-color max-h-[85vh]"
            />
          </div>
        )}
      </div>

      {/* 4. Confirmation Modals */}
      <ApprovalModal
        isOpen={!!proposalToApprove}
        onClose={() => setProposalToApprove(null)}
        onConfirm={handleConfirmApproval}
        proposal={proposalToApprove}
      />

      <RejectModal
        isOpen={!!proposalToReject}
        onClose={() => setProposalToReject(null)}
        onConfirm={handleConfirmRejection}
        proposal={proposalToReject}
      />
    </div>
  );
}
