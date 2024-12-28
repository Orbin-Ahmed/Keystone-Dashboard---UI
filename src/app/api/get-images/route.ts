export default async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const imageIDsParam = url.searchParams.get("imageIDs");

    if (!imageIDsParam) {
      return new Response(
        JSON.stringify({ error: "imageIDs parameter is required" }),
        {
          status: 400,
        },
      );
    }
    const imageIDs = imageIDsParam.split(",");

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const results: { [key: string]: string } = {};
    imageIDs.forEach((id) => {
      results[id] = `${backendUrl}api/get-image-url/?imageID=${id}`;
    });

    return new Response(JSON.stringify(results), { status: 200 });
  } catch (error) {
    console.error("Error processing GET request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
