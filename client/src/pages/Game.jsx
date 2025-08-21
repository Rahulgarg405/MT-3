import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { socket } from "../socket";
import Board from "../components/Board";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Game() {
  const { code } = useParams();
  const location = useLocation();

  const [state, setState] = useState(location.state?.state || null);
  const [symbol, setSymbol] = useState(location.state?.symbol || null);
  const [waitingRematch, setWaitingRematch] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  // New: Track if this player is the creator
  const isCreator = location.state?.isCreator || false;

  const navigate = useNavigate();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      socket.emit("join_room", { code }, (res) => {
        if (res.ok) {
          setState(res.state);
          setSymbol(res.symbol);
        } else {
          toast.error(res.error);
        }
      });
    }

    const handleGameUpdate = (newState) => {
      setState(newState);

      // Match starts after rematch or initial join
      if (newState.status === "in_progress") {
        setWaitingRematch(false);
      }
    };

    const handleOpponentRematch = () => {
      setWaitingRematch(false);
      toast.success("Opponent wants a rematch!");
    };

    const handleOpponentLeft = () => {
      toast.error("Opponent left the match");
      navigate("/play"); //go back to play page
    };

    const handleOpponentJoined = () => {
      toast.success("Opponent joined! Let’s play!");
    };

    socket.on("game_update", handleGameUpdate);
    socket.on("opponent_requested_rematch", handleOpponentRematch);
    socket.on("opponent_left", handleOpponentLeft);

    socket.on("opponent_joined", handleOpponentJoined);

    return () => {
      socket.off("game_update", handleGameUpdate);
      socket.off("opponent_requested_rematch", handleOpponentRematch);
      socket.off("opponent_left", handleOpponentLeft);
      socket.off("opponent_joined", handleOpponentJoined);
    };
  }, [code]);

  const handleMove = (index) => {
    socket.emit("player_move", { index }, (res) => {
      if (!res.ok) toast.error(res.error);
    });
  };

  //   const handleRematch = () => {
  //     setWaitingRematch(true);
  //     socket.emit("request_rematch", {}, (res) => {
  //       if (!res.ok) {
  //         toast.error(res.error);
  //         setWaitingRematch(false);
  //       }
  //     });
  //   };

  const handleRematch = () => {
    // Ask server for rematch; pass the room code so server reliably knows the room
    socket.emit("request_rematch", { code }, (res) => {
      if (!res) {
        toast.error("No response from server");
        setWaitingRematch(false);
        return;
      }
      if (!res.ok) {
        toast.error(res.error || "Rematch failed");
        setWaitingRematch(false);
        return;
      }

      // If server immediately started the rematch (both had already requested),
      // clear waiting state. Otherwise set waiting = true until opponent also clicks.
      if (res.started) {
        setWaitingRematch(false);
        toast.success("Rematch started");
      } else {
        setWaitingRematch(true);
        toast("Waiting for opponent...");
      }
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center text-gray-100 px-4">
      {state && (
        <>
          {/* Room Info */}
          <h2 className="text-2xl font-bold mb-2">Room Code</h2>

          {/* Copy Code Section - Only for creator */}
          {isCreator && (
            <div className="flex items-center gap-2 mb-4 relative">
              {/* Room Code */}
              <span className="px-3 py-1 bg-gray-700 rounded-lg font-mono text-lg">
                {code}
              </span>

              {/* Copy Button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setShowCopied(true);
                  setTimeout(() => setShowCopied(false), 1500); // hide tooltip after 1.5s
                }}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition cursor-pointer"
              >
                Copy
              </button>

              {/* Tooltip */}
              <span
                className={`absolute -top-8 right-0 bg-black text-white text-xs px-2 py-1 rounded shadow-lg transition-all duration-300 
        ${
          showCopied
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
              >
                Copied!
              </span>
            </div>
          )}

          {/* Player Info */}
          <p className="mb-4 text-lg">
            You are:{" "}
            <span
              className={`font-bold ${
                symbol === "X" ? "text-blue-400" : "text-pink-400"
              }`}
            >
              {symbol}
            </span>
          </p>

          {/* Turn Info */}
          <p className="mb-2 text-lg font-semibold text-lime-300">
            {state.status === "waiting"
              ? "Waiting for opponent to join..."
              : state.turn === symbol
              ? "Your Turn"
              : "Opponent's Turn"}
          </p>

          {/* Board */}
          <Board
            board={state.board}
            onMove={handleMove}
            mySymbol={symbol}
            turn={state.turn}
          />

          {/* Game Over */}
          {state.status === "finished" && (
            <>
              <p className="mt-6 text-xl font-semibold">
                {state.winner
                  ? state.winner === symbol
                    ? "🎉 You Won!"
                    : "😞 Opponent Won!"
                  : "🤝 It's a Draw!"}
              </p>

              <button
                className={`cursor-pointer mt-4 px-5 py-2 rounded-lg shadow-md transition-colors 
                  ${
                    waitingRematch
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  } 
                  text-white font-medium`}
                onClick={handleRematch}
                disabled={waitingRematch}
              >
                {waitingRematch ? "Waiting for Opponent..." : "Rematch"}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
