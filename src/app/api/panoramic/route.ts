import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, prompt, upscale } = await req.json();

    const BASETEN_KEY = process.env.BASETEN_API_KEY;

    const response = await axios.post(
      "https://model-5qe5pnpq.api.baseten.co/production/predict",
      {
        image: image,
        prompt: prompt,
        upscale: upscale,
      },
      {
        headers: {
          Authorization: `Api-Key ${BASETEN_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 300000,
      },
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error generating 360 view:", error);
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 },
    );
  }
}
