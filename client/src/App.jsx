import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/play" element={<Home />} />
          <Route path="/game/:code" element={<Game />} />
        </Routes>
      </Router>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
