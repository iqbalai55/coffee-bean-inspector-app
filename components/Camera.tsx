"use client";

import { useRef, useEffect, useState } from "react";

type CameraProps = {
  onCapture: (base64: string) => void;
};

export default function Camera({ onCapture }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Request camera access
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play(); // Ensure video plays
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        setError("Cannot access camera. Please check permissions or HTTPS.");
      }
    };

    startCamera();

    // Cleanup: stop camera on unmount
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 100);

    // Capture image
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL("image/jpeg");
    onCapture(base64Image);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
          {error}
        </div>
      ) : (
        <>
          {/* Video feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-screen h-screen object-cover"
          />

          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full bg-black/20" />
          </div>

          {/* Flash effect */}
          {flash && (
            <div className="absolute inset-0 bg-white/70 animate-ping" />
          )}

          {/* Capture button */}
          <button
            onClick={handleCapture}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-10 py-4 rounded-full shadow-xl hover:bg-yellow-700 active:scale-95 transition transform text-lg font-semibold"
          >
            Capture
          </button>
        </>
      )}
    </div>
  );
}
