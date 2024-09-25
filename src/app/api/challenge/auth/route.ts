import { NextResponse } from "next/server";
import { createRedisClient } from "../../utils";
import { setAuthCookie, checkAuth } from "../../utils/auth";

export async function POST(request: Request) {
  const { email, authKey } = await request.json();
  const redisClient = createRedisClient();

  if (!email || !authKey) {
    return NextResponse.json(
      { error: "Email and authKey are required" },
      { status: 400 },
    );
  }

  try {
    if (await checkAuth(email, authKey, redisClient)) {
      // Authentication successful, set the auth key as a cookie
      setAuthCookie(authKey, email);
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
