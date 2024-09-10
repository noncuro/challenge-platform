import { cookies } from "next/headers"
import { Login } from "./login";
import { createRedisClient } from "@/app/api/utils";
import { checkAdminAuth } from "@/app/api/auth/admin/route";
import Admin from "./admin";

export default async function AdminPage() {
  const adminAuthKey = cookies().get('adminAuthKey')?.value;  

  if (!adminAuthKey) {
    return <Login />;
  }

  const redisClient = createRedisClient();

  if (!await checkAdminAuth(adminAuthKey, redisClient)) {
    return <div>Something went wrong</div>;
  }

  await redisClient.quit();

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1> */}
      <Admin />
    </div>
  );
}

