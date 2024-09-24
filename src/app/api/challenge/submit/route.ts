import { NextResponse } from "next/server";
import { createRedisClient, getChallengeFromCookie } from "@/app/api/utils";
import { Submission } from "@/app/types"; // Make sure to update your types file

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

    if (
      isOvertime &&
      challengeStatus.submissions &&
      challengeStatus.submissions.length > 0
    ) {
      return NextResponse.json(
        { success: false, message: "Overtime submission not allowed" },
        { status: 400 },
      );
    }

    // Update challenge status
    if (!challengeStatus.submissions) {
      challengeStatus.submissions = [];
    }

    const newSubmission: Submission = {
      content: submission,
      timestamp: currentTime,
    };

    challengeStatus.submissions.push(newSubmission);
    challengeStatus.latestSubmission = newSubmission;

    // Save updated challenge status
    await redis.set(
      `challenge:${challengeStatus.emailAddress}`,
      JSON.stringify(challengeStatus),
    );

    return NextResponse.json(
      {
        success: true,
        message: isOvertime
          ? "Late submission accepted"
          : "Challenge submitted successfully",
        submissionTime: currentTime,
        isOvertime,
        submission: newSubmission,
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
