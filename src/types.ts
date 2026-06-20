export type ChessMode = "pvp" | "ai";
export type AIDifficulty = "easy" | "medium" | "hard";
export type PlayerColor = "w" | "b";

export interface GamePreset {
  name: string;
  description: string;
  fen: string;
}

export const CHESS_PRESETS: GamePreset[] = [
  {
    name: "Standard Board",
    description: "Start a classic game of chess.",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  },
  {
    name: "Scholar's Mate Setup",
    description: "Can you spot the quick mate-in-1 threat?",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
  },
  {
    name: "Smothered Mate Puzzle",
    description: "A spectacular knight sacrifice leading to a smothered mate.",
    fen: "6rk/5Npp/8/8/8/8/8/6RK b - - 0 1",
  },
  {
    name: "Endgame Mastery",
    description: "Rook and King vs. King endgame technique.",
    fen: "8/8/8/8/8/2k5/1r6/2K5 b - - 0 1",
  },
  {
    name: "Pawn Race",
    description: "A tense pawn promotion duel with kings far away.",
    fen: "8/kp6/8/8/8/8/pP6/7K w - - 0 1",
  },
];
