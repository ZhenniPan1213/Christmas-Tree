import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGesture } from './GestureContext';

interface LightOrnamentProps {
    color: string;
    treePosition: [number, number, number];
}

export const LightOrnament = ({ color, treePosition }: LightOrnamentProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { isFist, handXNormalized } = useGesture();

    // 1. 计算分散时的随机位置
    const scatteredPosition = useMemo(() => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = 5 + Math.random() * 5;
        return new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta) + 2,
            radius * Math.cos(phi)
        );
    }, []);

    const treeTarget = useMemo(() => new THREE.Vector3(...treePosition), [treePosition]);

    useFrame((state) => {
        if (!meshRef.current) return;

        // --- 运动逻辑 (与照片保持一致) ---
        const target = isFist ? treeTarget : scatteredPosition;
        const finalPos = target.clone();
        finalPos.x += handXNormalized * 2.5;

        const speed = isFist ? 0.08 : 0.04;
        meshRef.current.position.lerp(finalPos, speed);

        // 闪烁效果：根据时间稍微改变发光强度
        if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
            const t = state.clock.getElapsedTime();
            // 呼吸灯效果 1.5 ~ 3.0
            meshRef.current.material.emissiveIntensity = 2 + Math.sin(t * 3 + finalPos.x) * 0.5;
        }
    });

    return (
        <mesh ref={meshRef} position={scatteredPosition.toArray()}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
                color={color}
                emissive={color} // 自发光关键
                emissiveIntensity={2}
                toneMapped={false} // 关闭色调映射以获得极致辉光
            />
        </mesh>
    );
};