import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import toast from "react-hot-toast";

export default function Home() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = () => {
    setLoading(true);
    socket.connect();
    socket.emit("create_room", (res) => {
      setLoading(false);
      if (res.ok) {
        navigate(`/game/${res.code}`, {
          state: { ...res, isCreator: true }, // ✅ Mark as creator
        });
        toast("Waiting for opponent to join...", { position: "top-right" });
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleJoin = () => {
    if (!code) return;
    socket.connect();
    socket.emit("join_room", { code }, (res) => {
      if (res.ok) {
        navigate(`/game/${res.code}`, {
          state: { ...res, isCreator: false }, // ✅ Mark as joining player
        });
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4">
      {/* Title */}
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-blue-200 drop-shadow-lg">
        Tic Tac Toe
      </h1>

      {/* Create Game Button */}
      <button
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md text-lg font-semibold transition-transform transform hover:scale-105 cursor-pointer"
        onClick={handleCreate}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Creating Room...
          </span>
        ) : (
          "Create a Game"
        )}
      </button>

      {/* OR Divider */}
      <div className="flex items-center gap-4 w-full max-w-xs">
        <hr className="flex-1 border-gray-600" />
        <span className="text-gray-400 text-sm">OR</span>
        <hr className="flex-1 border-gray-600" />
      </div>

      {/* Join Game */}
      <div className="flex gap-2 w-full max-w-xs">
        <input
          className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
        />
        <button
          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg shadow-md font-semibold transition-transform transform hover:scale-105 cursor-pointer"
          onClick={handleJoin}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Joining...
            </span>
          ) : (
            "Join"
          )}
        </button>
      </div>
    </div>
  );
}
