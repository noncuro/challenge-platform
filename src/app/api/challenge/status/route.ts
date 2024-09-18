import { NextResponse } from "next/server";
import { createRedisClient, getChallengeStatusFromRedis } from "../../utils";
// import bcrypt from 'bcrypt';
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const redisClient = createRedisClient();

  try {
    const email = cookies().get("email")?.value;
    const authKey = cookies().get("authKey")?.value;

    if (!email || !authKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await getChallengeStatusFromRedis(email, redisClient);

    if (!status) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(status);
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
