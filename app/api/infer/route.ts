import { NextResponse } from "next/server";

export type Detection = {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
};

export async function POST(req: Request) {
  try {
    const { image_base64 } = await req.json();

    // Panggil Lambda server-side (no CORS issue)
    const res = await fetch(
      "https://t2smzpxsyewa75myphdgswqlpy0ymkth.lambda-url.ap-southeast-1.on.aws/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64 }),
      }
    );

    const data = await res.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error("Server-side API Error:", err);
    return NextResponse.json({ detections: [] });
  }
}
