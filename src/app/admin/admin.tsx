import { Button, Input, Textarea } from "@/components/ui";
import { createRedisClient } from "../api/utils";
import { useState } from "react";
import { CreateChallengeForm } from "./createChallenge";

export default async function Admin() {
    const redisClient = createRedisClient();
    const challenges = await redisClient.keys('challenge:*');
    const challengeStatuses = challenges.length ? await redisClient.mget(...challenges) : [];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Admin</h1>
            <CreateChallengeForm />
            <div className="flex flex-col gap-4">
                {challengeStatuses.map((challengeStatus, index) => (
                    <div key={challenges[index]}>
                        <h2 className="text-xl font-bold">{challenges[index]}</h2>
                        <p>{challengeStatus}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}