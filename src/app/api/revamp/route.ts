import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const image = formData.get("image");
    const prompt = formData.get("prompt") as string;
    const guidance_scale = parseFloat(
      (formData.get("guidance_scale") ?? "15").toString(),
    );
    const negative_prompt = formData.get("negative_prompt") as string;
    const prompt_strength = parseFloat(
      (formData.get("prompt_strength") ?? "0.8").toString(),
    );
    const num_inference_steps = parseInt(
      (formData.get("num_inference_steps") ?? "40").toString(),
    );
    const seed = formData.get("seed");

    if (!(image instanceof File)) {
      throw new Error("Invalid image file");
    }

    const input: any = {
      image: image,
      prompt: prompt,
      guidance_scale: guidance_scale,
      negative_prompt: negative_prompt,
      prompt_strength: prompt_strength,
      num_inference_steps: num_inference_steps,
    };

    if (seed && parseInt(seed.toString()) !== 0) {
      input.seed = parseInt(seed.toString());
    }

    const output = await replicate.run(
      "adirik/interior-design:76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38",
      { input },
    );

    return new Response(JSON.stringify(output), { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ detail: "Internal Server Error" }), {
      status: 500,
    });
  }
}
