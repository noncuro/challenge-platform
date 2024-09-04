import { NextResponse } from 'next/server';
import Redis from "ioredis"
import { createRedisClient } from '../utils';

export async function POST(request: Request) {
    const { email } = await request.json();

    const redisClient = createRedisClient();

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const client = redisClient
    try {
        const exists = await client.exists('approved_emails');

        if (exists) {
            // TODO: Send an email to the user with the approval link
            return NextResponse.json({ message: 'Email approved' }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Email not approved' }, { status: 403 });
        }
    } catch (error) {
        console.error('Redis error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await client.quit();
    }
}
