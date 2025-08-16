import { useState } from "react";

// ✅ Winner check
function findWinner(board) {
  for (let i = 0; i < 3; i++) {
    if (
      board[i][0] !== "" &&
      board[i][0] === board[i][1] &&
      board[i][0] === board[i][2]
    )
      return board[i][0];
  }
  for (let j = 0; j < 3; j++) {
    if (
      board[0][j] !== "" &&
      board[0][j] === board[1][j] &&
      board[0][j] === board[2][j]
    )
      return board[0][j];
  }
  if (
    board[0][0] !== "" &&
    board[0][0] === board[1][1] &&
    board[0][0] === board[2][2]
  )
    return board[0][0];

  if (
    board[0][2] !== "" &&
    board[0][2] === board[1][1] &&
    board[0][2] === board[2][0]
  )
    return board[0][2];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === "") return null;
    }
  }
  return "draw";
}

// ✅ Minimax
function minimax(board, depth, isMax) {
  let winner = findWinner(board);
  if (winner === "X") return 10 - depth;
  if (winner === "O") return -10 + depth;
  if (winner === "draw") return 0;

  if (isMax) {
    let bestScore = -1e9;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === "") {
          board[i][j] = "X";
          let score = minimax(board, depth + 1, false);
          board[i][j] = "";
          bestScore = Math.max(bestScore, score);
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = 1e9;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === "") {
          board[i][j] = "O";
          let score = minimax(board, depth + 1, true);
          board[i][j] = "";
          bestScore = Math.min(bestScore, score);
        }
      }
    }
    return bestScore;
  }
}

// ✅ Find best move
function findBestMove(board, player) {
  let best = player === "X" ? -1e9 : 1e9;
  let bestI = -1,
    bestJ = -1;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === "") {
        board[i][j] = player;
        let score = minimax(board, 0, player === "O"); // if AI is "O", next turn is Max
        board[i][j] = "";

        if (player === "X" && score > best) {
          best = score;
          bestI = i;
          bestJ = j;
        } else if (player === "O" && score < best) {
          best = score;
          bestI = i;
          bestJ = j;
        }
      }
    }
  }
  return [bestI, bestJ];
}

// ✅ Game Component
export default function AiGame() {
  const [board, setBoard] = useState([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]);
  const [isXTurn, setIsXTurn] = useState(true); // Human plays "X"
  const [winner, setWinner] = useState(null);

  function handleClick(i, j) {
    if (board[i][j] !== "" || winner) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[i][j] = "X";
    setBoard(newBoard);

    let result = findWinner(newBoard);
    if (result) {
      setWinner(result);
      return;
    }

    // AI move after short delay
    setTimeout(() => {
      const [aiI, aiJ] = findBestMove(newBoard, "O");
      if (aiI !== -1 && aiJ !== -1) {
        newBoard[aiI][aiJ] = "O";
      }
      setBoard([...newBoard]);
      result = findWinner(newBoard);
      if (result) setWinner(result);
    }, 400);
  }

  function resetGame() {
    setBoard([
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ]);
    setWinner(null);
    setIsXTurn(true);
  }

  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-6">Play with AI</h1>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <button
              key={i + "-" + j}
              onClick={() => handleClick(i, j)}
              className="w-20 h-20 text-3xl font-bold bg-gray-800 rounded-lg hover:bg-gray-700 flex items-center justify-center cursor-pointer"
            >
              {cell}
            </button>
          ))
        )}
      </div>

      {/* Winner */}
      {winner && (
        <div className="mt-6 text-xl font-semibold">
          {winner === "draw" ? "It's a Draw!" : `${winner} Wins!`}
        </div>
      )}

      {/* Reset */}
      <button
        onClick={resetGame}
        className="mt-7 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-xl cursor-pointer"
      >
        Play Again
      </button>
      <p className="text-sm mt-5 text-gray-500 italic">
        Opponent moves are powered by a classic game-theory algorithm.{" "}
        <a
          href="https://en.wikipedia.org/wiki/Minimax"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline hover:text-blue-300"
        >
          Learn More.
        </a>
      </p>
    </div>
  );
}
