import { NextResponse } from "next/server";

const RUNPOD_BEARER_TOKEN =
  process.env.RUNPOD_BEARER_TOKEN ||
  "rpa_ZPRXJCLK7JQ8ADPY7A2F943F63CMO1MLYA8QEM72wi9au7";

export async function POST(req: Request) {
  try {
    const { glb_file, time_of_day } = await req.json();
    if (!glb_file || !time_of_day) {
      return NextResponse.json(
        { detail: "Both 'glb_file' and 'time_of_day' are required." },
        { status: 400 }
      );
    }

    const payload = {
      time_of_day,
      glb_file,
    };

    console.log(JSON.stringify(payload))

    const runpodResponse = await fetch("https://api.runpod.ai/v2/hx49n6kpwjzb86/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RUNPOD_BEARER_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const runpodResponseText = await runpodResponse.text();

    if (!runpodResponse.ok) {
      return NextResponse.json(
        { detail: "Error from Runpod API", error: runpodResponseText },
        { status: runpodResponse.status }
      );
    }

    let output;
    try {
      output = JSON.parse(runpodResponseText);
    } catch (jsonError) {
      console.error("Failed to parse JSON:", jsonError);
      output = { detail: runpodResponseText };
    }

    return NextResponse.json(output, { status: 200 });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { detail: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
