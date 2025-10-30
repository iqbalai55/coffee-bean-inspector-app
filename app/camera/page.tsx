"use client";

import { useRef, useState, useEffect } from "react";
import { sendImageToAPI, Detection } from "@/lib/api";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null); // captured or uploaded image
  const [loading, setLoading] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);

  // Start camera
  useEffect(() => {
    if (imageSrc) return; // skip camera if we already have captured image
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    startCamera();

    // Stop camera on unmount
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [imageSrc]);

  // Generate image with bounding boxes
  const generateImageWithBBoxes = async (
    base64: string,
    detections: Detection[]
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        detections.forEach((d) => {
          const [x1, y1, x2, y2] = d.bbox;

          ctx.strokeStyle = "red";
          ctx.lineWidth = Math.max(canvas.width, canvas.height) * 0.003;
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

          ctx.fillStyle = "red";
          ctx.font = `${Math.max(canvas.width, canvas.height) * 0.02}px sans-serif`;
          ctx.fillText(
            `${d.class} (${(d.confidence * 100).toFixed(0)}%)`,
            x1 + 5,
            y1 - 5
          );
        });

        resolve(canvas.toDataURL("image/jpeg"));
      };
    });
  };

  // Capture from camera
  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg");

    const result = await sendImageToAPI(base64.split(",")[1]);
    setDetections(result.detections);

    const finalImage = await generateImageWithBBoxes(base64, result.detections);
    setImageSrc(finalImage);

    setLoading(false);
  };

  // Pick from gallery
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const result = await sendImageToAPI(base64.split(",")[1]);
      setDetections(result.detections);

      const finalImage = await generateImageWithBBoxes(base64, result.detections);
      setImageSrc(finalImage);

      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Reset to live camera
  const resetCamera = () => {
    setImageSrc(null);
    setDetections([]);
  };

  return (
    <div className="w-screen h-screen relative bg-black flex flex-col items-center justify-center">
      {/* Show live camera if no captured image */}
      {!imageSrc && (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
      )}

      {/* Show captured/detected image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt="Detected"
          className="w-full h-full object-cover"
        />
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Buttons */}
      {/* Buttons */}
      <div className="absolute bottom-8 flex flex-col items-center gap-4">
        {/* Top row: Detect + Pick from Gallery */}
        {!imageSrc && (
          <div className="flex gap-4">
            <button
              onClick={captureAndDetect}
              className="bg-yellow-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-yellow-700 transition"
            >
              {loading ? "Detecting..." : "Detect Camera"}
            </button>

            <label className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition">
              {loading ? "Detecting..." : "Pick from Gallery"}
              <input
                type="file"
                accept="image/*"
                onChange={handleGalleryUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Retake button below */}
        {imageSrc && (
          <button
            onClick={resetCamera}
            className="bg-red-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-700 transition"
          >
            Retake
          </button>
        )}
      </div>

    </div>
  );
}
