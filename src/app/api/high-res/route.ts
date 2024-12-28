import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
      return new Response(JSON.stringify({ detail: "Unauthorized" }), {
        status: 401,
      });
    }

    const body = await req.json();
    const imageUrl = body.imageUrl;
    const prediction1ID = body.prediction1ID;

    const input: any = {
      image: imageUrl,
      downscaling: true,
      scale_factor: 2,
    };

    const callbackURL = `${process.env.NEXT_PUBLIC_FRONTEND_URL}api/webhooks/high-res`;

    const prediction = await replicate.predictions.create({
      version:
        "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
      input,
      webhook: callbackURL,
      webhook_events_filter: ["completed"],
    });

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${backendUrl}api/create-prediction/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prediction1ID: prediction1ID,
          prediction2ID: prediction.id,
        }),
      });

      if (!response.ok) {
        console.error("Failed to notify the API:", response.statusText);
      } else {
        console.log("API notified successfully");
      }
    } catch (apiError) {
      console.error("Error during API call:", apiError);
    }

    return new Response(
      JSON.stringify({
        detail: "Upscalling started",
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ detail: "Internal Server Error" }), {
      status: 500,
    });
  }
}
