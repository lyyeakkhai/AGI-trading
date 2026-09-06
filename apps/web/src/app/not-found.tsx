import Link from "next/link";
import { AlertOctagon, ArrowLeft, LayoutDashboard, LineChart, FileText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface border border-border-color rounded-lg p-6 sm:p-8 space-y-6 text-center shadow-2xl">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-lg bg-loss/10 border border-loss/30 flex items-center justify-center text-loss shadow-[0_0_16px_rgba(255,59,48,0.2)]">
            <AlertOctagon size={28} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-2 border border-border-color text-xs font-mono text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-loss" />
            <span>ERROR 404 // ROUTE_NOT_FOUND</span>
          </div>
          <h1 className="text-lg font-bold text-gray-100 tracking-tight">
            Navigation Destination Unresolved
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
            The target terminal route does not exist in the active platform registry or has been
            relocated.
          </p>
        </div>

        <div className="pt-2 border-t border-border-color/60 space-y-3">
          <Link href="/overview" className="inline-block w-full">
            <Button
              variant="primary"
              size="md"
              leftIcon={<LayoutDashboard size={15} />}
              className="w-full justify-center"
            >
              Return to Command Center
            </Button>
          </Link>

          <div className="text-[11px] text-gray-500 font-medium">Quick Workspaces</div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <Link
              href="/markets"
              className="p-2 rounded bg-surface-2 border border-border-color text-gray-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors flex flex-col items-center gap-1"
            >
              <LineChart size={13} />
              <span>Markets</span>
            </Link>
            <Link
              href="/trade-proposals"
              className="p-2 rounded bg-surface-2 border border-border-color text-gray-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors flex flex-col items-center gap-1"
            >
              <FileText size={13} />
              <span>Proposals</span>
            </Link>
            <Link
              href="/risk"
              className="p-2 rounded bg-surface-2 border border-border-color text-gray-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors flex flex-col items-center gap-1"
            >
              <ShieldAlert size={13} />
              <span>Risk</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
