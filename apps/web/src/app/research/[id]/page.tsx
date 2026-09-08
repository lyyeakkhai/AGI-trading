import { ExperimentDetailWorkspace } from "@/components/research";

export const metadata = { title: "Experiment | AGI Trading" };

interface Props {
  params: { id: string };
}

export default function ExperimentPage({ params }: Props) {
  return <ExperimentDetailWorkspace experimentId={params.id} />;
}
