import React, { useState } from "react";
import { ChessPiece } from "./ChessPieces";

interface ChessBoardProps {
  // board is an 8x8 array from chess.board()
  board: any[][];
  selectedSquare: string | null;
  validMovesForSelected: string[];
  lastMove: { from: string; to: string } | null;
  kingInCheckSquare: string | null;
  isFlipped: boolean;
  boardTheme: "forest" | "walnut" | "midnight";
  isLocked: boolean;
  onSquareClick: (square: string) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedSquare,
  validMovesForSelected,
  lastMove,
  kingInCheckSquare,
  isFlipped,
  boardTheme,
  isLocked,
  onSquareClick,
}) => {
  // Map boardTheme to color values
  // Forest: Light (f3f4f6), Dark (16a34a)
  // Walnut: Light (fef3c7), Dark (b45309)
  // Midnight: Light (f1f5f9), Dark (334155)
  const themeClasses = {
    forest: {
      light: "bg-[#EEEED2] text-[#769656]",
      dark: "bg-[#769656] text-[#EEEED2]",
      name: "Forest Emerald",
    },
    walnut: {
      light: "bg-[#F0D9B5] text-[#B58863]",
      dark: "bg-[#B58863] text-[#F0D9B5]",
      name: "Classic Walnut",
    },
    midnight: {
      light: "bg-[#cbd5e1] text-[#1e293b]",
      dark: "bg-[#64748b] text-[#f1f5f9]",
      name: "Grandmaster Slate",
    },
  };

  const selectedTheme = themeClasses[boardTheme] || themeClasses.forest;

  // Let's build ranks (1 to 8) and files (a to h) based on isFlipped
  const ranks = isFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = isFlipped ? ["h", "g", "f", "e", "d", "c", "b", "a"] : ["a", "b", "c", "d", "e", "f", "g", "h"];

  // Mapping coordinate back to 0-7 indexes of chess.js
  // In chess.js, row 0 is rank 8, row 7 is rank 1.
  // Col 0 is file a, col 7 is file h.
  const getPieceAtCoord = (file: string, rank: number) => {
    const colIdx = file.charCodeAt(0) - 97; // 'a' -> 0, 'h' -> 7
    const rowIdx = 8 - rank; // 8 -> 0, 1 -> 7
    return board[rowIdx] ? board[rowIdx][colIdx] : null;
  };

  return (
    <div className="relative w-full aspect-square max-w-[540px] mx-auto rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-900 select-none">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {ranks.map((rank, rIdx) => {
          return files.map((file, fIdx) => {
            const squareName = `${file}${rank}`;
            const piece = getPieceAtCoord(file, rank);
            
            // Check light vs dark square
            const isDark = (file.charCodeAt(0) - 97 + rank) % 2 === 0;
            const tileBgClass = isDark ? selectedTheme.dark : selectedTheme.light;

            // Highlight state
            const isSelected = selectedSquare === squareName;
            const isValidDestination = validMovesForSelected.includes(squareName);
            const isLastMoveOrigin = lastMove?.from === squareName;
            const isLastMoveDest = lastMove?.to === squareName;
            const isCheckedKing = kingInCheckSquare === squareName;

            // Compute background color overrides based on priority
            let squareOverlayClass = "";
            if (isCheckedKing) {
              squareOverlayClass = "bg-red-500/40 ring-4 ring-red-500/70 animate-pulse z-10";
            } else if (isSelected) {
              squareOverlayClass = "bg-[#818cf8]/70 ring-2 ring-indigo-500/90 z-10";
            } else if (isLastMoveOrigin || isLastMoveDest) {
              // Highlight last played move with a soft gold/yellow tone
              squareOverlayClass = "bg-[#fde047]/40";
            }

            return (
              <div
                key={squareName}
                id={`square-${squareName}`}
                onClick={() => !isLocked && onSquareClick(squareName)}
                className={`relative flex items-center justify-center cursor-pointer transition-all duration-150 ${tileBgClass} ${isLocked ? "cursor-not-allowed text-opacity-50" : ""}`}
              >
                {/* Visual state overlay */}
                {squareOverlayClass && (
                  <div className={`absolute inset-0 ${squareOverlayClass}`} />
                )}

                {/* Draw Coordinates at the outer borders */}
                {/* Files are shown at bottom edge */}
                {((!isFlipped && rank === 1) || (isFlipped && rank === 8)) && (
                  <span
                    className={`absolute bottom-[2px] right-[4px] text-[9px] font-extrabold tracking-tight ${
                      isDark ? "text-slate-100/45 text-slate-100/50" : "text-slate-900/45 text-slate-900/50"
                    }`}
                  >
                    {file.toUpperCase()}
                  </span>
                )}
                {/* Ranks are shown at left edge */}
                {((!isFlipped && file === "a") || (isFlipped && file === "h")) && (
                  <span
                    className={`absolute top-[2px] left-[4px] text-[9px] font-extrabold tracking-tight ${
                      isDark ? "text-slate-100/45 text-slate-100/50" : "text-slate-900/45 text-slate-900/50"
                    }`}
                  >
                    {rank}
                  </span>
                )}

                {/* Chess piece */}
                {piece && (
                  <div className="absolute inset-[4%] z-20 transition-transform duration-300 hover:scale-105 active:scale-95 drop-shadow-md">
                    <ChessPiece type={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Move Hint Overlay */}
                {isValidDestination && (
                  <div className="absolute inset-0 flex items-center justify-center z-30">
                    {piece ? (
                      // If there is an enemy, draw deep active circle perimeter
                      <div className="w-[84%] h-[84%] rounded-full border-[5px] border-indigo-500/80" />
                    ) : (
                      // If empty cell, draw a neat central active circle dot
                      <div className="w-3.5 h-3.5 rounded-full bg-indigo-500/80 shadow-sm" />
                    )}
                  </div>
                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
