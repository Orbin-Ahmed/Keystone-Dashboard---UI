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
    const imageFile = formData.get("image") as File;
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const prompt = formData.get("prompt") as string;
    const guidance_scale = parseFloat(
      (formData.get("guidance_scale") ?? "15").toString(),
    );
    const negative_prompt = formData.get("negative_prompt") as string;
    const prompt_strength = parseFloat(
      (formData.get("prompt_strength") ?? "0.8").toString(),
    );
    const num_inference_steps = parseInt(
      (formData.get("num_inference_steps") ?? "50").toString(),
    );
    const seed = formData.get("seed");
    const imageID = formData.get("imageID");

    const input: any = {
      image: imageBuffer,
      prompt: prompt,
      guidance_scale: guidance_scale,
      negative_prompt: negative_prompt,
      prompt_strength: prompt_strength,
      num_inference_steps: num_inference_steps,
    };

    if (seed && parseInt(seed.toString()) !== 0) {
      input.seed = parseInt(seed.toString());
    }

    const callbackURL = `${process.env.NEXT_PUBLIC_FRONTEND_URL}api/webhooks/revampv2`;

    const prediction = await replicate.predictions.create({
      version:
        "e299c531485aac511610a878ef44b554381355de5ee032d109fcae5352f39fa9",
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
          prediction1ID: prediction.id,
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
      JSON.stringify({
        detail: "Rendering started",
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
