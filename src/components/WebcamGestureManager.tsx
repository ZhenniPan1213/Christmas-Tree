// src/components/WebcamGestureManager.tsx
import { useEffect, RefObject } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { useGesture } from "./GestureContext";

// 接收外部传入的 videoRef
interface Props {
  videoRef: RefObject<HTMLVideoElement>;
}

export const WebcamGestureManager = ({ videoRef }: Props) => {
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

        // 获取摄像头流
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });

        // 将流绑定到传入的 video 元素上
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          // 等待数据加载后开始预测
          videoRef.current.onloadeddata = () => predict();
        }
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
          const fingertips = [4, 8, 12, 16, 20];

          let avgDist = 0;
          for (const tip of fingertips) {
            const dx = landmarks[tip].x - wrist.x;
            const dy = landmarks[tip].y - wrist.y;
            avgDist += Math.sqrt(dx * dx + dy * dy);
          }
          avgDist /= fingertips.length;

          const isFist = avgDist < 0.25;
          const xPos = (0.5 - wrist.x) * 3.5;

          setGesture(isFist, xPos);
        } else {
          setGesture(false, 0);
        }
      }
      animationFrameId = requestAnimationFrame(predict);
    };

    setup();

    return () => {
      // 清理工作
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      if (handLandmarker) handLandmarker.close();
      cancelAnimationFrame(animationFrameId);
    };
  }, [setGesture, videoRef]);

  return null;
};