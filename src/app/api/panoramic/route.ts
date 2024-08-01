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

    const { imageUrl, prompt, upscale } = await req.json();

    const input = {
      image: imageUrl,
      prompt: prompt,
      upscale: upscale,
    };

    const output = await replicate.run(
      "orbin-ahmed/360_pano:dc653997df860cbabc5cc46b75b9fc77eef955ca7d1af9c00fc5ba3ada6ffe68",
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
