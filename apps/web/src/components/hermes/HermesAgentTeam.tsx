"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { SpecialistAgent } from "@/lib/mockHermesData";
import { Users, Bot, LineChart, Globe, Shield } from "lucide-react";

interface HermesAgentTeamProps {
  agents: SpecialistAgent[];
  className?: string;
}

export function HermesAgentTeam({
  agents,
  className = "",
}: HermesAgentTeamProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case "agent-1":
        return <Bot size={16} className="text-cyan-400" />;
      case "agent-2":
        return <LineChart size={16} className="text-blue-400" />;
      case "agent-3":
        return <Globe size={16} className="text-purple-400" />;
      case "agent-4":
        return <Shield size={16} className="text-profit" />;
      default:
        return <Bot size={16} className="text-gray-400" />;
    }
  };

  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/50 select-none">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-cyan-400" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Specialist Agent Team
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          ARCHITECTURE
        </span>
      </div>

      {/* Agents Grid/List */}
      <div className="divide-y divide-border-color/50">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-surface-hover/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded bg-bg-950 border border-border-color shrink-0">
                {getIcon(agent.id)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-gray-100">
                    {agent.name}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    ({agent.role})
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans mt-0.5">
                  {agent.specialization}
                </p>
                <span className="text-[10px] font-mono text-cyan-400/90 block mt-1">
                  Active Task: {agent.activeTask}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  agent.status === "Active"
                    ? "bg-cyan-400 animate-pulse"
                    : agent.status === "Monitoring"
                    ? "bg-blue-400"
                    : "bg-profit"
                }`}
              />
              <span className="text-[10px] font-mono font-semibold text-gray-300 uppercase">
                {agent.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Surface>
  );
}
