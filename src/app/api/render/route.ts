const RUNPOD_BEARER_TOKEN = process.env.RUNPOD_API_TOKEN;

export async function POST(req: Request) {
  try {
    const renderParams = await req.json();

    if (!renderParams.glb_url || !renderParams.time_of_day || !renderParams.r_id) {
      return new Response(JSON.stringify({ detail: "Missing Data" }), {
        status: 400,
      });
    }

    const payload = { "input": renderParams };

    const runpodResponse = await fetch(
      "https://api.runpod.ai/v2/hx49n6kpwjzb86/run",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RUNPOD_BEARER_TOKEN}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const runpodResponseText = await runpodResponse.text();

    if (!runpodResponse.ok) {
      return new Response(JSON.stringify({ detail: "Runpod Issue" }), {
        status: 500
      });
    }

    let output;
    try {
      output = JSON.parse(runpodResponseText);
    } catch {
      output = { detail: runpodResponseText };
    }

    return new Response(JSON.stringify(output), {
      status: 200
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        detail: "Internal Server Error",
        error: error.message,
      }),
      {
        status: 500,
      }
    );
  }
}
