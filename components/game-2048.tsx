"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";

type Tile = {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
};
type Board = (Tile | null)[][];
type Direction = "up" | "down" | "left" | "right";

export default function Game2048() {
  const [board, setBoard] = useState<Board>(() =>
    Array(4)
      .fill(null)
      .map(() => Array(4).fill(null))
  );
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [scoreGained, setScoreGained] = useState(0);
  const gameRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const tileIdCounter = useRef(0);

  // Initialize game
  const initGame = useCallback(() => {
    const newBoard = Array(4)
      .fill(null)
      .map(() => Array(4).fill(null));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
  }, []);

  // Add random tile to board
  const addRandomTile = (currentBoard: Board) => {
    const emptyCells: { row: number; col: number }[] = [];

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (currentBoard[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomCell =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newTile: Tile = {
        id: tileIdCounter.current++,
        value: Math.random() < 0.9 ? 2 : 4,
        row: randomCell.row,
        col: randomCell.col,
        isNew: true,
      };
      currentBoard[randomCell.row][randomCell.col] = newTile;
    }
  };

  // Move and merge logic
  const moveBoard = (
    direction: Direction
  ): { newBoard: Board; scoreGained: number; moved: boolean } => {
    const newBoard: Board = board.map((row) =>
      row.map((cell) =>
        cell ? { ...cell, isNew: false, isMerged: false } : null
      )
    );
    let scoreGained = 0;
    let moved = false;

    const moveRow = (
      row: (Tile | null)[]
    ): { newRow: (Tile | null)[]; score: number; moved: boolean } => {
      const filtered = row.filter((cell) => cell !== null) as Tile[];
      const newRow: (Tile | null)[] = Array(4).fill(null);
      let score = 0;
      let rowMoved = false;

      let writeIndex = 0;
      for (let i = 0; i < filtered.length; i++) {
        if (
          i < filtered.length - 1 &&
          filtered[i].value === filtered[i + 1].value
        ) {
          const mergedValue = filtered[i].value * 2;
          newRow[writeIndex] = {
            id: tileIdCounter.current++,
            value: mergedValue,
            row: -1, // Temporary, will be set later
            col: -1,
            isMerged: true,
          };
          score += mergedValue;
          i++;
        } else {
          newRow[writeIndex] = filtered[i];
        }
        writeIndex++;
      }

      for (let i = 0; i < 4; i++) {
        if (row[i]?.id !== newRow[i]?.id) {
          rowMoved = true;
          break;
        }
      }

      return { newRow, score, moved: rowMoved };
    };

    const rotateBoard = (boardToRotate: Board): Board => {
      const rotated: Board = Array(4)
        .fill(null)
        .map(() => Array(4).fill(null));
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          rotated[col][3 - row] = boardToRotate[row][col];
        }
      }
      return rotated;
    };

    const reverseRows = (boardToReverse: Board): Board => {
      return boardToReverse.map((row) => [...row].reverse());
    };

    let workingBoard = newBoard;

    if (direction === "up") {
      workingBoard = rotateBoard(rotateBoard(rotateBoard(workingBoard)));
    } else if (direction === "down") {
      workingBoard = rotateBoard(workingBoard);
    } else if (direction === "right") {
      workingBoard = reverseRows(workingBoard);
    }

    for (let row = 0; row < 4; row++) {
      const result = moveRow(workingBoard[row]);
      workingBoard[row] = result.newRow;
      scoreGained += result.score;
      if (result.moved) moved = true;
    }

    if (direction === "up") {
      workingBoard = rotateBoard(workingBoard);
    } else if (direction === "down") {
      workingBoard = rotateBoard(rotateBoard(rotateBoard(workingBoard)));
    } else if (direction === "right") {
      workingBoard = reverseRows(workingBoard);
    }

    // Update tile row/col based on their new position in the board
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const tile = workingBoard[row][col];
        if (tile) {
          tile.row = row;
          tile.col = col;
        }
      }
    }

    return { newBoard: workingBoard, scoreGained, moved };
  };

  // Check if game is over
  const isGameOver = (currentBoard: Board): boolean => {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (currentBoard[row][col] === null) return false;
      }
    }

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const current = currentBoard[row][col]?.value;
        if (col < 3 && current === currentBoard[row][col + 1]?.value)
          return false;
        if (row < 3 && current === currentBoard[row + 1][col]?.value)
          return false;
      }
    }

    return true;
  };

  // Check for 2048 tile
  const checkWin = (currentBoard: Board): boolean => {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (currentBoard[row][col]?.value === 2048) return true;
      }
    }
    return false;
  };

  // Handle move
  const handleMove = (direction: Direction) => {
    if (gameOver) return;

    const result = moveBoard(direction);

    if (result.moved) {
      setBoard(result.newBoard);
      if (result.scoreGained > 0) {
        setScoreGained(result.scoreGained);
        setTimeout(() => {
          setScoreGained(0);
        }, 600);
      }
      setTimeout(() => {
        const newBoardWithRandom = result.newBoard.map((row) => [...row]);
        addRandomTile(newBoardWithRandom);
        setBoard(newBoardWithRandom);

        const newScore = score + result.scoreGained;
        setScore(newScore);

        if (newScore > bestScore) {
          setBestScore(newScore);
        }

        if (!gameWon && checkWin(newBoardWithRandom)) {
          setGameWon(true);
        }

        if (isGameOver(newBoardWithRandom)) {
          setGameOver(true);
        }
      }, 150);
    }
  };

  // Touch/drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        handleMove(deltaX > 0 ? "right" : "left");
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        handleMove(deltaY > 0 ? "down" : "up");
      }
    }

    touchStartRef.current = null;
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!touchStartRef.current) return;

    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;
    const minDragDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minDragDistance) {
        handleMove(deltaX > 0 ? "right" : "left");
      }
    } else {
      if (Math.abs(deltaY) > minDragDistance) {
        handleMove(deltaY > 0 ? "down" : "up");
      }
    }

    touchStartRef.current = null;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handleMove("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          handleMove("right");
          break;
        case "ArrowUp":
          e.preventDefault();
          handleMove("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          handleMove("down");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [board, gameOver]);

  // Initialize game on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Load best score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("2048-best-score");
    if (saved) {
      setBestScore(Number.parseInt(saved));
    }
  }, []);

  // Save best score to localStorage
  useEffect(() => {
    localStorage.setItem("2048-best-score", bestScore.toString());
  }, [bestScore]);

  const getTileStyle = (value: number) => {
    const styles: { [key: number]: string } = {
      2: "bg-[#eee4da] text-[#776e65] text-6xl font-bold",
      4: "bg-[#ede0c8] text-[#776e65] text-6xl font-bold",
      8: "bg-[#f2b179] text-white text-6xl font-bold",
      16: "bg-[#f59563] text-white text-5xl font-bold",
      32: "bg-[#f67c5f] text-white text-5xl font-bold",
      64: "bg-[#f65e3b] text-white text-5xl font-bold",
      128: "bg-[#edcf72] text-white text-4xl font-bold",
      256: "bg-[#edcc61] text-white text-4xl font-bold",
      512: "bg-[#edc850] text-white text-4xl font-bold",
      1024: "bg-[#edc53f] text-white text-3xl font-bold",
      2048: "bg-[#edc22e] text-white text-3xl font-bold",
    };
    return styles[value] || "bg-[#3c3a32] text-white text-2xl font-bold";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#faf8ef] p-4 font-sans">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-7xl font-bold text-[#776e65] mb-2">2048</h1>
            <p className="text-[#776e65] text-lg">
              Join the numbers and get to the 2048 tile!
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {/* Score and Best side by side */}
            <div className="flex gap-3">
              <div className="relative bg-[#bbada0] rounded-md px-6 py-3 text-center min-w-[100px]">
                {scoreGained > 0 && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-8 text-2xl font-bold text-[#776e65] animate-score-popup">
                    +{scoreGained}
                  </div>
                )}
                <div className="text-white text-sm font-bold">SCORE</div>
                <div className="text-white text-2xl font-bold">{score}</div>
              </div>
              <div className="bg-[#bbada0] rounded-md px-6 py-3 text-center min-w-[100px]">
                <div className="text-white text-sm font-bold">BEST</div>
                <div className="text-white text-2xl font-bold">{bestScore}</div>
              </div>
            </div>
            {/* New Game Button */}
            <button
              onClick={initGame}
              className="bg-[#8f7a66] text-white px-6 py-3 rounded-md font-bold hover:bg-[#9f8a76] transition-colors"
            >
              New Game
            </button>
          </div>
        </div>

        {/* Game Board */}
        <div
          ref={gameRef}
          className="relative bg-[#bbada0] rounded-lg p-4 mb-6 select-none cursor-grab active:cursor-grabbing mx-auto w-[500px] h-[500px]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          {/* Grid Background */}
          <div className="grid grid-cols-4 gap-4 h-full w-full">
            {Array.from({ length: 16 }).map((_, index) => (
              <div key={index} className="bg-[#cdc1b4] rounded-md" />
            ))}
          </div>

          {/* Tiles */}
          {board
            .flat()
            .filter((tile): tile is Tile => tile !== null)
            .map((tile) => {
              const tileSize = 105;
              const gap = 16;
              const padding = 16;

              return (
                <div
                  key={tile.id}
                  className={`absolute rounded-md flex items-center justify-center transition-all duration-100 ease-in-out ${getTileStyle(
                    tile.value
                  )} ${tile.isNew ? "animate-tile-appear" : ""} ${
                    tile.isMerged ? "animate-tile-merge" : ""
                  }`}
                  style={{
                    width: `${tileSize}px`,
                    height: `${tileSize}px`,
                    left: `${tile.col * (tileSize + gap) + padding}px`,
                    top: `${tile.row * (tileSize + gap) + padding}px`,
                  }}
                >
                  {tile.value}
                </div>
              );
            })}

          {gameOver && (
            <div className="absolute inset-0 bg-[#faf8ef] bg-opacity-75 flex flex-col items-center justify-center z-10 rounded-lg transition-opacity duration-300">
              <h2 className="text-5xl font-bold text-[#776e65] mb-4">
                Game Over!
              </h2>
              <p className="text-2xl font-bold mb-6 text-[#776e65]">
                Score: {score}
              </p>
              <button
                onClick={initGame}
                className="bg-[#8f7a66] text-white px-6 py-3 rounded-md font-bold hover:bg-[#9f8a76] transition-colors text-xl"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-[#776e65] text-sm leading-relaxed text-center">
          <p className="font-bold mb-2">HOW TO PLAY:</p>
          <p>
            Use your arrow keys to move the tiles. When two tiles with the same
            number touch, they merge into one!
          </p>
        </div>
      </div>

      {/* Win Modal */}
      {gameWon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-[#f67c5f] mb-4">
              You Win! 🎉
            </h2>
            <p className="text-[#776e65] mb-4">{"You've reached 2048!"}</p>
            <p className="text-2xl font-bold mb-6 text-[#f67c5f]">
              Score: {score}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setGameWon(false)}
                className="bg-[#bbada0] text-white px-6 py-3 rounded-md font-bold hover:bg-[#cdc1b4] transition-colors"
              >
                Keep Playing
              </button>
              <button
                onClick={initGame}
                className="bg-[#8f7a66] text-white px-6 py-3 rounded-md font-bold hover:bg-[#9f8a76] transition-colors"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
