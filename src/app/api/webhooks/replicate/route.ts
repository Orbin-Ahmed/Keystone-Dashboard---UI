import fs from "fs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Webhook data from Replicate:", body);
    const finalImageUrl = body.output;

    const imageResponse = await fetch(finalImageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from ${finalImageUrl}`);
    }

    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const typedArray = new Uint8Array(imageArrayBuffer);

    const filePath = "./my-image.jpg";
    fs.writeFileSync(filePath, typedArray);

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Error handling replicate webhook:", error);
    return new Response(JSON.stringify({ error: "Bad Request" }), {
      status: 400,
    });
  }
}
