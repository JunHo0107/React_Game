import React from "react";
import "./StartScreen.css";

export default function StartScreen({ onStart }) {
  return (
    <div className="start-screen">
      <h1 className="title">BRAIN DASH</h1>
      <h2 className="subtitle">TRAIN YOUR MIND!</h2>

      {/* 필요하다면 뇌 이미지를 추가 (public/images/brain.png 위치에 둔 예시) */}
      <img src="/images/brain.png" alt="Brain" className="brain-img" />

      <button className="start-btn" onClick={onStart}>
        START
      </button>
    </div>
  );
}
