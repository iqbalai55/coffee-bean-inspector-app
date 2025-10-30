"use client";

import { useRef, useState, useEffect } from "react";
import { sendImageToAPI, Detection } from "@/lib/api";
import { generateImageWithBBoxes } from "@/lib/imageUtils";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);

  // Start camera
  useEffect(() => {
    if (imageSrc) return;
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

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [imageSrc]);

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

    // Use viewport size to scale the image
    const finalImage = await generateImageWithBBoxes(
      base64,
      result.detections,
      window.innerWidth,
      window.innerHeight
    );
    setImageSrc(finalImage);

    setLoading(false);
  };

  // Reset to camera
  const resetCamera = () => {
    setImageSrc(null);
    setDetections([]);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* Live camera */}
      {!imageSrc && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
      )}

      {/* Fullscreen detected image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt="Detected"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Buttons */}
      <div className="absolute bottom-8 flex flex-col items-center gap-4 w-full px-4">
        {!imageSrc && (
          <button
            onClick={captureAndDetect}
            disabled={loading}
            className="bg-yellow-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-yellow-700 transition disabled:opacity-50"
          >
            {loading ? "Detecting..." : "Detect Camera"}
          </button>
        )}

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
