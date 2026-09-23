import { NextRequest } from "next/server";

export async function proxyRequest(req: NextRequest, targetUrl: string | undefined) {
  if (!targetUrl) {
    return new Response("Target URL not configured in environment variables.", { status: 500 });
  }

  try {
    const headers: Record<string, string> = {};
    const contentType = req.headers.get("content-type");
    if (contentType) {
      headers["content-type"] = contentType;
    }

    const fetchOptions: RequestInit & { duplex?: string } = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      fetchOptions.body = req.body as any;
      fetchOptions.duplex = "half";
    }

    const res = await fetch(targetUrl, fetchOptions);

    return new Response(res.body, {
      status: res.status,
      headers: res.headers,
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
