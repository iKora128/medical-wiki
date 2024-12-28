import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (request.nextUrl.pathname.startsWith("/api/articles") && 
      (request.method === "POST" || request.method === "PUT" || request.method === "DELETE")) {
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.next()
} 