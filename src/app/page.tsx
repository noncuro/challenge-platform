import { createRedisClient, getChallengeStatusFromRedis } from './api/utils';
import { checkAuth } from './api/utils/auth';
import React from 'react';
import { SetAuthCookieAndReload } from "@/app/SetAuthCookieAndReload";

export const dynamic = 'force-dynamic';

export default async function Home({searchParams}: {searchParams: {token: string, email: string}}) {

  const redisClient = createRedisClient();

  const { token, email } = searchParams;
  if (token && await getChallengeStatusFromRedis(searchParams.email, redisClient)) {
      return <SetAuthCookieAndReload email={email} token={token} />
  }

  if (!token || !email) {
    return <div className="p-4 min-h-full">
      <p>Nothing public here yet. Come back when you have a token</p>
      </div>
  }


  try {
      if (await checkAuth(email, token, redisClient)) {
          // Authentication successful, set the auth key as a cookie
          return <SetAuthCookieAndReload email={email} token={token} />
      } else {
          return <div className="p-4">
            Invalid authentication key
          </div>
      }
  } catch (error) {
    console.error('Redis error:', error);
    return <div className="p-4">
      Error
    </div>
  } finally {
      await redisClient.quit();
  }
}
