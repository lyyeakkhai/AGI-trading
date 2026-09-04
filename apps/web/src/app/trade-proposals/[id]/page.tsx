"use client";

import { useParams } from "next/navigation";
import { TradeProposalsWorkspace } from "@/components/proposals/TradeProposalsWorkspace";

export default function ProposalDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || undefined;

  return <TradeProposalsWorkspace initialProposalId={id} />;
}
