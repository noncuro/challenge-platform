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

        // Start the challenge
        challengeStatus.isStarted = true;
        challengeStatus.startTime = new Date().getTime(); // Convert to number (timestamp)
        await redis.set(`challenge:${challengeStatus.emailAddress}`, JSON.stringify(challengeStatus));

        return NextResponse.json(
            { success: true, message: 'Challenge started' },
            { status: 200 }
        );

	} catch (error) {
		console.error('Error starting challenge:', error);
		return NextResponse.json(
			{ success: false, message: 'Internal server error' },
			{ status: 500 }
		);
	} finally {
		await redis.quit();
	}
}