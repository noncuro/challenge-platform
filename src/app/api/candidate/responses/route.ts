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

import { NextResponse } from "next/server";
import { createRedisClient, getChallengeStatusFromRedis } from "../../utils";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export async function GET() {
  const redisClient = createRedisClient();

  // Auth by checking the redis key 'admin' and see if the token in the cookie matches
  const admin = await redisClient.get("admin");
  const adminAuthKey = cookies().get("adminAuthKey")?.value;
  if (!admin || !adminAuthKey || !(await bcrypt.compare(adminAuthKey, admin))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
