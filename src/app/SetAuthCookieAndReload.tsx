"use client";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

export const SetAuthCookieAndReload = ({email, token}: {email:string, token: string}) =>{
    const [state, setState] = useState("Loading...");
    const router = useRouter()
    useEffect(() => {
        fetch("/api/challenge/auth", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, authKey: token})
        }).then((response) => {
            if(response.ok){
                setState("Success! Redirecting...")
                router.push("/candidate")
            }else{
                setState("Badddd token!")
            }
        })
    }, [email, router, token]);
    return <div>{state}</div>
}