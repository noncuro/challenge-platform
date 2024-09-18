import React from 'react';
import { cookies } from "next/headers"
import { Login } from "./login";
import { createRedisClient } from "@/app/api/utils";
import { checkAdminAuth } from "@/app/api/utils/auth";
import Admin from "./admin";
export default async function AdminPage() {
	const cookieStore = cookies()
	const redis = createRedisClient()
	const adminAuthKey = cookieStore.get('adminAuthKey')?.value

	const isAuthenticated = adminAuthKey ? await checkAdminAuth(adminAuthKey, redis) : false

	if (!isAuthenticated) {
		return <Login />
	}

	return (
		<div className="p-4">
			<Admin />
		</div>
	)
}
