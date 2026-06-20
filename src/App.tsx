/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { motion, AnimatePresence } from "motion/react";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Users,
  Monitor,
  CheckCircle,
  Shuffle,
  Info,
  Clock,
  Award,
  ChevronRight,
  BookOpen,
} from "lucide-react";

import { CHESS_PRESETS, ChessMode, AIDifficulty, PlayerColor } from "./types";
import { ChessBoard } from "./components/ChessBoard";
import { CapturedPieces } from "./components/CapturedPieces";
import { MoveHistory } from "./components/MoveHistory";
import { ChessPiece } from "./components/ChessPieces";
import { audio } from "./components/AudioEngine";
import { getBestMove } from "./lib/chessAI";

export default function App() {
  // --- Game Engine State ---
  const [chess, setChess] = useState(() => new Chess());
  // We keep a history of FENs for timeline traversal (index 0 is starting board, index 1 is first move, etc.)
  const [fensList, setFensList] = useState<string[]>([chess.fen()]);
  const [historyList, setHistoryList] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1); // -1 means starting board

  // --- Configuration State ---
  const [chessMode, setChessMode] = useState<ChessMode>("ai");
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>("medium");
  const [playerColor, setPlayerColor] = useState<PlayerColor>("w");
  const [boardTheme, setBoardTheme] = useState<"forest" | "walnut" | "midnight">("midnight");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // --- Real-time Tournament Clocks ---
  const [whiteTime, setWhiteTime] = useState<number>(600); // 10 minutes in seconds
  const [blackTime, setBlackTime] = useState<number>(600);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const isTimeOut = whiteTime === 0 || blackTime === 0;

  // --- UI Interactivity ---
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMovesForSelected, setValidMovesForSelected] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [kingInCheckSquare, setKingInCheckSquare] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(true);

  // --- Pawn Promotion Control ---
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);

  // --- Game Over Ending Overlay Control ---
  const [showGameOverOverlay, setShowGameOverOverlay] = useState<boolean>(true);

  // Auto-show end screen overlay on game end
  useEffect(() => {
    if (chess.isGameOver() || isTimeOut) {
      setShowGameOverOverlay(true);
    }
  }, [chess, isTimeOut]);

  // Re-sync sound engine preferences
  useEffect(() => {
    audio.setMute(isMuted);
  }, [isMuted]);

  // Derive active game state for rendering (supports reading historical/rewound positions)
  const isHistoryMode = currentHistoryIndex < historyList.length - 1;
  const activeChess = React.useMemo(() => {
    const targetFen = fensList[currentHistoryIndex + 1];
    return targetFen ? new Chess(targetFen) : chess;
  }, [fensList, currentHistoryIndex, chess]);

  const activeBoard = activeChess.board();
  const currentTurn = activeChess.turn();

  // Active turn tracking for Clocks
  useEffect(() => {
    // Start clocks only if at least one move has been made, and game is not over
    if (historyList.length > 0 && !chess.isGameOver() && !isHistoryMode) {
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  }, [historyList, chess, isHistoryMode]);

  // Real-time ticking effect
  useEffect(() => {
    let tickInterval: any = null;
    if (isTimerRunning) {
      tickInterval = setInterval(() => {
        const turn = chess.turn();
        if (turn === "w") {
          setWhiteTime((prev) => (prev > 0 ? prev - 1 : 0));
        } else {
          setBlackTime((prev) => (prev > 0 ? prev - 1 : 0));
        }
      }, 1000);
    }
    return () => clearInterval(tickInterval);
  }, [isTimerRunning, chess]);

  // --- Reactive Completed Background Music Trigger ---
  useEffect(() => {
    const gameOver = chess.isGameOver();
    const timedOut = whiteTime === 0 || blackTime === 0;

    if (gameOver || timedOut) {
      if (chess.isCheckmate()) {
        const checkmateWinner = chess.turn() === "w" ? "b" : "w";
        if (chessMode === "ai") {
          if (checkmateWinner === playerColor) {
            audio.startCompletedMusic("victory");
          } else {
            audio.startCompletedMusic("defeat");
          }
        } else {
          audio.startCompletedMusic("victory");
        }
      } else if (timedOut) {
        if (chessMode === "ai") {
          const activeTurn = chess.turn();
          const aiColor = playerColor === "w" ? "b" : "w";
          if (activeTurn === aiColor) {
            audio.startCompletedMusic("victory");
          } else {
            audio.startCompletedMusic("defeat");
          }
        } else {
          audio.startCompletedMusic("victory");
        }
      } else {
        audio.startCompletedMusic("draw");
      }
    } else {
      audio.stopCompletedMusic();
    }

    return () => {
      audio.stopCompletedMusic();
    };
  }, [chess, whiteTime, blackTime, chessMode, playerColor]);

  // Highlight King in Check if applicable
  useEffect(() => {
    if (activeChess.isCheck()) {
      // Find the active side's king position
      let kingPos: string | null = null;
      activeBoard.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
          if (cell && cell.type === "k" && cell.color === currentTurn) {
            const file = String.fromCharCode(97 + cIdx);
            const rank = 8 - rIdx;
            kingPos = `${file}${rank}`;
          }
        });
      });
      setKingInCheckSquare(kingPos);
    } else {
      setKingInCheckSquare(null);
    }
  }, [activeChess, activeBoard, currentTurn]);

  // --- Computer AI Automatic Turn trigger ---
  const aiColor = playerColor === "w" ? "b" : "w";
  useEffect(() => {
    if (
      chessMode === "ai" &&
      !isHistoryMode &&
      chess.turn() === aiColor &&
      !chess.isGameOver() &&
      !promotionPending &&
      !isTimeOut
    ) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const bestMove = getBestMove(chess, aiDifficulty);
        if (bestMove) {
          try {
            const moveRes = chess.move(bestMove);
            if (moveRes) {
              // Play sounds
              if (moveRes.captured) {
                audio.playCapture();
              } else {
                audio.playMove();
              }

              // Evaluate results
              if (chess.isCheckmate()) {
                audio.playDefeat();
              } else if (chess.isCheck()) {
                audio.playCheck();
              }

              const newFen = chess.fen();
              setFensList((prev) => [...prev, newFen]);
              setHistoryList((prev) => [...prev, moveRes.san]);
              setCurrentHistoryIndex((prev) => prev + 1);
              setLastMove({ from: bestMove.from, to: bestMove.to });
            }
          } catch (err) {
            console.error("AI execution failed", err);
          }
        }
        setIsAiThinking(false);
      }, 800); // 800ms natural delay for computer moves

      return () => clearTimeout(timer);
    }
  }, [chessMode, isHistoryMode, fensList, playerColor, aiDifficulty, promotionPending, isTimeOut]);

  // Auto-flip orientation based on Player Color selection in AI mode
  useEffect(() => {
    if (chessMode === "ai") {
      setIsFlipped(playerColor === "b");
    }
  }, [playerColor, chessMode]);

  // --- Board Coordinate Click Handling ---
  const handleSquareClick = (square: string) => {
    if (isHistoryMode || isAiThinking || isTimeOut) return;

    // Check if player clicking their turn pieces
    const cell = activeChess.get(square as any);
    const isPlayerTurn = chessMode === "pvp" || chess.turn() === playerColor;

    if (!isPlayerTurn) return;

    // If there is already a selection
    if (selectedSquare) {
      // Check if clicking another of player's own pieces (re-select)
      if (cell && cell.color === chess.turn()) {
        setSelectedSquare(square);
        const moves = chess.moves({ square: square as any, verbose: true });
        setValidMovesForSelected(moves.map((m) => m.to));
        return;
      }

      // Try playing the move
      const isDestinationValid = validMovesForSelected.includes(square);
      if (isSelectedSquareDestination(square) || isDestinationValid) {
        // Standard rule checks before moving
        const currentMoves = chess.moves({ square: selectedSquare as any, verbose: true });
        const matchingMove = currentMoves.find((m) => m.to === square);

        if (matchingMove) {
          // Pawn Promotion trigger check
          const isPawn = matchingMove.piece === "p";
          const is8thRow = matchingMove.to.endsWith("8") || matchingMove.to.endsWith("1");

          if (isPawn && is8thRow) {
            // Save parameters and trigger promotion Modal
            setPromotionPending({ from: selectedSquare, to: square });
            return;
          }

          executeMove(selectedSquare, square);
        }
      }

      // Clear selection if clicked away
      setSelectedSquare(null);
      setValidMovesForSelected([]);
    } else {
      // Select the clicked cell if it belongs to current player turn
      if (cell && cell.color === chess.turn()) {
        setSelectedSquare(square);
        const moves = chess.moves({ square: square as any, verbose: true });
        setValidMovesForSelected(moves.map((m) => m.to));
      }
    }
  };

  const isSelectedSquareDestination = (square: string) => {
    return validMovesForSelected.some((m) => m === square);
  };

  // --- Complete Move execution ---
  const executeMove = (from: string, to: string, promotion: string = "q") => {
    try {
      const liveChess = new Chess(chess.fen());
      const moveRes = liveChess.move({ from, to, promotion });

      if (moveRes) {
        setChess(liveChess);

        // Sound triggers
        if (moveRes.captured) {
          audio.playCapture();
        } else {
          audio.playMove();
        }

        if (liveChess.isCheck()) {
          audio.playCheck();
        }

        const newFen = liveChess.fen();
        
        // Truncate any branched history lists if we made a move from previous timeline undo point!
        const nextIdx = currentHistoryIndex + 1;
        const slicedFens = fensList.slice(0, nextIdx + 1);
        const slicedHistory = historyList.slice(0, nextIdx);

        setFensList([...slicedFens, newFen]);
        setHistoryList([...slicedHistory, moveRes.san]);
        setCurrentHistoryIndex(slicedHistory.length);
        setLastMove({ from, to });

        // Clear UI indicators
        setSelectedSquare(null);
        setValidMovesForSelected([]);
      }
    } catch (err) {
      console.warn("Invalid Move", err);
    }
  };

  // --- Pawn Promotion Choice Handler ---
  const handleSelectPromotion = (pieceCode: "q" | "r" | "n" | "b") => {
    if (promotionPending) {
      executeMove(promotionPending.from, promotionPending.to, pieceCode);
      setPromotionPending(null);
    }
  };

  // --- Reset Entire Game ---
  const handleResetGame = (f?: string) => {
    const startFen = f || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const freshChess = new Chess(startFen);
    
    setChess(freshChess);
    setFensList([freshChess.fen()]);
    setHistoryList([]);
    setCurrentHistoryIndex(-1);
    
    setSelectedSquare(null);
    setValidMovesForSelected([]);
    setLastMove(null);
    setKingInCheckSquare(null);
    setPromotionPending(null);
    setIsAiThinking(false);

    // Reset tournament clocks
    setWhiteTime(600);
    setBlackTime(600);
    setIsTimerRunning(false);

    // Reset game over overlay visibility
    setShowGameOverOverlay(true);

    audio.playMove();
  };

  // --- Timeline Jump / Interactive travel ---
  const handleSelectMoveIndex = (index: number) => {
    setCurrentHistoryIndex(index);
    setSelectedSquare(null);
    setValidMovesForSelected([]);
  };

  // --- Return Timeline to Active or Branch from here ---
  const handleKeepThisHistoryPosition = () => {
    // Overwrite live game with this previous timeline state
    const targetFen = fensList[currentHistoryIndex + 1];
    const newChess = new Chess(targetFen);
    
    setChess(newChess);
    setFensList(fensList.slice(0, currentHistoryIndex + 2));
    setHistoryList(historyList.slice(0, currentHistoryIndex + 1));
    // live index becomes the selected index
    setCurrentHistoryIndex(currentHistoryIndex);
    setSelectedSquare(null);
    setValidMovesForSelected([]);

    audio.playMove();
  };

  // --- Standard Undo action ---
  const handleUndo = () => {
    if (fensList.length <= 1 || isHistoryMode) return;

    // Popping user and AI moves together in AI mode
    const isPlayerBlackFirstMove = playerColor === "b" && fensList.length === 2;
    const popCount = chessMode === "ai" && !isPlayerBlackFirstMove ? 2 : 1;

    let updatedFens = [...fensList];
    let updatedHistory = [...historyList];

    for (let i = 0; i < popCount; i++) {
      if (updatedFens.length > 1) {
        updatedFens.pop();
        updatedHistory.pop();
      }
    }

    setFensList(updatedFens);
    setHistoryList(updatedHistory);
    setCurrentHistoryIndex(updatedHistory.length - 1);

    const prevFen = updatedFens[updatedFens.length - 1];
    const prevChess = new Chess(prevFen);
    setChess(prevChess);

    setSelectedSquare(null);
    setValidMovesForSelected([]);
    setLastMove(null);
    audio.playMove();
  };

  // --- Status label details ---
  const getStatusMessage = () => {
    if (whiteTime === 0) {
      return "Black wins on time! (Flag fell)";
    }
    if (blackTime === 0) {
      return "White wins on time! (Flag fell)";
    }

    if (activeChess.isGameOver()) {
      if (activeChess.isCheckmate()) {
        const winner = currentTurn === "w" ? "Black" : "White";
        return `Checkmate! ${winner} wins.`;
      }
      if (activeChess.isStalemate()) return "Remis! Stalemate draw.";
      if (activeChess.isThreefoldRepetition()) return "Remis! Threefold repetition draw.";
      if (activeChess.isInsufficientMaterial()) return "Remis! Insufficient pieces.";
      return "Draw Game.";
    }

    const turnLabel = currentTurn === "w" ? "White" : "Black";
    let message = `${turnLabel}'s Turn`;

    if (activeChess.isCheck()) {
      message += " - Check!";
    }

    if (isHistoryMode) {
      message += " (Viewing past)";
    } else if (isAiThinking) {
      message = "Engine is thinking...";
    }

    return message;
  };

  // Format seconds to MM:SS
  const formatTime = (timeInSec: number) => {
    const mins = Math.floor(timeInSec / 60);
    const secs = timeInSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get opponent name based on difficulty level
  const getOpponentInfo = () => {
    if (chessMode === "pvp") {
      return { name: "Pass & Play Challenger", rating: "GM 2100", flag: "🌍" };
    }
    switch (aiDifficulty) {
      case "easy":
        return { name: "Novice Companion Node", rating: "Rating 1200", flag: "🤖" };
      case "hard":
        return { name: "Stockfish Grandmaster AI", rating: "Beta GM 2600", flag: "⚡" };
      case "medium":
      default:
        return { name: "Advanced Tactical Bot", rating: "Rating 1800", flag: "🤖" };
    }
  };

  const opponent = getOpponentInfo();
  const player = { name: "Grandmaster Candidate (You)", rating: "FIDE 2350", flag: "♟️" };

  // Set top and bottom users based on board orientation (isFlipped)
  const topUser = isFlipped ? player : opponent;
  const bottomUser = isFlipped ? opponent : player;

  const topTime = isFlipped ? whiteTime : blackTime;
  const bottomTime = isFlipped ? blackTime : whiteTime;

  const topActive = isFlipped ? currentTurn === "w" : currentTurn === "b";
  const bottomActive = isFlipped ? currentTurn === "b" : currentTurn === "w";

  // --- Get details for Game Over Overlay ---
  const getGameOutcome = () => {
    const isGameOver = chess.isGameOver();
    const isTimedOut = whiteTime === 0 || blackTime === 0;

    if (!isGameOver && !isTimedOut) return null;

    let title = "Game Over";
    let sub = "";
    let statusClass = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
    let statusId: "victory" | "defeat" | "draw" = "draw";

    if (isTimedOut) {
      const winnerColor = whiteTime === 0 ? "b" : "w";
      const winnerName = winnerColor === "w" ? "White" : "Black";
      sub = `${winnerName} wins on time (opponent's clock flag fell).`;

      if (chessMode === "ai") {
        if (winnerColor === playerColor) {
          title = "VICTORY";
          statusClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
          statusId = "victory";
        } else {
          title = "DEFEAT";
          statusClass = "text-rose-400 bg-rose-500/10 border-rose-500/20";
          statusId = "defeat";
        }
      } else {
        title = "MATCH COMPLETED";
        statusClass = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
        statusId = "victory";
      }
    } else if (chess.isCheckmate()) {
      const winnerColor = chess.turn() === "w" ? "b" : "w";
      const winnerName = winnerColor === "w" ? "White" : "Black";
      sub = `${winnerColor === "w" ? "White" : "Black"} delivers checkmate!`;

      if (chessMode === "ai") {
        if (winnerColor === playerColor) {
          title = "VICTORY";
          statusClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
          statusId = "victory";
        } else {
          title = "DEFEAT";
          statusClass = "text-rose-400 bg-rose-500/10 border-rose-500/20";
          statusId = "defeat";
        }
      } else {
        title = "MATCH COMPLETED";
        statusClass = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
        statusId = "victory";
      }
    } else {
      title = "DRAW MATCH";
      statusClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
      statusId = "draw";
      if (chess.isStalemate()) {
        sub = "Match drawn by stalemate (no legal moves remaining).";
      } else if (chess.isThreefoldRepetition()) {
        sub = "Match drawn by threefold repetition of position.";
      } else if (chess.isInsufficientMaterial()) {
        sub = "Match drawn because of insufficient mating material.";
      } else {
        sub = "The match ended in a draw.";
      }
    }

    return { title, sub, statusClass, statusId };
  };

  const outcome = getGameOutcome();

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans antialiased pb-12 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 1. Header/Navbar */}
      <header className="sticky top-0 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800/80 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-slate-50 text-xl font-bold shadow-lg shadow-indigo-500/20">
              ♕
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Grandmaster Board <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-500/30 font-mono">v1.2</span>
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                Professional Polish Style <Sparkles className="w-2.5 h-2.5 text-indigo-400 animate-pulse" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Rule help button */}
            <button
              onClick={() => setShowHelp(!showHelp)}
              title="Show guide"
              className={`flex items-center justify-center p-2 rounded-lg border transition-all ${
                showHelp ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400" : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <BookOpen className="w-4.5 h-4.5" />
            </button>

            {/* Muted toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute sounds" : "Mute sounds"}
              className="flex items-center justify-center p-2 rounded-lg bg-slate-800/60 border border-slate-700/80 transition-all text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Primary layout container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDEBAR (CONFIG/PRESETS) - col-span-3 */}
          <div className="lg:col-span-3 space-y-4">
            {/* Game Options card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl p-5 space-y-4 backdrop-blur-md">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-800">
                <Users className="w-4 h-4 text-indigo-400" /> Match Opponent
              </h3>

              {/* Mode Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Match Format</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/60">
                  <button
                    onClick={() => {
                      setChessMode("ai");
                      handleResetGame();
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      chessMode === "ai"
                        ? "bg-slate-800 text-white shadow-md border border-slate-700/50"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5 text-indigo-400" /> Computer
                  </button>
                  <button
                    onClick={() => {
                      setChessMode("pvp");
                      handleResetGame();
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      chessMode === "pvp"
                        ? "bg-slate-800 text-white shadow-md border border-slate-700/50"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" /> Local PvP
                  </button>
                </div>
              </div>

              {/* AI Config (Only shown if AI mode selected) */}
              {chessMode === "ai" && (
                <div className="space-y-3.5 pt-1 animate-fade-in">
                  {/* Color Select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Alliance</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setPlayerColor("w");
                          handleResetGame();
                        }}
                        className={`py-1.5 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                          playerColor === "w"
                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-300 font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm shadow-white/40" /> White
                      </button>
                      <button
                        onClick={() => {
                          setPlayerColor("b");
                          handleResetGame();
                        }}
                        className={`py-1.5 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                          playerColor === "b"
                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-300 font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-450 border border-slate-900 shadow-sm" /> Black
                      </button>
                    </div>
                  </div>

                  {/* Difficulty level */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Engine Skill</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["easy", "medium", "hard"] as AIDifficulty[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => setAiDifficulty(level)}
                          className={`py-1 text-xs font-medium rounded-lg capitalize border transition-all ${
                            aiDifficulty === level
                              ? "bg-indigo-600 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/10"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Board Look Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl p-4 space-y-3 backdrop-blur-md">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-300 block">
                Board Colorways
              </label>
              <div className="grid grid-cols-1 gap-1">
                {(["midnight", "forest", "walnut"] as const).map((theme) => {
                  const names = { forest: "Forest Emerald", walnut: "Classic Walnut", midnight: "Grandmaster Slate" };
                  const previewBg = { forest: "bg-[#769656]", walnut: "bg-[#B58863]", midnight: "bg-[#64748b]" };
                  return (
                    <button
                      key={theme}
                      onClick={() => setBoardTheme(theme)}
                      className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-left text-xs font-semibold border transition-all ${
                        boardTheme === theme
                          ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300"
                          : "bg-slate-950/20 border-transparent text-slate-400 hover:bg-slate-800/40"
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-sm ${previewBg[theme]} ring-1 ring-white/10`} />
                      {names[theme]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Presets Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl p-4 space-y-3 backdrop-blur-md">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shuffle className="w-3.5 h-3.5 text-indigo-400" /> Grandmaster Scenarios
              </h3>
              <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                Test yourself with preset positions from historical master endgames.
              </p>
              <div className="flex flex-col gap-1.5 pt-1">
                {CHESS_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleResetGame(preset.fen)}
                    className="p-2.5 bg-slate-950/40 border border-slate-800 hover:border-indigo-500/40 hover:bg-indigo-500/5 rounded-xl text-left text-xs transition-all group"
                  >
                    <div className="font-bold text-slate-200 group-hover:text-indigo-400">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 font-mono">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN CHESSBOARD ARENA - col-span-6 */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* 1. Header profile above board (representing topUser) */}
            <div className={`flex items-center justify-between p-3 px-4 rounded-xl border transition-all ${
              topActive && !activeChess.isGameOver() && !isTimeOut
                ? "bg-slate-850 border-indigo-500/40 shadow-md shadow-indigo-500/5"
                : "bg-slate-900/40 border-slate-800/80"
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{topUser.flag}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">{topUser.name}</h4>
                    <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-1 py-0.2 rounded border border-indigo-500/20">
                      {topUser.rating}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-semibold">
                    {isFlipped ? "Allied Player" : "Opponent"}
                  </p>
                </div>
              </div>

              {/* Tournament Clock */}
              <div className={`flex items-center gap-2 p-1.5 px-3 rounded-lg font-mono text-sm font-bold ${
                topActive && !activeChess.isGameOver() && !isTimeOut
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse"
                  : "bg-slate-950 text-slate-450 border border-slate-800"
              }`}>
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{formatTime(topTime)}</span>
              </div>
            </div>

            {/* Chessboard Component Wrapper */}
            <div className="relative">
              <ChessBoard
                board={activeBoard}
                selectedSquare={selectedSquare}
                validMovesForSelected={validMovesForSelected}
                lastMove={lastMove}
                kingInCheckSquare={kingInCheckSquare}
                isFlipped={isFlipped}
                boardTheme={boardTheme}
                isLocked={isHistoryMode || isAiThinking || isTimeOut}
                onSquareClick={handleSquareClick}
              />

              {/* Historical View Mode notification Banner */}
              {isHistoryMode && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-40">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-[340px] text-center shadow-2xl relative">
                    <h3 className="text-sm font-bold text-indigo-400">Viewing Past State</h3>
                    <p className="text-xs text-slate-300 mt-1.5 font-mono">
                      Moves are frozen. Would you like to restore this position as the active board and play on?
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        onClick={handleKeepThisHistoryPosition}
                        className="py-1.5 px-3 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 transition-colors"
                      >
                        Yes, Restore
                      </button>
                      <button
                        onClick={() => handleSelectMoveIndex(historyList.length - 1)}
                        className="py-1.5 px-3 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors"
                      >
                        Go to Live
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pawn Promotion Modal Layer */}
              <AnimatePresence>
                {promotionPending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 15 }}
                      className="bg-slate-900 border border-slate-800 rounded-2xl max-w-[380px] w-full p-6 text-center shadow-2xl"
                    >
                      <h3 className="text-base font-bold text-white leading-none">Pawn Promotion</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Select which piece you want to promote your pawn into:
                      </p>

                      <div className="grid grid-cols-4 gap-3 mt-6">
                        {[
                          { key: "q", label: "Queen" },
                          { key: "r", label: "Rook" },
                          { key: "b", label: "Bishop" },
                          { key: "n", label: "Knight" },
                        ].map((piece) => (
                          <button
                            key={piece.key}
                            onClick={() => handleSelectPromotion(piece.key as any)}
                            className="flex flex-col items-center bg-slate-950 border border-slate-800 hover:bg-indigo-500/5 hover:border-indigo-500 rounded-xl p-3 text-slate-200 transition-all cursor-pointer group"
                          >
                            <div className="w-10 h-10 drop-shadow-sm group-hover:scale-110 transition-transform">
                              <ChessPiece type={piece.key} color={chess.turn()} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-2">
                              {piece.label}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-800/80">
                        <button
                          onClick={() => setPromotionPending(null)}
                          className="text-xs text-slate-450 hover:text-slate-200 underline"
                        >
                          Cancel Move
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Game Over "The End" Ending Screen Overlay */}
              <AnimatePresence>
                {outcome && showGameOverOverlay && !isHistoryMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-40 rounded-2xl"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-slate-900 border border-slate-800 rounded-2xl max-w-[365px] w-full p-6 text-center shadow-2xl relative"
                    >
                      {/* Decorative status icon with pulser */}
                      <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-slate-950/80 border border-slate-850 relative">
                          <Award className={`w-8 h-8 ${ outcome.statusId === 'victory' ? 'text-emerald-400 animate-bounce' : outcome.statusId === 'defeat' ? 'text-rose-400 animate-pulse' : 'text-amber-400' }`} />
                          <div className={`absolute -inset-1 rounded-full opacity-25 blur-sm animate-pulse ${ outcome.statusId === 'victory' ? 'bg-emerald-500' : outcome.statusId === 'defeat' ? 'bg-rose-500' : 'bg-amber-500' }`} />
                        </div>
                      </div>

                      <h2 className="text-xl font-black tracking-tight text-white uppercase font-sans">
                        {outcome.title}
                      </h2>
                      
                      <div className="mt-2.5 px-3 py-1.5 rounded-xl text-[11px] font-mono inline-block font-semibold border bg-slate-950 border-slate-850 text-slate-300 leading-normal max-w-xs mx-auto">
                        {outcome.sub}
                      </div>

                      {/* Musical ambiance indicator */}
                      <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[10px] text-indigo-400 font-mono">
                        <Sparkles className="w-3 h-3 animate-spin" /> Ambient Melody Playing
                      </div>

                      {/* Game Stats summary */}
                      <div className="grid grid-cols-2 gap-2 mt-5 bg-slate-100/5 p-3 rounded-xl border border-slate-800 text-left">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Moves played</span>
                          <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">
                            {historyList.length} Moves
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Game Mode</span>
                          <div className="text-xs font-bold text-slate-200 font-mono mt-0.5 uppercase">
                            {chessMode === "ai" ? "Against Computer" : "Local PvP"}
                          </div>
                        </div>
                      </div>

                      {/* Primary Actions */}
                      <div className="mt-6 flex flex-col gap-2">
                        <button
                          onClick={() => handleResetGame()}
                          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Start New Match
                        </button>
                        <button
                          onClick={() => setShowGameOverOverlay(false)}
                          className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700/50 transition-colors cursor-pointer"
                        >
                          Analyze & Review Board
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Footer profile below board (representing bottomUser) */}
            <div className={`flex items-center justify-between p-3 px-4 rounded-xl border transition-all ${
              bottomActive && !activeChess.isGameOver() && !isTimeOut
                ? "bg-slate-850 border-indigo-500/40 shadow-md shadow-indigo-500/5"
                : "bg-slate-900/40 border-slate-800/80"
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{bottomUser.flag}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">{bottomUser.name}</h4>
                    <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-1 py-0.2 rounded border border-indigo-500/20">
                      {bottomUser.rating}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-semibold">
                    {isFlipped ? "Opponent" : "Allied Player"}
                  </p>
                </div>
              </div>

              {/* Tournament Clock */}
              <div className={`flex items-center gap-2 p-1.5 px-3 rounded-lg font-mono text-sm font-bold ${
                bottomActive && !activeChess.isGameOver() && !isTimeOut
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse"
                  : "bg-slate-950 text-slate-450 border border-slate-800"
              }`}>
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{formatTime(bottomTime)}</span>
              </div>
            </div>

            {/* Match Status Header */}
            <div className="bg-slate-900 border border-slate-800/80 text-white p-4 px-5 rounded-2xl flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isAiThinking
                      ? "bg-indigo-500 animate-ping"
                      : activeChess.isCheck() || isTimeOut
                      ? "bg-red-500 animate-pulse"
                      : activeChess.turn() === "w"
                      ? "bg-white"
                      : "bg-slate-700"
                  }`}
                />
                <div>
                  <h2 className="text-sm font-bold font-mono tracking-tight leading-none text-slate-100 uppercase">
                    {getStatusMessage()}
                  </h2>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
                    {chessMode === "pvp"
                      ? "Player vs. Player Mode"
                      : `Computer AI (${aiDifficulty})`}
                  </p>
                </div>
              </div>

              {/* Loader pulse or Show Result action */}
              {isAiThinking ? (
                <span className="text-[10px] font-mono text-indigo-400 animate-pulse font-bold bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/20">
                  Thinking
                </span>
              ) : outcome && !showGameOverOverlay ? (
                <button
                  onClick={() => setShowGameOverOverlay(true)}
                  className="py-1 px-2.5 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 font-mono text-[9px] font-bold rounded-lg border border-indigo-500/30 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Award className="w-3 h-3 text-indigo-400" /> View Result
                </button>
              ) : null}
            </div>

            {/* Grid Arena Bottom Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 px-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                {/* Undo Button */}
                <button
                  onClick={handleUndo}
                  disabled={fensList.length <= 1 || isHistoryMode || isAiThinking}
                  className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition border border-slate-700/60 cursor-pointer"
                  title="Take back one turn"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Undo
                </button>

                {/* Flip Board Button */}
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700/60 cursor-pointer"
                  title="Rotate coordinates perspective"
                >
                  <Shuffle className="w-3.5 h-3.5 text-indigo-400" /> Flip Board
                </button>
              </div>

              {/* Reset Game Trigger Button */}
              <button
                onClick={() => handleResetGame()}
                className="py-1.5 px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/10 cursor-pointer"
                title="Restart board"
              >
                Reset Game
              </button>
            </div>
          </div>

          {/* RIGHT SIDE DETAILS (CAPTURES AND LOGS) - col-span-3 */}
          <div className="lg:col-span-3 space-y-4">
            {/* Captured scoreboard */}
            <CapturedPieces board={activeBoard} />

            {/* Move Log History Component */}
            <MoveHistory
              history={historyList}
              currentHistoryIndex={currentHistoryIndex}
              onSelectMoveIndex={handleSelectMoveIndex}
            />

            {/* Brief Rules section inside card */}
            {showHelp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-indigo-950/15 border border-indigo-500/20 rounded-2xl space-y-3 text-xs backdrop-blur-md"
              >
                <div className="flex items-center gap-1.5 font-bold text-indigo-300 uppercase tracking-wide">
                  <Info className="w-4 h-4 text-indigo-400" /> Grandmaster Guide Focus
                </div>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-300 leading-relaxed font-mono text-[10px]">
                  <li>Click a friendly piece, then select highlighting square options.</li>
                  <li>Deep blue indicators highlight potential moves or capturing points.</li>
                  <li>Real-time Clocks run as soon as White makes the first move.</li>
                  <li>Click historical moves in the Game Log to analyze previous branches.</li>
                  <li>Use the Undo action to retract the live board state seamlessly.</li>
                </ul>
              </motion.div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
