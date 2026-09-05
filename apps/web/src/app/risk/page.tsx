import { RiskWorkspace } from "@/components/risk/RiskWorkspace";

export const metadata = {
  title: "Risk Management | AGI Trading",
  description: "Deterministic portfolio protection, pre-execution checks, and quantitative exposure boundaries.",
};

export default function RiskPage() {
  return <RiskWorkspace />;
}
