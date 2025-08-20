import dotenv from "dotenv";
dotenv.config();
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { checkWinner, nextTurn } from "./game.js";
import { generateCode, now } from "./utils.js";

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.send("ok"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

// In-memory rooms (no DB)
const rooms = new Map();
const ROOM_TTL_MS = 30 * 60 * 1000; // 30 minutes

function createRoom(ownerSocketId) {
  let code;
  do {
    code = generateCode();
  } while (rooms.has(code));

  const room = {
    code,
    players: { X: ownerSocketId, O: null },
    board: Array(9).fill(null),
    turn: "X",
    status: "waiting", // waiting | in_progress | finished | player_left
    winner: null,
    createdAt: now(),
    updatedAt: now(),
    rematchRequests: new Set(), // symbols that requested rematch
  };

  rooms.set(code, room);
  return room;
}

function getRoom(code) {
  return rooms.get(code);
}

function deleteRoom(code) {
  rooms.delete(code);
}

function publicState(room) {
  return {
    code: room.code,
    board: room.board,
    turn: room.turn,
    status: room.status,
    winner: room.winner,
  };
}

io.on("connection", (socket) => {
  socket.data.roomCode = null;
  socket.data.symbol = null;

  // Create a new room
  socket.on("create_room", (ack) => {
    try {
      const room = createRoom(socket.id);
      socket.join(room.code);
      socket.data.roomCode = room.code;
      socket.data.symbol = "X";

      if (typeof ack === "function") {
        ack({
          ok: true,
          code: room.code,
          symbol: "X",
          state: publicState(room),
        });
      }
    } catch {
      if (typeof ack === "function") {
        ack({ ok: false, error: "CREATE_FAILED" });
      }
    }
  });

  // Join an existing room
  socket.on("join_room", (payload, ack) => {
    const code = payload?.code?.toUpperCase?.();
    const room = code ? getRoom(code) : null;

    if (!room) {
      return (
        typeof ack === "function" && ack({ ok: false, error: "NOT_FOUND" })
      );
    }
    if (room.players.O && room.players.X) {
      return (
        typeof ack === "function" && ack({ ok: false, error: "ROOM_FULL" })
      );
    }

    const symbol = !room.players.O ? "O" : !room.players.X ? "X" : null;
    if (!symbol) {
      return (
        typeof ack === "function" && ack({ ok: false, error: "ROOM_FULL" })
      );
    }

    room.players[symbol] = socket.id;
    room.status = room.players.X && room.players.O ? "in_progress" : "waiting";
    room.updatedAt = now();

    socket.join(room.code);
    socket.data.roomCode = room.code;
    socket.data.symbol = symbol;

    io.in(room.code).emit("game_update", publicState(room));

    if (typeof ack === "function") {
      ack({ ok: true, code: room.code, symbol, state: publicState(room) });
    }
  });

  // Player move
  socket.on("player_move", (payload, ack) => {
    const idx = Number(payload?.index);
    const code = socket.data.roomCode;
    const symbol = socket.data.symbol;
    const room = code ? getRoom(code) : null;

    if (!room || symbol == null) {
      return typeof ack === "function" && ack({ ok: false, error: "NO_ROOM" });
    }

    if (room.status !== "in_progress") {
      return (
        typeof ack === "function" &&
        ack({ ok: false, error: "NOT_IN_PROGRESS" })
      );
    }
    if (symbol !== room.turn) {
      return (
        typeof ack === "function" && ack({ ok: false, error: "NOT_YOUR_TURN" })
      );
    }
    if (!Number.isInteger(idx) || idx < 0 || idx > 8) {
      return (
        typeof ack === "function" && ack({ ok: false, error: "BAD_INDEX" })
      );
    }
    if (room.board[idx] !== null) {
      return (
        typeof ack === "function" && ack({ ok: false, error: "CELL_TAKEN" })
      );
    }

    room.board[idx] = symbol;
    room.updatedAt = now();

    const result = checkWinner(room.board);
    if (result === "draw") {
      room.status = "finished";
      room.winner = null;
    } else if (result === "X" || result === "O") {
      room.status = "finished";
      room.winner = result;
    } else {
      room.turn = nextTurn(room.turn);
    }

    io.in(room.code).emit("game_update", publicState(room));

    if (typeof ack === "function") ack({ ok: true });
  });

  // Request rematch
  socket.on("request_rematch", (_payload, ack) => {
    const code = socket.data.roomCode;
    const symbol = socket.data.symbol; // 'X' | 'O'
    const room = code ? getRoom(code) : null;
    if (!room || !symbol) {
      return typeof ack === "function" && ack({ ok: false, error: "NO_ROOM" });
    }

    // Track requests per room using the Set you already created in createRoom()
    room.rematchRequests.add(symbol);

    // Notify opponent that this player requested a rematch
    socket.to(code).emit("opponent_requested_rematch");

    // If both X and O have requested a rematch, reset the match
    if (room.rematchRequests.has("X") && room.rematchRequests.has("O")) {
      room.board = Array(9).fill(null);
      room.turn = "X";
      room.status = "in_progress"; // consistent with the rest of your code
      room.winner = null;
      room.updatedAt = now();
      room.rematchRequests.clear();

      io.in(code).emit("game_update", publicState(room));
      if (typeof ack === "function") ack({ ok: true, started: true });
    } else {
      if (typeof ack === "function") ack({ ok: true, started: false });
    }
  });
  // Optional alias if your client ever sent this older name:
  socket.on("rematch_request", (_payload, ack) => {
    const code = socket.data.roomCode;
    const symbol = socket.data.symbol; // 'X' | 'O'
    const room = code ? getRoom(code) : null;
    if (!room || !symbol) {
      return typeof ack === "function" && ack({ ok: false, error: "NO_ROOM" });
    }

    // Track requests per room using the Set you already created in createRoom()
    room.rematchRequests.add(symbol);

    // Notify opponent that this player requested a rematch
    socket.to(code).emit("opponent_requested_rematch");

    // If both X and O have requested a rematch, reset the match
    if (room.rematchRequests.has("X") && room.rematchRequests.has("O")) {
      room.board = Array(9).fill(null);
      room.turn = "X";
      room.status = "in_progress"; // consistent with the rest of your code
      room.winner = null;
      room.updatedAt = now();
      room.rematchRequests.clear();

      io.in(code).emit("game_update", publicState(room));
      if (typeof ack === "function") ack({ ok: true, started: true });
    } else {
      if (typeof ack === "function") ack({ ok: true, started: false });
    }
  });

  // Leave or disconnect
  socket.on("leave", () => handleDisconnect(socket));
  socket.on("disconnect", () => handleDisconnect(socket));
});

function handleDisconnect(socket) {
  const code = socket.data.roomCode;
  const symbol = socket.data.symbol;
  if (!code || !symbol) return;

  const room = getRoom(code);
  if (!room) return;

  if (room.players[symbol] === socket.id) {
    room.players[symbol] = null;
    room.status = "player_left";
    room.updatedAt = now();
    // Clear any pending rematch state so UI doesn't get stuck
    room.rematchRequests.clear();

    // Notify the opponent explicitly
    socket.to(code).emit("opponent_left");

    io.in(code).emit("game_update", publicState(room));

    // If both players have left, clean up the room
    if (!room.players.X && !room.players.O) {
      deleteRoom(code);
    }
  }
}

// Cleanup for idle rooms
setInterval(() => {
  const t = now();
  for (const [code, room] of rooms.entries()) {
    const activeCount =
      Number(Boolean(room.players.X)) + Number(Boolean(room.players.O));
    if (activeCount === 0 && t - room.updatedAt > ROOM_TTL_MS) {
      rooms.delete(code);
    }
  }
}, 60 * 1000);

server.listen(PORT, () => {
  console.log(`MT-3 server listening on http://localhost:${PORT}`);
});
