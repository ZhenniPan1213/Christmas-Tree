// src/App.tsx
import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Sparkles, ContactShadows, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { GestureProvider } from './components/GestureContext';
import { WebcamGestureManager } from './components/WebcamGestureManager';
import { LuxuryTree } from './components/LuxuryTree';
import { UIOverlay } from './components/UIOverlay';

export default function App() {
  // 创建 Video 元素的引用
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <GestureProvider>
      <div className="w-full h-screen bg-black relative overflow-hidden">

        {/* --- 1. 摄像头监控窗口 (右上角) --- */}
        <video
          ref={videoRef}
          className="absolute top-6 right-6 w-48 rounded-lg border-2 border-[#FFD700]/50 shadow-[0_0_20px_rgba(255,215,0,0.3)] z-50 object-cover scale-x-[-1]"
          // scale-x-[-1] 用于水平翻转镜像，让互动更自然
          autoPlay
          muted
          playsInline
        />

        {/* --- 2. 隐藏的逻辑控制器 --- */}
        <WebcamGestureManager videoRef={videoRef} />

        {/* --- 3. UI 状态显示 (右下角) --- */}
        <UIOverlay />

        {/* --- 4. 顶部标题 --- */}
        <div className="absolute top-8 left-8 z-10 pointer-events-none select-none">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#B8860B] drop-shadow-md font-serif">
            LUXURY <br /> MEMORIES
          </h1>
        </div>

        {/* --- 5. 3D 场景 --- */}
        <Canvas
          shadows
          camera={{ position: [0, 0, 9], fov: 45 }}
          gl={{ antialias: false }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={0.2} />
          <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={10} castShadow color="#FFD700" />

          <LuxuryTree />

          {/* 增加粒子密度，营造梦幻感 */}
          <Sparkles count={500} scale={15} size={2} speed={0.5} opacity={0.5} color="#FFD700" />
          <ContactShadows resolution={1024} scale={25} blur={2} opacity={0.6} far={10} color="#000000" />
          <Environment preset="city" />

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
          />

          <EffectComposer>
            {/* 辉光：阈值设为1，只有自发光的彩球和高光部分会发光 */}
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.6} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Canvas>
      </div>
    </GestureProvider>
  );
}