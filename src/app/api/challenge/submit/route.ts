import { NextResponse } from 'next/server';
import { createRedisClient, getChallengeFromCookie } from '@/app/api/utils';

export async function POST(request: Request) {
    const redis = createRedisClient();

    try {
        const challengeStatus = await getChallengeFromCookie(redis);

        if (!challengeStatus) {
            return NextResponse.json(
                { success: false, message: 'Challenge not found' },
                { status: 404 }
            );
        }

        if (!challengeStatus.isStarted) {
            return NextResponse.json(
                { success: false, message: 'Challenge has not been started' },
                { status: 400 }
            );
        }

        // Get the submitted answer from the request body
        const { submission } = await request.json();

        if (!submission) {
            return NextResponse.json(
                { success: false, message: 'No submission provided' },
                { status: 400 }
            );
        }

        if (!challengeStatus.startTime) {
            return NextResponse.json(
                { success: false, message: 'Challenge has not been started' },
                { status: 400 }
            );
        }

        // Calculate time taken
        const endTime = new Date().getTime();
        const timeTaken = endTime - challengeStatus.startTime;

        // Update challenge status
        challengeStatus.endTime = endTime;
        challengeStatus.submission = submission;

        // Save updated challenge status
        await redis.set(`challenge:${challengeStatus.emailAddress}`, JSON.stringify(challengeStatus));

        return NextResponse.json(
            { success: true, message: 'Challenge submitted successfully', timeTaken },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error submitting challenge:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await redis.quit();
    }
}
