import { PositionsWorkspace } from "@/components/positions/PositionsWorkspace";

export const metadata = {
  title: "Positions | AGI Trading",
  description: "Real-time paper trading positions, exposure, and portfolio monitoring.",
};

export default function PositionsPage() {
  return <PositionsWorkspace />;
}
