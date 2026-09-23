import { NextRequest } from "next/server";
import { proxyRequest } from "../proxy";

export async function POST(req: NextRequest) {
  return proxyRequest(req, process.env.N8N_TTS_URL);
}
