import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRedisClient } from "@/app/api/utils";
import { checkAdminAuth } from "@/app/api/utils/auth";

function setAdminAuthCookie(authKey: string) {
  cookies().set("adminAuthKey", authKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function POST(request: Request) {
  const { authKey } = await request.json();

  const redisClient = createRedisClient();

  if (!authKey) {
    return NextResponse.json(
      { error: "Auth key is required" },
      { status: 400 },
    );
  }

  try {
    if (await checkAdminAuth(authKey, redisClient)) {
      // Authentication successful, set the auth key as a cookie
      setAdminAuthCookie(authKey);

      return NextResponse.json(
        { message: "Authentication successful" },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { error: "Invalid authentication key" },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Redis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await redisClient.quit();
  }
}
