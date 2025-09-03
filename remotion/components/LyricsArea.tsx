import { memo, useMemo } from "react";
import { AbsoluteFill, spring } from "remotion";

const DarkOverlay = ({ fps, frame }: { fps: number; frame: number }) => {

    const opacity = useMemo(
        () =>
            spring({
                frame,
                fps,
                from: 0,
                to: 1,
                delay: fps,
            }),
        [frame, fps]
    );
    
    return (
        <>
            <AbsoluteFill className="relative w-[1155px] h-full left-[1228px]" style={{ opacity }}>
                <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center,rgba(0,0,0,0) 40%,rgba(0,0,0,0.45) 90%),linear-gradient(to bottom,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0) 50%,rgba(0,0,0,0.45) 100%)` }} />
            </AbsoluteFill>
            <AbsoluteFill className="z-50 relative w-[1155px] h-full left-[1228px]" style={{ opacity }}>
                <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom,rgba(0,0,0,1) 0%,rgba(0,0,0,0) 5%,rgba(0,0,0,0) 78%,rgba(0,0,0,1) 100%)`, }} />
            </AbsoluteFill>
        </>
    );
};

export default memo(DarkOverlay);


