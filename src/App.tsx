// src/App.tsx
import { Canvas } from '@react-three/fiber';
import { Environment, Sparkles, ContactShadows, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { GestureProvider } from './components/GestureContext';
import { WebcamGestureManager } from './components/WebcamGestureManager';
import { LuxuryTree } from './components/LuxuryTree';

export default function App() {
  return (
    <GestureProvider>
      <div className="w-full h-screen bg-black relative overflow-hidden">

        {/* 隐藏的 AI 摄像头组件 */}
        <WebcamGestureManager />

        {/* UI 提示层 */}
        <div className="absolute top-8 w-full text-center z-10 pointer-events-none select-none px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#B8860B] drop-shadow-md font-serif">
            LUXURY MEMORIES
          </h1>
          <div className="mt-4 flex justify-center gap-4 text-[#FFD700] text-sm uppercase tracking-widest font-semibold">
            <span className="bg-black/40 px-3 py-1 rounded border border-[#FFD700]/30">🖐️ 张开分散</span>
            <span className="bg-black/40 px-3 py-1 rounded border border-[#FFD700]/30">✊ 握拳聚合</span>
            <span className="bg-black/40 px-3 py-1 rounded border border-[#FFD700]/30">↔️ 手掌移动</span>
          </div>
        </div>

        <Canvas
          shadows
          camera={{ position: [0, 0, 8], fov: 45 }}
          gl={{ antialias: false }}
          dpr={[1, 1.5]}
        >
          {/* 灯光系统 */}
          <ambientLight intensity={0.4} />
          <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={15} castShadow color="#FFD700" />
          <pointLight position={[-10, -5, -10]} intensity={5} color="#004225" />

          {/* 核心 3D 内容 */}
          <LuxuryTree />

          {/* 氛围粒子 */}
          <Sparkles count={400} scale={15} size={3} speed={0.5} opacity={0.6} color="#FFD700" />

          {/* 底部阴影 */}
          <ContactShadows resolution={1024} scale={25} blur={2} opacity={0.6} far={10} color="#000000" />

          {/* 环境反射贴图 (让金属有质感) */}
          <Environment preset="city" />

          {/* 相机控制 (限制只能稍微旋转，主要靠手势) */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
          />

          {/* 电影级后期处理 */}
          <EffectComposer enableNormalPass>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.2} radius={0.5} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Canvas>
      </div>
    </GestureProvider>
  );
}