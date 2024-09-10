import { NextResponse } from "next/server";
import { createRedisClient, getChallengeStatusFromRedis } from "../../utils";

export async function GET() {
  const redisClient = createRedisClient();

  try {
    const candidateKeys = await redisClient.keys("challenge:*");
    const candidates = await Promise.all(
      candidateKeys.map(async (key) => {
        const email = key.split(":")[1];
        const status = await getChallengeStatusFromRedis(email, redisClient);
        return {
          email,
          submission: status?.submission || null,
          submissionTime: status?.submissionTime || null,
          isStarted: status?.isStarted || false,
          startTime: status?.startTime || null,
          endTime: status?.endTime || null,
        };
      }),
    );

    return NextResponse.json(candidates, { status: 200 });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await redisClient.quit();
  }
}
