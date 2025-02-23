import { NextResponse } from "next/server";

const RUNPOD_API_ENDPOINT =
  process.env.RUNPOD_API_ENDPOINT || "https://api.runpod.ai/v2/hx49n6kpwjzb86/run";
const RUNPOD_BEARER_TOKEN = process.env.RUNPOD_BEARER_TOKEN || "rpa_ZPRXJCLK7JQ8ADPY7A2F943F63CMO1MLYA8QEM72wi9au7";
const API_KEY = "rpa_ZPRXJCLK7JQ8ADPY7A2F943F63CMO1MLYA8QEM72wi9au7";

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

    const runpodResponse = await fetch(RUNPOD_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RUNPOD_BEARER_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!runpodResponse.ok) {
      const errorBody = await runpodResponse.text();
      return NextResponse.json(
        { detail: "Error from Runpod API", error: errorBody },
        { status: runpodResponse.status }
      );
    }

    const output = await runpodResponse.json();

    return NextResponse.json(output, { status: 200 });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 }
    );
  }
}
