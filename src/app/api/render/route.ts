const BEAM_API_TOKEN = process.env.BEAM_API_TOKEN;

export async function POST(req: Request) {
  try {
    const renderParams = await req.json();

    if (
      !renderParams.glb_url ||
      !renderParams.time_of_day ||
      !renderParams.r_id
    ) {
      return new Response(JSON.stringify({ detail: "Missing Data" }), {
        status: 400,
      });
    }

    const beamResponse = await fetch(
      "https://blender-beam-api-81a270f-v7.app.beam.cloud",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BEAM_API_TOKEN}`,
        },
        body: JSON.stringify(renderParams),
      },
    );

    const beamResponseText = await beamResponse.text();

    if (!beamResponse.ok) {
      return new Response(JSON.stringify({ detail: "Beam Issue" }), {
        status: 500,
      });
    }

    let output;
    try {
      output = JSON.parse(beamResponseText);
    } catch {
      output = { detail: beamResponseText };
    }

    return new Response(JSON.stringify(output), {
      status: 200,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        detail: "Internal Server Error",
        error: error.message,
      }),
      {
        status: 500,
      },
    );
  }
}
