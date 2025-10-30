"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StartPage() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  // Tangkap event PWA install
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    setShowInstall(false);
    setDeferredPrompt(null);
  };

  const handleStart = () => {
    router.push("/camera");
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 text-gray-900 px-6 relative">
      {/* Card container */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="Coffee Logo"
          className="w-44 h-44 mb-6 object-contain"
        />

        <h1 className="text-3xl font-extrabold mb-4 text-center">
          Coffee Bean Inspector
        </h1>

        <p className="text-center text-gray-700 mb-8">
          Detect defects in your coffee beans instantly using AI
        </p>

        <button
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-3 bg-yellow-600 text-white font-semibold px-6 py-4 rounded-2xl shadow-lg hover:bg-yellow-700 active:scale-95 transition transform"
        >
          Start Scanning
        </button>
      </div>

      {/* Install PWA popup */}
      {showInstall && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-2xl px-6 py-4 flex items-center justify-between max-w-xs w-full">
          <span className="text-gray-800 text-sm">
            Install Coffee Bean Inspector App
          </span>
          <button
            onClick={handleInstall}
            className="ml-4 bg-yellow-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-yellow-700 transition"
          >
            Install
          </button>
        </div>
      )}

      {/* Footer */}
      <p className="text-sm text-white/80 mt-6">
        Powered by AI Coffee Defect Detection
      </p>
    </div>
  );
}
