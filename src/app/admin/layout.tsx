import Link from 'next/link';
import {cookies} from "next/headers";
import {Login} from "@/app/admin/login";
import {createRedisClient} from "@/app/api/utils";
import {checkAdminAuth} from "@/app/api/auth/admin/route";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const adminAuthKey = cookies().get('adminAuthKey')?.value;

  if (!adminAuthKey) {
    return <Login />;
  }

  const redisClient = createRedisClient();

  if (!checkAdminAuth(adminAuthKey, redisClient)){
    return "Something went wrong"
  }

  return (
    <div>
      <nav className="bg-gray-100 p-4 mb-4">
        <div className="container mx-auto flex space-x-4">
          {/* <Link href="/admin" className="text-blue-600 hover:underline">Dashboard</Link> */}
          <Link href="/admin/challenges" className="text-blue-600 hover:underline">All Challenges</Link>
          <Link href="/admin/create-challenge" className="text-blue-600 hover:underline">Create Challenge</Link>
          <Link href="/admin/templates" className="text-blue-600 hover:underline">Manage Templates</Link>
        </div>
      </nav>
      {children}
    </div>
  );
}