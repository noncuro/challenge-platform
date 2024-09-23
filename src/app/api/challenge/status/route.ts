import { NextResponse } from "next/server";
import { createRedisClient, getChallengeFromCookie } from "@/app/api/utils";

export async function GET() {
  const redisClient = createRedisClient();

  try {
    const challenge = await getChallengeFromCookie(redisClient);

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(challenge, { status: 200 });
  } catch (error) {
    console.error("Error fetching challenge status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await redisClient.quit();
  }
}
