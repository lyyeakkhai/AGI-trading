import { SettingsWorkspace } from "@/components/settings/SettingsWorkspace";

export const metadata = {
  title: "Settings & Configuration | AGI Trading",
  description: "Deterministic risk boundaries, Hermes operating parameters, exchange simulation, and environment security.",
};

export default function SettingsPage() {
  return <SettingsWorkspace />;
}
