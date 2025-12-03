// src/components/WebcamGestureManager.tsx
import { useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { useGesture } from "./GestureContext";

export const WebcamGestureManager = () => {
  const videoRef = useRef<HTMLVideoElement>(document.createElement("video"));
  const { setGesture } = useGesture();

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;

    const setup = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });

        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        videoRef.current.onloadeddata = () => predict();
      } catch (err) {
        console.error("Camera Error:", err);
      }
    };

    const predict = () => {
      if (handLandmarker && videoRef.current && videoRef.current.readyState >= 2) {
        const results = handLandmarker.detectForVideo(videoRef.current, performance.now());

        if (results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          const wrist = landmarks[0];
          const fingertips = [4, 8, 12, 16, 20]; // 指尖索引
          
          // --- 算法：判断握拳 ---
          // 计算指尖到手腕的平均距离
          let avgDist = 0;
          for (const tip of fingertips) {
              const dx = landmarks[tip].x - wrist.x;
              const dy = landmarks[tip].y - wrist.y;
              avgDist += Math.sqrt(dx*dx + dy*dy);
          }
          avgDist /= fingertips.length;
          // 阈值：< 0.25 视为握拳 (聚合)，否则视为张开 (分散)
          const isFist = avgDist < 0.25;

          // --- 算法：判断左右移动 ---
          // wrist.x 范围是 0-1。0.5是中间。
          // 我们将其反转并映射到 -1 到 1 的范围
          const xPos = (0.5 - wrist.x) * 3.5; 

          setGesture(isFist, xPos);
        } else {
          // 没手的时候：默认分散，居中
          setGesture(false, 0);
        }
      }
      animationFrameId = requestAnimationFrame(predict);
    };

    setup();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      if (handLandmarker) handLandmarker.close();
      cancelAnimationFrame(animationFrameId);
    };
  }, [setGesture]);

  return null;
};