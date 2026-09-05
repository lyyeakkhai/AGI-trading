import { ActivityWorkspace } from "@/components/activity/ActivityWorkspace";

export const metadata = {
  title: "Activity & Audit | AGI Trading",
  description: "Deterministic operational ledger, execution checkpoints, state transitions, and audit telemetry.",
};

export default function ActivityPage() {
  return <ActivityWorkspace />;
}
