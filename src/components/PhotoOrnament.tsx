// src/components/PhotoOrnament.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGesture } from './GestureContext';

interface PhotoOrnamentProps {
  texture: THREE.Texture;      // 传入照片纹理
  treePosition: [number, number, number]; // 树上的目标位置
  index: number;
}

export const PhotoOrnament = ({ texture, treePosition, index }: PhotoOrnamentProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const { isFist, handXNormalized } = useGesture();

  // 1. 计算分散时的随机位置 (只计算一次)
  const scatteredPosition = useMemo(() => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const radius = 6 + Math.random() * 4; // 半径 6-10
    return new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta) + 2, 
        radius * Math.cos(phi)
    );
  }, []);

  // 2. 缓存树上的目标向量
  const treeTarget = useMemo(() => new THREE.Vector3(...treePosition), [treePosition]);

  useFrame(() => {
    if (!meshRef.current) return;

    // --- 运动逻辑 ---
    // A. 确定基础目标：握拳 -> 去树上；张开 -> 去散开
    const target = isFist ? treeTarget : scatteredPosition;
    
    // B. 创建当前帧的最终目标，加入手势的 X 轴偏移
    const finalPos = target.clone();
    // 系数 3.0 让移动幅度更明显
    finalPos.x += handXNormalized * 2.5; 

    // C. 平滑移动 (Lerp)
    // 聚合时快一点(0.08)，散开时慢一点飘出去(0.04)
    const speed = isFist ? 0.08 : 0.04;
    meshRef.current.position.lerp(finalPos, speed);

    // D. 旋转特效
    if (isFist) {
        // 在树上时：正面朝外，轻微摆动
        meshRef.current.rotation.y += 0.01;
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1);
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.1);
    } else {
        // 在空中时：自由翻滚
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={meshRef} position={scatteredPosition.toArray()}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* 金色边框 */}
        <mesh>
            <sphereGeometry args={[0.26, 32, 32]} />
            <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
        </mesh>
        {/* 照片本体 (压扁的球体) */}
        <mesh scale={[1, 1, 0.9]}> 
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial 
            map={texture} 
            color="white"
            metalness={0.2}
            roughness={0.3}
          />
        </mesh>
      </Float>
    </group>
  );
};