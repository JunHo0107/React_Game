import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  VELOCITY,
  CREATE_OBJECT_TIME,
  LIQUOR_SCORE,
  WALNUT_SCORE,
} from "../assets/constants";
import "./CanvasGame.css";

export default function CanvasGame({ onGameEnd }) {
  const [state, setState] = useState("play");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef(null);

  const scoreRef = useRef(score);
  const timeLeftRef = useRef(timeLeft);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const canvasRef = useRef(null);
  const brainRef = useRef(null);
  const liquorRef = useRef(null);
  const walnutRef = useRef(null);
  const backgroundRef = useRef(null);
  const objectSizeRef = useRef({ w: 0, h: 0 });
  const timeIntervalRef = useRef(null);

  const posRef = useRef({
    objects: [],
    objectAccel: [],
    brain: { x: 0, y: 0, w: 0, h: 0 },
  });

  const keyRef = useRef({ isLeft: false, isRight: false });

  const drawImage = useCallback((ctx, img, { x, y, w, h }) => {
    if (img) ctx.drawImage(img, x, y, w, h);
  }, []);

  const loadImage = useCallback((src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
    });
  }, []);

  const blockOverflowPos = useCallback((pos) => {
    const width = window.innerWidth;
    pos.x = Math.max(0, Math.min(pos.x, width - pos.w));
  }, []);

  const updateBrainPos = useCallback(
    (brainPos) => {
      const key = keyRef.current;
      if (key.isLeft) brainPos.x -= VELOCITY.brain.left;
      if (key.isRight) brainPos.x += VELOCITY.brain.right;
      blockOverflowPos(brainPos);
    },
    [blockOverflowPos]
  );

  const createObject = useCallback(() => {
    const type = Math.random() < 0.5 ? "liquor" : "walnut";
    const imgRef = type === "liquor" ? liquorRef : walnutRef;
    const size = objectSizeRef.current;
    if (!imgRef.current) return;
    posRef.current.objects.push({
      type,
      x: Math.random() * (window.innerWidth - size.w),
      y: -size.h,
      ...size,
    });
    posRef.current.objectAccel.push(10);
  }, []);

  const updateObjectPos = useCallback((object, index) => {
    const accel = posRef.current.objectAccel[index];
    posRef.current.objectAccel[index] = accel + VELOCITY.liquorAccel;
    object.y += accel;
  }, []);

  const deleteObject = useCallback((index) => {
    posRef.current.objects.splice(index, 1);
    posRef.current.objectAccel.splice(index, 1);
  }, []);

  // 수정된 catchObject 함수 : 충돌 영역을 캐릭터의 중앙부 근처로 좁힘
  const catchObject = useCallback(
    (obj, index) => {
      const brain = posRef.current.brain;
      // marginPercentage를 이용해 캐릭터의 충돌 감지 영역을 줄임 (예: 100% 제외)
      const marginPercentage = 1.0;
      const effectiveX = brain.x + (brain.w * marginPercentage) / 2;
      const effectiveY = brain.y + (brain.h * marginPercentage) / 2;
      const effectiveW = brain.w * (1 - marginPercentage);
      const effectiveH = brain.h * (1 - marginPercentage);

      // 수정된 충돌 영역으로 판정
      if (
        effectiveX + effectiveW >= obj.x &&
        effectiveX <= obj.x + obj.w &&
        effectiveY + effectiveH >= obj.y &&
        effectiveY <= obj.y + obj.h
      ) {
        if (obj.type === "liquor") {
          setScore((prev) => prev - LIQUOR_SCORE);
        } else if (obj.type === "walnut") {
          setScore((prev) => prev + WALNUT_SCORE);
        }
        deleteObject(index);
      }
    },
    [deleteObject]
  );

  const initialGame = useCallback((ctx) => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const brainImage = brainRef.current;
    const w = brainImage.width * 0.2;
    const h = brainImage.height * 0.2;
    posRef.current.brain = {
      x: window.innerWidth / 2 - w / 2,
      y: window.innerHeight - h - 10,
      w,
      h,
    };
    posRef.current.objects = [];
    posRef.current.objectAccel = [];
    keyRef.current.isLeft = false;
    keyRef.current.isRight = false;
    setScore(0);
    setTimeLeft(60);
    setState("play");

    if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    timeIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timeIntervalRef.current);
          timeIntervalRef.current = null;
          if (onGameEnd) onGameEnd(scoreRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onGameEnd]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    Promise.all([
      loadImage("/images/brain.png"),
      loadImage("/images/liquor.png"),
      loadImage("/images/walnut.png"),
      loadImage("/images/stone-bg.png"),
    ]).then(([brainImg, liquorImg, walnutImg, bgImg]) => {
      brainRef.current = brainImg;
      liquorRef.current = liquorImg;
      walnutRef.current = walnutImg;
      backgroundRef.current = bgImg;
      objectSizeRef.current = {
        w: liquorImg.width * 0.2,
        h: liquorImg.height * 0.2,
      };
      initialGame(ctx);
    });

    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      keyRef.current.isLeft = key === "a" || key === "arrowleft";
      keyRef.current.isRight = key === "d" || key === "arrowright";
    };

    const onKeyUp = () => {
      keyRef.current.isLeft = false;
      keyRef.current.isRight = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      clearInterval(timeIntervalRef.current);
    };
  }, [loadImage, initialGame]);

  useEffect(() => {
    if (state !== "play") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const timer = setInterval(() => {
      const objectCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < objectCount; i++) {
        createObject();
      }
    }, CREATE_OBJECT_TIME);

    let rafId;
    const animate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      const bg = backgroundRef.current;
      if (bg) ctx.drawImage(bg, 0, 0, width, height);

      if (brainRef.current) {
        updateBrainPos(posRef.current.brain);
        drawImage(ctx, brainRef.current, posRef.current.brain);
      }

      posRef.current.objects.forEach((obj, i) => {
        updateObjectPos(obj, i);
        const img = obj.type === "liquor" ? liquorRef.current : walnutRef.current;
        drawImage(ctx, img, obj);
      });

      for (let i = posRef.current.objects.length - 1; i >= 0; i--) {
        const obj = posRef.current.objects[i];
        if (obj.y >= window.innerHeight) {
          deleteObject(i);
        } else {
          catchObject(obj, i);
        }
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(rafId);
    };
  }, [
    state,
    drawImage,
    updateBrainPos,
    createObject,
    updateObjectPos,
    deleteObject,
    catchObject,
  ]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => console.log("Play Error:", e));
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch((err) =>
        console.log("Auto play blocked:", err)
      );
    }
  }, []);

  return (
    <div className="canvas-game-container">
      <div className="score-time-container">
        <div className="score-text">
          SCORE<br />{score}
        </div>

        <button className="audio-toggle-btn" onClick={toggleAudio}>
          {isPlaying ? "🎵 MUSIC OFF" : "🔇 MUSIC ON"}
        </button>

        <div className="time-text">
          TIME LEFT<br />{timeLeft}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="game-canvas"
      />
      <audio ref={audioRef} src="/audio/bg-music.mp3" loop />
    </div>
  );
}
