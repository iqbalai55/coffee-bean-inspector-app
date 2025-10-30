import { Detection } from "./api";

/**
 * Generate an image with bounding boxes and class counts, scaled to fit screen.
 * @param base64 Base64 image string
 * @param detections Array of detections
 * @param displayWidth Width to scale to (screen width)
 * @param displayHeight Height to scale to (screen height)
 * @returns Base64 of resulting image
 */
export const generateImageWithBBoxes = async (
  base64: string,
  detections: Detection[],
  displayWidth: number,
  displayHeight: number
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Scale image to fit display
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      const scaleX = displayWidth / img.naturalWidth;
      const scaleY = displayHeight / img.naturalHeight;

      // Count detections per class
      const classCount: Record<string, number> = {};
      detections.forEach((d) => {
        classCount[d.class] = (classCount[d.class] || 0) + 1;
      });

      // Draw bounding boxes
      detections.forEach((d) => {
        const [x1, y1, x2, y2] = d.bbox;

        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.strokeRect(
          x1 * scaleX,
          y1 * scaleY,
          (x2 - x1) * scaleX,
          (y2 - y1) * scaleY
        );

        ctx.fillStyle = "red";
        ctx.font = `${Math.max(displayWidth, displayHeight) * 0.02}px sans-serif`;
        ctx.fillText(
          `${d.class} (${(d.confidence * 100).toFixed(0)}%)`,
          x1 * scaleX + 5,
          y1 * scaleY - 5
        );
      });

      // Draw class counts box
      const boxPadding = 10;
      const lineHeight = Math.max(displayWidth, displayHeight) * 0.025;
      const boxHeight = Object.keys(classCount).length * lineHeight + boxPadding * 2;
      const boxWidth = 200;

      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(boxPadding, boxPadding, boxWidth, boxHeight);

      ctx.fillStyle = "white";
      ctx.font = `${Math.max(displayWidth, displayHeight) * 0.02}px sans-serif`;

      let yOffset = boxPadding + lineHeight;
      Object.entries(classCount).forEach(([cls, count]) => {
        ctx.fillText(`${cls}: ${count}`, boxPadding + 5, yOffset);
        yOffset += lineHeight;
      });

      resolve(canvas.toDataURL("image/jpeg"));
    };
  });
};
