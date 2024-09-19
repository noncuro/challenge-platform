"use client";
import {useEffect, useState} from "react";

export const SetAuthCookieAndReload = ({email, token}: {email:string, token: string}) =>{
    const [state, setState] = useState("Loading...");
    useEffect(() => {
        fetch("/api/auth", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, authKey: token})
        }).then((response) => {
            if(response.ok){
                setState("Success! Redirecting...")
                window.location.replace("/candidate")
            }else{
                setState("Badddd token!")
            }
        })
    }, []);
    return <div>{state}</div>
}