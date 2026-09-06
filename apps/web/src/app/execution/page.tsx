import { ExecutionWorkspace } from "@/components/execution/ExecutionWorkspace";

export const metadata = {
  title: "Execution Engine & Order Lifecycle | AGI Trading",
  description: "Controlled order execution, dual-signature approval verification, state transitions, and execution telemetry.",
};

export default function ExecutionPage() {
  return <ExecutionWorkspace />;
}
