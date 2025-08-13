export default function Board({ board, onMove, mySymbol, turn }) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-6 bg-gray-800 p-3 rounded-xl shadow-lg">
      {board.map((cell, idx) => {
        const isMyTurn = mySymbol === turn && !cell;
        return (
          <button
            key={idx}
            className={`w-24 h-24 rounded-lg flex items-center justify-center text-4xl font-bold transition-all duration-200 
              ${
                cell === "X"
                  ? "text-blue-400"
                  : cell === "O"
                  ? "text-pink-400"
                  : "text-gray-200"
              }
              ${
                isMyTurn
                  ? "bg-gray-700 hover:bg-gray-600 cursor-pointer"
                  : "bg-gray-700 opacity-70 cursor-not-allowed"
              }
            `}
            onClick={() => {
              if (isMyTurn) onMove(idx);
            }}
          >
            {cell}
          </button>
        );
      })}
    </div>
  );
}
