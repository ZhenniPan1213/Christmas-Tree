import { useGesture } from "./GestureContext";

export const UIOverlay = () => {
    const { isFist } = useGesture();

    return (
        <div className="absolute bottom-8 right-8 z-20 pointer-events-none select-none text-right">
            <div className="text-[#FFD700] text-xs font-bold tracking-[0.3em] opacity-60 mb-1">
                STATUS
            </div>
            <h2
                className={`text-4xl font-black italic tracking-wider transition-all duration-300 ${isFist ? "text-[#FFD700]" : "text-white/80"
                    }`}
                style={{ textShadow: isFist ? "0 0 20px rgba(255, 215, 0, 0.8)" : "none" }}
            >
                {isFist ? "ASSEMBLED" : "DISPERSE"}
            </h2>

            {/* 装饰线条 */}
            <div className={`h-1 bg-[#FFD700] mt-2 transition-all duration-500 ${isFist ? "w-full" : "w-12 opacity-30"}`} />
        </div>
    );
};