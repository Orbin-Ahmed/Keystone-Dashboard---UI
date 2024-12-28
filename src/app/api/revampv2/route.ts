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

    const callbackURL = `https://1d23-2603-7000-c7f0-a340-484d-fd50-798b-4493.ngrok-free.app/api/webhooks/revampv2`;

    const prediction = await replicate.predictions.create({
      version:
        "4f43c24297913070ba22c1ed2d7696840b8f9846d530d850c91ad4fee1948d7f",
      input,
      webhook: callbackURL,
      webhook_events_filter: ["completed"],
    });

    return new Response(JSON.stringify("rendering"), {
      status: 200,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ detail: "Internal Server Error" }), {
      status: 500,
    });
  }
}
