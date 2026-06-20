import React from "react";
import { ChessPiece } from "./ChessPieces";

interface CapturedPiecesProps {
  board: any[][];
}

const STARTING_COUNTS = {
  p: 8,
  n: 2,
  b: 2,
  r: 2,
  q: 1,
};

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
};

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ board }) => {
  // 1. Scan board and count current pieces
  const currentCounts = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 },
  };

  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell && cell.type !== "k") {
        const color = cell.color as "w" | "b";
        const type = cell.type as keyof typeof STARTING_COUNTS;
        if (currentCounts[color] && currentCounts[color][type] !== undefined) {
          currentCounts[color][type]++;
        }
      }
    });
  });

  // Calculate captures
  // If player is White ('w'), captured pieces are Black pieces ('b')
  const capturedByWhite: { type: string; color: "b" }[] = [];
  const capturedByBlack: { type: string; color: "w" }[] = [];

  // Material scoring totals
  let whiteMaterialVal = 0;
  let blackMaterialVal = 0;

  // Compute pieces captured by White (i.e., Black pieces that are missing)
  (Object.keys(STARTING_COUNTS) as Array<keyof typeof STARTING_COUNTS>).forEach((type) => {
    const missingBlack = STARTING_COUNTS[type] - currentCounts.b[type];
    for (let i = 0; i < missingBlack; i++) {
      capturedByWhite.push({ type, color: "b" });
      whiteMaterialVal += PIECE_VALUES[type];
    }

    const missingWhite = STARTING_COUNTS[type] - currentCounts.w[type];
    for (let i = 0; i < missingWhite; i++) {
      capturedByBlack.push({ type, color: "w" });
      blackMaterialVal += PIECE_VALUES[type];
    }
  });

  // Calculate score advantage
  const scoreDiff = whiteMaterialVal - blackMaterialVal;

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/60 border border-slate-800/70 rounded-2xl shadow-xl backdrop-blur-md">
      {/* Captured by WHITE (Black pieces) */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Captured by White</span>
          {scoreDiff > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500/25 text-indigo-300 rounded border border-indigo-500/30">
              +{scoreDiff}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 max-w-[180px] justify-end">
          {capturedByWhite.length > 0 ? (
            capturedByWhite.map((item, idx) => (
              <div key={`cap-b-${item.type}-${idx}`} className="w-5 h-5 flex-shrink-0 drop-shadow-md hover:scale-110 transition-transform">
                <ChessPiece type={item.type} color={item.color} />
              </div>
            ))
          ) : (
            <span className="text-[10px] text-slate-500 italic font-mono">-</span>
          )}
        </div>
      </div>

      {/* Captured by BLACK (White pieces) */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-850 border border-slate-900" />
          <span className="text-xs font-semibold text-slate-300">Captured by Black</span>
          {scoreDiff < 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
              +{Math.abs(scoreDiff)}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 max-w-[180px] justify-end">
          {capturedByBlack.length > 0 ? (
            capturedByBlack.map((item, idx) => (
              <div key={`cap-w-${item.type}-${idx}`} className="w-5 h-5 flex-shrink-0 drop-shadow-md hover:scale-110 transition-transform">
                <ChessPiece type={item.type} color={item.color} />
              </div>
            ))
          ) : (
            <span className="text-[10px] text-slate-500 italic font-mono">-</span>
          )}
        </div>
      </div>
    </div>
  );
};
