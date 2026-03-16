import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_BACKEND_URL || "https://groupprojectboxfusion.onrender.com";

const getTenantId = (request: NextRequest) =>
  request.headers.get("abp.tenantid") ??
  request.headers.get("Abp.TenantId") ??
  request.cookies.get("Abp.TenantId")?.value ??
  null;

async function handleRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const targetUrl = `${BACKEND_URL}/${path.join("/")}`;
  const tenantId = getTenantId(request);

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: {
      "Content-Type": request.headers.get("content-type") || "application/json",
      ...(request.headers.get("authorization")
        ? { Authorization: request.headers.get("authorization")! }
        : {}),
      ...(tenantId
        ? {
            "Abp.TenantId": tenantId,
            Cookie: `Abp.TenantId=${encodeURIComponent(tenantId)}`,
          }
        : {}),
    },
    body,
  });

  const responseText = await response.text();

  return new NextResponse(responseText, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") || "application/json",
    },
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
