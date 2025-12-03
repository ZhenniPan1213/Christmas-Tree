// src/components/GestureContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import * as THREE from 'three';

interface GestureState {
    isFist: boolean;        // 握拳状态：true=聚合, false=分散
    handXNormalized: number;// 手掌水平位置：-1(左) 到 1(右)
    setGesture: (isFist: boolean, x: number) => void;
}

const GestureContext = createContext<GestureState | null>(null);

export const GestureProvider = ({ children }: { children: ReactNode }) => {
    const [isFist, setIsFistState] = useState(false); // 默认分散
    const [handXNormalized, setHandXState] = useState(0);

    const setGesture = (fist: boolean, x: number) => {
        setIsFistState(fist);
        // 使用平滑插值减少手抖带来的抖动
        setHandXState(prev => THREE.MathUtils.lerp(prev, x, 0.2));
    };

    return (
        <GestureContext.Provider value={{ isFist, handXNormalized, setGesture }}>
            {children}
        </GestureContext.Provider>
    );
};

export const useGesture = () => {
    const context = useContext(GestureContext);
    if (!context) throw new Error("useGesture must be used within GestureProvider");
    return context;
};