import { cookies } from "next/headers"
import { Login } from "./login";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRedisClient } from "@/app/api/utils";
import { checkAdminAuth } from "@/app/api/auth/admin/route";
import Admin from "./admin";

export default function AdminPage() {

  const adminAuthKey = cookies().get('adminAuthKey')?.value;  

  if (!adminAuthKey) {
    return <Login />;
  }

  const redisClient = createRedisClient();

  if (!checkAdminAuth(adminAuthKey, redisClient)){
    return "Something went wrong"
  }

    return (
      <div className="p-4">
        <Admin />
      </div>
    )
  }
  
