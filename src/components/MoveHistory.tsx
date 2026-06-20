import React, { useEffect, useRef } from "react";

interface MoveHistoryProps {
  history: string[]; // List of move strings, e.g., ["e4", "e5", "Nf3", "Nc6"]
  currentHistoryIndex: number; // -1 means starting board, 0 means first move, etc.
  onSelectMoveIndex: (index: number) => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentHistoryIndex,
  onSelectMoveIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Group history into rows of 2 (White move, Black move)
  const rows: { index: number; white: string; black?: string }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({
      index: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1] ? history[i + 1] : undefined,
    });
  }

  // Auto-scroll to bottom of move list
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-800">
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Move Log</span>
        <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded">
          {history.length} {history.length === 1 ? "move" : "moves"}
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-2 min-h-[140px] max-h-[180px] md:max-h-[220px] font-mono text-sm scrollbar-thin scrollbar-thumb-slate-800"
      >
        {rows.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-xs py-8">
            No moves played yet
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {rows.map((row, rIdx) => {
              const whiteMoveIdx = rIdx * 2;
              const blackMoveIdx = rIdx * 2 + 1;

              const isWhiteSelected = currentHistoryIndex === whiteMoveIdx;
              const isBlackSelected = currentHistoryIndex === blackMoveIdx;

              return (
                <div
                  key={`move-row-${row.index}`}
                  className="grid grid-cols-12 py-1 items-center hover:bg-slate-800/30 rounded transition-colors px-1"
                >
                  {/* Row Number */}
                  <div className="col-span-2 text-slate-500 text-xs font-semibold">
                    {row.index}.
                  </div>

                  {/* White Move */}
                  <div className="col-span-5">
                    <button
                      onClick={() => onSelectMoveIndex(whiteMoveIdx)}
                      className={`text-left w-full px-2 py-0.5 rounded text-sm hover:underline hover:text-amber-300 transition-colors ${
                        isWhiteSelected
                          ? "bg-amber-600 text-slate-950 font-bold hover:text-slate-950"
                          : "text-slate-200"
                      }`}
                    >
                      {row.white}
                    </button>
                  </div>

                  {/* Black Move */}
                  <div className="col-span-5">
                    {row.black && (
                      <button
                        onClick={() => onSelectMoveIndex(blackMoveIdx)}
                        className={`text-left w-full px-2 py-0.5 rounded text-sm hover:underline hover:text-amber-300 transition-colors ${
                          isBlackSelected
                            ? "bg-amber-600 text-slate-950 font-bold hover:text-slate-950"
                            : "text-slate-200"
                        }`}
                      >
                        {row.black}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-slate-950/60 p-2 border-t border-slate-800 flex justify-between gap-1 text-[10px]">
        <button
          onClick={() => onSelectMoveIndex(-1)}
          disabled={currentHistoryIndex === -1 && history.length === 0}
          className="flex-1 py-1 px-1 text-center bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 rounded font-bold transition-all"
        >
          Start
        </button>
        <button
          onClick={() => onSelectMoveIndex(Math.max(-1, currentHistoryIndex - 1))}
          disabled={currentHistoryIndex === -1}
          className="flex-1 py-1 px-1 text-center bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 rounded font-bold transition-all"
        >
          &larr; Prev
        </button>
        <button
          onClick={() => onSelectMoveIndex(Math.min(history.length - 1, currentHistoryIndex + 1))}
          disabled={currentHistoryIndex === history.length - 1 || history.length === 0}
          className="flex-1 py-1 px-1 text-center bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 rounded font-bold transition-all"
        >
          Next &rarr;
        </button>
        <button
          onClick={() => onSelectMoveIndex(history.length - 1)}
          disabled={currentHistoryIndex === history.length - 1 || history.length === 0}
          className="flex-1 py-1 px-1 text-center bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 rounded font-bold transition-all"
        >
          Live
        </button>
      </div>
    </div>
  );
};
