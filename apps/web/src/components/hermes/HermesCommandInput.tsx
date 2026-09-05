"use client";

import React, { useState, useRef, useEffect } from "react";
import { Surface } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { CommandMessage, cannedCommandResponses } from "@/lib/mockHermesData";
import { Terminal, Send, Loader2, Sparkles, Bot, User } from "lucide-react";

interface HermesCommandInputProps {
  className?: string;
}

export function HermesCommandInput({ className = "" }: HermesCommandInputProps) {
  const [messages, setMessages] = useState<CommandMessage[]>([
    {
      id: "msg-init",
      sender: "hermes",
      text: "Hermes command interface ready. Query active market observations, technical regime evaluations, or risk parameters.",
      timestamp: "12:40:00",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    "Why is BTC being monitored?",
    "Show current opportunities",
    "Explain current market regime",
    "What is the active risk status?",
  ];

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isAnalyzing) return;

    const userMsg: CommandMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsAnalyzing(true);

    // Simulate realistic 600ms deterministic intelligence evaluation
    setTimeout(() => {
      const responseText =
        cannedCommandResponses[query] ||
        `Hermes evaluated query: "${query}". Market structure remains within nominal parameters. BTC is in a trending expansion regime and portfolio exposure is 34.2%, well below the 50% cap.`;

      const hermesMsg: CommandMessage = {
        id: `hms-${Date.now()}`,
        sender: "hermes",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, hermesMsg]);
      setIsAnalyzing(false);
    }, 600);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnalyzing]);

  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/50 select-none">
        <div className="flex items-center gap-2">
          <Terminal size={15} className="text-cyan-400" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Operational Query Terminal
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          DETERMINISTIC REASONING INTERFACE
        </span>
      </div>

      {/* Message Output History */}
      <div className="p-4 space-y-3 max-h-[260px] overflow-y-auto bg-bg-950/60 font-mono text-xs">
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="p-1 rounded bg-bg-900 border border-cyan-500/40 text-cyan-400 shrink-0 mt-0.5">
                  <Bot size={13} />
                </div>
              )}

              <div
                className={`p-2.5 rounded max-w-[85%] space-y-1 ${
                  isUser
                    ? "bg-surface-2 border border-border-hi text-gray-200"
                    : "bg-surface border border-cyan-500/30 text-gray-300 shadow-[0_0_12px_rgba(0,229,255,0.04)]"
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] text-gray-400 pb-0.5 border-b border-border-color/50">
                  <span className="font-bold uppercase tracking-wider text-cyan-400">
                    {isUser ? "OPERATOR" : "HERMES CORE"}
                  </span>
                  <span>{m.timestamp}</span>
                </div>
                <p className="text-xs leading-relaxed font-sans">{m.text}</p>
              </div>

              {isUser && (
                <div className="p-1 rounded bg-surface-2 border border-border-color text-gray-300 shrink-0 mt-0.5">
                  <User size={13} />
                </div>
              )}
            </div>
          );
        })}

        {isAnalyzing && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs py-1">
            <Loader2 size={13} className="animate-spin" />
            <span className="font-mono">Hermes is synthesizing market evidence...</span>
          </div>
        )}

        <div ref={logEndRef} />
      </div>

      {/* Suggested Fast Chips */}
      <div className="px-4 py-2 bg-surface-2/40 border-t border-border-color/60 flex flex-wrap items-center gap-1.5 overflow-x-auto select-none">
        <span className="text-[10px] font-mono text-gray-400 uppercase mr-1">
          SUGGESTED:
        </span>
        {samplePrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSend(prompt)}
            disabled={isAnalyzing}
            className="px-2 py-0.5 rounded text-[11px] font-mono bg-bg-950 border border-border-color hover:border-cyan-500/50 text-gray-300 hover:text-cyan-300 transition-colors disabled:opacity-50 text-left truncate max-w-[280px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-border-color bg-surface flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Hermes about the current market..."
          disabled={isAnalyzing}
          className="flex-1 px-3 py-2 text-xs font-mono bg-bg-950 border border-border-color rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!inputValue.trim() || isAnalyzing}
          leftIcon={<Send size={13} />}
          className="shrink-0 font-mono text-xs"
        >
          QUERY
        </Button>
      </form>
    </Surface>
  );
}
