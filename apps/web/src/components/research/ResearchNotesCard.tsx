import React from "react";
import type { NoteResponse, ResearchNoteType } from "@/lib/researchApi";

const NOTE_COLOR: Record<ResearchNoteType, string> = {
  OBSERVATION:    "text-gray-400 border-gray-700",
  HYPOTHESIS:     "text-cyan-400 border-cyan-800",
  ASSUMPTION:     "text-blue-400 border-blue-800",
  FINDING:        "text-green-400 border-green-800",
  FAILURE:        "text-red-400 border-red-800",
  INTERPRETATION: "text-purple-400 border-purple-800",
  DECISION:       "text-yellow-400 border-yellow-800",
  NEXT_STEP:      "text-orange-400 border-orange-800",
};

interface Props { notes: NoteResponse[] }

export function ResearchNotesCard({ notes }: Props) {
  if (notes.length === 0) {
    return (
      <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-3">Research Notes</div>
        <p className="text-xs text-gray-600 font-mono">No notes recorded.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-3">Research Notes</div>
      <div className="space-y-3">
        {notes.map((note) => {
          const colorClass = NOTE_COLOR[note.note_type] ?? "text-gray-400 border-gray-700";
          return (
            <div key={note.id} className={`border-l-2 pl-3 py-1 ${colorClass}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${colorClass.split(" ")[0]}`}>
                  {note.note_type.replace("_", " ")}
                </span>
                {note.stage && (
                  <span className="text-[10px] font-mono text-gray-600">@ {note.stage}</span>
                )}
                <span className="ml-auto text-[10px] font-mono text-gray-700">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{note.content}</p>
              {note.author && (
                <p className="text-[10px] font-mono text-gray-600 mt-1">— {note.author}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
