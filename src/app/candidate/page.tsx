import { cookies } from "next/headers";
import { createRedisClient, getChallengeStatusFromRedis } from "../api/utils";
import React from "react";
import TimedSubmissionWrapper from "./TimedSubmissionWrapper";

export default async function CandidatePage() {
    const redisClient = createRedisClient();

    const email = cookies().get('email')?.value;
    const authKey = cookies().get('authKey')?.value;

    if (!email || !authKey) {
        return <div className="p-4 min-h-full">
            <h1 className="text-2xl font-bold mb-4">Challenge!</h1>
            <p>Come back when you have a token</p>
        </div>
    }

    const status = await getChallengeStatusFromRedis(email, redisClient);
    if (!status) {
        return <div className="p-4 min-h-full">
            <h1 className="text-2xl font-bold mb-4">Challenge!</h1>
            <p>Weird...</p>
        </div>
    }

    return <div className="p-4 min-h-full">
        <TimedSubmissionWrapper />
    </div>
}