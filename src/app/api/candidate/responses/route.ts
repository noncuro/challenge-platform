import { NextResponse } from "next/server";
import { createRedisClient, getChallengeStatusFromRedis } from "../../utils";

export async function GET() {
  const redisClient = createRedisClient();

  try {
    const candidateKeys = await redisClient.keys("challenge:*");
    const responses = await Promise.all(
      candidateKeys.map(async (key) => {
        const email = key.split(":")[1];
        const status = await getChallengeStatusFromRedis(email, redisClient);
        return status && status.submission
          ? {
              email,
              submission: status.submission,
              submissionTime: status.submissionTime,
            }
          : null;
      }),
    );

    const validResponses = responses.filter(Boolean);

    return NextResponse.json(validResponses, { status: 200 });
  } catch (error) {
    console.error("Error fetching candidate responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await redisClient.quit();
  }
}
