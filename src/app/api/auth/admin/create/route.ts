import { NextResponse } from "next/server";
import { createRedisClient } from "@/app/api/utils";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    // Only allow admin key creation in development environment
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { adminAuthKey } = await req.json();
    if (!adminAuthKey) {
        return NextResponse.json({ error: 'Admin auth key is required' }, { status: 400 });
    }
    const redisClient = createRedisClient();
    const hashedAdminAuthKey = await bcrypt.hash(adminAuthKey, 10);
    await redisClient.set('admin', hashedAdminAuthKey);
    return NextResponse.json({ message: 'Admin key created' }, { status: 200 });
}