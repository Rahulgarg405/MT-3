import { io } from "socket.io-client";

const URL = "http://localhost:3001"; // change for production
export const socket = io(URL, { autoConnect: false });
