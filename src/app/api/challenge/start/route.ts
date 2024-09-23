import { NextResponse } from "next/server";
import { createRedisClient, getChallengeFromCookie } from "@/app/api/utils";

export async function POST() {
  const redis = createRedisClient();

  try {
    const challengeStatus = await getChallengeFromCookie(redis);

    if (!challengeStatus) {
      return NextResponse.json(
        { success: false, message: "Challenge not found" },
        { status: 404 },
      );
    }

    if (!challengeStatus.duration) {
      return NextResponse.json(
        { success: false, message: "Challenge duration not set" },
        { status: 400 },
      );
    }

    // Start the challenge
    const startTime = Date.now(); // Current timestamp in milliseconds
    const endTime = startTime + challengeStatus.duration * 1000; // duration is in seconds

    challengeStatus.isStarted = true;
    challengeStatus.startTime = startTime;
    challengeStatus.endTime = endTime;

    await redis.set(
      `challenge:${challengeStatus.emailAddress}`,
      JSON.stringify(challengeStatus),
    );

    return NextResponse.json(
      { success: true, message: "Challenge started", startTime, endTime },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error starting challenge:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await redis.quit();
  }
}
