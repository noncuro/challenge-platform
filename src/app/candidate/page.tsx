import { cookies } from "next/headers";
import TimedSubmissionPlatform from "./TimedSubmissionPlatform";
import { createRedisClient, getChallengeStatusFromRedis } from "../api/utils";

export default async function CandidatePage() {
    const redisClient = createRedisClient();

    const email = cookies().get('email')?.value;
    const authKey = cookies().get('authKey')?.value;
    console.log(email, authKey);
    
    if(!email || !authKey){
        return <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Timed Submission Platform</h1>
            <p>Come back when you have a token</p>
        </div>
    }

    const status = await getChallengeStatusFromRedis(email, redisClient);
    if(!status){
        return <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Timed Submission Platform</h1>
            <p>Weird...</p>
        </div>
    }

    return <div className="p-4">
        <TimedSubmissionPlatform />
    </div>
}