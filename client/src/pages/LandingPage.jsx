import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin, FaTwitter, FaTimes } from "react-icons/fa";

export default function LandingPage() {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-900 text-white flex flex-col items-center justify-center px-4">
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] pointer-events-none z-0 bg-[radial-gradient(circle,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.02)_60%,transparent_100%)] blur-3xl" />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 text-5xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-pink-300 drop-shadow-lg"
      >
        Tic Tac Toe
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="z-10 text-xl font-mono text-gray-300 mb-12 text-center max-w-xl"
      >
        Play the classic game with a modern twist. Challenge a friend or take on
        the system’s AI.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="z-10 flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={() => navigate("/play")}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          Play with Friend
        </button>

        <button
          onClick={() => navigate("/ai")}
          className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-lg font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          Play with System
        </button>
      </motion.div>

      {/* Instructions Button */}
      <button
        onClick={() => setShowInstructions(true)}
        className="z-10 mt-6 text-lg text-gray-300 hover:text-white hover:border-b-2 transition-colors cursor-pointer"
      >
        Instructions to Play?
      </button>

      {/* Footer */}
      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 z-10 text-lg text-gray-300 text-center"
      >
        <p className="mb-2">
          Built with ❤️ by{" "}
          <span className="text-white font-semibold">Rahul</span>
        </p>
        <div className="flex justify-center gap-6">
          <a
            href="https://github.com/your-github-username"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-500 transition-colors text-2xl"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/your-linkedin-username"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors text-2xl"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://twitter.com/your-twitter-handle"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 transition-colors text-2xl"
          >
            <FaTwitter />
          </a>
        </div>
      </motion.div>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstructions(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="fixed z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-lg border border-gray-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">How to Play</h2>
                <button onClick={() => setShowInstructions(false)}>
                  <FaTimes className="text-gray-400 hover:text-white transition-colors cursor-pointer" />
                </button>
              </div>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>
                  Click <b>Play with Friend</b> to create a room and share the
                  code with your friend.
                </li>
                <li>If your friend created a room, enter the code to join.</li>
                <li>
                  Click <b>Play with System</b> to start a match against the AI.
                </li>
                <li>
                  Take turns placing X or O — first to get 3 in a row wins!
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
