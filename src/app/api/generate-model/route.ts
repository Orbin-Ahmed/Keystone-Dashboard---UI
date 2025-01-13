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

    const formData = await req.formData();
    const files = formData.getAll("images") as File[];
    const imageID = formData.get("imageID") as string;

    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ detail: "No images provided" }), {
        status: 400,
      });
    }

    const imagesBase64 = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return `data:${file.type};base64,${buffer.toString('base64')}`;
      })
    );

    const input = {
      images: imagesBase64,
      texture_size: 2048,
      mesh_simplify: 0.95,
      generate_model: true,
      generate_color: false,
    };

    const callbackURL = `${process.env.NEXT_PUBLIC_FRONTEND_URL}api/webhooks/three-d-model`;

    const prediction = await replicate.predictions.create({
      version: "4876f2a8da1c544772dffa32e8889da4a1bab3a1f5c1937bfcfccb99ae347251",
      input: input,
      webhook: callbackURL,
      webhook_events_filter: ["completed"],
    });

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${backendUrl}api/create-3d-model/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predictionID: prediction.id,
          imageID: imageID,
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
      JSON.stringify({ detail: "Rendering started" }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ detail: "Internal Server Error" }), {
      status: 500,
    });
  }
}