export async function POST(req: Request) {
  try {
    const body = await req.json();
    const finalImageUrl = body.output;
    console.log(finalImageUrl);
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Error handling replicate webhook:", error);
    return new Response(JSON.stringify({ error: "Bad Request" }), {
      status: 400,
    });
  }
}
