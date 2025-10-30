export type Detection = {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
};

// Panggil API Next.js (server-side proxy)
export const sendImageToAPI = async (
  base64Image: string
): Promise<{ detections: Detection[] }> => {
  try {
    const res = await fetch("/api/infer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: base64Image }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { detections: [] };
  }
};
