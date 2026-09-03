"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Minimal axis-less line/area chart. No charting library — for a strip of
 * 40-60 points this is simpler, lighter, and easier to theme than pulling in
 * a dependency.
 */
export default function Sparkline({
  data,
  width = 240,
  height = 64,
  color = "#00f0ff",
  showArea = true,
  animate = true,
  strokeWidth = 1.75,
  className = "",
}) {
  const gradientId = useId();

  const { linePath, areaPath, lastPoint } = useMemo(() => {
    if (!data || data.length < 2) return { linePath: "", areaPath: "", lastPoint: null };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const padY = height * 0.12;
    const innerH = height - padY * 2;

    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = padY + innerH - ((v - min) / span) * innerH;
      return [x, y];
    });

    const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
    const area = `${line} L${width},${height} L0,${height} Z`;

    return { linePath: line, areaPath: area, lastPoint: points[points.length - 1] };
  }, [data, width, height]);

  if (!linePath) return null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="none"
      role="img"
      aria-label="Price trend"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {showArea && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}

      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={animate ? { pathLength: 1, opacity: 1 } : false}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />

      {lastPoint && (
        <>
          <circle cx={lastPoint[0]} cy={lastPoint[1]} r={3.5} fill={color} opacity={0.25} />
          <circle cx={lastPoint[0]} cy={lastPoint[1]} r={1.8} fill={color} />
        </>
      )}
    </svg>
  );
}
