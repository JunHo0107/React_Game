// src/App.js
import React, { useState } from "react";
import StartScreen from "./components/StartScreen";
import CanvasGame from "./components/CanvasGame";
import RankingScreen from "./components/RankingScreen";

function App() {
  const [screen, setScreen] = useState("start"); // start | game | end
  const [finalScore, setFinalScore] = useState(0);

  return (
    <div>
      {screen === "start" && (
        <StartScreen onStart={() => setScreen("game")} />
      )}

      {screen === "game" && (
        <CanvasGame
          onGameEnd={(score) => {
            setFinalScore(score);
            setScreen("end");
          }}
        />
      )}

      {screen === "end" && (
        <RankingScreen
          score={finalScore}
          onRestart={() => setScreen("start")}
        />
      )}
    </div>
  );
}

export default App;
