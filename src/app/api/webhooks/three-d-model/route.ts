export async function POST(req: Request) {
  try {
    const body = await req.json();
    const model_file = body.output.model_file;
    const predictionID = body.id;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${backendUrl}api/create-3d-model/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predictionID:predictionID,
          glbUrl: model_file
        }),
      });

      if (!response.ok) {
        console.error("Failed to notify the API:", response.statusText);
      } else {
        console.log("Final Result Sent to backend.");
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
