import { cookies } from "next/headers";
import Redis from "ioredis";
import bcrypt from "bcrypt";
import { getChallengeStatusFromRedis } from "../utils";

export function setAuthCookie(authKey: string, email: string) {
  cookies().set("authKey", authKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  cookies().set("email", email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function checkAuth(
  email: string,
  authKey: string,
  redis: Redis,
): Promise<boolean> {
  const challengeStatus = await getChallengeStatusFromRedis(email, redis);
  if (!challengeStatus) return false;
  return await bcrypt.compare(authKey, challengeStatus.hashedAuthToken);
}

export async function checkAdminAuth(
  authKey: string,
  redis: Redis,
): Promise<boolean> {
  const adminAuthKey = await redis.get("admin");
  if (!adminAuthKey) return false;
  return await bcrypt.compare(authKey, adminAuthKey);
}

export async function setAdminAuthKey(
  authKey: string,
  redis: Redis,
): Promise<void> {
  const hashedAuthKey = await bcrypt.hash(authKey, 10);
  await redis.set("admin", hashedAuthKey);
}

export function clearAuthCookies() {
  cookies().delete("authKey");
  cookies().delete("email");
}

export async function generateAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) reject(err);
      resolve(salt);
    });
  });
}

export async function hashAuthToken(authToken: string): Promise<string> {
  return bcrypt.hash(authToken, 10);
}
