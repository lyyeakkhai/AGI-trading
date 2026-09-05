import { AnalyticsWorkspace } from "@/components/analytics/AnalyticsWorkspace";

export const metadata = {
  title: "Analytics | AGI Trading",
  description: "Performance telemetry, risk-adjusted returns, strategy behavior, and execution quality.",
};

export default function AnalyticsPage() {
  return <AnalyticsWorkspace />;
}
