// src/components/LuxuryTree.tsx
import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { PhotoOrnament } from './PhotoOrnament';
import { LightOrnament } from './LightOrnament';

const imageModules = import.meta.glob('./files/*.{png,jpg,jpeg,svg}', { eager: true, as: 'url' });

// 圣诞配色板
const LIGHT_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFD700'];

export const LuxuryTree = () => {
  const [textures, setTextures] = useState<THREE.Texture[]>([]);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const loadedTextures: THREE.Texture[] = [];
    const urls = Object.values(imageModules);

    if (urls.length === 0) console.warn("⚠️ ./files/ 文件夹为空！");

    urls.forEach((url) => {
      loader.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.center.set(0.5, 0.5);
        loadedTextures.push(tex);
        setTextures([...loadedTextures]);
      });
    });
  }, []);

  // 生成混合装饰物的位置数据
  const items = useMemo(() => {
    const data = [];
    const totalCount = 150; // 总量增加，让树更丰满

    for (let i = 0; i < totalCount; i++) {
      const t = i / totalCount;
      // 树形结构算法
      const y = -1.5 + t * 3.8;
      const radius = 1.4 * (1 - t) + 0.1;
      const angle = i * 2.4; // 黄金角
      const pos: [number, number, number] = [
        Math.cos(angle) * radius, y, Math.sin(angle) * radius
      ];

      // 决策：每3个里面，有1个是照片，2个是彩球 (如果照片没加载完，就全用彩球)
      // 这样保证有大量的光点作为背景，衬托照片
      const isPhoto = (i % 3 === 0);
      // 随机分配颜色
      const color = LIGHT_COLORS[Math.floor(Math.random() * LIGHT_COLORS.length)];

      data.push({ pos, isPhoto, color, index: i });
    }
    return data;
  }, []);

  return (
    <group position={[0, -1, 0]}>
      {/* 树主体 */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[1.6, 4.5, 64]} />
        <meshStandardMaterial color="#002211" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* 树顶星星 */}
      <mesh position={[0, 2.8, 0]} rotation={[0, 0, Math.PI / 10]}>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={3} toneMapped={false} />
      </mesh>

      {/* 渲染混合装饰物 */}
      {items.map((item, i) => {
        // 逻辑：如果是照片位且有照片资源，渲染 PhotoOrnament
        if (item.isPhoto && textures.length > 0) {
          const tex = textures[(i / 3) % textures.length]; // 循环使用照片
          return <PhotoOrnament key={i} index={i} treePosition={item.pos} texture={tex} />;
        }
        // 否则渲染 LightOrnament
        else {
          return <LightOrnament key={i} color={item.color} treePosition={item.pos} />;
        }
      })}
    </group>
  );
};