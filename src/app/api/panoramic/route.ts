import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, prompt, upscale } = await req.json();

    const BASETEN_KEY = process.env.BASETEN_API_KEY;

    const response = await fetch(
      "https://model-5qe5pnpq.api.baseten.co/development/predict",
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${BASETEN_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: image,
          prompt: prompt,
          upscale: upscale,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error generating 360 view:", error);
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 },
    );
  }
}
