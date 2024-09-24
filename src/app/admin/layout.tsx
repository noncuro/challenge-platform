import Link from 'next/link';
import {cookies} from "next/headers";
import {Login} from "@/app/admin/login";
import {createRedisClient} from "@/app/api/utils";
import {checkAdminAuth} from "@/app/api/utils/auth";
import React from 'react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const redis = createRedisClient()
  const adminAuthKey = cookieStore.get('adminAuthKey')?.value

  const isAuthenticated = adminAuthKey ? await checkAdminAuth(adminAuthKey, redis) : false

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div>
      <nav className="bg-gray-100 p-4 mb-4">
        <div className="container mx-auto flex space-x-4">
          <Link href="/admin/challenges" className="text-blue-600 hover:underline">All Challenges</Link>
          <Link href="/admin/create-challenge" className="text-blue-600 hover:underline">Create Challenge</Link>
          <Link href="/admin/templates" className="text-blue-600 hover:underline">Manage Templates</Link>
        </div>
      </nav>
      {children}
    </div>
  )
}