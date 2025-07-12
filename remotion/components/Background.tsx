import { memo } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

const Background = () => {
  return (
    <AbsoluteFill className="fixed inset-0">
      <Img
        className="absolute inset-0 w-full h-full object-cover"
        src={staticFile("dist/blurred-album-cover.webp")}
      />
      <div className="absolute inset-0 bg-black/10" style={{ opacity: 0.3 }} />
    </AbsoluteFill>
  );
};

export default memo(Background);
