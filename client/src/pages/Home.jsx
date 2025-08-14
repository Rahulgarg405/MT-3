import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import toast from "react-hot-toast";

export default function Home() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleCreate = () => {
    socket.connect();
    socket.emit("create_room", (res) => {
      if (res.ok) {
        navigate(`/game/${res.code}`, {
          state: { ...res, isCreator: true }, // ✅ Mark as creator
        });
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
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-pink-300 drop-shadow-lg">
        Tic Tac Toe
      </h1>

      {/* Create Game Button */}
      <button
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md text-lg font-semibold transition-transform transform hover:scale-105 cursor-pointer"
        onClick={handleCreate}
      >
        🎮 Create New Game
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
        >
          Join
        </button>
      </div>
    </div>
  );
}
