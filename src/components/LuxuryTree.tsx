// src/components/LuxuryTree.tsx
import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { PhotoOrnament } from './PhotoOrnament';

// 1. 动态导入 files 文件夹下的所有图片 (Vite 特性)
// eager: true 表示直接加载模块，而不是懒加载
const imageModules = import.meta.glob('./files/*.{png,jpg,jpeg,svg}', { eager: true, as: 'url' });

export const LuxuryTree = () => {
  const [textures, setTextures] = useState<THREE.Texture[]>([]);

  // 2. 初始化加载所有图片纹理
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const loadedTextures: THREE.Texture[] = [];
    
    // 获取所有图片的 URL 路径
    const urls = Object.values(imageModules);

    if (urls.length === 0) {
        console.warn("⚠️ ./files/ 文件夹中没有找到图片！请放入 .jpg 或 .png 文件。");
    }

    urls.forEach((url) => {
      loader.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace; // 修正颜色
        // 居中剪裁图片以适应球体
        tex.center.set(0.5, 0.5); 
        loadedTextures.push(tex);
        // 当所有图片加载完或部分加载时触发重绘 (这里简化处理，直接更新状态)
        setTextures([...loadedTextures]); 
      });
    });
  }, []);

  // 3. 计算树上的位置点 (螺旋排列)
  const treePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    // 如果图片很少，我们多生成一些位置来复用图片
    const count = Math.max(textures.length, 50); 
    
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const y = -1.5 + t * 3.8; // 高度 -1.5 到 2.3
      const radius = 1.4 * (1 - t) + 0.1; // 底部宽，顶部尖
      const angle = i * 2.4; // 黄金角度
      
      positions.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
    }
    return positions;
  }, [textures.length]);

  return (
    <group position={[0, -1, 0]}>
      {/* --- 树的绿色主体 (圆锥体) --- */}
      <mesh position={[0, 0.5, 0]}>
         <coneGeometry args={[1.6, 4.5, 64]} />
         <meshStandardMaterial color="#004225" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* --- 树顶星星 --- */}
      <mesh position={[0, 2.8, 0]} rotation={[0, 0, Math.PI / 10]}>
         <dodecahedronGeometry args={[0.3, 0]} />
         <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} toneMapped={false} />
      </mesh>

      {/* --- 生成照片装饰球 --- */}
      {treePositions.map((pos, i) => {
         // 如果图片还没加载完，或者没有图片，就不渲染
         if (textures.length === 0) return null;
         // 循环使用图片
         const tex = textures[i % textures.length];
         return <PhotoOrnament key={i} index={i} treePosition={pos} texture={tex} />;
      })}
    </group>
  );
};