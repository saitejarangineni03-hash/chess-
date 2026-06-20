import { Chess } from "chess.js";

// Piece-Square Evaluation Tables
// Values are defined from White's perspective (i.e. row 0 is rank 8, row 7 is rank 1).
// For Black, the table is mirrored vertically.

const PAWN_TABLE = [
  [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
  [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
  [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
  [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
  [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
  [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
  [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
  [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
];

const KNIGHT_TABLE = [
  [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
  [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
  [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
  [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
  [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
  [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
  [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
  [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
];

const BISHOP_TABLE = [
  [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
  [-1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
  [-1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
  [-1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
  [-1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
  [-1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
  [-1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
  [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

const ROOK_TABLE = [
  [ 0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
  [ 0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
  [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ 0.0,  0.0,  0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];

const QUEEN_TABLE = [
  [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
  [-1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
  [-1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
  [-0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
  [ 0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
  [-1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
  [-1.0,  0.0,  0.5,  0.0,  0.0,  0.5,  0.0, -1.0],
  [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

const KING_MIDDLE_GAME_TABLE = [
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
  [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
  [ 2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0],
  [ 2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0]
];

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

/**
 * Returns static valuation of the current board state.
 * Positive favors White, negative favors Black.
 */
function evaluateBoard(chess: Chess): number {
  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const type = piece.type;
        const color = piece.color;
        
        let val = PIECE_VALUES[type] || 0;
        
        // Add positional values
        let tableVal = 0;
        const row = color === "w" ? r : 7 - r; // Mirror table vertically for Black
        const col = color === "w" ? c : 7 - c; // Handle symmetrical mirroring

        switch (type) {
          case "p":
            tableVal = PAWN_TABLE[row][col] * 10;
            break;
          case "n":
            tableVal = KNIGHT_TABLE[row][col] * 10;
            break;
          case "b":
            tableVal = BISHOP_TABLE[row][col] * 10;
            break;
          case "r":
            tableVal = ROOK_TABLE[row][col] * 10;
            break;
          case "q":
            tableVal = QUEEN_TABLE[row][col] * 10;
            break;
          case "k":
            tableVal = KING_MIDDLE_GAME_TABLE[row][col] * 10;
            break;
        }

        const totalComponent = val + tableVal;
        if (color === "w") {
          score += totalComponent;
        } else {
          score -= totalComponent;
        }
      }
    }
  }

  return score;
}

/**
 * Returns the best move for the active side using Minimax search with Alpha-Beta pruning,
 * tuned for the specified difficulty level.
 */
export function getBestMove(
  chess: Chess,
  difficulty: "easy" | "medium" | "hard"
): { from: string; to: string; promotion?: string } | null {
  const possibleMoves = chess.moves({ verbose: true });
  
  if (possibleMoves.length === 0) {
    return null;
  }

  // EASY MODE: Mostly random, but 50% chance of doing a simple capture if available
  if (difficulty === "easy") {
    const checks = possibleMoves.filter(m => m.san.includes("+"));
    const captures = possibleMoves.filter(m => m.flags.includes("c") || m.flags.includes("e"));
    
    if (captures.length > 0 && Math.random() < 0.5) {
      const randomCapture = captures[Math.floor(Math.random() * captures.length)];
      return { 
        from: randomCapture.from, 
        to: randomCapture.to,
        promotion: randomCapture.promotion
      };
    }
    
    if (checks.length > 0 && Math.random() < 0.3) {
      const randomCheck = checks[Math.floor(Math.random() * checks.length)];
      return { 
        from: randomCheck.from, 
        to: randomCheck.to, 
        promotion: randomCheck.promotion 
      };
    }

    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    return { 
      from: randomMove.from, 
      to: randomMove.to,
      promotion: randomMove.promotion
    };
  }

  // MEDIUM/HARD MODE: Minimax Search
  // Medium: Depth 2, Hard: Depth 3
  const depth = difficulty === "medium" ? 2 : 3;
  const isWhite = chess.turn() === "w";
  
  let bestMoveScalar = isWhite ? -Infinity : Infinity;
  let bestMoveIdx = 0;

  // Shuffle moves slightly to prevent playing identical games from identical positions
  const movesWithIndices = possibleMoves.map((move, index) => ({ move, index }));
  movesWithIndices.sort(() => Math.random() - 0.5);

  for (let i = 0; i < movesWithIndices.length; i++) {
    const { move, index } = movesWithIndices[i];
    
    chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion || "q", // default promotion to queen during simulation
    });

    const score = minimax(chess, depth - 1, -Infinity, Infinity, !isWhite);
    chess.undo();

    if (isWhite) {
      if (score > bestMoveScalar) {
        bestMoveScalar = score;
        bestMoveIdx = index;
      }
    } else {
      if (score < bestMoveScalar) {
        bestMoveScalar = score;
        bestMoveIdx = index;
      }
    }
  }

  const resultMove = possibleMoves[bestMoveIdx];
  return {
    from: resultMove.from,
    to: resultMove.to,
    promotion: resultMove.promotion || "q"
  };
}

/**
 * Recursive Minimax search with Alpha-Beta pruning
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    // If game-over check reward weights
    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        // Turn: w means black has just moved and checkmated White, or vice-versa
        return isMaximizingPlayer ? -99999 + (3 - depth) : 99999 - (3 - depth);
      }
      return 0; // Stalemate/draw
    }
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      chess.move({
        from: moves[i].from,
        to: moves[i].to,
        promotion: moves[i].promotion || "q",
      });
      const evaluation = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break; // beta cut-off
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < moves.length; i++) {
      chess.move({
        from: moves[i].from,
        to: moves[i].to,
        promotion: moves[i].promotion || "q",
      });
      const evaluation = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break; // alpha cut-off
      }
    }
    return minEval;
  }
}
