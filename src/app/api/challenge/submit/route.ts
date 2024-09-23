import { NextResponse } from "next/server";
import { createRedisClient, getChallengeFromCookie } from "@/app/api/utils";

export async function POST(request: Request) {
  const redis = createRedisClient();

  try {
    const challengeStatus = await getChallengeFromCookie(redis);

    if (!challengeStatus) {
      return NextResponse.json(
        { success: false, message: "Challenge not found" },
        { status: 404 },
      );
    }

    if (!challengeStatus.isStarted) {
      return NextResponse.json(
        { success: false, message: "Challenge has not been started" },
        { status: 400 },
      );
    }

    const { submission } = await request.json();

    if (!submission) {
      return NextResponse.json(
        { success: false, message: "No submission provided" },
        { status: 400 },
      );
    }

    const currentTime = new Date().getTime();
    const isOvertime = currentTime > challengeStatus.endTime!;

    if (isOvertime && challengeStatus.submission) {
      return NextResponse.json(
        { success: false, message: "Overtime submission not allowed" },
        { status: 400 },
      );
    }

    // Update challenge status
    challengeStatus.submission = submission;
    challengeStatus.submissionTime = currentTime;

    // Save updated challenge status
    await redis.set(
      `challenge:${challengeStatus.emailAddress}`,
      JSON.stringify(challengeStatus),
    );

    return NextResponse.json(
      {
        success: true,
        message: isOvertime
          ? "Overtime submission accepted"
          : "Challenge submitted successfully",
        submissionTime: currentTime,
        isOvertime,
        submission,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error submitting challenge:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await redis.quit();
  }
}
