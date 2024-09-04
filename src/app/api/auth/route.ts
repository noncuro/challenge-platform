import { NextResponse } from 'next/server';
import Redis from "ioredis";
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import { createRedisClient, getChallengeStatusFromRedis } from '../utils';

export function setAuthCookie(authKey: string, email: string) {
    cookies().set('authKey', authKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
    }).set('email', email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });
}

export async function checkAuth(email: string, authKey: string, redis: Redis): Promise<boolean> {
    const challengeStatus = await getChallengeStatusFromRedis(email, redis);
    if (!challengeStatus) return false;
    return await bcrypt.compare(authKey, challengeStatus.hashedAuthToken);
}


export async function POST(request: Request) {
    const { email, authKey } = await request.json();

    const redisClient = createRedisClient();

    if (!email || !authKey) {
        return NextResponse.json({ error: 'Email and authKey are required' }, { status: 400 });
    }

    try {
        const storedAuthKey = await redisClient.get(`auth:${email}`);

        if (await checkAuth(email, authKey, redisClient)) {
            // Authentication successful, set the auth key as a cookie
            setAuthCookie(authKey, email);

            return NextResponse.json({ message: 'Authentication successful' }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Invalid authentication key' }, { status: 401 });
        }
    } catch (error) {
        console.error('Redis error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await redisClient.quit();
    }
}
