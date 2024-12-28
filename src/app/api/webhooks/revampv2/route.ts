export async function POST(req: Request) {
  try {
    const body = await req.json();
    const finalImageUrl = body.output;

    try {
      const apiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_FRONTEND_URL}api/high-res`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
          body: JSON.stringify({
            imageUrl: finalImageUrl,
            prediction1ID: body.id,
          }),
        },
      );

      if (!apiResponse.ok) {
        throw new Error(
          `Failed to send data to another API: ${apiResponse.statusText}`,
        );
      } else {
        const data = await apiResponse.json();
        console.log("API Response:", data);
      }
    } catch (apiError) {
      console.error("Error sending data to another API:", apiError);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Error handling replicate webhook:", error);
    return new Response(JSON.stringify({ error: "Bad Request" }), {
      status: 400,
    });
  }
}
