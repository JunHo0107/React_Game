// src/components/RankingScreen.js

import React, { useEffect, useState } from "react";
import "./RankingScreen.css";

export default function RankingScreen({ score, onRestart }) {
  const [rankedScores, setRankedScores] = useState([]);

  useEffect(() => {
    const scores = JSON.parse(localStorage.getItem("rankings") || "[]");

    // 새로운 점수 추가 및 정렬
    const updatedScores = [...scores, score]
      .sort((a, b) => b - a);

    // 중복 제거
    const uniqueScores = [...new Set(updatedScores)].slice(0, 10);

    localStorage.setItem("rankings", JSON.stringify(updatedScores));
    setRankedScores(uniqueScores);
  }, [score]);

  return (
    <div className="ranking-screen">
      <div className="ranking-title">
        <h1>🏆 Top 10 Scores</h1>
      </div>
      <ul className="score-list">
        {rankedScores.map((s, i) => (
          <li key={i}>
            {i + 1}. {s}
          </li>
        ))}
      </ul>
      <button className="restart-btn" onClick={onRestart}>
        RESTART
      </button>
    </div>
  );
}
