import Redis from "ioredis";
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

export function createRedisClient() {
    return new Redis(`rediss://default:${process.env.UPSTASH_REDIS_REST_TOKEN}@${process.env.UPSTASH_REDIS_REST_URL?.replace('https://', '')}:6379`);
}

export const getChallengeStatusFromRedis = async (email: string, redis: Redis): Promise<ChallengeStatus | null> => {
    const challengeStatus = await redis.get(`challenge:${email}`);
    return challengeStatus ? JSON.parse(challengeStatus) : null;
}


export const getChallengeFromCookie = async (redis: Redis): Promise<ChallengeStatus | null> => {
    const authKey = cookies().get('authKey')?.value;
    const email = cookies().get('email')?.value;
    if (!authKey || !email) return null;
    const challengeStatus = await getChallengeStatusFromRedis(email, redis);
    if (!challengeStatus) return null;
    if (!await bcrypt.compare(authKey, challengeStatus.hashedAuthToken))
        return null;
    return challengeStatus;
}