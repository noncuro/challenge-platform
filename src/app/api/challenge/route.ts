import { NextResponse } from "next/server";
import { createRedisClient, getChallengeStatusFromRedis } from "../utils";

export async function GET() {
  const redisClient = createRedisClient();

  try {
    const challengeKeys = await redisClient.keys("challenge:*");
    const challenges = await Promise.all(
      challengeKeys.map(async (key) => {
        const email = key.split(":")[1];
        const status = await getChallengeStatusFromRedis(email, redisClient);
        if (status) {
          return {
            id: email,
            name: email, // Using email as name for now
            description: status.challengeDescription || "",
            duration: status.duration || 0,
            createdAt: status.startTime || Date.now(),
            candidateCount: 1, // Assuming one candidate per challenge for now
          };
        }
        return null;
      }),
    );

    const validChallenges = challenges.filter(Boolean);

    return NextResponse.json(validChallenges);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 },
    );
  } finally {
    await redisClient.quit();
  }
}

// Keep any existing POST, PUT, DELETE methods here
