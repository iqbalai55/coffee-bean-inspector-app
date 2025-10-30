"use client";

import { useRef, useEffect, useMemo } from "react";
import { Detection } from "@/lib/api";

type Props = {
  detections: Detection[];
  width: number;  // Original image/video width
  height: number; // Original image/video height
};

export default function BoundingBoxOverlay({ detections, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const classCount = useMemo(() => {
    const counts: Record<string, number> = {};
    detections.forEach(d => {
      counts[d.class] = (counts[d.class] || 0) + 1;
    });
    return counts;
  }, [detections]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();

    // Set internal canvas size to match displayed CSS size
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Compute scale to maintain aspect ratio
    const scale = Math.min(canvas.width / width, canvas.height / height);
    const offsetX = (canvas.width - width * scale) / 2;
    const offsetY = (canvas.height - height * scale) / 2;

    // Draw bounding boxes
    detections.forEach((d) => {
      const [x1, y1, x2, y2] = d.bbox;

      ctx.strokeStyle = "rgba(255,0,0,0.9)";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        offsetX + x1 * scale,
        offsetY + y1 * scale,
        (x2 - x1) * scale,
        (y2 - y1) * scale
      );

      ctx.fillStyle = "rgba(255,0,0,0.8)";
      ctx.font = "16px sans-serif";
      ctx.fillText(
        `${d.class} (${(d.confidence * 100).toFixed(0)}%)`,
        offsetX + x1 * scale + 2,
        offsetY + y1 * scale - 5
      );
    });

    // Draw class counts
    const boxHeight = Object.keys(classCount).length * 20 + 10;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(10, 10, 150, boxHeight);

    ctx.fillStyle = "#fff";
    ctx.font = "16px sans-serif";
    let yOffset = 30;
    Object.entries(classCount).forEach(([cls, count]) => {
      ctx.fillText(`${cls}: ${count}`, 20, yOffset);
      yOffset += 20;
    });
  }, [detections, classCount, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
}
