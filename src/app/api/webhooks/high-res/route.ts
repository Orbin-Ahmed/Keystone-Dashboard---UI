export async function POST(req: Request) {
  try {
    const body = await req.json();
    const finalImageUrl = body.output;
    const prediction2ID = body.id;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${backendUrl}api/create-prediction/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prediction2ID: prediction2ID,
          imageURL: finalImageUrl,
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
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Error handling replicate webhook:", error);
    return new Response(JSON.stringify({ error: "Bad Request" }), {
      status: 400,
    });
  }
}
