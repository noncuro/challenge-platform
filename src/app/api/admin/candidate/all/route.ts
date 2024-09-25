import { checkAdminAuth } from "@/app/api/utils/auth";
import { NextResponse } from "next/server";
import {
  createRedisClient,
  getChallengeStatusFromRedis,
} from "@/app/api/utils";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const redisClient = createRedisClient();

  const adminAuthKey = cookies().get("adminAuthKey")?.value;
  if (!(await checkAdminAuth(adminAuthKey, redisClient))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const candidateKeys = await redisClient.keys("challenge:*");
    const candidates = await Promise.all(
      candidateKeys.map(async (key) => {
        const email = key.split(":")[1];
        const status = await getChallengeStatusFromRedis(email, redisClient);

        return {
          email,
          submission: status?.latestSubmission?.content || null,
          submissionTime: status?.latestSubmission?.timestamp || null,
          isStarted: status?.isStarted || false,
          startTime: status?.startTime || null,
          endTime: status?.endTime || null,
          challengeDescription: status?.challengeDescription || null,
        };
      }),
    );

    return NextResponse.json(candidates, { status: 200 });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      {
        error: "Error fetching candidates",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  } finally {
    await redisClient.quit();
  }
}
