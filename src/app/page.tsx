import { useParams } from 'next/navigation'
import { createRedisClient, getChallengeStatusFromRedis } from './api/utils';
import { checkAuth, setAuthCookie } from './api/auth/route';
import Link from 'next/link';

export default async function Home({searchParams}: {searchParams: {token: string, email: string}}) {

  async function setCookie() {
    "use server"
    const { token, email } = searchParams;
    console.log(token, email);
    setAuthCookie(token, email);
  }
  const redisClient = createRedisClient();

  const { token, email } = searchParams;
  if(await getChallengeStatusFromRedis(searchParams.email, redisClient)){
    return <div className="p-4">
      Signed in. Go here: <Link href="/">Candidate</Link>
    </div>
  }


  if (!token || !email) {
    return <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Timed Submission Platform</h1>
      <p>Come back when you have a token</p>
      </div>
  }


  try {
      const storedAuthKey = await redisClient.get(`auth:${email}`);

      if (await checkAuth(email, token, redisClient)) {
          // Authentication successful, set the auth key as a cookie
          return <div className="p-4">
            <form action={setCookie}>
              <button type="submit">Reload the page</button>
            </form>
          </div>
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
